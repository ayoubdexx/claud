"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeckAdder, FlashcardSession, FlashcardStats } from "@/components/learn/flashcards";
import { getWord } from "@/content";
import { cardState } from "@/lib/srs";
import { useLearner } from "@/lib/store";

export default function FlashcardsPage() {
  const { state, stats } = useLearner();
  const favorites = Object.values(state.cards).filter((card) => card.favorite);
  const hard = Object.values(state.cards)
    .filter((card) => card.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 20);

  return (
    <>
      <PageHeader
        title="Flashcards"
        description="Spaced repetition with a four-button grading system. Cards you fail come back today; cards you know drift further apart. Ten minutes a day keeps thousands of words alive."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Flashcards" }]}
        eyebrow={
          <>
            <Badge variant="secondary">{stats.total} cards</Badge>
            <Badge variant={stats.due ? "warning" : "success"}>{stats.due} due today</Badge>
          </>
        }
      />

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="decks">Decks</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="favorites">Favourites ({favorites.length})</TabsTrigger>
          <TabsTrigger value="hard">Hardest ({hard.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <div className="mx-auto max-w-2xl">
            <FlashcardSession />
          </div>
        </TabsContent>

        <TabsContent value="decks">
          <DeckAdder />
        </TabsContent>

        <TabsContent value="stats">
          <FlashcardStats />
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((card) => {
                const word = getWord(card.wordId);
                if (!word) return null;
                return (
                  <Card key={card.id}>
                    <CardContent className="pt-5 sm:pt-6">
                      <p className="font-medium">
                        {word.article ? <span className="text-primary">{word.article} </span> : null}
                        {word.de}
                      </p>
                      <p className="text-sm text-muted-foreground">{word.en}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {cardState(card)} · interval {card.interval}d · ease {card.ease.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Star a card during review to keep it here for quick access.
            </p>
          )}
        </TabsContent>

        <TabsContent value="hard">
          {hard.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hard.map((card) => {
                const word = getWord(card.wordId);
                if (!word) return null;
                return (
                  <Card key={card.id}>
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{word.de}</p>
                        <Badge variant="danger">{card.lapses} lapses</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{word.en}</p>
                      {word.memoryTip ? (
                        <p className="mt-2 rounded-lg bg-primary/8 p-2 text-xs text-primary">💡 {word.memoryTip}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No problem cards yet — keep reviewing.</p>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
