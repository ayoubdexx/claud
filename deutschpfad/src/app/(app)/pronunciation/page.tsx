import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioButton } from "@/components/learn/audio-button";
import { MistakeList } from "@/components/learn/blocks";
import { pronunciationLessons } from "@/content";

export const metadata: Metadata = {
  title: "Pronunciation lab",
  description:
    "German pronunciation: the alphabet, umlauts, the ich- and ach-sounds, the German r, z/s/st/sp, long and short vowels, word stress, sentence melody and final devoicing — with IPA and audio.",
};

const groupLabels: Record<string, string> = {
  alphabet: "Alphabet & spelling",
  umlauts: "Umlauts",
  consonants: "Consonants",
  vowels: "Vowels",
  clusters: "Consonant clusters",
  prosody: "Stress & melody",
  mistakes: "Diagnostics",
};

export default function PronunciationPage() {
  return (
    <>
      <PageHeader
        title="Pronunciation"
        description="Ten focused lessons that cover everything German pronunciation actually requires. Every example can be played, and every sound has the mistakes to avoid."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Pronunciation" }]}
        eyebrow={<Badge variant="secondary">{pronunciationLessons.length} lessons</Badge>}
        actions={
          <Button variant="outline" asChild>
            <a href="/api/pdf/pronunciation/all" target="_blank" rel="noopener noreferrer">
              <Download /> Guide PDF
            </a>
          </Button>
        }
      />

      <div className="space-y-5">
        {pronunciationLessons.map((lesson) => (
          <Card key={lesson.slug} id={lesson.slug}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="default">{groupLabels[lesson.group] ?? lesson.group}</Badge>
                {lesson.ipa ? (
                  <Badge variant="outline" className="font-mono">
                    {lesson.ipa}
                  </Badge>
                ) : null}
              </div>

              <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">{lesson.title}</h2>
              <p className="prose-de mt-2">{lesson.explanation}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    So geht&apos;s
                  </p>
                  <ol className="space-y-1.5 text-sm">
                    {lesson.howTo.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="font-semibold text-primary">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Beispiele
                  </p>
                  <ul className="space-y-1.5">
                    {lesson.examples.map((example) => (
                      <li key={example.de} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5">
                        <AudioButton text={example.de} />
                        <span className="text-sm font-medium">{example.de}</span>
                        <span className="font-mono text-xs text-muted-foreground">[{example.ipa}]</span>
                        <span className="ml-auto text-xs text-muted-foreground">{example.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {lesson.minimalPairs?.length ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Minimalpaare
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lesson.minimalPairs.map((pair) => (
                      <span
                        key={`${pair.a}-${pair.b}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
                      >
                        <AudioButton text={pair.a} />
                        {pair.a}
                        <span className="text-muted-foreground">↔</span>
                        {pair.b}
                        <AudioButton text={pair.b} />
                        <span className="text-xs text-muted-foreground">{pair.note}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <MistakeList items={lesson.mistakes} />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
