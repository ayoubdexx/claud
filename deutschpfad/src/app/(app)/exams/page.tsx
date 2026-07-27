"use client";

import Link from "next/link";
import { ClipboardCheck, Download } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockExams } from "@/content";
import { useLearner } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";

export default function ExamsPage() {
  const { state } = useLearner();

  return (
    <>
      <PageHeader
        title="Mock exams"
        description="Full simulations with a per-module timer, automatic scoring, modular pass/fail evaluation and item-by-item corrections. Every exam is also available as a printable paper with answer key."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Mock exams" }]}
        eyebrow={<Badge variant="secondary">{mockExams.length} exams</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {mockExams.map((exam) => {
          const attempts = state.attempts.filter((item) => item.examSlug === exam.slug);
          const best = attempts.reduce((max, item) => Math.max(max, item.totalPercent), 0);
          return (
            <Card key={exam.slug}>
              <CardContent className="flex h-full flex-col pt-5 sm:pt-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <LevelBadge level={exam.level} />
                  <Badge variant={exam.provider === "goethe" ? "default" : "accent"}>
                    {exam.provider === "goethe" ? "Goethe" : "telc"}
                  </Badge>
                  <Badge variant="outline">{formatMinutes(exam.minutes)}</Badge>
                </div>

                <p className="font-display text-lg font-semibold tracking-[-0.01em]">{exam.title}</p>
                <p className="text-sm text-muted-foreground">{exam.officialName}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{exam.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exam.sections.map((section) => (
                    <Badge key={section.id} variant="secondary" className="capitalize">
                      {section.title} · {section.minutes}′
                    </Badge>
                  ))}
                </div>

                {attempts.length ? (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {attempts.length} attempt{attempts.length === 1 ? "" : "s"} · best {best}%
                      </span>
                      <span className={best >= exam.passMark ? "text-success" : "text-warning"}>
                        {best >= exam.passMark ? "passed" : "not yet"}
                      </span>
                    </div>
                    <Progress
                      value={best}
                      className="h-1.5"
                      indicatorClassName={best >= exam.passMark ? "bg-success" : "bg-warning"}
                    />
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button asChild>
                    <Link href={`/exams/${exam.slug}`}>
                      <ClipboardCheck /> Start exam
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`/api/pdf/exam/${exam.slug}`} target="_blank" rel="noopener noreferrer">
                      <Download /> PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.attempts.length ? (
        <div className="mt-8">
          <SectionTitle title="Attempt history" description="All results are stored on this device and synced when you are signed in." />
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <div className="scroll-slim overflow-x-auto">
                <table className="de-table">
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.attempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td className="font-medium">{attempt.examSlug}</td>
                        <td className="text-muted-foreground">
                          {new Date(attempt.startedAt).toLocaleDateString("de-DE")}
                        </td>
                        <td className="tabular-nums">{attempt.totalPercent}%</td>
                        <td>
                          <Badge variant={attempt.passed ? "success" : "danger"}>
                            {attempt.passed ? "bestanden" : "nicht bestanden"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
