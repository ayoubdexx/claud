import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FilterGrid, type GridItem } from "@/components/learn/filter-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { grammarTopics } from "@/content";

export const metadata: Metadata = {
  title: "Grammar A1–B2",
  description:
    "All German grammar from A1 to B2: simple and detailed explanations, conjugation and declension tables, common mistakes, practice, quizzes and printable cheat sheets.",
};

export default function GrammarPage() {
  const items: GridItem[] = grammarTopics.map((topic) => ({
    id: topic.slug,
    title: topic.title,
    subtitle: topic.titleDe,
    description: topic.simple,
    href: `/grammar/${topic.slug}`,
    level: topic.level,
    tags: [topic.category.toLowerCase().replace(/\s+/g, "-")],
    meta: `${topic.minutes} min · ${topic.tables.length} tables · ${topic.practice.length + topic.quiz.length} exercises`,
    keywords: topic.detailed.join(" "),
  }));

  const categories = Array.from(
    new Set(grammarTopics.map((topic) => topic.category.toLowerCase().replace(/\s+/g, "-"))),
  );

  return (
    <>
      <PageHeader
        title="Grammar"
        description="Every topic follows the same structure: a one-sentence rule, the full explanation, tables, examples, the mistakes learners really make, practice with solutions and a cheat sheet you can print."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Grammar" }]}
        eyebrow={<Badge variant="secondary">{grammarTopics.length} topics</Badge>}
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/api/pdf/cheatsheet/all" target="_blank" rel="noopener noreferrer">
                Master cheat sheet
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/pdf/grammar/A1" target="_blank" rel="noopener noreferrer">
                A1 grammar PDF
              </a>
            </Button>
          </>
        }
      />
      <FilterGrid items={items} searchPlaceholder="Search grammar…" categories={categories} columns={3} />
    </>
  );
}
