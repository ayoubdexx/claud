"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Layers, Plus, RotateCcw, Star, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/layout/page-header";
import { AudioButton } from "@/components/learn/audio-button";
import { allWords, getWord, vocabDecks } from "@/content";
import { buildQueue, GRADE_LABELS, nextDueLabel, type Grade } from "@/lib/srs";
import { useLearner } from "@/lib/store";
import type { SrsCard, VocabWord } from "@/lib/types";
import { cn } from "@/lib/utils";

function CardFace({ word, revealed }: { word: VocabWord; revealed: boolean }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex items-center gap-2">
        <LevelBadge level={word.level} />
        <Badge variant="secondary">{word.topic}</Badge>
        <Badge variant={word.difficulty === 3 ? "danger" : word.difficulty === 2 ? "warning" : "success"}>
          {"★".repeat(word.difficulty)}
        </Badge>
      </div>

      <div>
        <p className="font-display text-3xl font-semibold tracking-[-0.02em]">
          {word.article ? <span className="text-primary">{word.article} </span> : null}
          {word.de}
        </p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">[{word.ipa}]</p>
      </div>

      <AudioButton text={word.article ? `${word.article} ${word.de}` : word.de} label="Hören" variant="outline" />

      <AnimatePresence>
        {revealed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3 border-t border-border pt-4 text-left"
          >
            <p className="text-lg font-medium">{word.en}</p>
            {word.plural ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Plural: </span>
                {word.plural}
              </p>
            ) : null}
            <div className="rounded-xl bg-surface p-3">
              <p className="text-sm font-medium">{word.example.de}</p>
              <p className="text-sm text-muted-foreground">{word.example.en}</p>
            </div>
            {word.synonyms?.length ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Synonyme:</span> {word.synonyms.join(", ")}
              </p>
            ) : null}
            {word.opposites?.length ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Gegenteil:</span> {word.opposites.join(", ")}
              </p>
            ) : null}
            {word.expressions?.length ? (
              <ul className="space-y-1 text-xs">
                {word.expressions.map((expression) => (
                  <li key={expression.de}>
                    <span className="font-medium">{expression.de}</span>{" "}
                    <span className="text-muted-foreground">— {expression.en}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {word.memoryTip ? (
              <p className="rounded-lg bg-primary/8 p-2.5 text-xs text-primary">💡 {word.memoryTip}</p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FlashcardSession({ deckSlug }: { deckSlug?: string }) {
  const { state, dispatch, stats } = useLearner();
  const [revealed, setRevealed] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(0);

  const cards = React.useMemo(() => {
    const all = Object.values(state.cards);
    return deckSlug ? all.filter((card) => card.deck === deckSlug) : all;
  }, [state.cards, deckSlug]);

  const queue = React.useMemo(() => buildQueue(cards, 20), [cards]);
  const current: SrsCard | undefined = queue[0];
  const word = current ? getWord(current.wordId) : undefined;

  const grade = (value: Grade) => {
    if (!current) return;
    dispatch({ type: "review-card", id: current.id, grade: value });
    setRevealed(false);
    setReviewed((count) => count + 1);
  };

  if (!cards.length) {
    return (
      <EmptyState
        title="No cards in this deck yet"
        description="Add a vocabulary deck to start spaced repetition. Cards you struggle with come back sooner."
        icon={<Layers className="size-6" />}
        action={
          <Button
            onClick={() => {
              const deck = deckSlug ? vocabDecks.find((item) => item.slug === deckSlug) : vocabDecks[0];
              if (!deck) return;
              dispatch({ type: "add-cards", deck: deck.slug, words: deck.words });
              toast.success(`${deck.words.length} cards added`, { description: deck.title });
            }}
          >
            <Plus /> Add cards
          </Button>
        }
      />
    );
  }

  if (!current || !word) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <Check className="mx-auto size-8 text-success" />
          <p className="font-display text-xl font-semibold">Alles wiederholt!</p>
          <p className="text-sm text-muted-foreground">
            You reviewed {reviewed} card{reviewed === 1 ? "" : "s"} today. Next cards are due tomorrow.
          </p>
          <div className="mx-auto grid max-w-sm grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-surface p-3">
              <p className="font-display text-lg font-semibold">{stats.new}</p>
              <p className="text-muted-foreground">new</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="font-display text-lg font-semibold">{stats.learning}</p>
              <p className="text-muted-foreground">learning</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="font-display text-lg font-semibold">{stats.mature}</p>
              <p className="text-muted-foreground">mature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {queue.length} in queue · {reviewed} done
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle favourite"
            onClick={() => dispatch({ type: "toggle-favorite", id: current.id })}
          >
            <Star className={cn(current.favorite && "fill-warning text-warning")} />
          </Button>
          <Progress value={(reviewed / (reviewed + queue.length)) * 100} className="h-1.5 w-28" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <button className="w-full text-left" onClick={() => setRevealed((value) => !value)}>
          <CardFace word={word} revealed={revealed} />
        </button>
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([0, 1, 2, 3] as Grade[]).map((value) => (
            <Button
              key={value}
              variant={value === 0 ? "destructive" : value === 3 ? "success" : "outline"}
              onClick={() => grade(value)}
            >
              {GRADE_LABELS[value]}
            </Button>
          ))}
        </div>
      ) : (
        <Button className="w-full" onClick={() => setRevealed(true)}>
          <Volume2 /> Show answer
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Interval: {current.interval} day{current.interval === 1 ? "" : "s"} · next {nextDueLabel(current)} · ease{" "}
        {current.ease.toFixed(2)}
      </p>
    </div>
  );
}

export function DeckAdder() {
  const { state, dispatch } = useLearner();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {vocabDecks.map((deck) => {
        const added = Object.values(state.cards).filter((card) => card.deck === deck.slug).length;
        return (
          <Card key={deck.id}>
            <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
              <div className="flex items-center gap-2">
                <LevelBadge level={deck.level} />
                <Badge variant="secondary">{deck.words.length} Wörter</Badge>
              </div>
              <p className="font-semibold">{deck.title}</p>
              <p className="text-sm text-muted-foreground">{deck.titleDe}</p>
              <div className="mt-auto pt-3">
                {added ? (
                  <p className="flex items-center gap-1.5 text-xs text-success">
                    <Check className="size-3.5" /> {added} cards in your queue
                  </p>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      dispatch({ type: "add-cards", deck: deck.slug, words: deck.words });
                      toast.success(`${deck.words.length} cards added`, { description: deck.title });
                    }}
                  >
                    <Plus /> Add to flashcards
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function FlashcardStats() {
  const { stats, state, dispatch } = useLearner();

  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Total", value: stats.total },
            { label: "Due today", value: stats.due },
            { label: "New", value: stats.new },
            { label: "Learning", value: stats.learning },
            { label: "Mature", value: stats.mature },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-display text-2xl font-semibold tabular-nums">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            14-day forecast
          </p>
          <div className="flex items-end gap-1">
            {stats.forecast.map((day) => {
              const max = Math.max(...stats.forecast.map((item) => item.count), 1);
              return (
                <div key={day.date} className="flex-1 text-center">
                  <div
                    className="mx-auto w-full rounded-t bg-primary/70"
                    style={{ height: `${Math.max(3, (day.count / max) * 56)}px` }}
                    title={`${day.date}: ${day.count}`}
                  />
                  <p className="mt-1 text-[9px] text-muted-foreground">{day.date.slice(8)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {Object.keys(state.cards).length ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              dispatch({ type: "add-cards", deck: "all", words: allWords });
              toast.success("All decks added to your flashcards");
            }}
          >
            <RotateCcw /> Add every deck ({allWords.length} words)
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
