import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioButton } from "@/components/learn/audio-button";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { getReading, readingTexts } from "@/content";

export function generateStaticParams() {
  return readingTexts.map((text) => ({ slug: text.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const text = getReading(slug);
  if (!text) return { title: "Text not found" };
  return { title: `${text.title} (${text.level})`, description: text.intro };
}

export default async function ReadingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const text = getReading(slug);
  if (!text) notFound();

  return (
    <>
      <PageHeader
        title={text.title}
        description={text.intro}
        breadcrumbs={[{ label: "Reading", href: "/reading" }, { label: text.title }]}
        eyebrow={
          <>
            <LevelBadge level={text.level} />
            <Badge variant="secondary">{text.genre}</Badge>
            <Badge variant="outline">{text.minutes} min</Badge>
          </>
        }
        actions={
          <>
            <BookmarkButton
              id={`reading-${text.slug}`}
              kind="reading"
              title={text.title}
              href={`/reading/${text.slug}`}
              withLabel
            />
            <Button variant="outline" asChild>
              <a href={`/api/pdf/practice/${text.level}`} target="_blank" rel="noopener noreferrer">
                <Printer /> Practice PDF
              </a>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="support">Glossary & grammar</TabsTrigger>
          <TabsTrigger value="questions">Questions ({text.questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-4 flex justify-end">
                <AudioButton text={text.paragraphs.join(" ")} label="Read aloud" variant="outline" />
              </div>
              <article className="prose-de max-w-none space-y-4 text-[16px] leading-8">
                {text.paragraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </article>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Glossar</p>
                <ul className="divide-y divide-border text-sm">
                  {text.glossary.map((entry) => (
                    <li key={entry.de} className="flex items-start justify-between gap-3 py-2">
                      <span className="font-medium">{entry.de}</span>
                      <span className="text-right text-muted-foreground">{entry.en}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Grammatik im Text</p>
                <ul className="space-y-3 text-sm">
                  {text.grammarHighlights.map((highlight) => (
                    <li key={highlight.label}>
                      <p className="font-medium">{highlight.label}</p>
                      <p className="text-muted-foreground">{highlight.note}</p>
                      {highlight.grammar ? (
                        <Link
                          href={`/grammar/${highlight.grammar}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Open grammar topic →
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <ExerciseRunner
            exercises={text.questions}
            title={`Verständnisfragen · ${text.title}`}
            quizId={`reading-${text.slug}`}
            mode="list"
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
