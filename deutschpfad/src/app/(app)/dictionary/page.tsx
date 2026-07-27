"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioButton } from "@/components/learn/audio-button";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { dictionary, verbs } from "@/content";
import type { PartOfSpeech } from "@/lib/types";
import { verbSlug } from "@/lib/conjugate";

const posFilters: { id: PartOfSpeech | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "noun", label: "Nouns" },
  { id: "verb", label: "Verbs" },
  { id: "adjective", label: "Adjectives" },
  { id: "adverb", label: "Adverbs" },
  { id: "phrase", label: "Phrases" },
];

function DictionaryInner() {
  const params = useSearchParams();
  const [query, setQuery] = React.useState(params.get("q") ?? "");
  const [pos, setPos] = React.useState<PartOfSpeech | "all">("all");

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dictionary
      .filter((entry) => (pos === "all" ? true : entry.pos === pos))
      .filter((entry) => {
        if (!needle) return true;
        return (
          entry.de.toLowerCase().includes(needle) ||
          entry.en.some((meaning) => meaning.toLowerCase().includes(needle)) ||
          (entry.plural ?? "").toLowerCase().includes(needle)
        );
      })
      .slice(0, 80);
  }, [query, pos]);

  return (
    <>
      <PageHeader
        title="Dictionary"
        description="Every word used on the platform, with article, plural, IPA, meanings, example sentences, synonyms, opposites and fixed expressions. Verbs link straight to their full conjugation."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dictionary" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{dictionary.length} entries</Badge>
            <Badge variant="secondary">{verbs.length} conjugated verbs</Badge>
          </>
        }
      />

      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suchen Sie ein Wort — deutsch oder englisch…"
            className="h-12 pl-11 text-base"
            autoFocus
          />
        </div>

        <Tabs value={pos} onValueChange={(value) => setPos(value as PartOfSpeech | "all")}>
          <TabsList>
            {posFilters.map((filter) => (
              <TabsTrigger key={filter.id} value={filter.id}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <p className="text-sm text-muted-foreground">{results.length} results</p>

        {results.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="space-y-2 pt-5 sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {entry.article ? <span className="text-primary">{entry.article} </span> : null}
                        {entry.de}
                      </p>
                      {entry.ipa ? <p className="font-mono text-xs text-muted-foreground">[{entry.ipa}]</p> : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <AudioButton text={entry.article ? `${entry.article} ${entry.de}` : entry.de} />
                      <BookmarkButton
                        id={`dict-${entry.id}`}
                        kind="dictionary"
                        title={entry.de}
                        href={`/dictionary?q=${encodeURIComponent(entry.de)}`}
                      />
                    </div>
                  </div>

                  <p className="text-sm font-medium">{entry.en.join(", ")}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{entry.pos}</Badge>
                    {entry.level ? <LevelBadge level={entry.level} /> : null}
                    {entry.plural ? <Badge variant="outline">Pl. {entry.plural}</Badge> : null}
                    {entry.topic ? <Badge variant="outline">{entry.topic}</Badge> : null}
                  </div>

                  {entry.examples.slice(0, 2).map((example) => (
                    <div key={example.de} className="rounded-lg bg-surface p-2.5 text-sm">
                      <p className="font-medium">{example.de}</p>
                      <p className="text-muted-foreground">{example.en}</p>
                    </div>
                  ))}

                  {entry.synonyms?.length ? (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Synonyme:</span> {entry.synonyms.join(", ")}
                    </p>
                  ) : null}
                  {entry.opposites?.length ? (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Gegenteil:</span> {entry.opposites.join(", ")}
                    </p>
                  ) : null}
                  {entry.expressions?.length ? (
                    <ul className="space-y-0.5 text-xs">
                      {entry.expressions.slice(0, 3).map((expression) => (
                        <li key={expression.de}>
                          <span className="font-medium">{expression.de}</span>{" "}
                          <span className="text-muted-foreground">— {expression.en}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {entry.verb ? (
                    <Link
                      href={`/verbs/${verbSlug({ infinitive: entry.verb } as never)}`}
                      className="inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Full conjugation →
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No entry for “${query}”`}
            description="Try the base form (infinitive for verbs, singular for nouns) or search in English."
            icon={<Search className="size-6" />}
          />
        )}
      </div>
    </>
  );
}

export default function DictionaryPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <DictionaryInner />
    </React.Suspense>
  );
}
