"use client";

import * as React from "react";
import { Download, RotateCcw, Save, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Switch } from "@/components/ui/misc";
import { useTheme } from "@/components/theme-provider";
import { PLAYBACK_RATES, useGermanVoices, useSpeech } from "@/lib/speech";
import { useLearner } from "@/lib/store";
import { LEVELS, type Level } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { state, dispatch } = useLearner();
  const { theme, setTheme } = useTheme();
  const voices = useGermanVoices();
  const { speak } = useSpeech();
  const [name, setName] = React.useState(state.profile.name);
  const [goal, setGoal] = React.useState(state.profile.dailyGoalMinutes);
  const [examDate, setExamDate] = React.useState(state.profile.examDate ?? "");

  React.useEffect(() => {
    setName(state.profile.name);
    setGoal(state.profile.dailyGoalMinutes);
    setExamDate(state.profile.examDate ?? "");
  }, [state.profile]);

  const save = () => {
    dispatch({
      type: "profile",
      patch: { name, dailyGoalMinutes: goal, examDate: examDate || undefined },
    });
    toast.success("Settings saved");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deutschpfad-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Learning preferences, audio, appearance and your data."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-5 sm:pt-6">
            <SectionTitle title="Learning" />
            <Field label="Display name" htmlFor="name">
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </Field>

            <Field label="Current level" hint="Used for the daily plan">
              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map((level: Level) => (
                  <button
                    key={level}
                    onClick={() => dispatch({ type: "profile", patch: { level } })}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-semibold transition-colors",
                      state.profile.level === level
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-ring",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Target level">
              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map((level: Level) => (
                  <button
                    key={level}
                    onClick={() => dispatch({ type: "profile", patch: { targetLevel: level } })}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-semibold transition-colors",
                      state.profile.targetLevel === level
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-ring",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Daily goal (minutes)" htmlFor="goal">
              <Input
                id="goal"
                type="number"
                min={5}
                max={240}
                value={goal}
                onChange={(event) => setGoal(Number(event.target.value))}
              />
            </Field>

            <Field label="Exam date" htmlFor="exam" hint="Shows a countdown on the dashboard">
              <Input id="exam" type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
            </Field>

            <Button onClick={save}>
              <Save /> Save changes
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <SectionTitle title="Audio & speech" />

              <Field label="German voice" hint={`${voices.length} available`}>
                <Select
                  value={state.profile.voiceURI ?? "auto"}
                  onValueChange={(value) =>
                    dispatch({ type: "profile", patch: { voiceURI: value === "auto" ? undefined : value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Automatic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic (first de-DE voice)</SelectItem>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Default playback speed">
                <div className="flex flex-wrap gap-2">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => dispatch({ type: "profile", patch: { playbackRate: rate } })}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm font-medium",
                        state.profile.playbackRate === rate
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border",
                      )}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              </Field>

              <Button
                variant="outline"
                onClick={() =>
                  speak("Guten Tag! Ich bin die deutsche Stimme von DeutschPfad. Größe, Übung, schön.", {
                    rate: state.profile.playbackRate,
                    voiceURI: state.profile.voiceURI,
                  })
                }
              >
                <Volume2 /> Test voice
              </Button>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show English translations</p>
                  <p className="text-xs text-muted-foreground">Hide them to force yourself into German only.</p>
                </div>
                <Switch
                  checked={state.profile.showTranslations}
                  onCheckedChange={(checked) => dispatch({ type: "profile", patch: { showTranslations: checked } })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Autoplay audio in lessons</p>
                  <p className="text-xs text-muted-foreground">Plays dialogues automatically when a lesson opens.</p>
                </div>
                <Switch
                  checked={state.profile.autoplayAudio}
                  onCheckedChange={(checked) => dispatch({ type: "profile", patch: { autoplayAudio: checked } })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <SectionTitle title="Appearance" />
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setTheme(option)}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-medium capitalize transition-colors",
                      theme === option ? "border-primary bg-primary/10 text-primary" : "border-border",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <SectionTitle title="Your data" description="Progress is stored locally and synced when signed in." />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportData}>
                  <Download /> Export backup (JSON)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void fetch("/api/progress", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ state }),
                    }).then(() => toast.success("Synced to your account"));
                  }}
                >
                  <RotateCcw /> Sync now
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!window.confirm("Delete all local progress? This cannot be undone.")) return;
                    dispatch({ type: "reset" });
                    toast.info("All local data deleted");
                  }}
                >
                  <Trash2 /> Delete all data
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{Object.keys(state.lessons).length} lessons tracked</Badge>
                <Badge variant="secondary">{Object.keys(state.cards).length} cards</Badge>
                <Badge variant="secondary">{state.notes.length} notes</Badge>
                <Badge variant="secondary">{state.attempts.length} exam attempts</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
