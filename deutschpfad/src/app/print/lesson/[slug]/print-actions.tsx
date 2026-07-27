"use client";

import Link from "next/link";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintActions({ slug }: { slug: string }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/learn/${slug}`}>
          <ArrowLeft /> Back to lesson
        </Link>
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer /> Print this page
      </Button>
      <Button size="sm" variant="outline" asChild>
        <a href={`/api/pdf/lesson/${slug}`} target="_blank" rel="noopener noreferrer">
          <Download /> Download typeset PDF
        </a>
      </Button>
      <p className="ml-auto text-xs text-neutral-500">A4 · margins optimised for printing</p>
    </div>
  );
}
