/**
 * Domain model for the DeutschPfad curriculum.
 * Content is authored as typed data so it can be validated, searched,
 * rendered to HTML, exported to PDF and synced to the database.
 */

export type Level = "A1" | "A2" | "B1" | "B2";

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];

export type Skill =
  | "grammar"
  | "vocabulary"
  | "reading"
  | "listening"
  | "speaking"
  | "writing"
  | "pronunciation";

export type Provider = "goethe" | "telc";

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

export interface ExerciseBase {
  id: string;
  prompt: string;
  /** Shown after answering. */
  explanation?: string;
  points?: number;
  skill?: Skill;
  /** Optional link to the grammar topic that this item practises. */
  grammar?: string;
}

export type Exercise =
  | (ExerciseBase & { type: "multiple-choice"; options: string[]; answerIndex: number })
  | (ExerciseBase & { type: "true-false"; answer: boolean })
  | (ExerciseBase & {
      type: "fill-blank";
      /** Sentence containing one or more `___` placeholders. */
      sentence: string;
      answers: string[][];
      hint?: string;
    })
  | (ExerciseBase & { type: "order"; tokens: string[]; answer: string })
  | (ExerciseBase & { type: "match"; pairs: { left: string; right: string }[] })
  | (ExerciseBase & { type: "transform"; input: string; answers: string[]; hint?: string })
  | (ExerciseBase & { type: "dictation"; audioText: string; answers: string[] })
  | (ExerciseBase & {
      type: "speaking";
      target: string;
      translation?: string;
      tips?: string[];
    })
  | (ExerciseBase & {
      type: "writing";
      minWords: number;
      checklist: string[];
      sampleAnswer: string;
    });

export type ExerciseType = Exercise["type"];

/* ------------------------------------------------------------------ */
/* Grammar                                                             */
/* ------------------------------------------------------------------ */

export interface GrammarTable {
  title: string;
  caption?: string;
  headers: string[];
  rows: string[][];
  /** Highlights a column index, e.g. the ending column. */
  highlightColumn?: number;
  note?: string;
}

