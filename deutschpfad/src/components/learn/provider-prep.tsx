import Link from "next/link";
import { ArrowRight, ClipboardCheck, Download, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { DataTable } from "@/components/learn/blocks";
import { mockExams, writingTasks, speakingTasks, readingTexts, listeningTasks } from "@/content";
import type { Provider } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

const overview = {
  goethe: {
    title: "Goethe-Zertifikat preparation",
    intro:
      "The Goethe-Institut exams are the most widely recognised German certificates. From B1 upwards they are modular: Lesen, Hören, Schreiben and Sprechen are graded separately and each module must reach 60 %, which means a failed module can be retaken on its own.",
    table: {
      title: "Exam structure at a glance",
      headers: ["Level", "Official name", "Duration", "Modules", "Pass mark"],
      rows: [
        ["A1", "Start Deutsch 1", "65 min", "Lesen · Hören · Schreiben · Sprechen", "60 %"],
        ["A2", "Goethe-Zertifikat A2", "90 min", "Lesen · Hören · Schreiben · Sprechen", "60 %"],
        ["B1", "Goethe-Zertifikat B1", "165 min", "4 independent modules", "60 % per module"],
        ["B2", "Goethe-Zertifikat B2", "190 min", "4 independent modules", "60 % per module"],
      ],
      note: "Speaking is taken in pairs at A1–B1 and in pairs or singly at B2.",
    },
    strategies: [
      { title: "Use the module rule", body: "Prepare the weakest module hardest — you can repeat just that one. Track your module percentages after each mock exam." },
      { title: "Writing is scored on completeness first", body: "Every content point missed costs more than a grammar slip. Number the bullets, tick them off, then polish." },
      { title: "Speaking rewards interaction", body: "In the planning and discussion parts, examiners look for reacting, agreeing, objecting and summarising — not a memorised monologue." },
      { title: "Time the reading paper", body: "At B1/B2 there are five parts in 65 minutes. Give each part a hard budget and move on; unanswered items score zero." },
    ],
  },
  telc: {
    title: "telc Deutsch preparation",
    intro:
      "telc exams are used widely by employers, chambers of commerce and integration courses. The written paper is a single block, and telc adds a pure grammar and vocabulary section (Sprachbausteine) that Goethe does not have. Answers are transferred to an answer sheet (Antwortbogen).",
    table: {
      title: "Exam structure at a glance",
      headers: ["Level", "Official name", "Written", "Special feature", "Pass mark"],
      rows: [
        ["A2", "telc Deutsch A2", "70 min", "Sprachbausteine", "60 %"],
        ["B1", "telc Deutsch B1", "150 min", "Sprachbausteine 1 & 2", "60 %"],
        ["B2", "telc Deutsch B2", "150 min", "Register is graded explicitly", "60 %"],
      ],
      note: "Speaking is always paired: contact phase, presentation/topic, joint task.",
    },
    strategies: [
      { title: "Master the Sprachbausteine", body: "Part 1 tests grammar in context, part 2 fixed expressions and connectors. Learn the connector list by heart — it is the cheapest score on the paper." },
      { title: "Never leave a gap empty", body: "There is no negative marking. Transfer answers to the Antwortbogen with five minutes left and fill every box." },
      { title: "Register is graded", body: "At B2 an informal phrase in a formal letter costs points even with perfect grammar. Decide du or Sie in the first line and stay there." },
      { title: "Rehearse the joint task", body: "You must reach an agreement out loud: propose, react, compromise, then say the final arrangement." },
    ],
  },
};

export function ProviderPrep({ provider }: { provider: Provider }) {
  const config = overview[provider];
  const exams = mockExams.filter((exam) => exam.provider === provider);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <p className="prose-de">{config.intro}</p>
          <div className="mt-4">
            <DataTable table={config.table} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Mock exams</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.slug}>
              <CardContent className="flex h-full flex-col pt-5 sm:pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <LevelBadge level={exam.level} />
                  <Badge variant="outline">{formatMinutes(exam.minutes)}</Badge>
                </div>
                <p className="font-semibold">{exam.officialName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exam.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button size="sm" asChild>
                    <Link href={`/exams/${exam.slug}`}>
                      <ClipboardCheck /> Start
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/pdf/exam/${exam.slug}`} target="_blank" rel="noopener noreferrer">
                      <Download /> PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Exam strategies</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.strategies.map((strategy) => (
            <Card key={strategy.title}>
              <CardContent className="pt-5 sm:pt-6">
                <p className="flex items-center gap-2 font-medium">
                  <Target className="size-4 text-primary" /> {strategy.title}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{strategy.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="flex items-center gap-2 font-medium">
              <FileText className="size-4 text-primary" /> Writing templates
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {writingTasks.slice(0, 4).map((task) => (
                <li key={task.slug}>
                  <Link href={`/writing/${task.slug}`} className="text-primary hover:underline">
                    {task.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="font-medium">Speaking simulations</p>
            <ul className="mt-2 space-y-1 text-sm">
              {speakingTasks.slice(0, 4).map((task) => (
                <li key={task.slug}>
                  <Link href={`/speaking/${task.slug}`} className="text-primary hover:underline">
                    {task.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="font-medium">Reading practice</p>
            <ul className="mt-2 space-y-1 text-sm">
              {readingTexts.slice(0, 4).map((text) => (
                <li key={text.slug}>
                  <Link href={`/reading/${text.slug}`} className="text-primary hover:underline">
                    {text.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="font-medium">Listening practice</p>
            <ul className="mt-2 space-y-1 text-sm">
              {listeningTasks.slice(0, 4).map((task) => (
                <li key={task.slug}>
                  <Link href={`/listening/${task.slug}`} className="text-primary hover:underline">
                    {task.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5 sm:pt-6">
          <div>
            <p className="font-semibold">Four-week exam plan</p>
            <p className="text-sm text-muted-foreground">
              Weeks 1–2: one module per day + 20 flashcards. Week 3: two full mock exams with timer. Week 4: only
              weak modules, model answers and speaking recordings.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/planner">
              Open planner <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
