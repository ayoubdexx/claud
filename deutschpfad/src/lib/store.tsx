"use client";

import * as React from "react";
import type {
  Achievement,
  ExamAttempt,
  Level,
  LessonProgress,
  Note,
  PlannerTask,
  SkillScore,
  SrsCard,
  VocabWord,
} from "@/lib/types";
import { achievements as allAchievements, allWords, lessons } from "@/content";
import { newCard, review, srsStats, type Grade } from "@/lib/srs";
import { todayISO } from "@/lib/utils";

const STORAGE_KEY = "deutschpfad:state:v1";

export interface Bookmark {
  id: string;
  kind: string;
  title: string;
  href: string;
  createdAt: string;
}

export interface StudySession {
  date: string;
  minutes: number;
  xp: number;
  lessons: number;
  cards: number;
}

export interface WritingSubmission {
  slug: string;
  title: string;
  text: string;
  score: number;
  updatedAt: string;
}

export interface SpeakingResult {
  slug: string;
  itemId: string;
  score: number;
  transcript: string;
  at: string;
}

export interface LearnerProfile {
  name: string;
  level: Level;
  targetLevel: Level;
  dailyGoalMinutes: number;
  examDate?: string;
  voiceURI?: string;
  playbackRate: number;
  showTranslations: boolean;
  autoplayAudio: boolean;
}

export interface LearnerState {
  version: 1;
  profile: LearnerProfile;
  lessons: Record<string, LessonProgress>;
  grammarStudied: string[];
  cards: Record<string, SrsCard>;
  notes: Note[];
  bookmarks: Bookmark[];
  planner: PlannerTask[];
  attempts: ExamAttempt[];
  sessions: StudySession[];
  writings: WritingSubmission[];
  speaking: SpeakingResult[];
  quizScores: { id: string; percent: number; at: string }[];
  unlocked: string[];
  xp: number;
}

const defaultProfile: LearnerProfile = {
  name: "Lernende:r",
  level: "A1",
  targetLevel: "B2",
  dailyGoalMinutes: 30,
  playbackRate: 1,
  showTranslations: true,
  autoplayAudio: false,
};

export const initialState: LearnerState = {
  version: 1,
  profile: defaultProfile,
  lessons: {},
  grammarStudied: [],
  cards: {},
  notes: [],
  bookmarks: [],
  planner: [],
  attempts: [],
  sessions: [],
  writings: [],
  speaking: [],
  quizScores: [],
  unlocked: [],
  xp: 0,
};

/* ------------------------------- reducer -------------------------------- */

type Action =
  | { type: "hydrate"; state: LearnerState }
  | { type: "profile"; patch: Partial<LearnerProfile> }
  | { type: "lesson-progress"; slug: string; patch: Partial<LessonProgress> }
  | { type: "complete-lesson"; slug: string; score?: number; minutes?: number; xp?: number }
  | { type: "grammar-studied"; slug: string }
  | { type: "add-cards"; words: VocabWord[]; deck: string }
  | { type: "review-card"; id: string; grade: Grade }
  | { type: "toggle-favorite"; id: string }
  | { type: "note-save"; note: Note }
  | { type: "note-delete"; id: string }
  | { type: "bookmark-toggle"; bookmark: Bookmark }
  | { type: "planner-add"; task: PlannerTask }
  | { type: "planner-toggle"; id: string }
  | { type: "planner-delete"; id: string }
  | { type: "attempt-save"; attempt: ExamAttempt }
  | { type: "writing-save"; submission: WritingSubmission }
  | { type: "speaking-save"; result: SpeakingResult }
  | { type: "quiz-save"; id: string; percent: number }
  | { type: "log-session"; minutes: number; xp?: number; cards?: number; lessons?: number }
  | { type: "reset" };

function upsertSession(sessions: StudySession[], patch: Partial<StudySession>): StudySession[] {
  const date = todayISO();
  const index = sessions.findIndex((session) => session.date === date);
  const base: StudySession =
    index >= 0 ? sessions[index] : { date, minutes: 0, xp: 0, lessons: 0, cards: 0 };
  const merged: StudySession = {
    date,
    minutes: base.minutes + (patch.minutes ?? 0),
    xp: base.xp + (patch.xp ?? 0),
    lessons: base.lessons + (patch.lessons ?? 0),
    cards: base.cards + (patch.cards ?? 0),
  };
  const next = [...sessions];
  if (index >= 0) next[index] = merged;
  else next.push(merged);
  return next.slice(-400);
}

