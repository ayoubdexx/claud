import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LessonView } from "@/components/learn/lesson-view";
import { getLesson, lessons, lessonModule, nextLesson, previousLesson } from "@/content";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} (${lesson.level})`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const moduleInfo = lessonModule(lesson);
  const previous = previousLesson(slug);
  const next = nextLesson(slug);

  return (
    <>
      <PageHeader
        title={lesson.title}
        description={lesson.summary}
        breadcrumbs={[
          { label: "Courses", href: "/courses" },
          { label: lesson.level, href: `/courses/${lesson.level.toLowerCase()}` },
          { label: moduleInfo?.module.title ?? "Module" },
          { label: `Lesson ${lesson.order}` },
        ]}
      />
      <LessonView
        lesson={lesson}
        moduleTitle={moduleInfo?.module.title}
        previous={previous ? { slug: previous.slug, title: previous.title } : undefined}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </>
  );
}
