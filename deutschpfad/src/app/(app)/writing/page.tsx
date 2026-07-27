import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FilterGrid, type GridItem } from "@/components/learn/filter-grid";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/learn/blocks";
import { writingTasks } from "@/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "German writing tasks with automatic correction: messages, emails, letters, forum posts, essays and exam tasks, each with model and native-level answers.",
};

export default function WritingPage() {
  const items: GridItem[] = writingTasks.map((task) => ({
    id: task.slug,
    title: task.title,
    subtitle: task.scenario,
    description: task.bullets.join(" · "),
    href: `/writing/${task.slug}`,
    level: task.level,
    tags: [task.kind],
    meta: `${task.minWords}${task.maxWords ? `–${task.maxWords}` : "+"} words · ${task.minutes} min`,
    keywords: task.usefulPhrases.map((phrase) => phrase.de).join(" "),
  }));

  const categories = Array.from(new Set(writingTasks.map((task) => task.kind)));

  return (
    <>
      <PageHeader
        title="Writing"
        description="Every task mirrors a real exam or real life. Write, hit “Text prüfen”, and get feedback on length, register, connectors, verb position and the errors learners make most."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Writing" }]}
        eyebrow={<Badge variant="secondary">{writingTasks.length} tasks</Badge>}
      />
      <Callout variant="info" title="What the checker looks at">
        <p>
          Word count against the task, greeting and closing, du/Sie consistency, number of connectors, average
          sentence length, typical grammar traps (weil-clauses, kein vs. nicht, als vs. wie, sein/haben in the
          Perfekt) and noun capitalisation — then it shows a model answer and, where available, a native rewrite.
        </p>
      </Callout>
      <div className="mt-5">
        <FilterGrid items={items} searchPlaceholder="Search writing tasks…" categories={categories} columns={2} />
      </div>
    </>
  );
}