function reducer(state: LearnerState, action: Action): LearnerState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, version: 1 };

    case "profile":
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case "lesson-progress": {
      const current = state.lessons[action.slug] ?? { slug: action.slug, status: "in-progress" as const };
      return {
        ...state,
        lessons: { ...state.lessons, [action.slug]: { ...current, ...action.patch } },
      };
    }

    case "complete-lesson": {
      const lesson = lessons.find((item) => item.slug === action.slug);
      const gainedXp = action.xp ?? lesson?.xp ?? 50;
      const already = state.lessons[action.slug]?.status === "completed";
      return {
        ...state,
        xp: state.xp + (already ? 0 : gainedXp),
        lessons: {
          ...state.lessons,
          [action.slug]: {
            slug: action.slug,
            status: "completed",
            score: action.score,
            completedAt: new Date().toISOString(),
            secondsSpent: (state.lessons[action.slug]?.secondsSpent ?? 0) + (action.minutes ?? 0) * 60,
          },
        },
        sessions: upsertSession(state.sessions, {
          minutes: action.minutes ?? lesson?.minutes ?? 30,
          xp: already ? 0 : gainedXp,
          lessons: already ? 0 : 1,
        }),
      };
    }

    case "grammar-studied":
      return state.grammarStudied.includes(action.slug)
        ? state
        : { ...state, grammarStudied: [...state.grammarStudied, action.slug] };

    case "add-cards": {
      const cards = { ...state.cards };
      for (const word of action.words) {
        const card = newCard(word, action.deck);
        if (!cards[card.id]) cards[card.id] = card;
      }
      return { ...state, cards };
    }

    case "review-card": {
      const card = state.cards[action.id];
      if (!card) return state;
      const updated = review(card, action.grade);
      return {
        ...state,
        cards: { ...state.cards, [action.id]: updated },
        xp: state.xp + (action.grade === 0 ? 1 : 2),
        sessions: upsertSession(state.sessions, { cards: 1, xp: action.grade === 0 ? 1 : 2, minutes: 0 }),
      };
    }

    case "toggle-favorite": {
      const card = state.cards[action.id];
      if (!card) return state;
      return {
        ...state,
        cards: { ...state.cards, [action.id]: { ...card, favorite: !card.favorite } },
      };
    }

    case "note-save": {
      const exists = state.notes.some((note) => note.id === action.note.id);
      return {
        ...state,
        notes: exists
          ? state.notes.map((note) => (note.id === action.note.id ? action.note : note))
          : [action.note, ...state.notes],
      };
    }

    case "note-delete":
      return { ...state, notes: state.notes.filter((note) => note.id !== action.id) };

    case "bookmark-toggle": {
      const exists = state.bookmarks.some((item) => item.id === action.bookmark.id);
      return {
        ...state,
        bookmarks: exists
          ? state.bookmarks.filter((item) => item.id !== action.bookmark.id)
          : [action.bookmark, ...state.bookmarks],
      };
    }

    case "planner-add":
      return { ...state, planner: [...state.planner, action.task] };

    case "planner-toggle":
      return {
        ...state,
        planner: state.planner.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
      };

    case "planner-delete":
      return { ...state, planner: state.planner.filter((task) => task.id !== action.id) };

    case "attempt-save":
      return {
        ...state,
        attempts: [action.attempt, ...state.attempts.filter((item) => item.id !== action.attempt.id)],
        xp: state.xp + 80,
        sessions: upsertSession(state.sessions, { minutes: 60, xp: 80 }),
      };

    case "writing-save": {
      const exists = state.writings.some((item) => item.slug === action.submission.slug);
      return {
        ...state,
        writings: exists
          ? state.writings.map((item) => (item.slug === action.submission.slug ? action.submission : item))
          : [action.submission, ...state.writings],
        xp: state.xp + (exists ? 0 : 25),
        sessions: upsertSession(state.sessions, { minutes: 20, xp: exists ? 0 : 25 }),
      };
    }

    case "speaking-save":
      return {
        ...state,
        speaking: [action.result, ...state.speaking].slice(0, 500),
        xp: state.xp + 5,
        sessions: upsertSession(state.sessions, { minutes: 5, xp: 5 }),
      };

    case "quiz-save":
      return {
        ...state,
        quizScores: [{ id: action.id, percent: action.percent, at: new Date().toISOString() }, ...state.quizScores].slice(0, 400),
        xp: state.xp + Math.round(action.percent / 10),
      };

    case "log-session":
      return {
        ...state,
        xp: state.xp + (action.xp ?? 0),
        sessions: upsertSession(state.sessions, action),
      };

    case "reset":
      return { ...initialState };

    default:
      return state;
  }
}

/* ------------------------------ derived data ---------------------------- */

