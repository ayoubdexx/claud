"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { groupByKind, kindLabels, search, searchIndex } from "@/lib/search";

function SearchInner() {
  const params = useSearchParams();
  const [query, setQuery] = React.useState(params.get("q") ?? "");

  const results = React.useMemo(() => search(query, 60), [query]);
  const grouped = React.useMemo(() => groupByKind(results), [results]);

  return (
    <>
      <PageHeader
        title="Global search"
        description="One search across lessons, grammar, vocabulary, words, texts, audio, verbs, exams and the Ausbildung section. Press ⌘K anywhere for the quick palette."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Search" }]}
        eyebrow={<Badge variant="secondary">{searchIndex.length} indexed items</Badge>}
      />

      <div className="relative mb-6">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search everything… (e.g. Dativ, Bewerbung, Perfekt, Krankmeldung)"
          className="h-12 pl-11 text-base"
        />
      </div>

      {query.trim().length < 2 ? (
        <EmptyState
          title="Type at least two characters"
          description="Try “Konjunktiv”, “Lebenslauf”, “Wechselpräpositionen”, “Pflege” or an English word."
          icon={<SearchIcon className="size-6" />}
        />
      ) : results.length ? (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">{results.length} results for “{query}”</p>
          {grouped.map(([kind, items]) => (
            <div key={kind}>
              <h2 className="mb-3 font-display text-lg font-semibold">
                {kindLabels[kind]} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id} interactive>
                    <Link href={item.href}>
                      <CardContent className="pt-5 sm:pt-6">
                        <div className="mb-1.5 flex items-center gap-2">
                          {item.level ? <LevelBadge level={item.level} /> : null}
                          <Badge variant="secondary">{kindLabels[item.kind]}</Badge>
                        </div>
                        <p className="font-medium leading-snug">{item.title}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`Nothing found for “${query}”`}
          description="Check the spelling, try the German base form, or search the dictionary directly."
          icon={<SearchIcon className="size-6" />}
        />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <SearchInner />
    </React.Suspense>
  );
}
