import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FilterGrid, type GridItem } from "@/components/learn/filter-grid";
import { Badge } from "@/components/ui/badge";
import { readingTexts } from "@/content";

export const metadata: Metadata = {
  title: "Reading library",
  description:
    "Graded German reading texts from A1 to B2 with glossary, grammar highlights, comprehension questions and solutions.",
};

export default function ReadingPage() {
  const items: GridItem[] = readingTexts.map((text) => ({
    id: text.slug,
    title: text.title,
    subtitle: text.titleEn,
    description: text.intro,
    href: `/reading/${text.slug}`,
    level: text.level,
    tags: [text.genre.toLowerCase().replace(/\s+/g, "-")],
    meta: `${text.minutes} min · ${text.questions.length} questions · ${text.glossary.length} glossary entries`,
    keywords: text.paragraphs.join(" "),
  }));

  const categories = Array.from(new Set(readingTexts.map((text) => text.genre.toLowerCase().replace(/\s+/g, "-"))));

  return (
    <>
      <PageHeader
        title="Reading"
        description="Authentic-style texts: profiles, adverts, blog posts, house rules, articles and opinion pieces. Each one comes with vocabulary support, grammar highlights and exam-style questions."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reading" }]}
        eyebrow={<Badge variant="secondary">{readingTexts.length} texts</Badge>}
      />
      <FilterGrid items={items} searchPlaceholder="Search texts…" categories={categories} columns={2} />
    </>
  );
}