export function computeStreak(sessions: StudySession[]) {
  const active = new Set(sessions.filter((session) => session.minutes > 0 || session.cards > 0).map((s) => s.date));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const date = todayISO(-i);
    if (active.has(date)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function computeSkillScores(state: LearnerState): SkillScore {
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  const writingScores = state.writings.map((item) => item.score);
  const speakingScores = state.speaking.map((item) => Math.round(item.score * 100));
  const quiz = state.quizScores.map((item) => item.percent);
  const readingAttempts = state.attempts.flatMap((attempt) =>
    Object.entries(attempt.sectionScores)
      .filter(([id]) => id.includes("lesen"))
      .map(([, value]) => (value.max ? Math.round((value.points / value.max) * 100) : 0)),
  );
  const listeningAttempts = state.attempts.flatMap((attempt) =>
    Object.entries(attempt.sectionScores)
      .filter(([id]) => id.includes("hoer"))
      .map(([, value]) => (value.max ? Math.round((value.points / value.max) * 100) : 0)),
  );

  const cardList = Object.values(state.cards);
  const mature = cardList.filter((card) => card.interval >= 21).length;

  return {
    reading: avg(readingAttempts.length ? readingAttempts : quiz),
    listening: avg(listeningAttempts.length ? listeningAttempts : quiz),
    writing: avg(writingScores),
    speaking: avg(speakingScores),
    grammar: avg(quiz),
    vocabulary: cardList.length ? Math.round((mature / cardList.length) * 100) : 0,
  };
}

export function evaluateAchievements(state: LearnerState): { achievement: Achievement; value: number; done: boolean }[] {
  const completedLessons = Object.values(state.lessons).filter((item) => item.status === "completed").length;
  const streak = computeStreak(state.sessions);
  const words = Object.values(state.cards).filter((card) => card.repetitions > 0).length;
  const minutes = state.sessions.reduce((sum, session) => sum + session.minutes, 0);
  const exams = state.attempts.filter((attempt) => attempt.finishedAt).length;
  const perfect = state.quizScores.filter((score) => score.percent === 100).length;

  const metrics: Record<Achievement["metric"], number> = {
    lessons: completedLessons,
    streak,
    words,
    minutes,
    exams,
    perfectQuizzes: perfect,
    writing: state.writings.length,
    speaking: state.speaking.length,
    grammar: state.grammarStudied.length,
  };

  return allAchievements.map((achievement) => {
    const value = metrics[achievement.metric] ?? 0;
    return { achievement, value, done: value >= achievement.target };
  });
}

export function overallProgress(state: LearnerState) {
  const completed = Object.values(state.lessons).filter((item) => item.status === "completed").length;
  return {
    completed,
    total: lessons.length,
    percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

export function levelProgress(state: LearnerState, level: Level) {
  const levelLessons = lessons.filter((lesson) => lesson.level === level);
  const completed = levelLessons.filter((lesson) => state.lessons[lesson.slug]?.status === "completed").length;
  return {
    completed,
    total: levelLessons.length,
    percent: levelLessons.length ? Math.round((completed / levelLessons.length) * 100) : 0,
  };
}

/* -------------------------------- context ------------------------------- */

interface LearnerContextValue {
  state: LearnerState;
  dispatch: React.Dispatch<Action>;
  ready: boolean;
  /* convenience helpers */
  completeLesson: (slug: string, score?: number) => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (bookmark: Omit<Bookmark, "createdAt">) => void;
  addDeck: (deck: string) => void;
  streak: number;
  stats: ReturnType<typeof srsStats>;
}

const LearnerContext = React.createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LearnerState;
        dispatch({ type: "hydrate", state: { ...initialState, ...parsed } });
      }
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, ready]);

  /* Sync to the server when the user is signed in (best effort). */
  React.useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => {
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      }).catch(() => undefined);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [state, ready]);

  const completeLesson = React.useCallback(
    (slug: string, score?: number) => {
      const lesson = lessons.find((item) => item.slug === slug);
      dispatch({ type: "complete-lesson", slug, score, minutes: lesson?.minutes });
      for (const grammarSlug of lesson?.grammar ?? []) {
        dispatch({ type: "grammar-studied", slug: grammarSlug });
      }
    },
    [dispatch],
  );

  const isBookmarked = React.useCallback(
    (id: string) => state.bookmarks.some((item) => item.id === id),
    [state.bookmarks],
  );

  const toggleBookmark = React.useCallback(
    (bookmark: Omit<Bookmark, "createdAt">) => {
      dispatch({
        type: "bookmark-toggle",
        bookmark: { ...bookmark, createdAt: new Date().toISOString() },
      });
    },
    [dispatch],
  );

  const addDeck = React.useCallback(
    (deck: string) => {
      const words = allWords.filter((word) => word.topic && word.id.startsWith(deck.slice(0, 2)));
      dispatch({ type: "add-cards", deck, words: words.length ? words : allWords.slice(0, 10) });
    },
    [dispatch],
  );

  const streak = React.useMemo(() => computeStreak(state.sessions), [state.sessions]);
  const stats = React.useMemo(() => srsStats(Object.values(state.cards)), [state.cards]);

  const value = React.useMemo<LearnerContextValue>(
    () => ({ state, dispatch, ready, completeLesson, isBookmarked, toggleBookmark, addDeck, streak, stats }),
    [state, ready, completeLesson, isBookmarked, toggleBookmark, addDeck, streak, stats],
  );

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}

export function useLearner() {
  const context = React.useContext(LearnerContext);
  if (!context) throw new Error("useLearner must be used inside LearnerProvider");
  return context;
}
