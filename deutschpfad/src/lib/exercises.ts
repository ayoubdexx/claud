import type { Exercise } from "@/lib/types";
import { normalizeAnswer } from "@/lib/utils";

export interface ExerciseResult {
  correct: boolean;
  /** 0–1, used for partially correct multi-gap answers. */
  score: number;
  /** Per-gap correctness for fill-blank / match items. */
  detail?: boolean[];
  expected: string;
}

export type AnswerValue = string | number | boolean | string[] | Record<string, string> | null;

export function gapCount(exercise: Exercise) {
  if (exercise.type === "fill-blank") return exercise.answers.length;
  if (exercise.type === "match") return exercise.pairs.length;
  return 1;
}

export function expectedAnswer(exercise: Exercise): string {
  switch (exercise.type) {
    case "multiple-choice":
      return exercise.options[exercise.answerIndex];
    case "true-false":
      return exercise.answer ? "richtig" : "falsch";
    case "fill-blank":
      return exercise.answers.map((options) => options[0]).join(" · ");
    case "order":
      return exercise.answer;
    case "match":
      return exercise.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(" · ");
    case "transform":
      return exercise.answers[0];
    case "dictation":
      return exercise.answers[0];
    case "speaking":
      return exercise.target;
    case "writing":
      return exercise.sampleAnswer;
    default:
      return "";
  }
}

/** Levenshtein distance, used for tolerant checking of long answers. */
export function distance(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i, ...Array(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[n];
}

export function similarity(a: string, b: string) {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x && !y) return 1;
  const max = Math.max(x.length, y.length);
  if (!max) return 0;
  return 1 - distance(x, y) / max;
}

function matchesAny(value: string, accepted: string[], tolerance = 0.9) {
  const needle = normalizeAnswer(value);
  return accepted.some((option) => {
    const candidate = normalizeAnswer(option);
    if (candidate === needle) return true;
    // allow one typo in longer answers
    return candidate.length > 8 && similarity(needle, candidate) >= tolerance;
  });
}

export function checkExercise(exercise: Exercise, answer: AnswerValue): ExerciseResult {
  const expected = expectedAnswer(exercise);

  switch (exercise.type) {
    case "multiple-choice": {
      const correct = Number(answer) === exercise.answerIndex;
      return { correct, score: correct ? 1 : 0, expected };
    }
    case "true-false": {
      const correct = answer === exercise.answer;
      return { correct, score: correct ? 1 : 0, expected };
    }
    case "fill-blank": {
      const values = Array.isArray(answer) ? (answer as string[]) : [String(answer ?? "")];
      const detail = exercise.answers.map((accepted, index) =>
        matchesAny(values[index] ?? "", accepted),
      );
      const hits = detail.filter(Boolean).length;
      return {
        correct: hits === detail.length,
        score: detail.length ? hits / detail.length : 0,
        detail,
        expected,
      };
    }
    case "order": {
      const value = Array.isArray(answer) ? (answer as string[]).join(" ") : String(answer ?? "");
      const correct = normalizeAnswer(value) === normalizeAnswer(exercise.answer);
      return { correct, score: correct ? 1 : 0, expected };
    }
    case "match": {
      const map = (answer ?? {}) as Record<string, string>;
      const detail = exercise.pairs.map((pair) => normalizeAnswer(map[pair.left] ?? "") === normalizeAnswer(pair.right));
      const hits = detail.filter(Boolean).length;
      return {
        correct: hits === detail.length,
        score: detail.length ? hits / detail.length : 0,
        detail,
        expected,
      };
    }
    case "transform":
    case "dictation": {
      const value = String(answer ?? "");
      const correct = matchesAny(value, exercise.answers, 0.92);
      return { correct, score: correct ? 1 : 0, expected };
    }
    case "speaking": {
      const value = String(answer ?? "");
      const score = similarity(value, exercise.target);
      return { correct: score >= 0.75, score, expected };
    }
    case "writing": {
      const value = String(answer ?? "");
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      const ratio = exercise.minWords ? Math.min(1, words / exercise.minWords) : 1;
      return { correct: ratio >= 1, score: ratio, expected };
    }
    default:
      return { correct: false, score: 0, expected };
  }
}

export function isAutoGraded(exercise: Exercise) {
  return exercise.type !== "writing" && exercise.type !== "speaking";
}

export function exercisePoints(exercise: Exercise) {
  return exercise.points ?? 1;
}

export function summarise(results: { result: ExerciseResult; exercise: Exercise }[]) {
  const maxPoints = results.reduce((sum, item) => sum + exercisePoints(item.exercise), 0);
  const points = results.reduce(
    (sum, item) => sum + item.result.score * exercisePoints(item.exercise),
    0,
  );
  const percent = maxPoints ? Math.round((points / maxPoints) * 100) : 0;
  return {
    points: Math.round(points * 10) / 10,
    maxPoints,
    percent,
    correctCount: results.filter((item) => item.result.correct).length,
    total: results.length,
  };
}

export const exerciseTypeLabels: Record<Exercise["type"], string> = {
  "multiple-choice": "Multiple choice",
  "true-false": "True / false",
  "fill-blank": "Fill in the blanks",
  order: "Sentence ordering",
  match: "Matching",
  transform: "Transformation",
  dictation: "Dictation",
  speaking: "Speaking",
  writing: "Writing",
};
