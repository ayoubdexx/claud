import {
  ausbildungResources,
  dictionary,
  grammarTopics,
  lessons,
  listeningTasks,
  mockExams,
  pronunciationLessons,
  readingTexts,
  speakingTasks,
  verbs,
  vocabDecks,
  writingTasks,
} from "@/content";
import type { Level } from "@/lib/types";

export type SearchKind =
  | "lesson"
  | "grammar"
  | "vocabulary"
  | "word"
  | "reading"
  | "listening"
  | "speaking"
  | "writing"
  | "pronunciation"
  | "verb"
  | "exam"
  | "ausbildung"
  | "dictionary";

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  level?: Level;
  keywords: string;
}

function build(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const lesson of lessons) {
    items.push({
      id: `lesson-${lesson.slug}`,
      kind: "lesson",
      title: lesson.title,
      subtitle: `${lesson.titleDe} · ${lesson.minutes} min`,
      href: `/learn/${lesson.slug}`,
      level: lesson.level,
      keywords: [lesson.title, lesson.titleDe, lesson.summary, ...lesson.objectives].join(" "),
    });
  }

  for (const topic of grammarTopics) {
    items.push({
      id: `grammar-${topic.slug}`,
      kind: "grammar",
      title: topic.title,
      subtitle: `${topic.titleDe} · ${topic.category}`,
      href: `/grammar/${topic.slug}`,
      level: topic.level,
      keywords: [topic.title, topic.titleDe, topic.simple, topic.category, ...topic.tips].join(" "),
    });
  }

  for (const deck of vocabDecks) {
    items.push({
      id: `deck-${deck.slug}`,
      kind: "vocabulary",
      title: deck.title,
      subtitle: `${deck.titleDe} · ${deck.words.length} words`,
      href: `/vocabulary/${deck.slug}`,
      level: deck.level,
      keywords: [deck.title, deck.titleDe, deck.topic, deck.description].join(" "),
    });
    for (const word of deck.words) {
      items.push({
        id: `word-${word.id}`,
        kind: "word",
        title: word.article ? `${word.article} ${word.de}` : word.de,
        subtitle: `${word.en} · ${deck.title}`,
        href: `/vocabulary/${deck.slug}#${word.id}`,
        level: word.level,
        keywords: [word.de, word.en, word.plural ?? "", word.topic, word.example.de].join(" "),
      });
    }
  }

  for (const text of readingTexts) {
    items.push({
      id: `reading-${text.slug}`,
      kind: "reading",
      title: text.title,
      subtitle: `${text.genre} · ${text.minutes} min`,
      href: `/reading/${text.slug}`,
      level: text.level,
      keywords: [text.title, text.titleEn, text.intro, text.genre].join(" "),
    });
  }

  for (const task of listeningTasks) {
    items.push({
      id: `listening-${task.slug}`,
      kind: "listening",
      title: task.title,
      subtitle: `${task.titleEn} · ${task.seconds}s`,
      href: `/listening/${task.slug}`,
      level: task.level,
      keywords: [task.title, task.titleEn, task.scenario].join(" "),
    });
  }

  for (const task of speakingTasks) {
    items.push({
      id: `speaking-${task.slug}`,
      kind: "speaking",
      title: task.title,
      subtitle: `${task.kind} · ${task.minutes} min`,
      href: `/speaking/${task.slug}`,
      level: task.level,
      keywords: [task.title, task.scenario, task.goal, task.kind].join(" "),
    });
  }

  for (const task of writingTasks) {
    items.push({
      id: `writing-${task.slug}`,
      kind: "writing",
      title: task.title,
      subtitle: `${task.kind} · ${task.minWords}+ words`,
      href: `/writing/${task.slug}`,
      level: task.level,
      keywords: [task.title, task.scenario, task.kind, ...task.bullets].join(" "),
    });
  }

  for (const item of pronunciationLessons) {
    items.push({
      id: `pron-${item.slug}`,
      kind: "pronunciation",
      title: item.title,
      subtitle: `Pronunciation · ${item.group}`,
      href: `/pronunciation#${item.slug}`,
      keywords: [item.title, item.explanation, item.group].join(" "),
    });
  }

  for (const verb of verbs) {
    items.push({
      id: `verb-${verb.infinitive}`,
      kind: "verb",
      title: verb.infinitive,
      subtitle: `${verb.en} · ${verb.kind} · ${verb.partizip2}`,
      href: `/verbs/${encodeURIComponent(verb.infinitive.replace(/^sich /, ""))}`,
      level: verb.level,
      keywords: [verb.infinitive, verb.en, verb.partizip2, verb.preteriteStem, verb.kind].join(" "),
    });
  }

  for (const exam of mockExams) {
    items.push({
      id: `exam-${exam.slug}`,
      kind: "exam",
      title: exam.title,
      subtitle: `${exam.officialName} · ${exam.minutes} min`,
      href: `/exams/${exam.slug}`,
      level: exam.level,
      keywords: [exam.title, exam.officialName, exam.provider, exam.description].join(" "),
    });
  }

  for (const resource of ausbildungResources) {
    items.push({
      id: `ausbildung-${resource.slug}`,
      kind: "ausbildung",
      title: resource.title,
      subtitle: `Ausbildung · ${resource.category}`,
      href: `/ausbildung/${resource.slug}`,
      level: resource.level,
      keywords: [resource.title, resource.summary, resource.category].join(" "),
    });
  }

  for (const entry of dictionary) {
    items.push({
      id: `dict-${entry.id}`,
      kind: "dictionary",
      title: entry.article ? `${entry.article} ${entry.de}` : entry.de,
      subtitle: entry.en.join(", "),
      href: `/dictionary?q=${encodeURIComponent(entry.de)}`,
      level: entry.level,
      keywords: [entry.de, ...entry.en, entry.topic ?? ""].join(" "),
    });
  }

  return items;
}

export const searchIndex = build();

const KIND_WEIGHT: Record<SearchKind, number> = {
  lesson: 6,
  grammar: 6,
  vocabulary: 4,
  exam: 4,
  ausbildung: 4,
  reading: 3,
  listening: 3,
  speaking: 3,
  writing: 3,
  verb: 3,
  pronunciation: 2,
  word: 2,
  dictionary: 1,
};

export function search(query: string, limit = 24) {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const terms = needle.split(/\s+/);
  const scored = searchIndex
    .map((item) => {
      const haystack = `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (!haystack.includes(term)) return { item, score: -1 };
        if (item.title.toLowerCase().startsWith(term)) score += 8;
        else if (item.title.toLowerCase().includes(term)) score += 5;
        else score += 1;
      }
      score += KIND_WEIGHT[item.kind] / 2;
      return { item, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.item);
}

export function groupByKind(items: SearchItem[]) {
  const groups = new Map<SearchKind, SearchItem[]>();
  for (const item of items) {
    const list = groups.get(item.kind) ?? [];
    list.push(item);
    groups.set(item.kind, list);
  }
  return Array.from(groups.entries()).sort(
    (a, b) => KIND_WEIGHT[b[0]] - KIND_WEIGHT[a[0]],
  );
}

export const kindLabels: Record<SearchKind, string> = {
  lesson: "Lessons",
  grammar: "Grammar",
  vocabulary: "Vocabulary decks",
  word: "Words",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
  pronunciation: "Pronunciation",
  verb: "Verbs",
  exam: "Mock exams",
  ausbildung: "Ausbildung",
  dictionary: "Dictionary",
};