export interface GrammarTopic {
  slug: string;
  level: Level;
  title: string;
  titleDe: string;
  category: string;
  /** One or two sentences a beginner can understand. */
  simple: string;
  /** Full explanation, one string per paragraph. */
  detailed: string[];
  tables: GrammarTable[];
  /** Visual summary blocks: a formula/pattern with parts. */
  visuals: { label: string; pattern: string; parts: string[] }[];
  examples: { de: string; en: string; note?: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
  tips: string[];
  practice: Exercise[];
  quiz: Exercise[];
  revision: string[];
  cheatSheet: { label: string; value: string }[];
  minutes: number;
  related?: string[];
}

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "phrase"
  | "pronoun"
  | "conjunction"
  | "number";

export interface VocabWord {
  id: string;
  /** Base form without article. */
  de: string;
  article?: "der" | "die" | "das";
  plural?: string;
  en: string;
  ipa: string;
  pos: PartOfSpeech;
  level: Level;
  topic: string;
  example: { de: string; en: string };
  synonyms?: string[];
  opposites?: string[];
  expressions?: { de: string; en: string }[];
  memoryTip?: string;
  /** 1 = easy, 2 = medium, 3 = hard. */
  difficulty: 1 | 2 | 3;
}

export interface VocabDeck {
  id: string;
  slug: string;
  title: string;
  titleDe: string;
  level: Level;
  topic: string;
  icon: string;
  description: string;
  words: VocabWord[];
}

/* ------------------------------------------------------------------ */
/* Reading / Listening / Speaking / Writing                            */
/* ------------------------------------------------------------------ */

export interface ReadingText {
  slug: string;
  level: Level;
  title: string;
  titleEn: string;
  genre: string;
  minutes: number;
  intro: string;
  paragraphs: string[];
  glossary: { de: string; en: string }[];
  grammarHighlights: { label: string; note: string; grammar?: string }[];
  questions: Exercise[];
  source?: string;
}

export interface TranscriptLine {
  speaker: string;
  de: string;
  en?: string;
}

export interface ListeningTask {
  slug: string;
  level: Level;
  title: string;
  titleEn: string;
  scenario: string;
  /** Rendered with the browser speech engine (de-DE) at chosen speed. */
  transcript: TranscriptLine[];
  vocabulary: { de: string; en: string }[];
  questions: Exercise[];
  tips: string[];
  seconds: number;
}

export interface SpeakingTask {
  slug: string;
  level: Level;
  title: string;
  kind: "roleplay" | "conversation" | "interview" | "monologue" | "pronunciation" | "challenge";
  scenario: string;
  goal: string;
  prompts: { question: string; hint?: string; sample: string }[];
  usefulPhrases: { de: string; en: string }[];
  /** Sentences the learner repeats; scored with speech recognition. */
  targets: { de: string; en: string }[];
  minutes: number;
}

export interface WritingTask {
  slug: string;
  level: Level;
  title: string;
  kind: "email" | "letter" | "message" | "essay" | "exam" | "cv" | "cover-letter";
  scenario: string;
  bullets: string[];
  minWords: number;
  maxWords?: number;
  structure: { part: string; detail: string }[];
  usefulPhrases: { de: string; en: string }[];
  checklist: string[];
  sampleAnswer: string;
  /** Native-level rewrite of a typical learner answer. */
  nativeVersion?: string;
  minutes: number;
}

export interface PronunciationLesson {
  slug: string;
  title: string;
  group: "alphabet" | "umlauts" | "consonants" | "vowels" | "clusters" | "prosody" | "mistakes";
  ipa?: string;
  explanation: string;
  howTo: string[];
  examples: { de: string; ipa: string; en: string }[];
  minimalPairs?: { a: string; b: string; note: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
}

/* ------------------------------------------------------------------ */
/* Verbs & dictionary                                                  */
/* ------------------------------------------------------------------ */

export interface VerbEntry {
  infinitive: string;
  en: string;
  level: Level;
  kind: "regular" | "irregular" | "modal" | "separable" | "reflexive" | "mixed" | "auxiliary";
  /** Stem change in 2nd/3rd person singular present, e.g. "fahr" -> "fähr". */
  presentStemChange?: string;
  /** Irregular present forms keyed by person index (0-5). */
  presentOverrides?: Partial<Record<0 | 1 | 2 | 3 | 4 | 5, string>>;
  preteriteStem: string;
  /** Präteritum endings differ for strong verbs (no -te). */
  strong?: boolean;
  partizip2: string;
  auxiliary: "haben" | "sein";
  konjunktiv2Stem?: string;
  separablePrefix?: string;
  notes?: string;
  examples?: { de: string; en: string }[];
}

export interface DictionaryEntry {
  id: string;
  de: string;
  article?: "der" | "die" | "das";
  plural?: string;
  pos: PartOfSpeech;
  en: string[];
  ipa: string;
  level?: Level;
  examples: { de: string; en: string }[];
  synonyms?: string[];
  opposites?: string[];
  expressions?: { de: string; en: string }[];
  verb?: string;
  topic?: string;
}

/* ------------------------------------------------------------------ */
/* Lessons, modules, courses                                           */
/* ------------------------------------------------------------------ */

export type LessonBlock =
  | { kind: "text"; title?: string; body: string[] }
  | { kind: "objectives"; items: string[] }
  | { kind: "dialogue"; title: string; setting?: string; lines: TranscriptLine[] }
  | { kind: "examples"; title?: string; items: { de: string; en: string; note?: string }[] }
  | { kind: "table"; table: GrammarTable }
  | { kind: "tip"; title?: string; body: string }
  | { kind: "warning"; title?: string; body: string }
  | { kind: "mistakes"; items: { wrong: string; right: string; why: string }[] }
  | { kind: "vocab"; title: string; deck: string; wordIds?: string[] }
  | { kind: "grammar"; slug: string }
  | { kind: "pronunciation"; slug: string }
  | { kind: "culture"; title: string; body: string[] }
  | { kind: "checklist"; title: string; items: string[] };

export interface Lesson {
  slug: string;
  level: Level;
  moduleSlug: string;
  order: number;
  title: string;
  titleDe: string;
  summary: string;
  minutes: number;
  skills: Skill[];
  objectives: string[];
  blocks: LessonBlock[];
  grammar: string[];
  vocabDecks: string[];
  reading?: string;
  listening?: string;
  speaking?: string;
  writing?: string;
  pronunciation?: string[];
  exercises: Exercise[];
  homework: string[];
  revision: string[];
  xp: number;
}

export interface CourseModule {
  slug: string;
  level: Level;
  order: number;
  title: string;
  titleDe: string;
  description: string;
  icon: string;
  outcomes: string[];
  /** Lesson slugs in study order. */
  lessons: string[];
  miniTest?: string;
}

export interface Course {
  level: Level;
  title: string;
  subtitle: string;
  description: string;
  hours: number;
  canDo: string[];
  grammarFocus: string[];
  vocabularyTarget: number;
  exams: string[];
  color: string;
  modules: CourseModule[];
  finalExam: string;
}

/* ------------------------------------------------------------------ */
/* Exams                                                               */
/* ------------------------------------------------------------------ */

export interface ExamPart {
  id: string;
  title: string;
  instructions: string;
  skill: Skill;
  minutes: number;
  /** Text shown for reading parts. */
  reading?: string[];
  /** Transcript spoken by the audio engine for listening parts. */
  audio?: TranscriptLine[];
  playLimit?: number;
  items: Exercise[];
  maxPoints: number;
}

export interface ExamSection {
  id: string;
  skill: Skill;
  title: string;
  minutes: number;
  maxPoints: number;
  weight: number;
  parts: ExamPart[];
}

export interface MockExam {
  slug: string;
  provider: Provider;
  level: Level;
  title: string;
  officialName: string;
  minutes: number;
  passMark: number;
  description: string;
  strategies: { title: string; body: string }[];
  sections: ExamSection[];
}

/* ------------------------------------------------------------------ */
/* Ausbildung & downloads                                              */
/* ------------------------------------------------------------------ */

export interface AusbildungResource {
  slug: string;
  title: string;
  category:
    | "cv"
    | "cover-letter"
    | "interview"
    | "vocabulary"
    | "email"
    | "phone"
    | "dialogue"
    | "culture"
    | "expressions"
    | "situations";
  summary: string;
  level: Level;
  body: LessonBlock[];
  vocabulary?: { de: string; en: string; note?: string }[];
  template?: string;
  minutes: number;
}

export interface DownloadItem {
  slug: string;
  title: string;
  category:
    | "grammar-sheet"
    | "vocabulary-list"
    | "worksheet"
    | "practice-test"
    | "mock-exam"
    | "study-guide"
    | "revision-notes"
    | "cheat-sheet";
  level: Level | "ALL";
  pages: number;
  description: string;
  /** PDF route that generates this file on demand. */
  href: string;
}

/* ------------------------------------------------------------------ */
/* Learner state                                                       */
/* ------------------------------------------------------------------ */

export interface LessonProgress {
  slug: string;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
  completedAt?: string;
  secondsSpent?: number;
  lastBlock?: number;
}

export interface SrsCard {
  id: string;
  wordId: string;
  deck: string;
  /** SM-2 style scheduling data. */
  ease: number;
  interval: number;
  repetitions: number;
  due: string;
  lapses: number;
  favorite?: boolean;
  suspended?: boolean;
  lastReviewed?: string;
}

export interface SkillScore {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  grammar: number;
  vocabulary: number;
}

export interface Note {
  id: string;
  title: string;
  folder: string;
  content: string;
  tags: string[];
  lessonSlug?: string;
  updatedAt: string;
  createdAt: string;
  pinned?: boolean;
}

export interface PlannerTask {
  id: string;
  date: string;
  title: string;
  kind: "lesson" | "revision" | "exam" | "vocab" | "speaking" | "custom";
  minutes: number;
  done: boolean;
  href?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  /** Progress metric used to evaluate the achievement. */
  metric:
    | "lessons"
    | "streak"
    | "words"
    | "minutes"
    | "exams"
    | "perfectQuizzes"
    | "writing"
    | "speaking"
    | "grammar";
  target: number;
  xp: number;
}

export interface ExamAttempt {
  id: string;
  examSlug: string;
  startedAt: string;
  finishedAt?: string;
  sectionScores: Record<string, { points: number; max: number }>;
  totalPercent: number;
  passed: boolean;
  answers: Record<string, unknown>;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  level: Level;
  visibility: "public" | "private";
  code: string;
  members: { id: string; name: string; level: Level; xp: number; streak: number; role: Role }[];
  challenge?: { title: string; goal: number; unit: string; endsAt: string; progress: number };
  createdAt: string;
}
