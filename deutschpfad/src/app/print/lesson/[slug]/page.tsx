import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDeck, getGrammar, getLesson, lessons } from "@/content";
import { expectedAnswer } from "@/lib/exercises";
import { PrintActions } from "./print-actions";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return { title: lesson ? `Print · ${lesson.title}` : "Print" , robots: { index: false } };
}

export default async function PrintLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const grammarTopics = lesson.grammar.map((item) => getGrammar(item)).filter(Boolean);
  const decks = lesson.vocabDecks.map((item) => getDeck(item)).filter(Boolean);

  return (
    <div className="mx-auto max-w-[820px] bg-white px-8 py-10 text-black">
      <PrintActions slug={lesson.slug} />

      <header className="mb-8 border-b-2 border-black pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          DeutschPfad · Niveau {lesson.level} · Lektion {lesson.order}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{lesson.title}</h1>
        <p className="text-lg text-neutral-600">{lesson.titleDe}</p>
        <p className="mt-3 text-sm">{lesson.summary}</p>
        <p className="mt-3 text-xs text-neutral-500">
          Dauer: {lesson.minutes} Minuten · Fertigkeiten: {lesson.skills.join(", ")} · Name: ______________________
          Datum: ____________
        </p>
      </header>

      <section className="print-avoid-break mb-8">
        <h2 className="mb-2 text-lg font-bold">1. Lernziele</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm">
          {lesson.objectives.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      {lesson.blocks
        .filter((block) => block.kind === "dialogue")
        .map((block, index) =>
          block.kind === "dialogue" ? (
            <section key={index} className="print-avoid-break mb-8">
              <h2 className="mb-2 text-lg font-bold">2. Dialog: {block.title}</h2>
              <table className="w-full text-sm">
                <tbody>
                  {block.lines.map((line, lineIndex) => (
                    <tr key={lineIndex} className="align-top">
                      <td className="w-28 py-1 font-semibold text-blue-700">{line.speaker}</td>
                      <td className="py-1">
                        <p>{line.de}</p>
                        {line.en ? <p className="text-neutral-500">{line.en}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null,
        )}

      {grammarTopics.map((topic, index) =>
        topic ? (
          <section key={topic.slug} className="mb-8">
            <h2 className="mb-2 text-lg font-bold">
              {3 + index}. Grammatik: {topic.title}
            </h2>
            <p className="mb-2 rounded border-l-4 border-blue-600 bg-neutral-50 p-3 text-sm">{topic.simple}</p>
            {topic.detailed.map((paragraph, i) => (
              <p key={i} className="mb-2 text-sm leading-6">
                {paragraph}
              </p>
            ))}
            {topic.tables.map((table) => (
              <figure key={table.title} className="print-avoid-break mb-4">
                <figcaption className="mb-1 text-sm font-semibold">{table.title}</figcaption>
                <table className="w-full border border-neutral-300 text-xs">
                  <thead className="bg-neutral-100">
                    <tr>
                      {table.headers.map((header) => (
                        <th key={header} className="border border-neutral-300 px-2 py-1 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-neutral-300 px-2 py-1">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {table.note ? <p className="mt-1 text-[11px] italic text-neutral-500">{table.note}</p> : null}
              </figure>
            ))}
            <div className="print-avoid-break mb-3">
              <p className="text-sm font-semibold">Häufige Fehler</p>
              <table className="w-full border border-neutral-300 text-xs">
                <tbody>
                  {topic.mistakes.map((mistake) => (
                    <tr key={mistake.wrong}>
                      <td className="border border-neutral-300 px-2 py-1 line-through">{mistake.wrong}</td>
                      <td className="border border-neutral-300 px-2 py-1 font-semibold">{mistake.right}</td>
                      <td className="border border-neutral-300 px-2 py-1 text-neutral-600">{mistake.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="print-avoid-break rounded bg-neutral-50 p-3">
              <p className="text-sm font-semibold">Cheat Sheet</p>
              <ul className="mt-1 grid grid-cols-2 gap-x-6 text-xs">
                {topic.cheatSheet.map((row) => (
                  <li key={row.label} className="flex justify-between border-b border-neutral-200 py-0.5">
                    <span className="font-medium">{row.label}</span>
                    <span>{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null,
      )}

      {decks.map((deck) =>
        deck ? (
          <section key={deck.id} className="print-page mb-8">
            <h2 className="mb-2 text-lg font-bold">Wortschatz: {deck.titleDe}</h2>
            <table className="w-full border border-neutral-300 text-xs">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Wort</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Plural</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Bedeutung</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">IPA</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Beispiel</th>
                </tr>
              </thead>
              <tbody>
                {deck.words.map((word) => (
                  <tr key={word.id}>
                    <td className="border border-neutral-300 px-2 py-1 font-medium">
                      {word.article ? `${word.article} ` : ""}
                      {word.de}
                    </td>
                    <td className="border border-neutral-300 px-2 py-1">{word.plural ?? "—"}</td>
                    <td className="border border-neutral-300 px-2 py-1">{word.en}</td>
                    <td className="border border-neutral-300 px-2 py-1 font-mono">{word.ipa}</td>
                    <td className="border border-neutral-300 px-2 py-1">{word.example.de}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null,
      )}

      <section className="print-page mb-8">
        <h2 className="mb-3 text-lg font-bold">Übungen</h2>
        <ol className="space-y-5 text-sm">
          {lesson.exercises.map((exercise, index) => (
            <li key={exercise.id} className="print-avoid-break">
              <p className="font-medium">
                {index + 1}. {exercise.prompt}
              </p>
              {exercise.type === "multiple-choice" ? (
                <ul className="ml-5 mt-1 space-y-0.5">
                  {exercise.options.map((option, optionIndex) => (
                    <li key={option}>
                      ☐ {String.fromCharCode(97 + optionIndex)}) {option}
                    </li>
                  ))}
                </ul>
              ) : null}
              {exercise.type === "true-false" ? <p className="ml-5 mt-1">☐ richtig ☐ falsch</p> : null}
              {exercise.type === "fill-blank" ? <p className="ml-5 mt-1">{exercise.sentence}</p> : null}
              {exercise.type === "order" ? (
                <p className="ml-5 mt-1 italic">{exercise.tokens.join(" / ")}</p>
              ) : null}
              {exercise.type === "transform" ? <p className="ml-5 mt-1 italic">{exercise.input}</p> : null}
              {exercise.type === "match" ? (
                <ul className="ml-5 mt-1 space-y-0.5">
                  {exercise.pairs.map((pair) => (
                    <li key={pair.left}>{pair.left} → ______________________</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-2 space-y-3">
                {Array.from({ length: exercise.type === "writing" ? 8 : 2 }).map((_, lineIndex) => (
                  <div key={lineIndex} className="border-b border-neutral-300" />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="print-page mb-8">
        <h2 className="mb-3 text-lg font-bold">Lösungen</h2>
        <ol className="space-y-2 text-sm">
          {lesson.exercises.map((exercise, index) => (
            <li key={exercise.id}>
              <span className="font-semibold">{index + 1}.</span>{" "}
              <span className="font-medium text-green-700">{expectedAnswer(exercise)}</span>
              {exercise.explanation ? (
                <span className="text-neutral-600"> — {exercise.explanation}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 text-lg font-bold">Hausaufgaben</h2>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {lesson.homework.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-bold">Wiederholung</h2>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {lesson.revision.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-neutral-300 pt-3 text-[11px] text-neutral-500">
        DeutschPfad · {lesson.title} · Niveau {lesson.level} · Diese Seite darf für den Unterricht kopiert werden.
      </footer>
    </div>
  );
}
