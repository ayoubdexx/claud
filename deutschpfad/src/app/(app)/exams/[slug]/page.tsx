import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { ExamRunner } from "@/components/learn/exam-runner";
import { getExam, mockExams } from "@/content";
import { formatMinutes } from "@/lib/utils";

export function generateStaticParams() {
  return mockExams.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) return { title: "Exam not found" };
  return { title: exam.title, description: exam.description };
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  return (
    <>
      <PageHeader
        title={exam.title}
        description={exam.officialName}
        breadcrumbs={[{ label: "Mock exams", href: "/exams" }, { label: exam.title }]}
        eyebrow={
          <>
            <LevelBadge level={exam.level} />
            <Badge variant={exam.provider === "goethe" ? "default" : "accent"}>
              {exam.provider === "goethe" ? "Goethe-Institut" : "telc"}
            </Badge>
            <Badge variant="outline">{formatMinutes(exam.minutes)}</Badge>
            <Badge variant="outline">Pass mark {exam.passMark}%</Badge>
          </>
        }
      />
      <ExamRunner exam={exam} />
    </>
  );
}
