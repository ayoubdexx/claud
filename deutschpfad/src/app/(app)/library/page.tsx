import Link from "next/link";
import type { Metadata } from "next";
import { Download, FileText, Printer } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { courses, lessons, mockExams } from "@/content";
import { LEVELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "PDF library",
  description:
    "A professionally laid out printable PDF for every lesson, grammar level, worksheet set, vocabulary list, revision pack and mock exam.",
};

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="PDF library"
        description="Every lesson generates an A4 document with cover, table of contents, grammar tables, vocabulary, examples, exercises, solutions, homework and a revision summary. Nothing is a screenshot — it is typeset for print."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "PDF library" }]}
        eyebrow={<Badge variant="secondary">{lessons.length} lesson PDFs</Badge>}
        actions={
          <Button variant="outline" asChild>
            <Link href="/downloads">
              <Download /> Download centre
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((level) => (
          <Card key={level}>
            <CardContent className="pt-5 sm:pt-6">
              <LevelBadge level={level} className="mb-3" />
              <p className="font-semibold">{level} document pack</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {[
                  { label: "Grammar sheets", href: `/api/pdf/grammar/${level}` },
                  { label: "Vocabulary lists", href: `/api/pdf/vocabulary/${level}` },
                  { label: "Worksheets + solutions", href: `/api/pdf/worksheets/${level}` },
                  { label: "Revision notes", href: `/api/pdf/revision/${level}` },
                  { label: "Practice test", href: `/api/pdf/practice/${level}` },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <FileText className="size-3.5" /> {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.map((course) => (
        <div key={course.level} className="mb-8">
          <SectionTitle
            title={`${course.level} lesson PDFs`}
            description={`${lessons.filter((lesson) => lesson.level === course.level).length} lessons, each with exercises and answer key.`}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lessons
              .filter((lesson) => lesson.level === course.level)
              .map((lesson) => (
                <Card key={lesson.slug}>
                  <CardContent className="pt-5 sm:pt-6">
                    <p className="font-medium leading-snug">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.titleDe}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/api/pdf/lesson/${lesson.slug}`} target="_blank" rel="noopener noreferrer">
                          <Download /> PDF
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/print/lesson/${lesson.slug}`}>
                          <Printer /> Print view
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <SectionTitle title="Exam papers" description="Complete papers with transcripts, answer key and assessment notes." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockExams.map((exam) => (
          <Card key={exam.slug}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-2 flex items-center gap-2">
                <LevelBadge level={exam.level} />
                <Badge variant="secondary">{exam.provider === "goethe" ? "Goethe" : "telc"}</Badge>
              </div>
              <p className="font-medium">{exam.officialName}</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <a href={`/api/pdf/exam/${exam.slug}`} target="_blank" rel="noopener noreferrer">
                  <Download /> Download paper
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
