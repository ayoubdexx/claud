import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CourseModules } from "@/components/learn/course-modules";
import { courses, getCourse } from "@/content";
import { Badge, LevelBadge } from "@/components/ui/badge";
import type { Level } from "@/lib/types";

export function generateStaticParams() {
  return courses.map((course) => ({ level: course.level.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const course = getCourse(level.toUpperCase() as Level);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.description };
}

export default async function CourseLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const course = getCourse(level.toUpperCase() as Level);
  if (!course) notFound();

  return (
    <>
      <PageHeader
        title={course.title}
        description={course.description}
        breadcrumbs={[{ label: "Courses", href: "/courses" }, { label: course.level }]}
        eyebrow={
          <>
            <LevelBadge level={course.level} />
            <Badge variant="outline">{course.hours} hours</Badge>
            <Badge variant="outline">{course.modules.length} modules</Badge>
            <Badge variant="outline">{course.vocabularyTarget} words</Badge>
          </>
        }
      />
      <CourseModules course={course} />
    </>
  );
}
