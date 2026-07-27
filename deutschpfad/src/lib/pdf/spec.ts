import {
  ausbildungResources,
  getExam,
  getLesson,
  getGrammar,
  grammarByLevel,
  decksByLevel,
  lessonsByLevel,
  pronunciationLessons,
  verbs,
  grammarTopics,
  getDeck,
} from "@/content";
import { conjugate } from "@/lib/conjugate";
import { expectedAnswer } from "@/lib/exercises";
import type { Exercise, GrammarTopic, LessonBlock, Level } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Document specification (renderer-agnostic)                          */
/* ------------------------------------------------------------------ */

export type DocBlock =
  | { type: "heading"; text: string; level: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; title?: string; headers: string[]; rows: string[][]; note?: string }
  | { type: "keyvalue"; title?: string; items: { label: string; value: string }[] }
  | { type: "callout"; variant: "tip" | "warning" | "info"; title?: string; text: string }
  | { type: "examples"; items: { de: string; en?: string; note?: string }[] }
  | { type: "dialogue"; title?: string; lines: { speaker: string; de: string; en?: string }[] }
  | { type: "exercises"; title: string; items: { prompt: string; hint?: string; lines?: number }[] }
  | { type: "solutions"; title: string; items: { prompt: string; answer: string; explanation?: string }[] }
  | { type: "spacer"; size?: number }
  | { type: "pagebreak" };

export interface DocSection {
  id: string;
  title: string;
  blocks: DocBlock[];
  /** Start this section on a new page. */
  newPage?: boolean;
}

export interface DocSpec {
  title: string;
  subtitle?: string;
  level?: Level | "ALL";
  kicker?: string;
  footer?: string;
  /** Rendered as a table of contents on page 1. */
  toc: boolean;
  sections: DocSection[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function exerciseToPrompt(exercise: Exercise): { prompt: string; hint?: string; lines?: number } {
  switch (exercise.type) {
    case "multiple-choice":
      return {
        prompt: `${exercise.prompt}\n${exercise.options.map((option, index) => `   ${String.fromCharCode(97 + index)}) ${option}`).join("\n")}`,
        lines: 1,
      };
    case "true-false":
      return { prompt: `${exercise.prompt}   ☐ richtig   ☐ falsch`, lines: 0 };
    case "fill-blank":
      return { prompt: `${exercise.prompt}\n   ${exercise.sentence}`, hint: exercise.hint, lines: 1 };
    case "order":
      return { prompt: `${exercise.prompt}\n   ${exercise.tokens.join(" / ")}`, lines: 2 };
    case "match":
      return {
        prompt: `${exercise.prompt}\n${exercise.pairs.map((pair, index) => `   ${index + 1}. ${pair.left} → ______`).join("\n")}\n   Optionen: ${exercise.pairs.map((pair) => pair.right).join(" · ")}`,
        lines: 0,
      };
    case "transform":
      return { prompt: `${exercise.prompt}\n   ${exercise.input}`, hint: exercise.hint, lines: 2 };
    case "dictation":
      return { prompt: `${exercise.prompt} (Diktat)`, lines: 2 };
    case "speaking":
      return { prompt: `${exercise.prompt}\n   Zielsatz: ${exercise.target}`, lines: 0 };
    case "writing":
      return { prompt: `${exercise.prompt} (min. ${exercise.minWords} Wörter)`, lines: 8 };
    default:
      return { prompt: "", lines: 2 };
  }
}

function exercisesBlock(title: string, items: Exercise[]): DocBlock[] {
  if (!items.length) return [];
  return [
    { type: "exercises", title, items: items.map(exerciseToPrompt) },
  ];
}

function solutionsBlock(title: string, items: Exercise[]): DocBlock[] {
  if (!items.length) return [];
  return [
    {
      type: "solutions",
      title,
      items: items.map((item) => ({
        prompt: item.prompt,
        answer: expectedAnswer(item),
        explanation: item.explanation,
      })),
    },
  ];
}

function grammarBlocks(topic: GrammarTopic, withPractice = true): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "heading", text: `${topic.title} — ${topic.titleDe}`, level: 2 },
    { type: "callout", variant: "info", title: "Kurz erklärt", text: topic.simple },
    ...topic.detailed.map((text): DocBlock => ({ type: "paragraph", text })),
  ];

  for (const table of topic.tables) {
    blocks.push({
      type: "table",
      title: table.title,
      headers: table.headers,
      rows: table.rows,
      note: table.note,
    });
  }

  if (topic.visuals.length) {
    blocks.push({
      type: "keyvalue",
      title: "Visuelle Zusammenfassung",
      items: topic.visuals.map((visual) => ({ label: visual.pattern, value: visual.parts.join("  ") })),
    });
  }

  blocks.push({ type: "examples", items: topic.examples });

  if (topic.mistakes.length) {
    blocks.push({
      type: "table",
      title: "Häufige Fehler",
      headers: ["Falsch", "Richtig", "Warum"],
      rows: topic.mistakes.map((mistake) => [mistake.wrong, mistake.right, mistake.why]),
    });
  }

  if (topic.tips.length) {
    blocks.push({ type: "list", items: topic.tips });
  }

  if (withPractice) {
    blocks.push(...exercisesBlock("Übungen", topic.practice));
    blocks.push(...solutionsBlock("Lösungen", topic.practice));
    blocks.push(...exercisesBlock("Mini-Quiz", topic.quiz));
    blocks.push(...solutionsBlock("Lösungen Mini-Quiz", topic.quiz));
  }

  blocks.push({ type: "list", items: topic.revision, ordered: true });
  blocks.push({ type: "keyvalue", title: "Cheat Sheet", items: topic.cheatSheet });

  return blocks;
}

