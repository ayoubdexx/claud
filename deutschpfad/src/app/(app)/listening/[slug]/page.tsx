import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ListeningPlayer } from "@/components/learn/listening-player";
import { ExerciseRunner } from "@/components/learn/exercise-runner";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { getListening, listeningTasks } from "@/content";

export function generateStaticParams() {
  return listeningTasks.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = getListening(slug);
  if (!task) return { title: "Listening task not found" };
  return { title: `${task.title} (${task.level})`, description: task.scenario };
}

export default async function ListeningDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getListening(slug);
  if (!task) notFound();

  return (
    <>
      <PageHeader
        title={task.title}
        description={task.scenario}
        breadcrumbs={[{ label: "Listening", href: "/listening" }, { label: task.title }]}
        eyebrow={
          <>
            <LevelBadge level={task.level} />
            <Badge variant="outline">{task.seconds}s</Badge>
            <Badge variant="outline">{task.questions.length} questions</Badge>
          </>
        }
        actions={
          <BookmarkButton
            id={`listening-${task.slug}`}
            kind="listening"
            title={task.title}
            href={`/listening/${task.slug}`}
            withLabel
          />
        }
      />

      <div className="space-y-5">
        <ListeningPlayer transcript={task.transcript} title={task.titleEn} seconds={task.seconds} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <p className="mb-3 font-semibold">Wortschatz</p>
              <ul className="divide-y divide-border text-sm">
                {task.vocabulary.map((entry) => (
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
              <p className="mb-3 font-semibold">Strategie</p>
              <ul className="space-y-2 text-sm">
                {task.tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <ExerciseRunner
          exercises={task.questions}
          title={`Hörverstehen · ${task.title}`}
          quizId={`listening-${task.slug}`}
          mode="list"
        />
      </div>
    </>
  );
}
