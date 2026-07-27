"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Lightbulb, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { AudioButton, GermanText } from "@/components/learn/audio-button";
import { getDeck, getGrammar, getPronunciation } from "@/content";
import type { GrammarTable, LessonBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DataTable({ table, compact = false }: { table: GrammarTable; compact?: boolean }) {
  return (
    <figure className="print-avoid-break my-4 overflow-hidden rounded-2xl border border-border">
      {table.title ? (
        <figcaption className="border-b border-border bg-surface px-4 py-2.5 text-sm font-semibold">
          {table.title}
        </figcaption>
      ) : null}
      <div className="scroll-slim overflow-x-auto">
        <table className="de-table">
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      compact && "py-2",
                      table.highlightColumn === cellIndex && "font-semibold text-primary",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note ? (
        <p className="border-t border-border bg-surface px-4 py-2.5 text-xs text-muted-foreground">{table.note}</p>
      ) : null}
    </figure>
  );
}

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "tip" | "warning";
  title?: string;
  children: React.ReactNode;
}) {
  const config = {
    info: { icon: Sparkles, className: "border-primary/25 bg-primary/5 text-primary" },
    tip: { icon: Lightbulb, className: "border-success/25 bg-success/8 text-success" },
    warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/8 text-warning" },
  }[variant];
  const IconComponent = config.icon;

  return (
    <div className={cn("print-avoid-break my-4 rounded-2xl border p-4", config.className)}>
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <IconComponent className="size-4" />
        {title ?? (variant === "warning" ? "Achtung" : variant === "tip" ? "Tipp" : "Info")}
      </p>
      <div className="prose-de text-foreground/90">{children}</div>
    </div>
  );
}

export function MistakeList({ items }: { items: { wrong: string; right: string; why: string }[] }) {
  return (
    <div className="my-4 space-y-2">
      {items.map((item) => (
        <div key={item.wrong} className="print-avoid-break rounded-2xl border border-border p-4">
          <p className="flex items-start gap-2 text-sm">
            <X className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span className="line-through decoration-destructive/50">{item.wrong}</span>
          </p>
          <p className="mt-1.5 flex items-start gap-2 text-sm font-medium">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{item.right}</span>
            <AudioButton text={item.right} className="ml-auto shrink-0" />
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">{item.why}</p>
        </div>
      ))}
    </div>
  );
}

export function ExampleList({ items }: { items: { de: string; en?: string; note?: string }[] }) {
  return (
    <div className="my-4 space-y-2.5">
      {items.map((item) => (
        <div key={item.de} className="print-avoid-break rounded-xl border-l-2 border-primary/40 bg-surface px-4 py-2.5">
          <GermanText de={item.de} en={item.en} note={item.note} />
        </div>
      ))}
    </div>
  );
}