function lessonBlockToDoc(block: LessonBlock): DocBlock[] {
  switch (block.kind) {
    case "text":
      return [
        ...(block.title ? [{ type: "heading", text: block.title, level: 3 } as DocBlock] : []),
        ...block.body.map((text): DocBlock => ({ type: "paragraph", text })),
      ];
    case "objectives":
      return [{ type: "heading", text: "Lernziele", level: 3 }, { type: "list", items: block.items }];
    case "dialogue":
      return [
        { type: "dialogue", title: block.title, lines: block.lines },
      ];
    case "examples":
      return [
        ...(block.title ? [{ type: "heading", text: block.title, level: 3 } as DocBlock] : []),
        { type: "examples", items: block.items },
      ];
    case "table":
      return [
        {
          type: "table",
          title: block.table.title,
          headers: block.table.headers,
          rows: block.table.rows,
          note: block.table.note,
        },
      ];
    case "tip":
      return [{ type: "callout", variant: "tip", title: block.title ?? "Tipp", text: block.body }];
    case "warning":
      return [{ type: "callout", variant: "warning", title: block.title ?? "Achtung", text: block.body }];
    case "mistakes":
      return [
        {
          type: "table",
          title: "Häufige Fehler",
          headers: ["Falsch", "Richtig", "Warum"],
          rows: block.items.map((item) => [item.wrong, item.right, item.why]),
        },
      ];
    case "vocab": {
      const deck = getDeck(block.deck);
      if (!deck) return [];
      return [
        {
          type: "table",
          title: `${block.title} (${deck.words.length} Wörter)`,
          headers: ["Wort", "Plural", "Bedeutung", "IPA", "Beispiel"],
          rows: deck.words.map((word) => [
            word.article ? `${word.article} ${word.de}` : word.de,
            word.plural ?? "—",
            word.en,
            word.ipa,
            word.example.de,
          ]),
        },
      ];
    }
    case "grammar": {
      const topic = getGrammar(block.slug);
      if (!topic) return [];
      return grammarBlocks(topic, false);
    }
    case "pronunciation": {
      const item = pronunciationLessons.find((entry) => entry.slug === block.slug);
      if (!item) return [];
      return [
        { type: "heading", text: `Aussprache: ${item.title}`, level: 3 },
        { type: "paragraph", text: item.explanation },
        { type: "list", items: item.howTo },
        {
          type: "table",
          title: "Beispiele",
          headers: ["Deutsch", "IPA", "Englisch"],
          rows: item.examples.map((example) => [example.de, example.ipa, example.en]),
        },
      ];
    }
    case "culture":
      return [
        { type: "heading", text: block.title, level: 3 },
        { type: "list", items: block.body },
      ];
    case "checklist":
      return [
        { type: "heading", text: block.title, level: 3 },
        { type: "list", items: block.items.map((item) => `☐ ${item}`) },
      ];
    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */

export function buildLessonDoc(slug: string): DocSpec | null {
  const lesson = getLesson(slug);
  if (!lesson) return null;

  const sections: DocSection[] = [
    {
      id: "overview",
      title: "Überblick",
      blocks: [
        { type: "keyvalue", items: [
          { label: "Niveau", value: lesson.level },
          { label: "Dauer", value: `${lesson.minutes} Minuten` },
          { label: "Fertigkeiten", value: lesson.skills.join(", ") },
          { label: "XP", value: String(lesson.xp) },
        ] },
        { type: "paragraph", text: lesson.summary },
        { type: "heading", text: "Lernziele", level: 3 },
        { type: "list", items: lesson.objectives, ordered: true },
      ],
    },
    {
      id: "content",
      title: "Lektionsinhalt",
      blocks: lesson.blocks.flatMap(lessonBlockToDoc),
    },
  ];

  if (lesson.exercises.length) {
    sections.push({
      id: "exercises",
      title: "Übungen",
      newPage: true,
      blocks: exercisesBlock("Aufgaben", lesson.exercises),
    });
    sections.push({
      id: "solutions",
      title: "Lösungen",
      blocks: solutionsBlock("Lösungsschlüssel", lesson.exercises),
    });
  }

  sections.push({
    id: "homework",
    title: "Hausaufgaben & Wiederholung",
    blocks: [
      { type: "heading", text: "Hausaufgaben", level: 3 },
      { type: "list", items: lesson.homework, ordered: true },
      { type: "heading", text: "Wiederholung", level: 3 },
      { type: "list", items: lesson.revision },
      { type: "callout", variant: "tip", title: "Lerntipp", text: "Wiederholen Sie diese Lektion nach 1 Tag, 3 Tagen und 7 Tagen. Das ist der wirksamste Rhythmus gegen das Vergessen." },
    ],
  });

  return {
    title: lesson.title,
    subtitle: lesson.titleDe,
    level: lesson.level,
    kicker: `DeutschPfad · Lektion ${lesson.order}`,
    toc: true,
    sections,
  };
}

export function buildGrammarLevelDoc(level: Level): DocSpec {
  const topics = grammarByLevel(level);
  return {
    title: `Grammatik ${level}`,
    subtitle: `${topics.length} Themen mit Tabellen, Beispielen, Übungen und Lösungen`,
    level,
    kicker: "DeutschPfad · Grammar Sheets",
    toc: true,
    sections: topics.map((topic) => ({
      id: topic.slug,
      title: topic.title,
      newPage: true,
      blocks: grammarBlocks(topic),
    })),
  };
}

export function buildGrammarTopicDoc(slug: string): DocSpec | null {
  const topic = getGrammar(slug);
  if (!topic) return null;
  return {
    title: topic.title,
    subtitle: topic.titleDe,
    level: topic.level,
    kicker: `DeutschPfad · Grammatik ${topic.level}`,
    toc: false,
    sections: [{ id: topic.slug, title: topic.title, blocks: grammarBlocks(topic) }],
  };
}

export function buildVocabularyDoc(level: Level): DocSpec {
  const decks = decksByLevel(level);
  return {
    title: `Wortschatz ${level}`,
    subtitle: `${decks.length} Themenkarteien · ${decks.reduce((sum, deck) => sum + deck.words.length, 0)} Wörter`,
    level,
    kicker: "DeutschPfad · Vocabulary Lists",
    toc: true,
    sections: decks.map((deck) => ({
      id: deck.slug,
      title: `${deck.title} — ${deck.titleDe}`,
      newPage: true,
      blocks: [
        { type: "paragraph", text: deck.description },
        {
          type: "table",
          title: "Wortliste",
          headers: ["Wort", "Plural", "Bedeutung", "IPA", "Niveau"],
          rows: deck.words.map((word) => [
            word.article ? `${word.article} ${word.de}` : word.de,
            word.plural ?? "—",
            word.en,
            word.ipa,
            `${word.level} · ${"★".repeat(word.difficulty)}`,
          ]),
        },
        {
          type: "examples",
          items: deck.words.map((word) => ({ de: word.example.de, en: word.example.en, note: word.memoryTip })),
        },
      ],
    })),
  };
}

export function buildVerbsDoc(): DocSpec {
  return {
    title: "Verbtabellen",
    subtitle: `${verbs.length} Verben: Präsens, Präteritum, Perfekt, Konjunktiv, Imperativ`,
    level: "ALL",
    kicker: "DeutschPfad · Verb Reference",
    toc: true,
    sections: [
      {
        id: "overview",
        title: "Übersicht: Stammformen",
        blocks: [
          {
            type: "table",
            title: "Alle Verben",
            headers: ["Infinitiv", "Präsens (er)", "Präteritum", "Partizip II", "Hilfsverb", "Typ"],
            rows: verbs.map((verb) => {
              const table = conjugate(verb);
              return [
                verb.infinitive,
                table.tables[0].forms[2],
                table.tables[1].forms[0],
                verb.partizip2,
                verb.auxiliary,
                verb.kind,
              ];
            }),
          },
        ],
      },
      {
        id: "full",
        title: "Vollständige Konjugation der wichtigsten Verben",
        newPage: true,
        blocks: verbs.slice(0, 14).flatMap((verb): DocBlock[] => {
          const full = conjugate(verb);
          return [
            { type: "heading", text: `${verb.infinitive} — ${verb.en}`, level: 3 },
            {
              type: "table",
              headers: ["Person", "Präsens", "Präteritum", "Perfekt", "Konjunktiv II"],
              rows: ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"].map((person, index) => [
                person,
                full.tables[0].forms[index],
                full.tables[1].forms[index],
                full.tables[2].forms[index],
                full.tables[7].forms[index],
              ]),
              note: `Imperativ: ${full.imperative.join("  ")} · Hilfsverb: ${verb.auxiliary}`,
            },
          ];
        }),
      },
    ],
  };
}

