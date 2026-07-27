"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Download, Headphones, Mic, PenLine, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonBlocks } from "@/components/learn/blocks";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { useLearner } from "@/lib/store";
import type { Lesson } from "@/lib/types";

export function LessonView({
  lesson,
  moduleTitle,
  previous,
  next,
}: {
  lesson: Lesson;
  moduleTitle?: string;
  previous?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  const { state, completeLesson, dispatch } = useLearner();
  const progress = state.lessons[lesson.slug];
  const completed = progress?.status === "completed";
  const [score, setScore] = React.useState<number | null>(progress?.score ?? null);

  React.useEffect(() => {
    if (!progress) {
      dispatch({ type: "lesson-progress", slug: lesson.slug, patch: { status: "in-progress" } });
    }
  }, [dispatch, lesson.slug, progress]);

  const finish = () => {
    completeLesson(lesson.slug, score ?? undefined);
    toast.success("Lektion abgeschlossen!", {
      description: `+${lesson.xp} XP · ${lesson.title}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={lesson.level} />
        {moduleTitle ? <Badge variant="secondary">{moduleTitle}</Badge> : null}
        <Badge variant="outline">{lesson.minutes} min</Badge>
        <Badge variant="outline">{lesson.xp} XP</Badge>
        {completed ? (
          <Badge variant="success">
            <Check className="size-3" /> abgeschlossen
          </Badge>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <BookmarkButton
            id={`lesson-${lesson.slug}`}
            kind="lesson"
            title={lesson.title}
            href={`/learn/${lesson.slug}`}
          />
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/pdf/lesson/${lesson.slug}`} target="_blank" rel="noopener noreferrer">
              <Download /> PDF
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/print/lesson/${lesson.slug}`}>
              <Printer /> Print
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="lesson">
        <TabsList>
          <TabsTrigger value="lesson">Lektion</TabsTrigger>
          <TabsTrigger value="exercises">Übungen ({lesson.exercises.length})</TabsTrigger>
          <TabsTrigger value="practice">Fertigkeiten</TabsTrigger>
          <TabsTrigger value="homework">Hausaufgaben</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson">
          <LessonBlocks blocks={lesson.blocks} />

          <Card className="mt-6">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5 sm:pt-6">
              <div>
                <p className="font-semibold">Fertig mit der Lektion?</p>
                <p className="text-sm text-muted-foreground">
                  Markieren Sie sie als abgeschlossen, um XP zu sammeln und Ihren Fortschritt zu speichern.
                </p>
              </div>
              <Button onClick={finish} variant={completed ? "secondary" : "default"}>
                <Check /> {completed ? "Erneut abschließen" : "Als abgeschlossen markieren"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <ExerciseRunner
            exercises={lesson.exercises}
            title={`Übungen · ${lesson.title}`}
            quizId={`lesson-${lesson.slug}`}
            onFinish={(percent) => {
              setScore(percent);
              dispatch({ type: "lesson-progress", slug: lesson.slug, patch: { score: percent } });
            }}
          />
          {score !== null ? (
            <Card className="mt-4">
              <CardContent className="flex items-center gap-4 pt-5 sm:pt-6">
                <div className="flex-1">
                  <p className="text-sm font-medium">Letztes Ergebnis: {score}%</p>
                  <Progress value={score} className="mt-1.5 h-1.5" />
                </div>
                <Button size="sm" onClick={finish}>
                  <Check /> Abschließen
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="practice">
          <div className="grid gap-4 sm:grid-cols-2">
            {lesson.reading ? (
              <Card interactive>
                <Link href={`/reading/${lesson.reading}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="flex items-center gap-2 font-medium">
                      <PenLine className="size-4 text-primary" /> Lesetext
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Passender Lesetext mit Glossar, Grammatikhinweisen und Fragen.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ) : null}
            {lesson.listening ? (
              <Card interactive>
                <Link href={`/listening/${lesson.listening}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="flex items-center gap-2 font-medium">
                      <Headphones className="size-4 text-primary" /> Hörübung
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Audio mit variabler Geschwindigkeit, Transkript und Prüfungsfragen.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ) : null}
            {lesson.speaking ? (
              <Card interactive>
                <Link href={`/speaking/${lesson.speaking}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="flex items-center gap-2 font-medium">
                      <Mic className="size-4 text-primary" /> Sprechübung
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Rollenspiel und Aussprachetraining mit automatischer Bewertung.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ) : null}
            {lesson.writing ? (
              <Card interactive>
                <Link href={`/writing/${lesson.writing}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="flex items-center gap-2 font-medium">
                      <PenLine className="size-4 text-primary" /> Schreibaufgabe
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aufgabe mit Korrektur, Musterlösung und Checkliste.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ) : null}
            {lesson.grammar.map((slug) => (
              <Card key={slug} interactive>
                <Link href={`/grammar/${slug}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="font-medium">Grammatik: {slug.replace(/-/g, " ")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vollständige Erklärung, Tabellen, Fehler, Übungen und Cheat Sheet.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
            {lesson.vocabDecks.map((deck) => (
              <Card key={deck} interactive>
                <Link href="/flashcards">
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="font-medium">Karteikarten: {deck}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Wortschatz dieser Lektion mit Spaced Repetition wiederholen.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="homework">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Hausaufgaben</p>
                <ol className="space-y-2 text-sm">
                  {lesson.homework.map((item, index) => (
                    <li key={item} className="flex gap-2">
                      <span className="font-semibold text-primary">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Wiederholung</p>
                <ul className="space-y-2 text-sm">
                  {lesson.revision.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        {previous ? (
          <Button variant="outline" asChild>
            <Link href={`/learn/${previous.slug}`}>
              <ArrowLeft /> {previous.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link href={`/learn/${next.slug}`}>
              {next.title} <ArrowRight />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
