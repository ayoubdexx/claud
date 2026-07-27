import type { SrsCard, VocabWord } from "@/lib/types";
import { todayISO } from "@/lib/utils";

/**
 * Spaced repetition based on SM-2, simplified to four buttons:
 * again (0) · hard (1) · good (2) · easy (3).
 */
export type Grade = 0 | 1 | 2 | 3;

export const GRADE_LABELS: Record<Grade, string> = {
  0: "Again",
  1: "Hard",
  2: "Good",
  3: "Easy",
};

export function newCard(word: VocabWord, deck: string): SrsCard {
  return {
    id: `${deck}:${word.id}`,
    wordId: word.id,
    deck,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    due: todayISO(),
  };
}

function addDays(days: number) {
  return todayISO(Math.max(0, Math.round(days)));
}

export function review(card: SrsCard, grade: Grade): SrsCard {
  const next: SrsCard = { ...card, lastReviewed: new Date().toISOString() };

  if (grade === 0) {
    next.repetitions = 0;
    next.lapses = card.lapses + 1;
    next.interval = 0;
    next.ease = Math.max(1.3, card.ease - 0.2);
    next.due = todayISO();
    return next;
  }

  const easeDelta = grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0;
  next.ease = Math.min(3.2, Math.max(1.3, card.ease + easeDelta));
  next.repetitions = card.repetitions + 1;

  if (next.repetitions === 1) {
    next.interval = grade === 1 ? 1 : grade === 3 ? 3 : 2;
  } else if (next.repetitions === 2) {
    next.interval = grade === 1 ? 3 : grade === 3 ? 8 : 6;
  } else {
    const factor = grade === 1 ? 1.2 : next.ease;
    next.interval = Math.max(1, Math.round(card.interval * factor));
  }

  next.due = addDays(next.interval);
  return next;
}

export function isDue(card: SrsCard, on = todayISO()) {
  if (card.suspended) return false;
  return card.due <= on;
}

export function dueCards(cards: SrsCard[], on = todayISO()) {
  return cards.filter((card) => isDue(card, on));
}

export function cardState(card: SrsCard) {
  if (card.repetitions === 0) return "new" as const;
  if (card.interval >= 21) return "mature" as const;
  return "learning" as const;
}

export interface SrsStats {
  total: number;
  new: number;
  learning: number;
  mature: number;
  due: number;
  favorites: number;
  averageEase: number;
  /** Cards scheduled per day for the next 14 days. */
  forecast: { date: string; count: number }[];
}

export function srsStats(cards: SrsCard[]): SrsStats {
  const forecast: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const date = todayISO(i);
    forecast.push({ date, count: cards.filter((card) => card.due === date).length });
  }
  const easeSum = cards.reduce((sum, card) => sum + card.ease, 0);
  return {
    total: cards.length,
    new: cards.filter((card) => cardState(card) === "new").length,
    learning: cards.filter((card) => cardState(card) === "learning").length,
    mature: cards.filter((card) => cardState(card) === "mature").length,
    due: dueCards(cards).length,
    favorites: cards.filter((card) => card.favorite).length,
    averageEase: cards.length ? Math.round((easeSum / cards.length) * 100) / 100 : 0,
    forecast,
  };
}

/** Cards to study now: due cards first, then new cards up to the daily limit. */
export function buildQueue(cards: SrsCard[], limit = 20) {
  const due = dueCards(cards).sort((a, b) => a.due.localeCompare(b.due));
  const fresh = cards.filter((card) => cardState(card) === "new" && !due.includes(card));
  return [...due, ...fresh].slice(0, limit);
}

export function nextDueLabel(card: SrsCard) {
  if (card.interval === 0) return "today";
  if (card.interval === 1) return "tomorrow";
  return `in ${card.interval} days`;
}