export function buildCheatSheetDoc(): DocSpec {
  return {
    title: "Master Cheat Sheet A1–B2",
    subtitle: `${grammarTopics.length} Grammatikthemen auf wenigen Seiten`,
    level: "ALL",
    kicker: "DeutschPfad · Cheat Sheet",
    toc: false,
    sections: (["A1", "A2", "B1", "B2"] as Level[]).map((level) => ({
      id: level,
      title: `Niveau ${level}`,
      newPage: true,
      blocks: grammarByLevel(level).flatMap((topic): DocBlock[] => [
        { type: "keyvalue", title: `${topic.title} (${topic.titleDe})`, items: topic.cheatSheet },
      ]),
    })),
  };
}

export function buildWorksheetDoc(level: Level): DocSpec {
  const levelLessons = lessonsByLevel(level);
  return {
    title: `Arbeitsblätter ${level}`,
    subtitle: "Übungen zum Ausdrucken mit Lösungsschlüssel",
    level,
    kicker: "DeutschPfad · Worksheets",
    toc: true,
    sections: [
      ...levelLessons.map((lesson) => ({
        id: `ws-${lesson.slug}`,
        title: `${lesson.title}`,
        newPage: true,
        blocks: [
          { type: "paragraph", text: lesson.summary } as DocBlock,
          ...exercisesBlock("Aufgaben", lesson.exercises),
        ],
      })),
      {
        id: "solutions",
        title: "Lösungsschlüssel",
        newPage: true,
        blocks: levelLessons.flatMap((lesson): DocBlock[] => [
          { type: "heading", text: lesson.title, level: 3 },
          ...solutionsBlock("Lösungen", lesson.exercises),
        ]),
      },
    ],
  };
}

