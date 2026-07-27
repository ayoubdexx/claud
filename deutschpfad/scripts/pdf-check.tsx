/**
 * Renders every PDF the platform can produce and reports failures.
 * Run with:  npm run pdf:check
 */
import { renderSpecToPdf } from "../src/lib/pdf/render";
import {
  buildAusbildungDoc,
  buildCheatSheetDoc,
  buildExamDoc,
  buildGrammarLevelDoc,
  buildGrammarTopicDoc,
  buildLessonDoc,
  buildPracticeDoc,
  buildPronunciationDoc,
  buildRevisionDoc,
  buildVerbsDoc,
  buildVocabularyDoc,
  buildWorksheetDoc,
  type DocSpec,
} from "../src/lib/pdf/spec";
import { grammarTopics, lessons, mockExams } from "../src/content";
import { LEVELS } from "../src/lib/types";

const jobs: [string, () => DocSpec | null][] = [
  ...LEVELS.map((level): [string, () => DocSpec | null] => [
    `grammar/${level}`,
    () => buildGrammarLevelDoc(level),
  ]),
  ...grammarTopics.map((topic): [string, () => DocSpec | null] => [
    `grammar/${topic.slug}`,
    () => buildGrammarTopicDoc(topic.slug),
  ]),
  ...lessons.map((lesson): [string, () => DocSpec | null] => [
    `lesson/${lesson.slug}`,
    () => buildLessonDoc(lesson.slug),
  ]),
  ...mockExams.map((exam): [string, () => DocSpec | null] => [
    `exam/${exam.slug}`,
    () => buildExamDoc(exam.slug),
  ]),
  ...LEVELS.flatMap((level): [string, () => DocSpec | null][] => [
    [`vocabulary/${level}`, () => buildVocabularyDoc(level)],
    [`worksheets/${level}`, () => buildWorksheetDoc(level)],
    [`revision/${level}`, () => buildRevisionDoc(level)],
    [`practice/${level}`, () => buildPracticeDoc(level)],
  ]),
  ["verbs/all", () => buildVerbsDoc()],
  ["cheatsheet/all", () => buildCheatSheetDoc()],
  ["ausbildung/all", () => buildAusbildungDoc()],
  ["pronunciation/all", () => buildPronunciationDoc()],
];

async function main() {
  let failed = 0;

  for (const [name, build] of jobs) {
    try {
      const spec = build();
      if (!spec) throw new Error("builder returned null");
      const buffer = await renderSpecToPdf(spec);
      if (buffer.subarray(0, 5).toString() !== "%PDF-") throw new Error("output is not a PDF");
      console.log(`ok    ${name} (${buffer.length} bytes)`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(
    failed ? `\n${failed} of ${jobs.length} documents failed.` : `\nAll ${jobs.length} documents rendered.`,
  );
  process.exit(failed ? 1 : 0);
}

void main();
