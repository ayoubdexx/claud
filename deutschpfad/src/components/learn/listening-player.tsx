"use client";

import * as React from "react";
import { Eye, EyeOff, Gauge, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAYBACK_RATES, useSpeech } from "@/lib/speech";
import { useLearner } from "@/lib/store";
import type { TranscriptLine } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListeningPlayer({
  transcript,
  title,
  seconds,
  playLimit,
}: {
  transcript: TranscriptLine[];
  title?: string;
  seconds?: number;
  playLimit?: number;
}) {
  const { state, dispatch } = useLearner();
  const { speak, stop, speaking } = useSpeech();
  const [rate, setRate] = React.useState(state.profile.playbackRate);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [plays, setPlays] = React.useState(0);
  const [activeLine, setActiveLine] = React.useState<number | null>(null);

  const limitReached = typeof playLimit === "number" && plays >= playLimit;

  const playAll = () => {
    if (speaking) {
      stop();
      setActiveLine(null);
      return;
    }
    setPlays((count) => count + 1);
    dispatch({ type: "log-session", minutes: Math.max(1, Math.round((seconds ?? 60) / 60)) });

    let index = 0;
    const next = () => {
      if (index >= transcript.length) {
        setActiveLine(null);
        return;
      }
      const line = transcript[index];
      setActiveLine(index);
      index += 1;
      speak(`${line.de}`, { rate, voiceURI: state.profile.voiceURI, onEnd: next });
    };
    next();
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-5 sm:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{title ?? "Audio"}</p>
            <p className="text-xs text-muted-foreground">
              {transcript.length} Sprechbeiträge{seconds ? ` · ca. ${seconds}s` : ""}
              {typeof playLimit === "number" ? ` · ${playLimit}× hören erlaubt (${plays} genutzt)` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={playAll} disabled={limitReached && !speaking}>
              {speaking ? <Pause /> : <Play />}
              {speaking ? "Pause" : plays ? "Nochmal hören" : "Abspielen"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Restart"
              onClick={() => {
                stop();
                setActiveLine(null);
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Gauge className="size-4 text-muted-foreground" />
          {PLAYBACK_RATES.map((value) => (
            <button
              key={value}
              onClick={() => setRate(value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                rate === value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-ring",
              )}
            >
              {value}×
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setShowTranscript((value) => !value)}
          >
            {showTranscript ? <EyeOff /> : <Eye />}
            {showTranscript ? "Transkript verbergen" : "Transkript zeigen"}
          </Button>
        </div>

        {showTranscript ? (
          <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
            {transcript.map((line, index) => (
              <div
                key={`${line.speaker}-${index}`}
                className={cn(
                  "flex gap-3 rounded-lg p-2 transition-colors",
                  activeLine === index && "bg-primary/10",
                )}
              >
                <Badge variant="secondary" className="h-fit shrink-0">
                  {line.speaker}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{line.de}</p>
                  {line.en && state.profile.showTranslations ? (
                    <p className="text-sm text-muted-foreground">{line.en}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto shrink-0"
                  aria-label="Play line"
                  onClick={() => speak(line.de, { rate, voiceURI: state.profile.voiceURI })}
                >
                  <Play />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Hören Sie zuerst ohne Transkript und beantworten Sie die Fragen. Erst danach das Transkript öffnen — so
            trainieren Sie wie in der Prüfung.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
