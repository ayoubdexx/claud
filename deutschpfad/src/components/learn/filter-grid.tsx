"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/layout/page-header";
import { LEVELS, type Level } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface GridItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  level?: Level;
  tags?: string[];
  meta?: string;
  keywords?: string;
}

export function FilterGrid({
  items,
  searchPlaceholder = "Filter…",
  categories,
  columns = 2,
  emptyTitle = "Nothing found",
}: {
  items: GridItem[];
  searchPlaceholder?: string;
  categories?: string[];
  columns?: 1 | 2 | 3;
  emptyTitle?: string;
}) {
  const [level, setLevel] = React.useState<Level | "all">("all");
  const [category, setCategory] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = items.filter((item) => {
    if (level !== "all" && item.level !== level) return false;
    if (category !== "all" && !(item.tags ?? []).includes(category)) return false;
    if (query.trim().length >= 2) {
      const haystack = `${item.title} ${item.subtitle ?? ""} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase();
      if (!haystack.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={level} onValueChange={(value) => setLevel(value as Level | "all")}>
          <TabsList>
            <TabsTrigger value="all">All levels</TabsTrigger>
            {LEVELS.map((item) => (
              <TabsTrigger key={item} value={item}>
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 pl-9"
          />
        </div>
      </div>

      {categories?.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === "all" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-ring",
            )}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                category === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-ring",
              )}
            >
              {item.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length ? (
        <div
          className={cn(
            "grid gap-4",
            columns === 1 && "grid-cols-1",
            columns === 2 && "sm:grid-cols-2",
            columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {filtered.map((item) => (
            <Link key={item.id} href={item.href} className="group">
              <Card interactive className="h-full">
                <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.level ? <LevelBadge level={item.level} /> : null}
                      {item.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="capitalize">
                          {tag.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>

                  <div>
                    <p className="font-semibold leading-snug">{item.title}</p>
                    {item.subtitle ? <p className="text-sm text-muted-foreground">{item.subtitle}</p> : null}
                  </div>

                  {item.description ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  ) : null}

                  {item.meta ? (
                    <p className="mt-auto pt-2 text-xs font-medium text-muted-foreground">{item.meta}</p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyTitle}
          description="Try a different level or clear the search filter."
          icon={<Search className="size-6" />}
        />
      )}
    </div>
  );
}
