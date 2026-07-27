"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Flame, Lock, Plus, Trophy, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/misc";
import { computeStreak, overallProgress, useLearner } from "@/lib/store";
import { LEVELS, type Level } from "@/lib/types";

interface GroupPayload {
  id: string;
  name: string;
  description: string;
  level: Level;
  visibility: "public" | "private";
  code: string;
  members: { userId: string; name: string; xp: number; streak: number; level: Level }[];
  challenge?: { title: string; goal: number; unit: string; endsAt: string; progress: number };
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const { state } = useLearner();
  const queryClient = useQueryClient();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [level, setLevel] = React.useState<Level>("A1");
  const [code, setCode] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups");
      return (await response.json()) as { groups: GroupPayload[] };
    },
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name, description, level, visibility: "public" }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Failed");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Study group created");
      setName("");
      setDescription("");
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", code }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Failed");
      return response.json();
    },
    onSuccess: () => {
      toast.success("You joined the group");
      setCode("");
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const groups = data?.groups ?? [];
  const progress = overallProgress(state);
  const myStreak = computeStreak(state.sessions);

  /* Local leaderboard: you plus everyone in your groups. */
  const leaderboard = [
    {
      userId: "me",
      name: session?.user?.name ?? state.profile.name,
      xp: state.xp,
      streak: myStreak,
      level: state.profile.level,
      me: true,
    },
    ...groups.flatMap((group) =>
      group.members
        .filter((member) => member.userId !== session?.user?.id)
        .map((member) => ({ ...member, me: false })),
    ),
  ]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title="Study groups"
        description="Learning German alone is hard. Create a group, share the invite code with friends, compare progress and run a weekly challenge."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Community" }]}
        eyebrow={<Badge variant="secondary">{groups.length} groups</Badge>}
      />

      {!session?.user ? (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5 sm:pt-6">
            <p className="flex items-center gap-2 text-sm">
              <Lock className="size-4 text-warning" />
              Sign in to create or join a study group. Your solo progress keeps working either way.
            </p>
            <Button size="sm" asChild>
              <a href="/login">Sign in</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <SectionTitle title="Create a group" description="You become the group teacher and get an invite code." />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Group name" htmlFor="group-name">
                  <Input
                    id="group-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="B1 Prüfungsgruppe"
                  />
                </Field>
                <Field label="Level">
                  <Select value={level} onValueChange={(value) => setLevel(value as Level)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Description" htmlFor="group-description">
                <Textarea
                  id="group-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Wir treffen uns dienstags online und schreiben jede Woche einen Text."
                />
              </Field>
              <Button
                onClick={() => createGroup.mutate()}
                loading={createGroup.isPending}
                disabled={!session?.user || !name.trim()}
              >
                <Plus /> Create group
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-5 sm:pt-6">
              <SectionTitle title="Join with a code" />
              <div className="flex flex-wrap gap-2">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="sm:max-w-[200px]"
                />
                <Button
                  variant="outline"
                  onClick={() => joinGroup.mutate()}
                  loading={joinGroup.isPending}
                  disabled={!session?.user || code.length < 4}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <SectionTitle title="Groups" description="Public groups you can join, and the ones you belong to." />
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading groups…</p>
            ) : groups.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="mb-2 flex items-center gap-2">
                        <LevelBadge level={group.level} />
                        <Badge variant="secondary">{group.visibility}</Badge>
                        <Badge variant="outline">Code {group.code}</Badge>
                      </div>
                      <p className="font-semibold">{group.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="size-3.5" /> {group.members.length} members
                      </div>

                      {group.challenge ? (
                        <div className="mt-3 rounded-xl bg-surface p-3">
                          <p className="text-sm font-medium">{group.challenge.title}</p>
                          <Progress
                            value={(group.challenge.progress / group.challenge.goal) * 100}
                            className="mt-2 h-1.5"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {group.challenge.progress}/{group.challenge.goal} {group.challenge.unit} · ends{" "}
                            {new Date(group.challenge.endsAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      ) : null}

                      <ul className="mt-3 space-y-1 text-sm">
                        {group.members.slice(0, 5).map((member) => (
                          <li key={member.userId} className="flex items-center justify-between">
                            <span className="truncate">{member.name}</span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Zap className="size-3" /> {member.xp}
                              <Flame className="size-3" /> {member.streak}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No groups yet"
                description="Create the first one — a group of three or four learners preparing for the same exam works best."
                icon={<Users className="size-6" />}
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Leaderboard" description="XP earned from lessons, cards, quizzes and exams." />
              <ol className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <li
                    key={`${entry.userId}-${index}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                      entry.me ? "bg-primary/10" : "bg-surface"
                    }`}
                  >
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">
                      {index === 0 ? <Crown className="mx-auto size-4 text-warning" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {entry.name} {entry.me ? <span className="text-xs text-primary">(you)</span> : null}
                    </span>
                    <LevelBadge level={entry.level} />
                    <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                      <Zap className="size-3" /> {entry.xp}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Your stats to share" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lessons completed</span>
                  <span className="font-semibold tabular-nums">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">XP</span>
                  <span className="font-semibold tabular-nums">{state.xp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-semibold tabular-nums">{myStreak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cards</span>
                  <span className="font-semibold tabular-nums">{Object.keys(state.cards).length}</span>
                </div>
                <Progress value={progress.percent} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Group challenge ideas" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-warning" /> 500 flashcards in a week
                </li>
                <li className="flex gap-2">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-warning" /> One written text each, corrected by a
                  partner
                </li>
                <li className="flex gap-2">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-warning" /> Everyone completes the same mock exam
                  module and compares scores
                </li>
                <li className="flex gap-2">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-warning" /> 7-day streak for the whole group
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
