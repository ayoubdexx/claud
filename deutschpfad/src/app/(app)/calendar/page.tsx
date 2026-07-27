"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/misc";
import { useLearner } from "@/lib/store";
import { cn, todayISO } from "@/lib/utils";

function intensity(minutes: number) {
  if (minutes === 0) return "bg-muted";
  if (minutes < 15) return "bg-primary/25";
  if (minutes < 30) return "bg-primary/45";
  if (minutes < 60) return "bg-primary/70";
  return "bg-primary";
}

export default function CalendarPage() {
  const { state, streak } = useLearner();
  const [monthOffset, setMonthOffset] = React.useState(0);

  const sessionMap = new Map(state.sessions.map((session) => [session.date, session]));

  /* 26-week heatmap */
  const weeks: string[][] = [];
  const start = new Date();
  start.setDate(start.getDate() - 181);
  const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setDate(start.getDate() - startDay);
  for (let week = 0; week < 27; week++) {
    const days: string[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      days.push(date.toISOString().slice(0, 10));
    }
    weeks.push(days);
  }

  /* Month grid with planner tasks */
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = monthDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const firstWeekday = (monthDate.getDay() === 0 ? 6 : monthDate.getDay() - 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), index + 1);
      return date.toISOString().slice(0, 10);
    }),
  ];

  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.minutes, 0);
  const activeDays = state.sessions.filter((session) => session.minutes > 0).length;

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Your study history as a heatmap plus a month view with planner tasks and exam countdown."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Calendar" }]}
        eyebrow={
          <>
            <Badge variant="secondary">
              <Flame className="size-3" /> {streak} day streak
            </Badge>
            <Badge variant="secondary">{activeDays} active days</Badge>
            <Badge variant="secondary">{Math.round(totalMinutes / 60)} h total</Badge>
          </>
        }
        actions={
          <Button variant="outline" asChild>
            <Link href="/planner">
              <CalendarDays /> Planner
            </Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-5 sm:pt-6">
          <p className="mb-3 font-semibold">Last 6 months</p>
          <div className="scroll-slim overflow-x-auto pb-2">
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const session = sessionMap.get(day);
                    const minutes = session?.minutes ?? 0;
                    const future = day > todayISO();
                    return (
                      <Tooltip
                        key={day}
                        content={`${new Date(day).toLocaleDateString("de-DE")}: ${minutes} min${
                          session?.cards ? `, ${session.cards} cards` : ""
                        }`}
                      >
                        <div
                          className={cn(
                            "size-3 rounded-sm",
                            future ? "bg-transparent" : intensity(minutes),
                            day === todayISO() && "ring-1 ring-primary ring-offset-1 ring-offset-background",
                          )}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>less</span>
            {["bg-muted", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"].map((className) => (
              <span key={className} className={cn("size-3 rounded-sm", className)} />
            ))}
            <span>more</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold capitalize">{monthName}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMonthOffset((value) => value - 1)}>
                ←
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMonthOffset(0)}>
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMonthOffset((value) => value + 1)}>
                →
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
              <div key={day} className="py-1 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;
              const session = sessionMap.get(day);
              const tasks = state.planner.filter((task) => task.date === day);
              const isToday = day === todayISO();
              const isExam = state.profile.examDate === day;
              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[74px] rounded-xl border p-1.5 text-left text-xs",
                    isToday ? "border-primary bg-primary/5" : "border-border",
                    isExam && "border-warning bg-warning/10",
                  )}
                >
                  <p className="font-medium tabular-nums">{Number(day.slice(8))}</p>
                  {session?.minutes ? (
                    <p className="mt-0.5 text-[10px] text-primary">{session.minutes}′</p>
                  ) : null}
                  {isExam ? <p className="mt-0.5 text-[10px] font-semibold text-warning">Prüfung</p> : null}
                  {tasks.slice(0, 2).map((task) => (
                    <p key={task.id} className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      · {task.title}
                    </p>
                  ))}
                  {tasks.length > 2 ? (
                    <p className="text-[10px] text-muted-foreground">+{tasks.length - 2} more</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
