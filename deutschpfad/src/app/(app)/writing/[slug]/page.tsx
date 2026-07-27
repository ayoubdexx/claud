import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { WritingStudio } from "@/components/learn/writing-studio";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { getWriting, writingTasks } from "@/content";

export function generateStaticParams() {
  return writingTasks.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = getWriting(slug);
  if (!task) return { title: "Writing task not found" };
  return { title: `${task.title} (${task.level})`, description: task.scenario };
}

export default async function WritingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getWriting(slug);
  if (!task) notFound();

  return (
    <>
      <PageHeader
        title={task.title}
        description={`${task.minWords}${task.maxWords ? `–${task.maxWords}` : "+"} Wörter · ca. ${task.minutes} Minuten`}
        breadcrumbs={[{ label: "Writing", href: "/writing" }, { label: task.title }]}
        eyebrow={
          <>
            <LevelBadge level={task.level} />
            <Badge variant="secondary" className="capitalize">
              {task.kind.replace(/-/g, " ")}
            </Badge>
          </>
        }
        actions={
          <BookmarkButton
            id={`writing-${task.slug}`}
            kind="writing"
            title={task.title}
            href={`/writing/${task.slug}`}
            withLabel
          />
        }
      />
      <WritingStudio task={task} />
    </>
  );
}
