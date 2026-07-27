"use client";

import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLearner } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function BookmarksPage() {
  const { state, toggleBookmark } = useLearner();

  const grouped = state.bookmarks.reduce<Record<string, typeof state.bookmarks>>((acc, item) => {
    acc[item.kind] = [...(acc[item.kind] ?? []), item];
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Bookmarks"
        description="Everything you saved: lessons, grammar topics, words, texts, exams and Ausbildung resources."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Bookmarks" }]}
        eyebrow={<Badge variant="secondary">{state.bookmarks.length} saved</Badge>}
      />

      {state.bookmarks.length ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind}>
              <h2 className="mb-3 font-display text-lg font-semibold capitalize">
                {kind} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
                      <p className="font-medium leading-snug">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Saved {formatDate(item.createdAt)}</p>
                      <div className="mt-auto flex gap-2 pt-3">
                        <Button size="sm" asChild>
                          <Link href={item.href}>Open</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark({ id: item.id, kind: item.kind, title: item.title, href: item.href })}
                        >
                          <Trash2 /> Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing bookmarked yet"
          description="Use the bookmark button on any lesson, grammar topic, word or exam to collect it here."
          icon={<Bookmark className="size-6" />}
          action={
            <Button asChild>
              <Link href="/grammar">Browse grammar</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