export function Dialogue({
  title,
  setting,
  lines,
}: {
  title?: string;
  setting?: string;
  lines: { speaker: string; de: string; en?: string }[];
}) {
  const script = lines.map((line) => line.de).join(" ");

  return (
    <Card className="my-5">
      <CardContent className="pt-5 sm:pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title ? <p className="font-semibold">{title}</p> : null}
            {setting ? <p className="text-xs text-muted-foreground">{setting}</p> : null}
          </div>
          <AudioButton text={script} label="Play dialogue" variant="outline" />
        </div>
        <div className="space-y-2.5">
          {lines.map((line, index) => (
            <div key={`${line.speaker}-${index}`} className="flex gap-3">
              <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                {line.speaker}
              </span>
              <GermanText de={line.de} en={line.en} className="flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VocabPreview({ deckId, title }: { deckId: string; title: string }) {
  const deck = getDeck(deckId);
  if (!deck) return null;

  return (
    <Card className="my-5">
      <CardContent className="pt-5 sm:pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">
              {deck.words.length} Wörter · {deck.titleDe}
            </p>
          </div>
          <Link
            href={`/vocabulary/${deck.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Open deck <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="scroll-slim overflow-x-auto">
          <table className="de-table">
            <thead>
              <tr>
                <th>Wort</th>
                <th>Plural</th>
                <th>Bedeutung</th>
                <th className="hidden sm:table-cell">Beispiel</th>
                <th aria-label="Audio" />
              </tr>
            </thead>
            <tbody>
              {deck.words.map((word) => (
                <tr key={word.id}>
                  <td className="font-medium">
                    {word.article ? <span className="text-primary">{word.article} </span> : null}
                    {word.de}
                  </td>
                  <td className="text-muted-foreground">{word.plural ?? "—"}</td>
                  <td>{word.en}</td>
                  <td className="hidden text-muted-foreground sm:table-cell">{word.example.de}</td>
                  <td>
                    <AudioButton text={word.article ? `${word.article} ${word.de}` : word.de} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function GrammarInline({ slug }: { slug: string }) {
  const topic = getGrammar(slug);
  if (!topic) return null;

  return (
    <Card className="my-5 border-primary/25">
      <CardContent className="pt-5 sm:pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <LevelBadge level={topic.level} />
              <Badge variant="secondary">{topic.category}</Badge>
            </div>
            <p className="font-semibold">
              {topic.title} · <span className="text-muted-foreground">{topic.titleDe}</span>
            </p>
          </div>
          <Link
            href={`/grammar/${topic.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Full explanation <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <p className="prose-de">{topic.simple}</p>
        {topic.tables.slice(0, 1).map((table) => (
          <DataTable key={table.title} table={table} compact />
        ))}
        {topic.visuals.slice(0, 1).map((visual) => (
          <div key={visual.pattern} className="rounded-xl bg-surface p-3.5 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{visual.label}</p>
            <p className="mt-1 font-medium text-primary">{visual.pattern}</p>
            <p className="mt-1 text-muted-foreground">{visual.parts.join("  ·  ")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PronunciationInline({ slug }: { slug: string }) {
  const item = getPronunciation(slug);
  if (!item) return null;

  return (
    <Card className="my-5">
      <CardContent className="pt-5 sm:pt-6">
        <p className="font-semibold">Aussprache: {item.title}</p>
        <p className="prose-de mt-1">{item.explanation}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.examples.slice(0, 6).map((example) => (
            <span key={example.de} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm">
              {example.de}
              <span className="font-mono text-xs text-muted-foreground">[{example.ipa}]</span>
              <AudioButton text={example.de} />
            </span>
          ))}
        </div>
        <Link href="/pronunciation" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Pronunciation lab <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-1">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "text":
            return (
              <section key={index} className="my-4">
                {block.title ? <h3 className="mb-2 text-lg font-semibold">{block.title}</h3> : null}
                <div className="prose-de space-y-3">
                  {block.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          case "objectives":
            return (
              <Callout key={index} variant="info" title="Lernziele">
                <ul className="mt-1 space-y-1">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-1 size-3.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </Callout>
            );
          case "dialogue":
            return <Dialogue key={index} title={block.title} setting={block.setting} lines={block.lines} />;
          case "examples":
            return (
              <section key={index}>
                {block.title ? <h3 className="mb-1 mt-5 text-lg font-semibold">{block.title}</h3> : null}
                <ExampleList items={block.items} />
              </section>
            );
          case "table":
            return <DataTable key={index} table={block.table} />;
          case "tip":
            return (
              <Callout key={index} variant="tip" title={block.title}>
                <p>{block.body}</p>
              </Callout>
            );
          case "warning":
            return (
              <Callout key={index} variant="warning" title={block.title}>
                <p>{block.body}</p>
              </Callout>
            );
          case "mistakes":
            return <MistakeList key={index} items={block.items} />;
          case "vocab":
            return <VocabPreview key={index} deckId={block.deck} title={block.title} />;
          case "grammar":
            return <GrammarInline key={index} slug={block.slug} />;
          case "pronunciation":
            return <PronunciationInline key={index} slug={block.slug} />;
          case "culture":
            return (
              <Card key={index} className="my-5 bg-accent/5">
                <CardContent className="pt-5 sm:pt-6">
                  <p className="mb-2 font-semibold">{block.title}</p>
                  <ul className="prose-de space-y-2">
                    {block.body.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          case "checklist":
            return (
              <Card key={index} className="my-5">
                <CardContent className="pt-5 sm:pt-6">
                  <p className="mb-2 font-semibold">{block.title}</p>
                  <ul className="space-y-1.5 text-sm">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 flex size-4 items-center justify-center rounded border border-border text-[10px]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
