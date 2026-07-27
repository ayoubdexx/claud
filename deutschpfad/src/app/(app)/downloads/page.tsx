"use client";

import * as React from "react";
import { Download, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloads } from "@/content";
import type { DownloadItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryLabels: Record<DownloadItem["category"], string> = {
  "grammar-sheet": "Grammar sheets",
  "vocabulary-list": "Vocabulary lists",
  worksheet: "Worksheets",
  "practice-test": "Practice tests",
  "mock-exam": "Mock exams",
  "study-guide": "Study guides",
  "revision-notes": "Revision notes",
  "cheat-sheet": "Cheat sheets",
};

export default function DownloadsPage() {
  const [category, setCategory] = React.useState<DownloadItem["category"] | "all">("all");
  const [level, setLevel] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = downloads.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (level !== "all" && item.level !== level) return false;
    if (query.trim().length >= 2) {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      if (!haystack.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const totalPages = downloads.reduce((sum, item) => sum + item.pages, 0);

  return (
    <>
      <PageHeader
        title="Download centre"
        description="Every printable resource in one place. Files are generated on demand, so they always match the current content."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Downloads" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{downloads.length} documents</Badge>
            <Badge variant="secondary">≈ {totalPages} pages</Badge>
          </>
        }
      />

      <div className="mb-5 space-y-4">
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList>
            <TabsTrigger value="all">All levels</TabsTrigger>
            {["A1", "A2", "B1", "B2", "ALL"].map((item) => (
              <TabsTrigger key={item} value={item}>
                {item === "ALL" ? "Cross-level" : item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              category === "all" ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            All categories
          </button>
          {(Object.keys(categoryLabels) as DownloadItem["category"][]).map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                category === item ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              {categoryLabels[item]}
            </button>
          ))}
        </div>

        <div className="relative sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.slug} className="h-full">
            <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
              <div className="flex items-center gap-2">
                {item.level === "ALL" ? (
                  <Badge variant="secondary">A1–B2</Badge>
                ) : (
                  <LevelBadge level={item.level} />
                )}
                <Badge variant="outline">{categoryLabels[item.category]}</Badge>
              </div>
              <p className="font-semibold leading-snug">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground">≈ {item.pages} pages · A4 · print ready</p>
              <div className="mt-auto pt-3">
                <Button size="sm" className="w-full" asChild>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <Download /> Download PDF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filtered.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FileText className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents match this filter.</p>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
