import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FilterGrid, type GridItem } from "@/components/learn/filter-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allWords, vocabDecks } from "@/content";

export const metadata: Metadata = {
  title: "Vocabulary decks",
  description:
    "Thematic German vocabulary with article, plural, IPA, example sentence, synonyms, opposites, expressions and memory tips.",
};

export default function VocabularyPage() {
  const items: GridItem[] = vocabDecks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    subtitle: deck.titleDe,
    description: deck.description,
    href: `/vocabulary/${deck.slug}`,
    level: deck.level,
    tags: [deck.topic.toLowerCase().replace(/\s+/g, "-")],
    meta: `${deck.words.length} words`,
    keywords: deck.words.map((word) => `${word.de} ${word.en}`).join(" "),
  }));

  const categories = Array.from(new Set(vocabDecks.map((deck) => deck.topic.toLowerCase().replace(/\s+/g, "-"))));

  return (
    <>
      <PageHeader
        title="Vocabulary"
        description="Words are grouped by topic and level. Every entry carries the article, plural, IPA transcription, a real example sentence and a memory hook — and can be sent straight to your flashcards."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Vocabulary" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{vocabDecks.length} decks</Badge>
            <Badge variant="secondary">{allWords.length} words</Badge>
          </>
        }
        actions={
          <Button variant="outline" asChild>
            <a href="/api/pdf/vocabulary/A1" target="_blank" rel="noopener noreferrer">
              A1 word list PDF
            </a>
          </Button>
        }
      />
      <FilterGrid items={items} searchPlaceholder="Search decks or words…" categories={categories} columns={3} />
    </>
  );
}
