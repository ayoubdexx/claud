"use client";

import * as React from "react";
import { Check, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CopyBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("In die Zwischenablage kopiert");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Kopieren nicht möglich — bitte manuell markieren.");
    }
  };

  return (
    <Card className="mt-5">
      <CardContent className="pt-5 sm:pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">{title}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check /> : <Copy />} {copied ? "Kopiert" : "Kopieren"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.print()}>
              <Printer /> Drucken
            </Button>
          </div>
        </div>
        <pre className="scroll-slim overflow-x-auto whitespace-pre-wrap rounded-xl bg-surface p-4 font-mono text-[12.5px] leading-6">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
