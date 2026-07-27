"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioButton } from "@/components/learn/audio-button";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { useLearner } from "@/lib/store";
import type { Exercise, VocabDeck } from "@/lib/types";
import { shuffleWithSeed, hashString } from "@/lib/utils";

/** Builds vocabulary drills from the deck so every deck is also a practice set. */
function buildDrills(deck: VocabDeck): Exercise[] {
  const drills: Exercise[] = [];

  deck.words.slice(0, 8).forEach((word, index) => {
    const distractors = shuffleWithSeed(
      deck.words.filter((item) => item.id !== word.id).map((item) => item.en),
      hashString(word.id),
    ).slice(0, 3);
    const options = shuffleWithSeed([word.en, ...distractors], hashString(word.de));
    drills.push({
      id: `drill-mc-${word.id}`,
      type: "multiple-choice",
      prompt: `Was bedeutet „${word.article ? `${word.article} ` : ""}${word.de}“?`,
      options,
      answerIndex: options.indexOf(word.en),
      explanation: `${word.de} = ${word.en}. Beispiel: ${word.example.de}`,
      skill: "vocabulary",
      points: 1,
    });

    if (word.article && index < 5) {
      drills.push({
        id: `drill-art-${word.id}`,
        type: "multiple-choice",
        prompt: `Welcher Artikel gehört zu „${word.de}“?`,
        options: ["der", "die", "das"],
        answerIndex: ["der", "die", "das"].indexOf(word.article),
        explanation: `${word.article} ${word.de}${word.plural ? `, Plural: ${word.plural}` : ""}.`,
        skill: "vocabulary",
      });
    }
  });

  return drills;
}

export function DeckDetail({ deck }: { deck: VocabDeck }) {
  const { state, dispatch } = useLearner();
  const added = Object.values(state.cards).filter((card) => card.deck === deck.slug).length;
  const drills = React.useMemo(() => buildDrills(deck), [deck]);

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5 sm:pt-6">
          <div>
            <p className="font-semibold">{deck.titleDe}</p>
            <p className="text-sm text-muted-foreground">
              {added ? `${added} cards already in your flashcard queue` : "Not in your flashcards yet"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={added ? "secondary" : "default"}
              onClick={() => {
                dispatch({ type: "add-cards", deck: deck.slug, words: deck.words });
                toast.success(`${deck.words.length} cards ready`, { description: deck.title });
              }}
            >
              {added ? <Check /> : <Plus />}
              {added ? "Refresh cards" : "Add to flashcards"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/flashcards">
                <Layers /> Review now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="words">
        <TabsList>
          <TabsTrigger value="words">Words ({deck.words.length})</TabsTrigger>
          <TabsTrigger value="table">Compact table</TabsTrigger>
          <TabsTrigger value="drills">Drills ({drills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="words">
          <div className="grid gap-4 sm:grid-cols-2">
            {deck.words.map((word) => (
              <Card key={word.id} id={word.id}>
                <CardContent className="space-y-2.5 pt-5 sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {word.article ? <span className="text-primary">{word.article} </span> : null}
                        {word.de}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">[{word.ipa}]</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <AudioButton text={word.article ? `${word.article} ${word.de}` : word.de} />
                      <BookmarkButton
                        id={`word-${word.id}`}
                        kind="word"
                        title={word.de}
                        href={`/vocabulary/${deck.slug}#${word.id}`}
                      />
                    </div>
                  </div>

                  <p className="text-sm font-medium">{word.en}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{word.pos}</Badge>
                    {word.plural ? <Badge variant="outline">Pl. {word.plural}</Badge> : null}
                    <Badge variant={word.difficulty === 3 ? "danger" : word.difficulty === 2 ? "warning" : "success"}>
                      {"★".repeat(word.difficulty)}
                    </Badge>
                  </div>

                  <div className="rounded-xl bg-surface p-3">
                    <div className="flex items-start gap-2">
                      <AudioButton text={word.example.de} />
                      <div>
                        <p className="text-sm font-medium">{word.example.de}</p>
                        <p className="text-sm text-muted-foreground">{word.example.en}</p>
                      </div>
                    </div>
                  </div>

                  {word.synonyms?.length ? (
                    <p className="text-xs">
                      <span className="font-semibold text-muted-foreground">Synonyme: </span>
                      {word.synonyms.join(", ")}
                    </p>
                  ) : null}
                  {word.opposites?.length ? (
                    <p className="text-xs">
                      <span className="font-semibold text-muted-foreground">Gegenteil: </span>
                      {word.opposites.join(", ")}
                    </p>
                  ) : null}
                  {word.expressions?.length ? (
                    <ul className="space-y-0.5 text-xs">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <div className="scroll-slim overflow-x-auto">
                <table className="de-table">
                  <thead>
                    <tr>
                      <th>Wort</th>
                      <th>Plural</th>
                      <th>Bedeutung</th>
                      <th>IPA</th>
                      <th className="hidden sm:table-cell">Beispiel</th>
                      <th aria-label="Audio" />
                    </tr>
                  </thead>
                  <tbody>
                    {deck.words.map((word) => (
                      <tr key={word.id}>
                        <td className="font-medium">
                          {word.article ? <span className="text-primary">{word.article} </span> : null}
                          {word.de}
                        </td>
                        <td className="text-muted-foreground">{word.plural ?? "—"}</td>
                        <td>{word.en}</td>
                        <td className="font-mono text-xs text-muted-foreground">{word.ipa}</td>
                        <td className="hidden text-muted-foreground sm:table-cell">{word.example.de}</td>
                        <td>
                          <AudioButton text={word.de} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drills">
          <ExerciseRunner exercises={drills} title={`Vocabulary drills · ${deck.title}`} quizId={`deck-${deck.slug}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
