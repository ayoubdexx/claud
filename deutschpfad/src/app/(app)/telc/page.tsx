import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ProviderPrep } from "@/components/learn/provider-prep";
import { mockExams } from "@/content";

export const metadata: Metadata = {
  title: "TELC preparation",
  description:
    "Prepare for telc Deutsch A2, B1 and B2: Sprachbausteine, answer sheet technique, register requirements, paired speaking tasks and full mock exams.",
};

export default function TelcPage() {
  const count = mockExams.filter((exam) => exam.provider === "telc").length;

  return (
    <>
      <PageHeader
        title="telc Deutsch preparation"
        description="telc adds a pure grammar section and grades register explicitly. This page covers both, plus the paired speaking format used at every level."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "TELC" }]}
        eyebrow={
          <>
            <Badge variant="accent">A2 · B1 · B2</Badge>
            <Badge variant="secondary">{count} mock exams</Badge>
          </>
        }
      />
      <ProviderPrep provider="telc" />
    </>
  );
}
