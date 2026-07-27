"use client";

import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { evaluateAchievements, useLearner } from "@/lib/store";
import { cn } from "@/lib/utils";

const tierStyles: Record<string, string> = {
  bronze: "bg-[#b45309]/12 text-[#b45309]",
  silver: "bg-muted text-foreground/70",
  gold: "bg-warning/15 text-warning",
  platinum: "bg-accent/15 text-accent",
};

export default function AchievementsPage() {
  const { state } = useLearner();
  const achievements = evaluateAchievements(state);
  const unlocked = achievements.filter((item) => item.done);
  const xpFromAchievements = unlocked.reduce((sum, item) => sum + item.achievement.xp, 0);

  return (
    <>
      <PageHeader
        title="Achievements"
        description="Milestones for consistency, vocabulary, exams and output. They exist for one reason: to make you come back tomorrow."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Achievements" }]}
        eyebrow={
          <>
            <Badge variant="secondary">
              <Trophy className="size-3" /> {unlocked.length}/{achievements.length} unlocked
            </Badge>
            <Badge variant="secondary">{xpFromAchievements} bonus XP</Badge>
          </>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-5 sm:pt-6">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Overall completion</span>
            <span className="tabular-nums text-muted-foreground">
              {Math.round((unlocked.length / achievements.length) * 100)}%
            </span>
          </div>
          <Progress
            value={(unlocked.length / achievements.length) * 100}
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-primary to-accent"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map(({ achievement, value, done }) => (
          <Card key={achievement.id} className={cn(done && "border-success/30")}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    done ? tierStyles[achievement.tier] : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon name={achievement.icon} className="size-5" />
                </span>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={done ? "success" : "secondary"} className="capitalize">
                    {achievement.tier}
                  </Badge>
                  <span className="text-xs text-muted-foreground">+{achievement.xp} XP</span>
                </div>
              </div>

              <p className="font-semibold">{achievement.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{achievement.description}</p>

              <div className="mt-3">
                <Progress
                  value={Math.min(100, (value / achievement.target) * 100)}
                  className="h-1.5"
                  indicatorClassName={done ? "bg-success" : undefined}
                />
                <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                  {Math.min(value, achievement.target)} / {achievement.target} {achievement.metric}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
