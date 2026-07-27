"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ListChecks, Trophy } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { courses, getLesson, grammarByLevel, grammarTopics } from "@/content";
import { useLearner } from "@/lib/store";
import { LEVELS, type Exercise } from "@/lib/types";

function QuizzesInner() {
  const params = useSearchParams();
  const moduleSlug = params.get("module");
  const { state } = useLearner();

  const moduleInfo = React.useMemo(() => {
    if (!moduleSlug) return null;
    for (const course of courses) {
      const found = course.modules.find((item) => item.slug === moduleSlug);
      if (found) return { module: found, course };
    }
    return null;
  }, [moduleSlug]);

  const moduleQuiz: Exercise[] = React.useMemo(() => {
    if (!moduleInfo) return [];
    const lessonItems = moduleInfo.module.lessons
      .map((slug) => getLesson(slug))
      .flatMap((lesson) => lesson?.exercises ?? []);
    const grammarItems = moduleInfo.module.lessons
      .map((slug) => getLesson(slug))
      .flatMap((lesson) => lesson?.grammar ?? [])
      .flatMap((slug) => grammarTopics.find((topic) => topic.slug === slug)?.quiz ?? []);
    return [...lessonItems, ...grammarItems].slice(0, 12);
  }, [moduleInfo]);

  const history = state.quizScores.slice(0, 12);
  const average = history.length
    ? Math.round(history.reduce((sum, item) => sum + item.percent, 0) / history.length)
    : 0;

  if (moduleInfo && moduleQuiz.length) {
    return (
      <>
        <PageHeader
          title={`Mini test · ${moduleInfo.module.title}`}
          description={moduleInfo.module.description}
          breadcrumbs={[
            { label: "Courses", href: "/courses" },
            { label: moduleInfo.course.level, href: `/courses/${moduleInfo.course.level.toLowerCase()}` },
            { label: "Mini test" },
          ]}
          eyebrow={<LevelBadge level={moduleInfo.course.level} />}
          actions={
            <Button variant="outline" asChild>
              <Link href="/quizzes">All quizzes</Link>
            </Button>
          }
        />
        <ExerciseRunner exercises={moduleQuiz} title={moduleInfo.module.title} quizId={`module-${moduleInfo.module.slug}`} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Quizzes"
        description="Short checks after every grammar topic and module. Your scores feed the statistics page and the achievement system."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Quizzes" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{grammarTopics.length} topic quizzes</Badge>
            {history.length ? <Badge variant="success">Average {average}%</Badge> : null}
          </>
        }
      />

      {history.length ? (
        <Card className="mb-6">
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Recent results" />
            <div className="space-y-2">
              {history.map((item) => (
                <div key={`${item.id}-${item.at}`} className="flex items-center gap-3">
                  <Trophy className="size-4 shrink-0 text-warning" />
                  <span className="min-w-0 flex-1 truncate text-sm">{item.id.replace(/-/g, " ")}</span>
                  <Progress value={item.percent} className="h-1.5 w-24" />
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {LEVELS.map((level) => (
        <div key={level} className="mb-6">
          <SectionTitle title={`${level} topic quizzes`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grammarByLevel(level).map((topic) => {
              const score = state.quizScores.find((item) => item.id === `grammar-quiz-${topic.slug}`);
              return (
                <Card key={topic.slug} interactive>
                  <Link href={`/grammar/${topic.slug}`}>
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <ListChecks className="size-4 text-primary" />
                        {score ? (
                          <Badge variant={score.percent >= 80 ? "success" : "warning"}>{score.percent}%</Badge>
                        ) : (
                          <Badge variant="secondary">{topic.quiz.length} items</Badge>
                        )}
                      </div>
                      <p className="font-medium">{topic.title}</p>
                      <p className="text-sm text-muted-foreground">{topic.titleDe}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                        Start quiz <ArrowRight className="size-3" />
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default function QuizzesPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <QuizzesInner />
    </React.Suspense>
  );
}
