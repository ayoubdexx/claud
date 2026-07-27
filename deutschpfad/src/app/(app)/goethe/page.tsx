import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ProviderPrep } from "@/components/learn/provider-prep";
import { mockExams } from "@/content";

export const metadata: Metadata = {
  title: "Goethe preparation",
  description:
    "Prepare for Goethe-Zertifikat A1, A2, B1 and B2: exam structure, module rules, strategies, writing templates, speaking simulations and full mock exams with scoring.",
};

export default function GoethePage() {
  const count = mockExams.filter((exam) => exam.provider === "goethe").length;

  return (
    <>
      <PageHeader
        title="Goethe-Zertifikat preparation"
        description="Everything specific to the Goethe exams: what each module contains, how it is graded, and how to spend the four weeks before the test."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Goethe" }]}
        eyebrow={
          <>
            <Badge variant="default">A1 · A2 · B1 · B2</Badge>
            <Badge variant="secondary">{count} mock exams</Badge>
          </>
        }
      />
      <ProviderPrep provider="goethe" />
    </>
  );
}
