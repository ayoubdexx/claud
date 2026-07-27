"use client";

import * as React from "react";
import { CalendarPlus, Check, Clock, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/misc";
import { lessons } from "@/content";
import { useLearner } from "@/lib/store";
import type { PlannerTask } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";

const kinds: PlannerTask["kind"][] = ["lesson", "revision", "vocab", "speaking", "exam", "custom"];

export default function PlannerPage() {
  const { state, dispatch } = useLearner();
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [minutes, setMinutes] = React.useState(30);
  const [kind, setKind] = React.useState<PlannerTask["kind"]>("lesson");

  const add = () => {
    if (!title.trim()) {
      toast.error("Bitte geben Sie eine Aufgabe ein.");
      return;
    }
    dispatch({
      type: "planner-add",
      task: { id: crypto.randomUUID(), date, title, kind, minutes, done: false },
    });
    setTitle("");
    toast.success("Zum Plan hinzugefügt");
  };

  const generateWeek = () => {
    const pending = lessons
      .filter((lesson) => state.lessons[lesson.slug]?.status !== "completed")
      .slice(0, 7);
    pending.forEach((lesson, index) => {
      dispatch({
        type: "planner-add",
        task: {
          id: crypto.randomUUID(),
          date: todayISO(index),
          title: `Lektion: ${lesson.title}`,
          kind: "lesson",
          minutes: lesson.minutes,
          done: false,
          href: `/learn/${lesson.slug}`,
        },
      });
      dispatch({
        type: "planner-add",
        task: {
          id: crypto.randomUUID(),
          date: todayISO(index),
          title: "20 Karteikarten wiederholen",
          kind: "vocab",
          minutes: 10,
          done: false,
          href: "/flashcards",
        },
      });
    });
    toast.success("7-Tage-Plan erstellt");
  };

  const days = Array.from({ length: 14 }, (_, index) => todayISO(index));
  const byDate = days.map((day) => ({
    date: day,
    tasks: state.planner.filter((task) => task.date === day),
  }));

  const weekTasks = state.planner.filter((task) => days.slice(0, 7).includes(task.date));
  const weekDone = weekTasks.filter((task) => task.done).length;
  const weekMinutes = weekTasks.reduce((sum, task) => sum + task.minutes, 0);

  const examCountdown = state.profile.examDate
    ? Math.ceil((new Date(state.profile.examDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <>
      <PageHeader
        title="Study planner"
        description="Plan the next two weeks, generate a week automatically from your unfinished lessons, and track how much you actually did."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Study planner" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{state.planner.length} tasks</Badge>
            {examCountdown !== null ? (
              <Badge variant={examCountdown < 30 ? "warning" : "outline"}>Exam in {examCountdown} days</Badge>
            ) : null}
          </>
        }
        actions={
          <Button variant="outline" onClick={generateWeek}>
            <CalendarPlus /> Generate 7-day plan
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Target className="size-3.5" /> This week
            </p>
            <p className="font-display text-2xl font-semibold">
              {weekDone}/{weekTasks.length}
            </p>
            <Progress
              value={weekTasks.length ? (weekDone / weekTasks.length) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3.5" /> Planned minutes
            </p>
            <p className="font-display text-2xl font-semibold">{weekMinutes}</p>
            <p className="text-xs text-muted-foreground">
              Goal {state.profile.dailyGoalMinutes * 7} min per week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily goal</p>
            <p className="font-display text-2xl font-semibold">{state.profile.dailyGoalMinutes} min</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 px-0"
              onClick={() =>
                dispatch({
                  type: "profile",
                  patch: { dailyGoalMinutes: state.profile.dailyGoalMinutes === 30 ? 60 : 30 },
                })
              }
            >
              Switch to {state.profile.dailyGoalMinutes === 30 ? 60 : 30} min
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5 sm:pt-6">
          <SectionTitle title="Add a task" />
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
            <Field label="Task" htmlFor="task-title">
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="z. B. Dativ wiederholen"
              />
            </Field>
            <Field label="Date" htmlFor="task-date">
              <Input id="task-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
            <Field label="Minutes" htmlFor="task-minutes">
              <Input
                id="task-minutes"
                type="number"
                min={5}
                max={240}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
              />
            </Field>
            <Field label="Type">
              <Select value={kind} onValueChange={(value) => setKind(value as PlannerTask["kind"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kinds.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button onClick={add}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {byDate.map(({ date: day, tasks }) => (
          <Card key={day} className={cn(day === todayISO() && "border-primary/40")}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">
                  {new Date(day).toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })}
                  {day === todayISO() ? <Badge className="ml-2">heute</Badge> : null}
                </p>
                <span className="text-xs text-muted-foreground">
                  {tasks.reduce((sum, task) => sum + task.minutes, 0)} min
                </span>
              </div>

              {tasks.length ? (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3",
                        task.done ? "border-success/30 bg-success/5" : "border-border",
                      )}
                    >
                      <button
                        onClick={() => dispatch({ type: "planner-toggle", id: task.id })}
                        aria-label="Toggle done"
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full border",
                          task.done ? "border-success bg-success text-success-foreground" : "border-border",
                        )}
                      >
                        {task.done ? <Check className="size-3.5" /> : null}
                      </button>
                      <span className={cn("flex-1 text-sm", task.done && "text-muted-foreground line-through")}>
                        {task.title}
                      </span>
                      <Badge variant="secondary">{task.kind}</Badge>
                      <span className="text-xs tabular-nums text-muted-foreground">{task.minutes}′</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete task"
                        onClick={() => dispatch({ type: "planner-delete", id: task.id })}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing planned.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
