"use client";

import * as React from "react";
import { Check, Mic, MicOff, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/learn/audio-button";
import { similarity } from "@/lib/exercises";
import { useSpeechRecognition } from "@/lib/speech";
import { useLearner } from "@/lib/store";
import type { SpeakingTask } from "@/lib/types";
import { cn } from "@/lib/utils";

function TargetPractice({ task, target }: { task: SpeakingTask; target: { de: string; en: string } }) {
  const { dispatch } = useLearner();
  const { start, stop, listening, transcript, error, supported, reset } = useSpeechRecognition();
  const [score, setScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!transcript) return;
    const value = similarity(transcript, target.de);
    setScore(value);
  }, [transcript, target.de]);

  const save = () => {
    if (score === null) return;
    dispatch({
      type: "speaking-save",
      result: {
        slug: task.slug,
        itemId: target.de,
        score,
        transcript,
        at: new Date().toISOString(),
      },
    });
    toast.success(`Gespeichert: ${Math.round(score * 100)}%`);
  };

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-start gap-2">
        <AudioButton text={target.de} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{target.de}</p>
          <p className="text-sm text-muted-foreground">{target.en}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {supported ? (
          <Button
            size="sm"
            variant={listening ? "destructive" : "outline"}
            onClick={() => {
              if (listening) {
                stop();
              } else {
                reset();
                setScore(null);
                start();
              }
            }}
          >
            {listening ? <MicOff /> : <Mic />}
            {listening ? "Stop" : "Nachsprechen"}
          </Button>
        ) : (
          <Badge variant="warning">Spracherkennung nur in Chrome/Edge verfügbar</Badge>
        )}
        {score !== null ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => { reset(); setScore(null); }}>
              <RefreshCcw /> Nochmal
            </Button>
            <Button size="sm" onClick={save}>
              <Check /> Ergebnis speichern
            </Button>
          </>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      {transcript ? (
        <div className="mt-3 rounded-xl bg-surface p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Erkannt</p>
          <p className="text-sm">{transcript}</p>
          {score !== null ? (
            <div className="mt-2">
              <Progress
                value={Math.round(score * 100)}
                className="h-1.5"
                indicatorClassName={score >= 0.8 ? "bg-success" : score >= 0.6 ? "bg-warning" : "bg-destructive"}
              />
              <p className={cn("mt-1 text-xs", score >= 0.8 ? "text-success" : "text-muted-foreground")}>
                Übereinstimmung {Math.round(score * 100)}%{" "}
                {score >= 0.8 ? "— sehr gut!" : score >= 0.6 ? "— fast, langsamer sprechen." : "— Wort für Wort üben."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SpeakingPractice({ task }: { task: SpeakingTask }) {
  const [openPrompt, setOpenPrompt] = React.useState<number | null>(0);

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 pt-5 sm:pt-6">
          <p className="font-semibold">Szenario</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{task.scenario}</p>
          <p className="rounded-xl bg-primary/8 p-3 text-sm text-primary">Ziel: {task.goal}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5 sm:pt-6">
          <p className="font-semibold">Fragen & Musterantworten</p>
          {task.prompts.map((prompt, index) => (
            <div key={prompt.question} className="rounded-2xl border border-border">
              <button
                className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
                onClick={() => setOpenPrompt(openPrompt === index ? null : index)}
              >
                <span className="text-sm font-medium">
                  {index + 1}. {prompt.question}
                </span>
                <Badge variant="secondary">{openPrompt === index ? "−" : "+"}</Badge>
              </button>
              {openPrompt === index ? (
                <div className="space-y-3 border-t border-border p-3.5">
                  {prompt.hint ? <p className="text-xs text-muted-foreground">Hinweis: {prompt.hint}</p> : null}
                  <div className="flex items-start gap-2 rounded-xl bg-surface p-3">
                    <AudioButton text={prompt.sample} />
                    <p className="text-sm">{prompt.sample}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5 sm:pt-6">
          <div>
            <p className="font-semibold">Aussprache-Training mit Bewertung</p>
            <p className="text-sm text-muted-foreground">
              Sprechen Sie die Sätze nach. Die Spracherkennung vergleicht Ihre Aufnahme mit dem Zielsatz.
            </p>
          </div>
          <div className="space-y-3">
            {task.targets.map((target) => (
              <TargetPractice key={target.de} task={task} target={target} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-5 sm:pt-6">
          <p className="font-semibold">Nützliche Wendungen</p>
          <ul className="space-y-2">
            {task.usefulPhrases.map((phrase) => (
              <li key={phrase.de} className="flex items-start gap-2">
                <AudioButton text={phrase.de} />
                <div>
                  <p className="text-sm font-medium">{phrase.de}</p>
                  <p className="text-sm text-muted-foreground">{phrase.en}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
