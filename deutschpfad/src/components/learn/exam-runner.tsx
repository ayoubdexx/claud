"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Download, Flag, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { ExerciseItem } from "@/components/learn/exercise-runner";
import { ListeningPlayer } from "@/components/learn/listening-player";
import { gradeLabel, readiness, scoreExam, type ExamScore } from "@/lib/scoring";
import type { AnswerValue } from "@/lib/exercises";
import { useLearner } from "@/lib/store";
import type { MockExam } from "@/lib/types";
import { cn, formatMinutes } from "@/lib/utils";

function Timer({ minutes, running, onExpire }: { minutes: number; running: boolean; onExpire: () => void }) {
  const [left, setLeft] = React.useState(minutes * 60);

  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, onExpire]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const critical = left < 300;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums",
        critical ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border",
      )}
    >
      <Clock className="size-4" />
      {mm}:{ss}
    </span>
  );
}

export function ExamRunner({ exam }: { exam: MockExam }) {
  const { dispatch } = useLearner();
  const [started, setStarted] = React.useState(false);
  const [sectionIndex, setSectionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, AnswerValue>>({});
  const [score, setScore] = React.useState<ExamScore | null>(null);

  const section = exam.sections[sectionIndex];
  const totalItems = exam.sections.reduce(
    (sum, item) => sum + item.parts.reduce((count, part) => count + part.items.length, 0),
    0,
  );
  const answered = Object.keys(answers).length;

  const submit = React.useCallback(() => {
    const result = scoreExam(exam, answers);
    setScore(result);
    dispatch({
      type: "attempt-save",
      attempt: {
        id: `${exam.slug}-${Date.now()}`,
        examSlug: exam.slug,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        sectionScores: Object.fromEntries(
          result.sections.map((item) => [item.id, { points: item.points, max: item.max }]),
        ),
        totalPercent: result.percent,
        passed: result.passed,
        answers: answers as Record<string, unknown>,
      },
    });
    toast[result.passed ? "success" : "warning"](
      `${result.percent}% — ${gradeLabel(result.percent).label}`,
      { description: readiness(result.percent, exam.level) },
    );
  }, [answers, dispatch, exam]);

  if (score) {
    return (
      <div className="space-y-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing value={score.percent} size={116} stroke={10}>
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold tabular-nums">{score.percent}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {score.passed ? "bestanden" : "nicht bestanden"}
                  </p>
                </div>
              </ProgressRing>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="font-display text-xl font-semibold">{gradeLabel(score.percent).label}</p>
                <p className="text-sm text-muted-foreground">{readiness(score.percent, exam.level)}</p>
                <p className="text-sm">
                  {score.totalPoints} / {score.totalMax} Punkte · Bestehensgrenze {exam.passMark}%
                </p>
                {!score.modularPassed && score.passed ? (
                  <p className="flex items-center gap-1.5 text-sm text-warning">
                    <AlertTriangle className="size-4" /> Ein Modul liegt unter {exam.passMark}% — bei Goethe zählt
                    jedes Modul einzeln.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {score.sections.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-5 sm:pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant={item.passed ? "success" : "danger"}>{item.percent}%</Badge>
                </div>
                <Progress value={item.percent} className="h-1.5" indicatorClassName={item.passed ? "bg-success" : "bg-destructive"} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.points} / {item.max} Punkte
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="space-y-3 pt-5 sm:pt-6">
            <p className="font-semibold">Detaillierte Korrektur</p>
            {score.itemResults.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border p-3 text-sm",
                  item.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
                )}
              >
                <p className="font-medium">
                  {index + 1}. {item.prompt}
                </p>
                <p className="mt-1">
                  <span className="text-muted-foreground">Lösung: </span>
                  <span className="font-medium">{item.expected}</span>
                </p>
                {item.explanation ? <p className="mt-1 text-muted-foreground">{item.explanation}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setScore(null);
              setAnswers({});
              setSectionIndex(0);
              setStarted(false);
            }}
          >
            <RotateCcw /> Nochmal versuchen
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/pdf/exam/${exam.slug}`} target="_blank" rel="noopener noreferrer">
              <Download /> Prüfung als PDF
            </a>
          </Button>
          <Button asChild>
            <Link href="/statistics">Statistik ansehen</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={exam.level} />
            <Badge variant="secondary">{exam.provider === "goethe" ? "Goethe-Institut" : "telc"}</Badge>
            <Badge variant="outline">{formatMinutes(exam.minutes)}</Badge>
            <Badge variant="outline">Bestehensgrenze {exam.passMark}%</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{exam.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {exam.sections.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-3.5">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.minutes} min · {item.maxPoints} Punkte · {item.parts.length} Teile
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Strategien</p>
            {exam.strategies.map((strategy) => (
              <div key={strategy.title} className="rounded-xl bg-surface p-3">
                <p className="text-sm font-medium">{strategy.title}</p>
                <p className="text-sm text-muted-foreground">{strategy.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStarted(true)}>
              <Flag /> Prüfung starten ({totalItems} Aufgaben)
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/pdf/exam/${exam.slug}`} target="_blank" rel="noopener noreferrer">
                <Download /> Als PDF drucken
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass sticky top-14 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">
            Modul {sectionIndex + 1}/{exam.sections.length}
          </Badge>
          <span className="text-sm font-medium">{section.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {answered}/{totalItems} beantwortet
          </span>
          <Timer minutes={section.minutes} running onExpire={() => toast.warning("Zeit für dieses Modul ist um.")} />
        </div>
      </div>

      {section.parts.map((part) => (
        <Card key={part.id}>
          <CardContent className="space-y-5 pt-5 sm:pt-6">
            <div>
              <p className="font-semibold">{part.title}</p>
              <p className="text-sm text-muted-foreground">{part.instructions}</p>
            </div>

            {part.reading?.length ? (
              <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                {part.reading.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line text-[15px] leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {part.audio?.length ? (
              <ListeningPlayer transcript={part.audio} title="Hörtext" playLimit={part.playLimit} />
            ) : null}

            <div className="space-y-6">
              {part.items.map((item, index) => (
                <div key={item.id} className="border-t border-border pt-5 first:border-0 first:pt-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Aufgabe {index + 1} · {item.points ?? 1} Punkt{(item.points ?? 1) === 1 ? "" : "e"}
                  </p>
                  <ExerciseItem
                    exercise={item}
                    value={answers[item.id] ?? null}
                    onChange={(value) => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={sectionIndex === 0}
          onClick={() => setSectionIndex((value) => Math.max(0, value - 1))}
        >
          <ArrowLeft /> Vorheriges Modul
        </Button>
        {sectionIndex < exam.sections.length - 1 ? (
          <Button onClick={() => setSectionIndex((value) => value + 1)}>
            Nächstes Modul <ArrowRight />
          </Button>
        ) : (
          <Button onClick={submit}>
            <Flag /> Prüfung abgeben und auswerten
          </Button>
        )}
      </div>
    </div>
  );
}
