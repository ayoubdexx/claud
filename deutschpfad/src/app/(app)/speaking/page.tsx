import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FilterGrid, type GridItem } from "@/components/learn/filter-grid";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/learn/blocks";
import { speakingTasks } from "@/content";

export const metadata: Metadata = {
  title: "Speaking",
  description:
    "Daily speaking practice: roleplays, conversations, job interviews, presentations, discussions and pronunciation drills with speech recognition scoring.",
};

export default function SpeakingPage() {
  const items: GridItem[] = speakingTasks.map((task) => ({
    id: task.slug,
    title: task.title,
    subtitle: task.goal,
    description: task.scenario,
    href: `/speaking/${task.slug}`,
    level: task.level,
    tags: [task.kind],
    meta: `${task.minutes} min · ${task.prompts.length} prompts · ${task.targets.length} target sentences`,
    keywords: task.usefulPhrases.map((phrase) => phrase.de).join(" "),
  }));

  const categories = Array.from(new Set(speakingTasks.map((task) => task.kind)));

  return (
    <>
      <PageHeader
        title="Speaking"
        description="The only way to speak German is to speak German. Every task gives you prompts, model answers, useful phrases and target sentences that are scored by speech recognition."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Speaking" }]}
        eyebrow={<Badge variant="secondary">{speakingTasks.length} tasks</Badge>}
      />
      <Callout variant="tip" title="Daily speaking challenge">
        <p>
          Six minutes a day is enough: one pronunciation sprint, one roleplay answer recorded and compared, one
          spontaneous 60-second monologue. Consistency beats long sessions.
        </p>
      </Callout>
      <div className="mt-5">
        <FilterGrid items={items} searchPlaceholder="Search speaking tasks…" categories={categories} columns={2} />
      </div>
    </>
  );
}
