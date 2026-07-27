"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { grammarTopics, lessons } from "@/content";
import { computeSkillScores, levelProgress, overallProgress, useLearner } from "@/lib/store";
import { LEVELS } from "@/lib/types";
import { formatMinutes, todayISO } from "@/lib/utils";

export default function StatisticsPage() {
  const { state, streak, stats } = useLearner();
  const skills = computeSkillScores(state);
  const progress = overallProgress(state);

  const last30 = Array.from({ length: 30 }, (_, index) => {
    const date = todayISO(-(29 - index));
    const session = state.sessions.find((item) => item.date === date);
    return {
      date: date.slice(5),
      minutes: session?.minutes ?? 0,
      cards: session?.cards ?? 0,
      xp: session?.xp ?? 0,
    };
  });

  const skillData = Object.entries(skills).map(([skill, value]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    value,
  }));

  const levelData = LEVELS.map((level) => {
    const levelStats = levelProgress(state, level);
    return { level, percent: levelStats.percent, completed: levelStats.completed, total: levelStats.total };
  });

  const quizByTopic = grammarTopics
    .map((topic) => {
      const score = state.quizScores.find((item) => item.id === `grammar-quiz-${topic.slug}`);
      return score ? { topic: topic.title, level: topic.level, percent: score.percent } : null;
    })
    .filter(Boolean) as { topic: string; level: string; percent: number }[];

  const weak = [...quizByTopic].sort((a, b) => a.percent - b.percent).slice(0, 5);
  const strong = [...quizByTopic].sort((a, b) => b.percent - a.percent).slice(0, 5);

  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.minutes, 0);
  const wordsLearned = Object.values(state.cards).filter((card) => card.repetitions > 0).length;
  const examScores = state.attempts.map((attempt) => ({
    exam: attempt.examSlug.replace(/-mock-1/, ""),
    percent: attempt.totalPercent,
  }));

  const cefrEstimate = React.useMemo(() => {
    const completedByLevel = LEVELS.map((level) => levelProgress(state, level));
    for (let index = LEVELS.length - 1; index >= 0; index--) {
      if (completedByLevel[index].percent >= 70) return LEVELS[index];
    }
    return state.profile.level;
  }, [state]);

  return (
    <>
      <PageHeader
        title="Statistics"
        description="Everything the platform knows about your learning: time, streak, vocabulary, skill balance, quiz results, weak topics and exam scores."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Statistics" }]}
        eyebrow={
          <>
            <LevelBadge level={cefrEstimate} label="estimated CEFR" />
            <Badge variant="secondary">{formatMinutes(totalMinutes)} studied</Badge>
            <Badge variant="secondary">{streak} day streak</Badge>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lessons completed", value: `${progress.completed}/${lessons.length}`, extra: `${progress.percent}%` },
          { label: "Words learned", value: wordsLearned, extra: `${stats.mature} mature` },
          { label: "Grammar topics studied", value: `${state.grammarStudied.length}/${grammarTopics.length}` },
          { label: "Mock exams taken", value: state.attempts.length, extra: `${state.writings.length} writings` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-5 sm:pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="font-display text-2xl font-semibold tabular-nums">{item.value}</p>
              {item.extra ? <p className="text-xs text-muted-foreground">{item.extra}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Study time — last 30 days" description="Minutes per day and cards reviewed." />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="minutes" name="Minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cards" name="Cards" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Skill balance" description="Reading, listening, writing, speaking, grammar, vocabulary." />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData} outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.35}
                  />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Progress per level" />
            <div className="space-y-4">
              {levelData.map((item) => (
                <div key={item.level} className="flex items-center gap-4">
                  <ProgressRing value={item.percent} size={56} stroke={6}>
                    <span className="text-[10px] font-semibold tabular-nums">{item.percent}%</span>
                  </ProgressRing>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <LevelBadge level={item.level} />
                      <span className="tabular-nums text-muted-foreground">
                        {item.completed}/{item.total} lessons
                      </span>
                    </div>
                    <Progress value={item.percent} className="mt-1.5 h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Quiz scores over time" description="Each point is one quiz or drill." />
            {state.quizScores.length ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...state.quizScores]
                      .reverse()
                      .map((item, index) => ({ index: index + 1, percent: item.percent }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percent"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Take a quiz to start building your score history.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Weak topics" description="Revise these first — they cost the most marks." />
            {weak.length ? (
              <ul className="space-y-2">
                {weak.map((item) => (
                  <li key={item.topic} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm">{item.topic}</span>
                    <Progress value={item.percent} className="h-1.5 w-24" indicatorClassName="bg-warning" />
                    <span className="w-10 text-right text-sm tabular-nums">{item.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Complete some topic quizzes to see this analysis.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Strong topics" />
            {strong.length ? (
              <ul className="space-y-2">
                {strong.map((item) => (
                  <li key={item.topic} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm">{item.topic}</span>
                    <Progress value={item.percent} className="h-1.5 w-24" indicatorClassName="bg-success" />
                    <span className="w-10 text-right text-sm tabular-nums">{item.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {examScores.length ? (
        <Card className="mt-6">
          <CardContent className="pt-5 sm:pt-6">
            <SectionTitle title="Mock exam results" />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="exam" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="percent" name="Score %" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
