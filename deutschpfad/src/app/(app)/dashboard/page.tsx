"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Flame,
  Layers,
  Play,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { courses, lessons, mockExams } from "@/content";
import { quickActions } from "@/components/layout/nav-config";
import {
  computeSkillScores,
  evaluateAchievements,
  levelProgress,
  overallProgress,
  useLearner,
} from "@/lib/store";
import { LEVELS } from "@/lib/types";
import { formatMinutes, todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const { state, streak, stats } = useLearner();

  const progress = overallProgress(state);
  const skills = computeSkillScores(state);
  const achievements = evaluateAchievements(state);
  const unlocked = achievements.filter((item) => item.done);

  const currentLevel = state.profile.level;
  const levelLessons = lessons.filter((lesson) => lesson.level === currentLevel);
  const nextUp =
    levelLessons.find((lesson) => state.lessons[lesson.slug]?.status !== "completed") ?? lessons[0];

  const minutesToday = state.sessions.find((session) => session.date === todayISO())?.minutes ?? 0;
  const goalPercent = Math.min(100, Math.round((minutesToday / state.profile.dailyGoalMinutes) * 100));
  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.minutes, 0);

  const examCountdown = state.profile.examDate
    ? Math.ceil((new Date(state.profile.examDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <>
      <PageHeader
        title={`Hallo${state.profile.name ? `, ${state.profile.name.split(" ")[0]}` : ""}!`}
        description="Your German at a glance. Keep the streak, clear the flashcard queue and take the next lesson."
        eyebrow={
          <>
            <LevelBadge level={currentLevel} label="current level" />
            <Badge variant="secondary">Target {state.profile.targetLevel}</Badge>
            {examCountdown !== null ? (
              <Badge variant={examCountdown < 30 ? "warning" : "outline"}>
                Exam in {examCountdown} days
              </Badge>
            ) : null}
          </>
        }
        actions={
          <Button asChild>
            <Link href={`/learn/${nextUp.slug}`}>
              <Play /> Continue learning
            </Link>
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5 sm:pt-6">
            <ProgressRing value={goalPercent} size={72} stroke={7}>
              <span className="text-xs font-semibold tabular-nums">{goalPercent}%</span>
            </ProgressRing>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily goal</p>
              <p className="font-display text-xl font-semibold">
                {minutesToday}/{state.profile.dailyGoalMinutes} min
              </p>
              <p className="text-xs text-muted-foreground">Total {formatMinutes(totalMinutes)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Flame className="size-3.5 text-warning" /> Streak
            </p>
            <p className="font-display text-3xl font-semibold tabular-nums">{streak}</p>
            <p className="text-xs text-muted-foreground">
              {streak === 0 ? "Start today to open your streak" : "days in a row — don't break it"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Layers className="size-3.5 text-primary" /> Flashcards due
            </p>
            <p className="font-display text-3xl font-semibold tabular-nums">{stats.due}</p>
            <p className="text-xs text-muted-foreground">
              {stats.total} cards · {stats.mature} mature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Zap className="size-3.5 text-accent" /> XP
            </p>
            <p className="font-display text-3xl font-semibold tabular-nums">{state.xp}</p>
            <p className="text-xs text-muted-foreground">
              {unlocked.length}/{achievements.length} achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue + quick actions */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="pt-5 sm:pt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next lesson</p>
              <LevelBadge level={nextUp.level} />
            </div>
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">{nextUp.title}</h3>
            <p className="text-sm text-muted-foreground">{nextUp.titleDe}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{nextUp.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {nextUp.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="capitalize">
                  {skill}
                </Badge>
              ))}
              <Badge variant="outline">{nextUp.minutes} min</Badge>
              <Badge variant="outline">{nextUp.xp} XP</Badge>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/learn/${nextUp.slug}`}>
                  <Play /> Start lesson
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/daily">
                  <CalendarCheck /> Today&apos;s plan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Quick actions" />
              <div className="grid gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-2.5 text-sm transition-colors hover:border-ring"
                  >
                    <Icon name={action.icon} className="size-4 text-primary" />
                    <span className="flex-1">{action.label}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Skill balance" description="Based on your quizzes, exams and submissions." />
              <div className="space-y-2.5">
                {Object.entries(skills).map(([skill, value]) => (
                  <div key={skill}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="capitalize">{skill}</span>
                      <span className="tabular-nums text-muted-foreground">{value}%</span>
                    </div>
                    <Progress value={value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course progress */}
      <div className="mt-8">
        <SectionTitle
          title="Your path from A1 to B2"
          description="Complete lessons to unlock the next level and the final exam."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">
                All courses <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((level) => {
            const course = courses.find((item) => item.level === level)!;
            const levelStats = levelProgress(state, level);
            return (
              <Card key={level} interactive>
                <Link href={`/courses/${level.toLowerCase()}`}>
                  <CardContent className="pt-5 sm:pt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <LevelBadge level={level} />
                      <span className="text-xs tabular-nums text-muted-foreground">{levelStats.percent}%</span>
                    </div>
                    <p className="font-semibold">{course.title.replace("German ", "")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{course.subtitle}</p>
                    <Progress value={levelStats.percent} className="mt-3 h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {levelStats.completed}/{levelStats.total} lessons · {course.modules.length} modules
                    </p>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent achievements + exam readiness */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle
              title="Achievements"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/achievements">
                    All <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <div className="space-y-2">
              {achievements.slice(0, 5).map(({ achievement, value, done }) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon name={achievement.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{achievement.title}</p>
                    <Progress
                      value={Math.min(100, (value / achievement.target) * 100)}
                      className="mt-1 h-1"
                      indicatorClassName={done ? "bg-success" : undefined}
                    />
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {Math.min(value, achievement.target)}/{achievement.target}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle
              title="Exam readiness"
              description="Take a mock exam to see where you stand."
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/exams">
                    Exams <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <div className="space-y-2">
              {mockExams.slice(0, 4).map((exam) => {
                const attempt = state.attempts.find((item) => item.examSlug === exam.slug);
                return (
                  <Link
                    key={exam.slug}
                    href={`/exams/${exam.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-ring"
                  >
                    <LevelBadge level={exam.level} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{exam.officialName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attempt ? `Last attempt: ${attempt.totalPercent}%` : "Not attempted yet"}
                      </p>
                    </div>
                    {attempt ? (
                      <Badge variant={attempt.passed ? "success" : "warning"}>{attempt.totalPercent}%</Badge>
                    ) : (
                      <Target className="size-4 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall */}
      <Card className="mt-8">
        <CardContent className="flex flex-wrap items-center gap-6 pt-5 sm:pt-6">
          <div className="flex items-center gap-4">
            <Trophy className="size-8 text-warning" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall course progress</p>
              <p className="font-display text-2xl font-semibold">
                {progress.completed} / {progress.total} lessons
              </p>
            </div>
          </div>
          <div className="min-w-[200px] flex-1">
            <Progress value={progress.percent} className="h-2.5" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
            <p className="mt-2 text-xs text-muted-foreground">
              {progress.percent}% of the A1–B2 path complete. Keep going — consistency beats intensity.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/statistics">
              <BookOpen /> Detailed statistics
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
