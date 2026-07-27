"use client";

import * as React from "react";
import { AlertTriangle, Check, FileText, Info, Lightbulb, Save, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyseWriting, type WritingFeedback } from "@/lib/writing-check";
import { useLearner } from "@/lib/store";
import type { WritingTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WritingStudio({ task }: { task: WritingTask }) {
  const { state, dispatch } = useLearner();
  const saved = state.writings.find((item) => item.slug === task.slug);
  const [text, setText] = React.useState(saved?.text ?? "");
  const [feedback, setFeedback] = React.useState<WritingFeedback | null>(null);
  const [showSample, setShowSample] = React.useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  /* Autosave every few seconds while typing. */
  React.useEffect(() => {
    if (!text.trim()) return;
    const timeout = setTimeout(() => {
      dispatch({
        type: "writing-save",
        submission: {
          slug: task.slug,
          title: task.title,
          text,
          score: feedback?.score ?? 0,
          updatedAt: new Date().toISOString(),
        },
      });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [text, dispatch, task.slug, task.title, feedback?.score]);

  const review = () => {
    const result = analyseWriting(text, task);
    setFeedback(result);
    dispatch({
      type: "writing-save",
      submission: {
        slug: task.slug,
        title: task.title,
        text,
        score: result.score,
        updatedAt: new Date().toISOString(),
      },
    });
    toast.success(`Score: ${result.score}/100`, {
      description: `${result.issues.filter((issue) => issue.type === "error").length} errors · ${result.connectorsUsed.length} connectors`,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 pt-5 sm:pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Ihr Text</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className={cn(words >= task.minWords && "text-success")}>
                  {words} / {task.minWords}{task.maxWords ? `–${task.maxWords}` : "+"} Wörter
                </span>
                <Progress value={Math.min(100, (words / task.minWords) * 100)} className="h-1.5 w-24" />
              </div>
            </div>

            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={16}
              placeholder="Schreiben Sie hier Ihren Text auf Deutsch…"
              className="min-h-[340px] font-[15px] leading-7"
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={review} disabled={!text.trim()}>
                <Wand2 /> Text prüfen
              </Button>
              <Button variant="outline" onClick={() => setShowSample((value) => !value)}>
                <FileText /> {showSample ? "Musterlösung verbergen" : "Musterlösung"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  dispatch({
                    type: "writing-save",
                    submission: {
                      slug: task.slug,
                      title: task.title,
                      text,
                      score: feedback?.score ?? 0,
                      updatedAt: new Date().toISOString(),
                    },
                  });
                  toast.success("Gespeichert");
                }}
              >
                <Save /> Speichern
              </Button>
            </div>
            {saved ? (
              <p className="text-xs text-muted-foreground">
                Autosave aktiv · zuletzt gespeichert {new Date(saved.updatedAt).toLocaleString("de-DE")}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {showSample ? (
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <Tabs defaultValue="sample">
                <TabsList>
                  <TabsTrigger value="sample">Musterlösung</TabsTrigger>
                  {task.nativeVersion ? <TabsTrigger value="native">Muttersprachliche Version</TabsTrigger> : null}
                </TabsList>
                <TabsContent value="sample">
                  <p className="whitespace-pre-line text-[15px] leading-7">{task.sampleAnswer}</p>
                </TabsContent>
                {task.nativeVersion ? (
                  <TabsContent value="native">
                    <p className="whitespace-pre-line text-[15px] leading-7">{task.nativeVersion}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      So würde ein Muttersprachler denselben Inhalt formulieren — kürzer, idiomatischer, mit
                      höherem Register.
                    </p>
                  </TabsContent>
                ) : null}
              </Tabs>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 pt-5 sm:pt-6">
            <p className="font-semibold">Aufgabe</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{task.scenario}</p>
            <ul className="space-y-1.5 text-sm">
              {task.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {bullet}
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-surface p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aufbau</p>
              <ul className="space-y-1 text-xs">
                {task.structure.map((part) => (
                  <li key={part.part}>
                    <span className="font-medium">{part.part}:</span>{" "}
                    <span className="text-muted-foreground">{part.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nützliche Wendungen
              </p>
              <ul className="space-y-1 text-sm">
                {task.usefulPhrases.map((phrase) => (
                  <li key={phrase.de}>
                    <span className="font-medium">{phrase.de}</span>
                    <span className="text-muted-foreground"> — {phrase.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {feedback ? (
          <Card>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Automatische Korrektur</p>
                <Badge variant={feedback.score >= 80 ? "success" : feedback.score >= 60 ? "warning" : "danger"}>
                  {feedback.score}/100
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-surface p-2.5">
                  <p className="font-display text-lg font-semibold">{feedback.words}</p>
                  <p className="text-muted-foreground">Wörter</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <p className="font-display text-lg font-semibold">{feedback.sentences}</p>
                  <p className="text-muted-foreground">Sätze</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <p className="font-display text-lg font-semibold">{feedback.connectorsUsed.length}</p>
                  <p className="text-muted-foreground">Konnektoren</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Register erkannt: <span className="font-medium text-foreground">{feedback.registerDetected}</span> ·
                Ø Satzlänge {feedback.averageSentenceLength}
              </p>

              {feedback.strengths.length ? (
                <ul className="space-y-1 text-sm">
                  {feedback.strengths.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-success">
                      <Check className="mt-0.5 size-4 shrink-0" /> <span className="text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {feedback.issues.length ? (
                <div className="space-y-2">
                  {feedback.issues.map((issue, index) => {
                    const IconComponent =
                      issue.type === "error" ? AlertTriangle : issue.type === "warning" ? Info : Lightbulb;
                    return (
                      <div
                        key={`${issue.message}-${index}`}
                        className={cn(
                          "rounded-xl border p-3 text-sm",
                          issue.type === "error" && "border-destructive/30 bg-destructive/5",
                          issue.type === "warning" && "border-warning/30 bg-warning/5",
                          issue.type === "hint" && "border-border bg-surface",
                        )}
                      >
                        <p className="flex items-start gap-2 font-medium">
                          <IconComponent className="mt-0.5 size-4 shrink-0" />
                          {issue.message}
                        </p>
                        {issue.excerpt ? (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">„{issue.excerpt}“</p>
                        ) : null}
                        {issue.suggestion ? (
                          <p className="mt-1 text-xs">
                            <span className="text-muted-foreground">Besser: </span>
                            <span className="font-medium">{issue.suggestion}</span>
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-success">
                  <Sparkles className="size-4" /> Keine Fehler gefunden — sehr gut!
                </p>
              )}

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Checkliste
                </p>
                <ul className="space-y-1 text-sm">
                  {task.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 items-center justify-center rounded border border-border text-[10px]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
