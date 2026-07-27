import type {
  Course,
  DictionaryEntry,
  GrammarTopic,
  Lesson,
  Level,
  MockExam,
  VocabDeck,
  VocabWord,
} from "@/lib/types";

import { a1Grammar } from "@/content/grammar/a1";
import { a2Grammar } from "@/content/grammar/a2";
import { b1Grammar } from "@/content/grammar/b1";
import { b2Grammar } from "@/content/grammar/b2";

import { a1Decks } from "@/content/vocabulary/a1";
import { a2Decks } from "@/content/vocabulary/a2";
import { b1Decks } from "@/content/vocabulary/b1";
import { b2Decks } from "@/content/vocabulary/b2";

import { a1Course, a1Lessons } from "@/content/courses/a1";
import { a2Course, a2Lessons } from "@/content/courses/a2";
import { b1Course, b1Lessons } from "@/content/courses/b1";
import { b2Course, b2Lessons } from "@/content/courses/b2";

import { goetheExams } from "@/content/exams/goethe";
import { telcExams } from "@/content/exams/telc";

import { readingTexts } from "@/content/reading";
import { listeningTasks } from "@/content/listening";
import { speakingTasks } from "@/content/speaking";
import { writingTasks } from "@/content/writing";
import { pronunciationLessons } from "@/content/pronunciation";
import { ausbildungResources } from "@/content/ausbildung";
import { extraDictionaryEntries } from "@/content/dictionary";
import { verbs } from "@/content/verbs";
import { achievements, downloads, helpTopics } from "@/content/meta";

/* ------------------------------ registries ------------------------------ */

export const grammarTopics: GrammarTopic[] = [...a1Grammar, ...a2Grammar, ...b1Grammar, ...b2Grammar];
export const vocabDecks: VocabDeck[] = [...a1Decks, ...a2Decks, ...b1Decks, ...b2Decks];
export const courses: Course[] = [a1Course, a2Course, b1Course, b2Course];
export const lessons: Lesson[] = [...a1Lessons, ...a2Lessons, ...b1Lessons, ...b2Lessons];
export const mockExams: MockExam[] = [...goetheExams, ...telcExams];

export {
  readingTexts,
  listeningTasks,
  speakingTasks,
  writingTasks,
  pronunciationLessons,
  ausbildungResources,
  verbs,
  achievements,
  downloads,
  helpTopics,
};

export const allWords: VocabWord[] = vocabDecks.flatMap((deck) => deck.words);

/* ------------------------------- lookups -------------------------------- */

export function getCourse(level: Level) {
  return courses.find((course) => course.level === level);
}

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getModule(slug: string) {
  for (const course of courses) {
    const mod = course.modules.find((m) => m.slug === slug);
    if (mod) return { module: mod, course };
  }
  return undefined;
}

export function getGrammar(slug: string) {
  return grammarTopics.find((topic) => topic.slug === slug);
}

export function getDeck(slugOrId: string) {
  return vocabDecks.find((deck) => deck.slug === slugOrId || deck.id === slugOrId);
}

export function getWord(id: string) {
  return allWords.find((word) => word.id === id);
}

export function getReading(slug: string) {
  return readingTexts.find((text) => text.slug === slug);
}

export function getListening(slug: string) {
  return listeningTasks.find((task) => task.slug === slug);
}

export function getSpeaking(slug: string) {
  return speakingTasks.find((task) => task.slug === slug);
}

export function getWriting(slug: string) {
  return writingTasks.find((task) => task.slug === slug);
}

export function getPronunciation(slug: string) {
  return pronunciationLessons.find((item) => item.slug === slug);
}

export function getExam(slug: string) {
  return mockExams.find((exam) => exam.slug === slug);
}

export function getAusbildung(slug: string) {
  return ausbildungResources.find((item) => item.slug === slug);
}

export function lessonsByLevel(level: Level) {
  return lessons.filter((lesson) => lesson.level === level);
}

export function grammarByLevel(level: Level) {
  return grammarTopics.filter((topic) => topic.level === level);
}

export function decksByLevel(level: Level) {
  return vocabDecks.filter((deck) => deck.level === level);
}

export function nextLesson(slug: string) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1 || index === lessons.length - 1) return undefined;
  return lessons[index + 1];
}

export function previousLesson(slug: string) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index <= 0) return undefined;
  return lessons[index - 1];
}

export function lessonModule(lesson: Lesson) {
  return getModule(lesson.moduleSlug);
}

/* ------------------------------ dictionary ------------------------------ */

function wordToEntry(word: VocabWord): DictionaryEntry {
  return {
    id: word.id,
    de: word.de,
    article: word.article,
    plural: word.plural,
    pos: word.pos,
    en: [word.en],
    ipa: word.ipa,
    level: word.level,
    examples: [word.example],
    synonyms: word.synonyms,
    opposites: word.opposites,
    expressions: word.expressions,
    topic: word.topic,
  };
}

function verbToEntry(infinitive: string): DictionaryEntry | null {
  const verb = verbs.find((v) => v.infinitive === infinitive);
  if (!verb) return null;
  return {
    id: `verb-${verb.infinitive}`,
    de: verb.infinitive,
    pos: "verb",
    en: [verb.en],
    ipa: "",
    level: verb.level,
    examples: verb.examples ?? [],
    verb: verb.infinitive,
    topic: "verbs",
  };
}

/** Merged dictionary: vocabulary decks + verb list + curated extra entries. */
export const dictionary: DictionaryEntry[] = (() => {
  const map = new Map<string, DictionaryEntry>();

  for (const word of allWords) {
    const entry = wordToEntry(word);
    map.set(entry.de.toLowerCase(), entry);
  }

  for (const verb of verbs) {
    const key = verb.infinitive.toLowerCase();
    const entry = verbToEntry(verb.infinitive);
    if (!entry) continue;
    const existing = map.get(key);
    if (existing) {
      existing.verb = verb.infinitive;
      if (!existing.en.includes(verb.en)) existing.en.push(verb.en);
    } else {
      map.set(key, entry);
    }
  }

  for (const entry of extraDictionaryEntries) {
    const key = entry.de.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.en = Array.from(new Set([...existing.en, ...entry.en]));
      existing.examples = [...existing.examples, ...entry.examples];
      existing.expressions = [...(existing.expressions ?? []), ...(entry.expressions ?? [])];
    } else {
      map.set(key, entry);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.de.localeCompare(b.de, "de"));
})();

export function lookupDictionary(term: string) {
  const needle = term.trim().toLowerCase();
  return dictionary.find((entry) => entry.de.toLowerCase() === needle);
}

/* -------------------------------- stats -------------------------------- */

export const contentStats = {
  levels: 4,
  modules: courses.reduce((sum, course) => sum + course.modules.length, 0),
  lessons: lessons.length,
  grammarTopics: grammarTopics.length,
  vocabDecks: vocabDecks.length,
  words: allWords.length,
  dictionaryEntries: dictionary.length,
  verbs: verbs.length,
  readings: readingTexts.length,
  listenings: listeningTasks.length,
  speakings: speakingTasks.length,
  writings: writingTasks.length,
  pronunciations: pronunciationLessons.length,
  exams: mockExams.length,
  ausbildung: ausbildungResources.length,
  downloads: downloads.length,
  exercises:
    lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0) +
    grammarTopics.reduce((sum, topic) => sum + topic.practice.length + topic.quiz.length, 0) +
    readingTexts.reduce((sum, text) => sum + text.questions.length, 0) +
    listeningTasks.reduce((sum, task) => sum + task.questions.length, 0),
};
