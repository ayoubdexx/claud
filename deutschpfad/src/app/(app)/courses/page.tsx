import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, Clock, GraduationCap, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { courses, contentStats } from "@/content";

export const metadata: Metadata = {
  title: "Courses A1–B2",
  description:
    "The complete CEFR curriculum: modules, lessons, grammar focus, vocabulary targets and final exams for A1, A2, B1 and B2.",
};

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        title="Courses"
        description="Four levels, each with modules, lessons, mini tests and a final mock exam. Work through them in order or jump to the level you need."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Courses" }]}
        eyebrow={
          <>
            <Badge variant="secondary">
              <Layers className="size-3" /> {contentStats.modules} modules
            </Badge>
            <Badge variant="secondary">
              <GraduationCap className="size-3" /> {contentStats.lessons} lessons
            </Badge>
            <Badge variant="secondary">
              <Clock className="size-3" /> {courses.reduce((sum, course) => sum + course.hours, 0)} hours
            </Badge>
          </>
        }
      />

      <div className="space-y-6">
        {courses.map((course) => (
          <Card key={course.level} className="overflow-hidden">
            <CardContent className="pt-5 sm:pt-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <LevelBadge level={course.level} />
                    <Badge variant="outline">{course.hours} hours</Badge>
                    <Badge variant="outline">{course.vocabularyTarget} words</Badge>
                    <Badge variant="outline">{course.modules.length} modules</Badge>
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">{course.subtitle}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{course.description}</p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    At the end of this level you can
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {course.canDo.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/courses/${course.level.toLowerCase()}`}>
                        Open course <ArrowRight />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/exams/${course.finalExam}`}>Final mock exam</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <a href={`/api/pdf/grammar/${course.level}`} target="_blank" rel="noopener noreferrer">
                        Grammar PDF
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl bg-surface p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Grammar focus
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {course.grammarFocus.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modules</p>
                    <ol className="mt-2 space-y-1.5 text-sm">
                      {course.modules.map((module, index) => (
                        <li key={module.slug} className="flex items-start gap-2">
                          <span className="font-semibold text-primary">{index + 1}.</span>
                          <span>
                            {module.title}
                            <span className="text-muted-foreground"> · {module.lessons.length} lessons</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
