"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleDot, Download, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { getLesson } from "@/content";
import { levelProgress, useLearner } from "@/lib/store";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CourseModules({ course }: { course: Course }) {
  const { state } = useLearner();
  const stats = levelProgress(state, course.level);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 pt-5 sm:pt-6">
          <div className="min-w-[220px] flex-1">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">Your progress</span>
              <span className="tabular-nums text-muted-foreground">
                {stats.completed}/{stats.total} lessons · {stats.percent}%
              </span>
            </div>
            <Progress value={stats.percent} className="h-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/pdf/grammar/${course.level}`} target="_blank" rel="noopener noreferrer">
                <Download /> Grammar sheets
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/pdf/worksheets/${course.level}`} target="_blank" rel="noopener noreferrer">
                <Download /> Worksheets
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/exams/${course.finalExam}`}>Final exam</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {course.modules.map((module, moduleIndex) => {
        const moduleLessons = module.lessons.map((slug) => getLesson(slug)).filter(Boolean);
        const done = moduleLessons.filter(
          (lesson) => lesson && state.lessons[lesson.slug]?.status === "completed",
        ).length;
        const previousModule = course.modules[moduleIndex - 1];
        const previousDone = previousModule
          ? previousModule.lessons.every((slug) => state.lessons[slug]?.status === "completed")
          : true;

        return (
          <Card key={module.slug}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={module.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Module {moduleIndex + 1}
                    </p>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
                      {module.title} <span className="text-muted-foreground">· {module.titleDe}</span>
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Badge variant={done === moduleLessons.length && done > 0 ? "success" : "secondary"}>
                  {done}/{moduleLessons.length} done
                </Badge>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {module.outcomes.map((outcome) => (
                  <Badge key={outcome} variant="outline">
                    {outcome}
                  </Badge>
                ))}
              </div>

              <ul className="space-y-2">
                {moduleLessons.map((lesson) => {
                  if (!lesson) return null;
                  const progress = state.lessons[lesson.slug];
                  const completed = progress?.status === "completed";
                  const inProgress = progress?.status === "in-progress";
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${lesson.slug}`}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ease-apple hover:border-ring",
                          completed ? "border-success/30 bg-success/5" : "border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            completed
                              ? "bg-success text-success-foreground"
                              : inProgress
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {completed ? <Check className="size-4" /> : inProgress ? <CircleDot className="size-4" /> : lesson.order}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{lesson.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {lesson.titleDe} · {lesson.minutes} min · {lesson.skills.join(", ")}
                          </span>
                        </span>
                        {progress?.score !== undefined ? (
                          <Badge variant={progress.score >= 80 ? "success" : "warning"}>{progress.score}%</Badge>
                        ) : null}
                        {previousDone ? (
                          <Play className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Lock className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {module.miniTest ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-3.5">
                  <p className="text-sm">
                    <span className="font-medium">Mini test</span>{" "}
                    <span className="text-muted-foreground">— check this module before moving on.</span>
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/quizzes?module=${module.slug}`}>
                      Start mini test <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
