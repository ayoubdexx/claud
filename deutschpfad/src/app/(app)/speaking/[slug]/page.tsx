import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { SpeakingPractice } from "@/components/learn/speaking-practice";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { getSpeaking, speakingTasks } from "@/content";

export function generateStaticParams() {
  return speakingTasks.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = getSpeaking(slug);
  if (!task) return { title: "Speaking task not found" };
  return { title: `${task.title} (${task.level})`, description: task.scenario };
}

export default async function SpeakingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getSpeaking(slug);
  if (!task) notFound();

  return (
    <>
      <PageHeader
        title={task.title}
        description={task.goal}
        breadcrumbs={[{ label: "Speaking", href: "/speaking" }, { label: task.title }]}
        eyebrow={
          <>
            <LevelBadge level={task.level} />
            <Badge variant="secondary" className="capitalize">
              {task.kind}
            </Badge>
            <Badge variant="outline">{task.minutes} min</Badge>
          </>
        }
        actions={
          <BookmarkButton
            id={`speaking-${task.slug}`}
            kind="speaking"
            title={task.title}
            href={`/speaking/${task.slug}`}
            withLabel
          />
        }
      />
      <SpeakingPractice task={task} />
    </>
  );
}
