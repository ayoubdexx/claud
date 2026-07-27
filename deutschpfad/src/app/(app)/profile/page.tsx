"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, Flame, Mail, Pencil, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/misc";
import { evaluateAchievements, computeSkillScores, overallProgress, useLearner } from "@/lib/store";
import { formatMinutes, initials } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { state, dispatch, streak } = useLearner();
  const [name, setName] = React.useState(state.profile.name);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const progress = overallProgress(state);
  const skills = computeSkillScores(state);
  const unlocked = evaluateAchievements(state).filter((item) => item.done);
  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.minutes, 0);

  const upload = (file: File) => {
    if (file.size > 1_500_000) {
      toast.error("Please choose an image under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      toast.success("Avatar updated (stored on this device)");
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your identity on the platform, your learning summary and your certificates."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Profile" }]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardContent className="space-y-4 pt-5 sm:pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20">
                  {avatar ?? session?.user?.image ? (
                    <AvatarImage src={avatar ?? session?.user?.image ?? ""} alt={name} />
                  ) : null}
                  <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-border bg-background shadow-soft"
                  aria-label="Upload avatar"
                >
                  <Camera className="size-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) upload(file);
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold">{name}</p>
                <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Mail className="size-3.5" /> {session?.user?.email ?? "Guest — progress stored locally"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <LevelBadge level={state.profile.level} label="current" />
                  <Badge variant="secondary">Target {state.profile.targetLevel}</Badge>
                  {session?.user?.role ? (
                    <Badge variant="outline">
                      <ShieldCheck className="size-3" /> {session.user.role.toLowerCase()}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <Field label="Display name" htmlFor="profile-name">
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
            </Field>

            <Button
              onClick={() => {
                dispatch({ type: "profile", patch: { name } });
                toast.success("Profile updated");
              }}
            >
              <Pencil /> Save profile
            </Button>

            {!session?.user ? (
              <p className="rounded-xl bg-surface p-3 text-xs text-muted-foreground">
                Create an account to sync your progress across devices, join study groups and keep your data if you
                clear your browser.{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Register free →
                </Link>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Learning summary" />
              <div className="flex flex-wrap items-center gap-6">
                <ProgressRing value={progress.percent} size={96} stroke={9}>
                  <div className="text-center">
                    <p className="font-display text-lg font-semibold tabular-nums">{progress.percent}%</p>
                    <p className="text-[10px] uppercase text-muted-foreground">A1–B2</p>
                  </div>
                </ProgressRing>
                <div className="grid flex-1 grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Lessons</p>
                    <p className="font-display text-xl font-semibold tabular-nums">{progress.completed}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">XP</p>
                    <p className="font-display text-xl font-semibold tabular-nums">
                      <Zap className="mb-0.5 inline size-4 text-primary" /> {state.xp}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Streak</p>
                    <p className="font-display text-xl font-semibold tabular-nums">
                      <Flame className="mb-0.5 inline size-4 text-warning" /> {streak}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Time</p>
                    <p className="font-display text-xl font-semibold">{formatMinutes(totalMinutes)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
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

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle
                title="Certificates"
                description="Complete every lesson of a level to unlock its certificate."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {(["A1", "A2", "B1", "B2"] as const).map((level) => {
                  const levelLessons = Object.entries(state.lessons).filter(([slug]) =>
                    slug.startsWith(level.toLowerCase()),
                  );
                  const done = levelLessons.filter(([, item]) => item.status === "completed").length;
                  const unlockedCert = done > 0 && done === levelLessons.length;
                  return (
                    <div
                      key={level}
                      className={`rounded-xl border p-4 ${
                        unlockedCert ? "border-success/40 bg-success/5" : "border-dashed border-border"
                      }`}
                    >
                      <LevelBadge level={level} />
                      <p className="mt-2 text-sm font-medium">
                        {unlockedCert ? "Certificate unlocked" : "Not yet unlocked"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {done}/{levelLessons.length || "?"} lessons completed
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle
                title={`Achievements (${unlocked.length})`}
                action={
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/achievements">All →</Link>
                  </Button>
                }
              />
              <div className="flex flex-wrap gap-2">
                {unlocked.length ? (
                  unlocked.map(({ achievement }) => (
                    <Badge key={achievement.id} variant="success">
                      {achievement.title}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete your first lesson to unlock your first achievement.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
