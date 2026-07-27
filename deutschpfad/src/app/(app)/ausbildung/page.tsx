import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Callout } from "@/components/learn/blocks";
import { ausbildungResources } from "@/content";

export const metadata: Metadata = {
  title: "Ausbildung preparation",
  description:
    "Everything for moving to Germany through an Ausbildung: Lebenslauf and Anschreiben templates, 50 interview questions, workplace, office, construction and healthcare vocabulary, professional emails, phone calls, work dialogues and German working culture.",
};

const categoryLabels: Record<string, string> = {
  cv: "Lebenslauf",
  "cover-letter": "Anschreiben",
  interview: "Vorstellungsgespräch",
  vocabulary: "Fachwortschatz",
  email: "E-Mails",
  phone: "Telefonieren",
  dialogue: "Dialoge",
  culture: "Arbeitskultur",
  expressions: "Redemittel",
  situations: "Behörden & Situationen",
};

const steps = [
  { step: "1", title: "Sprache aufbauen", body: "B1 ist Minimum, B2 für Pflege und Gesundheit. Parallel Fachvokabular des Berufsfelds lernen." },
  { step: "2", title: "Unterlagen vorbereiten", body: "Lebenslauf tabellarisch, Anschreiben auf eine Seite, Zeugnisse mit beglaubigter Übersetzung." },
  { step: "3", title: "Anerkennung prüfen", body: "Kammer oder Behörde kontaktieren; Teilanerkennung ermöglicht oft einen früheren Start." },
  { step: "4", title: "Bewerben & Gespräch", body: "Betriebe direkt anschreiben, Gespräch üben, Fragen an den Betrieb vorbereiten." },
  { step: "5", title: "Ankommen", body: "Anmeldung, Krankenversicherung, Konto, Aufenthaltstitel — Reihenfolge und Unterlagen im Bereich Behörden." },
];

export default function AusbildungPage() {
  return (
    <>
      <PageHeader
        title="Ausbildung in Deutschland"
        description="A complete track for learners who want to move to Germany for vocational training: the paperwork, the language, the interview and the culture — with templates you can copy today."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Ausbildung" }]}
        eyebrow={
          <>
            <Badge variant="accent">{ausbildungResources.length} resources</Badge>
            <Badge variant="secondary">B1–B2 focus</Badge>
          </>
        }
        actions={
          <Button variant="outline" asChild>
            <a href="/api/pdf/ausbildung/all" target="_blank" rel="noopener noreferrer">
              <Download /> Full pack PDF
            </a>
          </Button>
        }
      />

      <Callout variant="info" title="Wie das duale System funktioniert">
        <p>
          Drei bis vier Tage im Betrieb, die übrigen Tage in der Berufsschule. Sie verdienen von Anfang an eine
          Ausbildungsvergütung (ca. 700–1.200 € monatlich), sind sozialversichert und erhalten nach zwei bis
          dreieinhalb Jahren einen in ganz Deutschland anerkannten Berufsabschluss.
        </p>
      </Callout>

      <div className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((item) => (
          <Card key={item.step} className="bg-surface">
            <CardContent className="pt-5 sm:pt-6">
              <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {item.step}
              </span>
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ausbildungResources.map((resource) => (
          <Card key={resource.slug} interactive className="h-full">
            <Link href={`/ausbildung/${resource.slug}`}>
              <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
                <div className="flex items-center gap-2">
                  <LevelBadge level={resource.level} />
                  <Badge variant="secondary">{categoryLabels[resource.category] ?? resource.category}</Badge>
                </div>
                <p className="font-semibold leading-snug">{resource.title}</p>
                <p className="line-clamp-3 text-sm text-muted-foreground">{resource.summary}</p>
                <p className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-primary">
                  {resource.minutes} min lesen <ArrowRight className="size-3" />
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
