"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Text to speech (de-DE) — powers all listening and pronunciation    */
/* ------------------------------------------------------------------ */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onEnd?: () => void;
}

export function useGermanVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      setVoices(all.filter((voice) => voice.lang.toLowerCase().startsWith("de")));
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return voices;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        (options.voiceURI && voices.find((voice) => voice.voiceURI === options.voiceURI)) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith("de"));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        options.onEnd?.();
      };
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  /** Speaks a list of lines sequentially, e.g. a dialogue transcript. */
  const speakSequence = useCallback(
    (lines: string[], options: SpeakOptions = {}) => {
      if (!lines.length) return;
      let index = 0;
      const next = () => {
        if (index >= lines.length) {
          options.onEnd?.();
          return;
        }
        const line = lines[index++];
        speak(line, { ...options, onEnd: next });
      };
      next();
    },
    [speak],
  );

  return { speak, speakSequence, stop, speaking, supported };
}

/* ------------------------------------------------------------------ */
/* Speech recognition — powers speaking practice and scoring          */
/* ------------------------------------------------------------------ */

type RecognitionResultHandler = (transcript: string, isFinal: boolean) => void;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(Boolean(getRecognition()));
    return () => recognitionRef.current?.abort();
  }, []);

  const start = useCallback((onResult?: RecognitionResultHandler) => {
    const recognition = getRecognition();
    if (!recognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError(null);
    setTranscript("");
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let text = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        text += result[0]?.transcript ?? "";
        if (result.isFinal) isFinal = true;
      }
      setTranscript(text);
      onResult?.(text, isFinal);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow it in your browser settings."
          : `Recognition error: ${event.error}`,
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return { start, stop, reset, listening, transcript, error, supported };
}

export const PLAYBACK_RATES = [0.6, 0.75, 0.9, 1, 1.15] as const;
