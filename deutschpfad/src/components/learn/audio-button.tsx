"use client";

import * as React from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearner } from "@/lib/store";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function AudioButton({
  text,
  label,
  size = "icon-sm",
  variant = "ghost",
  className,
  rate,
}: {
  text: string;
  label?: string;
  size?: "icon" | "icon-sm" | "sm" | "default";
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
  rate?: number;
}) {
  const { speak, stop, speaking, supported } = useSpeech();
  const { state } = useLearner();

  if (!supported) {
    return (
      <Button variant={variant} size={size} disabled className={className} aria-label="Audio not supported">
        <VolumeX />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={label ? "sm" : size}
      className={cn(className)}
      aria-label={label ?? `Play “${text.slice(0, 40)}”`}
      onClick={() =>
        speaking
          ? stop()
          : speak(text, { rate: rate ?? state.profile.playbackRate, voiceURI: state.profile.voiceURI })
      }
    >
      {speaking ? <Loader2 className="animate-spin" /> : <Volume2 />}
      {label}
    </Button>
  );
}

export function GermanText({
  de,
  en,
  note,
  className,
  showAudio = true,
}: {
  de: string;
  en?: string;
  note?: string;
  className?: string;
  showAudio?: boolean;
}) {
  const { state } = useLearner();
  return (
    <div className={cn("group flex items-start gap-2", className)}>
      {showAudio ? <AudioButton text={de} className="mt-0.5 shrink-0 opacity-60 group-hover:opacity-100" /> : null}
      <div className="min-w-0">
        <p className="font-medium leading-relaxed">{de}</p>
        {en && state.profile.showTranslations ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{en}</p>
        ) : null}
        {note ? <p className="mt-0.5 text-xs text-primary/80">{note}</p> : null}
      </div>
    </div>
  );
}