export function buildRevisionDoc(level: Level): DocSpec {
  const levelLessons = lessonsByLevel(level);
  return {
    title: `Wiederholungsnotizen ${level}`,
    subtitle: "Eine Seite pro Lektion — ideal für die Woche vor der Prüfung",
    level,
    kicker: "DeutschPfad · Revision Notes",
    toc: true,
    sections: levelLessons.map((lesson) => ({
      id: `rev-${lesson.slug}`,
      title: lesson.title,
      blocks: [
        { type: "paragraph", text: lesson.summary },
        { type: "heading", text: "Merksätze", level: 3 },
        { type: "list", items: lesson.revision },
        { type: "heading", text: "Lernziele", level: 3 },
        { type: "list", items: lesson.objectives },
        { type: "heading", text: "Hausaufgaben", level: 3 },
        { type: "list", items: lesson.homework },
      ],
    })),
  };
}

export function buildExamDoc(slug: string): DocSpec | null {
  const exam = getExam(slug);
  if (!exam) return null;

  const sections: DocSection[] = [
    {
      id: "info",
      title: "Prüfungsinformationen",
      blocks: [
        { type: "keyvalue", items: [
          { label: "Prüfung", value: exam.officialName },
          { label: "Niveau", value: exam.level },
          { label: "Dauer", value: `${exam.minutes} Minuten` },
          { label: "Bestehensgrenze", value: `${exam.passMark} %` },
        ] },
        { type: "paragraph", text: exam.description },
        { type: "heading", text: "Strategien", level: 3 },
        ...exam.strategies.map((strategy): DocBlock => ({
          type: "callout",
          variant: "tip",
          title: strategy.title,
          text: strategy.body,
        })),
      ],
    },
  ];

  for (const section of exam.sections) {
    sections.push({
      id: section.id,
      title: `${section.title} (${section.minutes} min, ${section.maxPoints} Punkte)`,
      newPage: true,
      blocks: section.parts.flatMap((part): DocBlock[] => [
        { type: "heading", text: part.title, level: 3 },
        { type: "paragraph", text: part.instructions },
        ...(part.reading ?? []).map((text): DocBlock => ({ type: "paragraph", text })),
        ...(part.audio
          ? [{ type: "dialogue", title: "Transkript (nur für Lehrkräfte)", lines: part.audio } as DocBlock]
          : []),
        ...exercisesBlock("Aufgaben", part.items),
      ]),
    });
  }

  sections.push({
    id: "key",
    title: "Lösungsschlüssel und Bewertung",
    newPage: true,
    blocks: exam.sections.flatMap((section): DocBlock[] => [
      { type: "heading", text: section.title, level: 3 },
      ...section.parts.flatMap((part) => solutionsBlock(part.title, part.items)),
    ]),
  });

  return {
    title: exam.title,
    subtitle: exam.officialName,
    level: exam.level,
    kicker: `DeutschPfad · ${exam.provider === "goethe" ? "Goethe" : "telc"} Mock Exam`,
    toc: true,
    sections,
  };
}

