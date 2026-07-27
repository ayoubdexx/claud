import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { DeckDetail } from "@/components/learn/deck-detail";
import { getDeck, vocabDecks } from "@/content";

export function generateStaticParams() {
  return vocabDecks.map((deck) => ({ slug: deck.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const deck = getDeck(slug);
  if (!deck) return { title: "Deck not found" };
  return { title: `${deck.title} (${deck.level})`, description: deck.description };
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  return (
    <>
      <PageHeader
        title={deck.title}
        description={deck.description}
        breadcrumbs={[{ label: "Vocabulary", href: "/vocabulary" }, { label: deck.title }]}
        eyebrow={
          <>
            <LevelBadge level={deck.level} />
            <Badge variant="secondary">{deck.topic}</Badge>
            <Badge variant="outline">{deck.words.length} words</Badge>
          </>
        }
        actions={
          <Button variant="outline" asChild>
            <a href={`/api/pdf/vocabulary/${deck.level}`} target="_blank" rel="noopener noreferrer">
              <Download /> Word list PDF
            </a>
          </Button>
        }
      />
      <DeckDetail deck={deck} />
    </>
  );
}
