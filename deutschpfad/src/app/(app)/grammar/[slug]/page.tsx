import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Callout, DataTable, ExampleList, MistakeList } from "@/components/learn/blocks";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { GrammarStudied } from "@/components/learn/grammar-studied";
import { getGrammar, grammarTopics } from "@/content";

export function generateStaticParams() {
  return grammarTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getGrammar(slug);
  if (!topic) return { title: "Grammar topic not found" };
  return { title: `${topic.title} (${topic.level})`, description: topic.simple };
}

export default async function GrammarTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getGrammar(slug);
  if (!topic) notFound();

  return (
    <>
      <GrammarStudied slug={topic.slug} />
      <PageHeader
        title={topic.title}
        description={topic.titleDe}
        breadcrumbs={[
          { label: "Grammar", href: "/grammar" },
          { label: topic.level, href: `/courses/${topic.level.toLowerCase()}` },
          { label: topic.title },
        ]}
        eyebrow={
          <>
            <LevelBadge level={topic.level} />
            <Badge variant="secondary">{topic.category}</Badge>
            <Badge variant="outline">{topic.minutes} min</Badge>
          </>
        }
        actions={
          <>
            <BookmarkButton
              id={`grammar-${topic.slug}`}
              kind="grammar"
              title={topic.title}
              href={`/grammar/${topic.slug}`}
              withLabel
            />
            <Button variant="outline" asChild>
              <a href={`/api/pdf/grammar/${topic.slug}`} target="_blank" rel="noopener noreferrer">
                <Download /> PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/pdf/grammar/${topic.level}`} target="_blank" rel="noopener noreferrer">
                <Printer /> All {topic.level}
              </a>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="explanation">
        <TabsList>
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes & tips</TabsTrigger>
          <TabsTrigger value="practice">Practice ({topic.practice.length})</TabsTrigger>
          <TabsTrigger value="quiz">Mini quiz ({topic.quiz.length})</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
        </TabsList>

        <TabsContent value="explanation">
          <Callout variant="info" title="In one sentence">
            <p>{topic.simple}</p>
          </Callout>
          <div className="prose-de space-y-4">
            {topic.detailed.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {topic.visuals.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {topic.visuals.map((visual) => (
                <Card key={visual.pattern} className="bg-surface">
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{visual.label}</p>
                    <p className="mt-1.5 font-medium text-primary">{visual.pattern}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {visual.parts.map((part, index) => (
                        <span key={`${part}-${index}`} className="rounded-lg bg-background px-2.5 py-1 text-sm">
                          {part}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <h2 className="mt-8 font-display text-lg font-semibold">Examples</h2>
          <ExampleList items={topic.examples} />
        </TabsContent>

        <TabsContent value="tables">
          {topic.tables.map((table) => (
            <DataTable key={table.title} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="mistakes">
          <h2 className="font-display text-lg font-semibold">Common mistakes</h2>
          <MistakeList items={topic.mistakes} />
          <Callout variant="tip" title="Tips that actually help">
            <ul className="mt-1 space-y-1.5">
              {topic.tips.map((tip) => (
                <li key={tip}>· {tip}</li>
              ))}
            </ul>
          </Callout>
        </TabsContent>

        <TabsContent value="practice">
          <ExerciseRunner
            exercises={topic.practice}
            title={`Practice · ${topic.title}`}
            quizId={`grammar-practice-${topic.slug}`}
            mode="list"
          />
        </TabsContent>

        <TabsContent value="quiz">
          <ExerciseRunner
            exercises={topic.quiz}
            title={`Quiz · ${topic.title}`}
            quizId={`grammar-quiz-${topic.slug}`}
          />
        </TabsContent>

        <TabsContent value="revision">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Revision summary</p>
                <ul className="space-y-2 text-sm">
                  {topic.revision.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <p className="mb-3 font-semibold">Cheat sheet</p>
                <dl className="divide-y divide-border text-sm">
                  {topic.cheatSheet.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 py-2">
                      <dt className="font-medium">{row.label}</dt>
                      <dd className="text-right text-muted-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>

          {topic.related?.length ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Related topics</p>
              <div className="flex flex-wrap gap-2">
                {topic.related.map((related) => {
                  const item = getGrammar(related);
                  if (!item) return null;
                  return (
                    <Button key={related} variant="outline" size="sm" asChild>
                      <Link href={`/grammar/${related}`}>{item.title}</Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </>
  );
}
