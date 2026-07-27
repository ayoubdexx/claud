"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Flame, Layers, Mic, PenLine, Play, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { grammarByLevel, lessons, listeningTasks, readingTexts, speakingTasks, writingTasks } from "@/content";
import { useLearner } from "@/lib/store";
import { hashString, todayISO } from "@/lib/utils";

export default function DailyPage() {
  const { state, stats, streak, dispatch } = useLearner();
  const level = state.profile.level;
  const today = todayISO();
  const seed = hashString(today + level);

  const levelLessons = lessons.filter((lesson) => lesson.level === level);
  const nextLesson =
    levelLessons.find((lesson) => state.lessons[lesson.slug]?.status !== "completed") ?? levelLessons[0] ?? lessons[0];

  const pick = <T,>(items: T[], offset = 0) => (items.length ? items[(seed + offset) % items.length] : undefined);

  const grammar = pick(grammarByLevel(level));
  const reading = pick(readingTexts.filter((text) => text.level === level) ?? readingTexts, 1) ?? readingTexts[0];
  const listening =
    pick(listeningTasks.filter((task) => task.level === level), 2) ?? listeningTasks[0];
  const speaking = pick(speakingTasks.filter((task) => task.level === level), 3) ?? speakingTasks[0];
  const writing = pick(writingTasks.filter((task) => task.level === level), 4) ?? writingTasks[0];

  const minutesToday = state.sessions.find((session) => session.date === today)?.minutes ?? 0;
  const goal = state.profile.dailyGoalMinutes;
  const percent = Math.min(100, Math.round((minutesToday / goal) * 100));

  const plan = [
    {
      id: "flashcards",
      icon: Layers,
      title: `Flashcards: ${Math.max(stats.due, 10)} cards`,
      minutes: 10,
      href: "/flashcards",
      done: (state.sessions.find((session) => session.date === today)?.cards ?? 0) >= 10,
      body: "Clear the due queue first — it is the cheapest way to keep everything you have learned.",
    },
    {
      id: "lesson",
      icon: Play,
      title: `Lesson: ${nextLesson.title}`,
      minutes: nextLesson.minutes,
      href: `/learn/${nextLesson.slug}`,
      done: state.lessons[nextLesson.slug]?.status === "completed",
      body: nextLesson.summary,
    },
    grammar
      ? {
          id: "grammar",
          icon: Sparkles,
          title: `Grammar review: ${grammar.title}`,
          minutes: 10,
          href: `/grammar/${grammar.slug}`,
          done: state.grammarStudied.includes(grammar.slug),
          body: grammar.simple,
        }
      : null,
    listening
      ? {
          id: "listening",
          icon: Clock,
          title: `Listening: ${listening.title}`,
          minutes: 8,
          href: `/listening/${listening.slug}`,
          done: Boolean(state.quizScores.find((item) => item.id === `listening-${listening.slug}`)),
          body: listening.scenario,
        }
      : null,
    speaking
      ? {
          id: "speaking",
          icon: Mic,
          title: `Speaking: ${speaking.title}`,
          minutes: 6,
          href: `/speaking/${speaking.slug}`,
          done: state.speaking.some((item) => item.slug === speaking.slug),
          body: speaking.goal,
        }
      : null,
    writing
      ? {
          id: "writing",
          icon: PenLine,
          title: `Writing: ${writing.title}`,
          minutes: 15,
          href: `/writing/${writing.slug}`,
          done: state.writings.some((item) => item.slug === writing.slug),
          body: writing.scenario,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    icon: typeof Layers;
    title: string;
    minutes: number;
    href: string;
    done: boolean;
    body: string;
  }[];

  const totalMinutes = plan.reduce((sum, item) => sum + item.minutes, 0);
  const doneCount = plan.filter((item) => item.done).length;

  return (
    <>
      <PageHeader
        title="Today's plan"
        description="A balanced session generated from your level and your progress: repetition, input, output. Follow it top to bottom."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Daily lessons" }]}
        eyebrow={
          <>
            <LevelBadge level={level} />
            <Badge variant="secondary">
              <Flame className="size-3" /> {streak} day streak
            </Badge>
            <Badge variant="outline">{totalMinutes} min total</Badge>
          </>
        }
        actions={
          <Button asChild>
            <Link href={`/learn/${nextLesson.slug}`}>
              <Play /> Start now
            </Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-5 pt-5 sm:pt-6">
          <div className="min-w-[200px] flex-1">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">Daily goal</span>
              <span className="tabular-nums text-muted-foreground">
                {minutesToday}/{goal} min · {doneCount}/{plan.length} tasks
              </span>
            </div>
            <Progress value={percent} className="h-2" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "log-session", minutes: 10, xp: 5 })}
          >
            <Clock /> Log 10 minutes
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {plan.map((item, index) => (
          <Card key={item.id} className={item.done ? "border-success/30 bg-success/5" : undefined}>
            <CardContent className="flex flex-wrap items-center gap-4 pt-5 sm:pt-6">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  item.done ? "bg-success text-success-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                {item.done ? <Check className="size-5" /> : <item.icon className="size-5" />}
              </span>
              <div className="min-w-[200px] flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Step {index + 1} · {item.minutes} min
                </p>
                <p className="font-medium">{item.title}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
              <Button variant={item.done ? "secondary" : "default"} size="sm" asChild>
                <Link href={item.href}>
                  {item.done ? "Review again" : "Open"} <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="pt-5 sm:pt-6">
          <p className="font-semibold">Why this order?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Flashcards first while your attention is fresh, then new input (lesson, grammar, listening), then output
            (speaking, writing) — producing language after input is what turns passive knowledge into active
            ability. Reading text of the day: {" "}
            <Link href={`/reading/${reading.slug}`} className="font-medium text-primary hover:underline">
              {reading.title}
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </>
  );
}
