"use client";

import * as React from "react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { grammarTopics, lessons, listeningTasks, readingTexts } from "@/content";
import { exerciseTypeLabels } from "@/lib/exercises";
import { LEVELS, type Exercise, type Level } from "@/lib/types";
import { shuffleWithSeed } from "@/lib/utils";

const allExercises: (Exercise & { level: Level; source: string })[] = [
  ...lessons.flatMap((lesson) =>
    lesson.exercises.map((exercise) => ({ ...exercise, level: lesson.level, source: lesson.title })),
  ),
  ...grammarTopics.flatMap((topic) =>
    [...topic.practice, ...topic.quiz].map((exercise) => ({
      ...exercise,
      level: topic.level,
      source: topic.title,
    })),
  ),
  ...readingTexts.flatMap((text) =>
    text.questions.map((exercise) => ({ ...exercise, level: text.level, source: text.title })),
  ),
  ...listeningTasks.flatMap((task) =>
    task.questions.map((exercise) => ({ ...exercise, level: task.level, source: task.title })),
  ),
];

const types = Object.keys(exerciseTypeLabels) as Exercise["type"][];

export default function ExercisesPage() {
  const [level, setLevel] = React.useState<Level | "all">("all");
  const [type, setType] = React.useState<Exercise["type"] | "all">("all");
  const [seed, setSeed] = React.useState(7);

  const pool = React.useMemo(() => {
    const filtered = allExercises.filter((exercise) => {
      if (level !== "all" && exercise.level !== level) return false;
      if (type !== "all" && exercise.type !== type) return false;
      return true;
    });
    return shuffleWithSeed(filtered, seed).slice(0, 12);
  }, [level, type, seed]);

  const counts = types.map((item) => ({
    type: item,
    count: allExercises.filter((exercise) => exercise.type === item).length,
  }));

  return (
    <>
      <PageHeader
        title="Exercises"
        description="A single pool of every exercise on the platform. Filter by level and type, then drill with instant feedback and detailed explanations."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Exercises" }]}
        eyebrow={<Badge variant="secondary">{allExercises.length} exercises</Badge>}
        actions={
          <Button variant="outline" onClick={() => setSeed((value) => value + 1)}>
            Shuffle new set
          </Button>
        }
      />

      <div className="mb-5 space-y-4">
        <Tabs value={level} onValueChange={(value) => setLevel(value as Level | "all")}>
          <TabsList>
            <TabsTrigger value="all">All levels</TabsTrigger>
            {LEVELS.map((item) => (
              <TabsTrigger key={item} value={item}>
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setType("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              type === "all" ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            All types ({allExercises.length})
          </button>
          {counts.map((item) => (
            <button
              key={item.type}
              onClick={() => setType(item.type)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                type === item.type ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              {exerciseTypeLabels[item.type]} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {pool.length ? (
        <>
          <SectionTitle
            title={`${pool.length} exercises in this set`}
            description="Answers are checked with tolerance for typos and accept every valid variant."
          />
          <ExerciseRunner exercises={pool} title="Mixed drill" quizId={`drill-${level}-${type}`} mode="list" />
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No exercises match this combination. Try another type or level.
          </CardContent>
        </Card>
      )}
    </>
  );
}
