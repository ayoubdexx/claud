import type { Exercise, MockExam } from "@/lib/types";
import { checkExercise, exercisePoints, type AnswerValue } from "@/lib/exercises";

export interface SectionScore {
  id: string;
  title: string;
  skill: string;
  points: number;
  max: number;
  percent: number;
  passed: boolean;
}

export interface ExamScore {
  sections: SectionScore[];
  totalPoints: number;
  totalMax: number;
  percent: number;
  passed: boolean;
  /** Goethe B1/B2 are modular: each section must reach the pass mark. */
  modularPassed: boolean;
  weakestSection?: SectionScore;
  strongestSection?: SectionScore;
  itemResults: {
    id: string;
    correct: boolean;
    score: number;
    expected: string;
    prompt: string;
    explanation?: string;
    sectionId: string;
  }[];
}

export function scoreExam(exam: MockExam, answers: Record<string, AnswerValue>): ExamScore {
  const sections: SectionScore[] = [];
  const itemResults: ExamScore["itemResults"] = [];

  for (const section of exam.sections) {
    let points = 0;
    let max = 0;

    for (const part of section.parts) {
      for (const item of part.items) {
        const weight = exercisePoints(item);
        max += weight;
        const answer = answers[item.id] ?? null;
        const result = checkExercise(item, answer);
        points += result.score * weight;
        itemResults.push({
          id: item.id,
          correct: result.correct,
          score: result.score,
          expected: result.expected,
          prompt: item.prompt,
          explanation: item.explanation,
          sectionId: section.id,
        });
      }
    }

    const percent = max ? Math.round((points / max) * 100) : 0;
    sections.push({
      id: section.id,
      title: section.title,
      skill: section.skill,
      points: Math.round(points * 10) / 10,
      max,
      percent,
      passed: percent >= exam.passMark,
    });
  }

  const totalPoints = sections.reduce((sum, section) => sum + section.points, 0);
  const totalMax = sections.reduce((sum, section) => sum + section.max, 0);
  const percent = totalMax ? Math.round((totalPoints / totalMax) * 100) : 0;
  const sorted = [...sections].sort((a, b) => a.percent - b.percent);

  return {
    sections,
    totalPoints: Math.round(totalPoints * 10) / 10,
    totalMax,
    percent,
    passed: percent >= exam.passMark,
    modularPassed: sections.every((section) => section.passed),
    weakestSection: sorted[0],
    strongestSection: sorted[sorted.length - 1],
    itemResults,
  };
}

export function examItems(exam: MockExam): Exercise[] {
  return exam.sections.flatMap((section) => section.parts.flatMap((part) => part.items));
}

export function gradeLabel(percent: number) {
  if (percent >= 90) return { label: "sehr gut", note: "Outstanding — exam ready." };
  if (percent >= 80) return { label: "gut", note: "Solid pass with margin." };
  if (percent >= 70) return { label: "befriedigend", note: "Comfortable pass." };
  if (percent >= 60) return { label: "ausreichend", note: "Pass, but keep practising." };
  return { label: "nicht bestanden", note: "Below the 60 % pass mark." };
}

/** Converts raw percentages into an estimated CEFR readiness statement. */
export function readiness(percent: number, level: string) {
  if (percent >= 80) return `You are ready for the ${level} exam.`;
  if (percent >= 60) return `You would pass ${level}, but with little margin — revise your weakest module.`;
  if (percent >= 45) return `Not yet: focus on ${level} core grammar and repeat this mock in two weeks.`;
  return `Work through the ${level} course modules before attempting the exam again.`;
}