export function buildAusbildungDoc(): DocSpec {
  return {
    title: "Ausbildung in Deutschland — Bewerbungspaket",
    subtitle: "Lebenslauf, Anschreiben, Vorstellungsgespräch, Fachwortschatz, Arbeitskultur",
    level: "ALL",
    kicker: "DeutschPfad · Ausbildung Pack",
    toc: true,
    sections: ausbildungResources.map((resource) => ({
      id: resource.slug,
      title: resource.title,
      newPage: true,
      blocks: [
        { type: "paragraph", text: resource.summary } as DocBlock,
        ...resource.body.flatMap(lessonBlockToDoc),
        ...(resource.template
          ? [
              { type: "heading", text: "Vorlage", level: 3 } as DocBlock,
              { type: "paragraph", text: resource.template } as DocBlock,
            ]
          : []),
        ...(resource.vocabulary?.length
          ? [
              {
                type: "table",
                title: "Wortschatz",
                headers: ["Deutsch", "Englisch", "Hinweis"],
                rows: resource.vocabulary.map((item) => [item.de, item.en, item.note ?? ""]),
              } as DocBlock,
            ]
          : []),
      ],
    })),
  };
}

export function buildPronunciationDoc(): DocSpec {
  return {
    title: "Aussprache-Leitfaden",
    subtitle: "Alphabet, Umlaute, ich- und ach-Laut, Betonung, Satzmelodie",
    level: "ALL",
    kicker: "DeutschPfad · Pronunciation Guide",
    toc: true,
    sections: pronunciationLessons.map((item) => ({
      id: item.slug,
      title: item.title,
      blocks: [
        { type: "paragraph", text: item.explanation },
        { type: "list", items: item.howTo, ordered: true },
        {
          type: "table",
          title: "Beispiele",
          headers: ["Deutsch", "IPA", "Englisch"],
          rows: item.examples.map((example) => [example.de, example.ipa, example.en]),
        },
        ...(item.minimalPairs?.length
          ? [
              {
                type: "table",
                title: "Minimalpaare",
                headers: ["A", "B", "Unterschied"],
                rows: item.minimalPairs.map((pair) => [pair.a, pair.b, pair.note]),
              } as DocBlock,
            ]
          : []),
        {
          type: "table",
          title: "Typische Fehler",
          headers: ["Falsch", "Richtig", "Warum"],
          rows: item.mistakes.map((mistake) => [mistake.wrong, mistake.right, mistake.why]),
        },
      ],
    })),
  };
}

export function buildPracticeDoc(level: Level): DocSpec {
  const topics = grammarByLevel(level);
  const items = topics.flatMap((topic) => topic.quiz).slice(0, 20);
  return {
    title: `Kurztest ${level}`,
    subtitle: `${items.length} Aufgaben · ca. ${level === "A1" ? 30 : 45} Minuten`,
    level,
    kicker: "DeutschPfad · Practice Test",
    toc: false,
    sections: [
      {
        id: "test",
        title: "Aufgaben",
        blocks: [
          { type: "callout", variant: "info", title: "Anleitung", text: "Arbeiten Sie ohne Hilfsmittel und notieren Sie Ihre Zeit. Ab 60 % gilt der Test als bestanden." },
          ...exercisesBlock("Test", items),
        ],
      },
      {
        id: "solutions",
        title: "Lösungen",
        newPage: true,
        blocks: solutionsBlock("Lösungsschlüssel", items),
      },
    ],
  };
}
