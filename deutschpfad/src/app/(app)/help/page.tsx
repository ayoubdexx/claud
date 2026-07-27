import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, LifeBuoy, Mail, MessagesSquare } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/misc";
import { contentStats, helpTopics } from "@/content";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "How to use DeutschPfad: choosing your level, spaced repetition, audio and speech recognition, writing feedback, Goethe vs telc, accounts and printing.",
};

export default function HelpPage() {
  return (
    <>
      <PageHeader
        title="Help center"
        description="Short answers to the questions learners ask most. If something is missing, post it in the discussion board."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Help" }]}
        eyebrow={<Badge variant="secondary">{helpTopics.reduce((sum, topic) => sum + topic.items.length, 0)} articles</Badge>}
        actions={
          <Button variant="outline" asChild>
            <Link href="/discussion">
              <MessagesSquare /> Ask the community
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <BookOpen className="mb-2 size-5 text-primary" />
            <p className="font-semibold">New here?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with the dashboard, then open today&apos;s plan. Everything else can wait.
            </p>
            <Button size="sm" variant="ghost" className="mt-2 px-0" asChild>
              <Link href="/daily">Open today&apos;s plan →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <LifeBuoy className="mb-2 size-5 text-primary" />
            <p className="font-semibold">What is included</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {contentStats.lessons} lessons, {contentStats.grammarTopics} grammar topics, {contentStats.words} words,
              {" "}{contentStats.exams} mock exams and {contentStats.downloads} printable documents.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <Mail className="mb-2 size-5 text-primary" />
            <p className="font-semibold">Data & privacy</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Progress lives in your browser and, if you sign in, in your account. You can export or delete it in
              Settings.
            </p>
            <Button size="sm" variant="ghost" className="mt-2 px-0" asChild>
              <Link href="/settings">Open settings →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {helpTopics.map((topic) => (
        <div key={topic.category} className="mb-6">
          <SectionTitle title={topic.category} />
          <Card>
            <CardContent className="pt-2 sm:pt-3">
              <Accordion type="single" collapsible>
                {topic.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-[15px] leading-relaxed">{item.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      ))}
    </>
  );
}
