import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { AudioButton } from "@/components/learn/audio-button";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { Callout } from "@/components/learn/blocks";
import { verbs } from "@/content";
import { conjugate, getVerb, PERSONS, verbSlug } from "@/lib/conjugate";

export function generateStaticParams() {
  return verbs.map((verb) => ({ verb: verbSlug(verb) }));
}

export async function generateMetadata({ params }: { params: Promise<{ verb: string }> }): Promise<Metadata> {
  const { verb } = await params;
  const entry = getVerb(verb);
  if (!entry) return { title: "Verb not found" };
  return {
    title: `${entry.infinitive} — conjugation`,
    description: `Full conjugation of ${entry.infinitive} (${entry.en}): Präsens, Präteritum, Perfekt, Futur, Konjunktiv, imperative and passive.`,
  };
}

export default async function VerbPage({ params }: { params: Promise<{ verb: string }> }) {
  const { verb: slug } = await params;
  const entry = getVerb(slug);
  if (!entry) notFound();

  const full = conjugate(entry);

  return (
    <>
      <PageHeader
        title={entry.infinitive}
        description={entry.en}
        breadcrumbs={[{ label: "Verbs", href: "/verbs" }, { label: entry.infinitive }]}
        eyebrow={
          <>
            <LevelBadge level={entry.level} />
            <Badge variant="secondary" className="capitalize">
              {entry.kind}
            </Badge>
            <Badge variant="outline">Hilfsverb: {entry.auxiliary}</Badge>
            <Badge variant="outline">Partizip II: {entry.partizip2}</Badge>
          </>
        }
        actions={
          <>
            <AudioButton text={entry.infinitive} label="Hören" variant="outline" />
            <BookmarkButton
              id={`verb-${entry.infinitive}`}
              kind="verb"
              title={entry.infinitive}
              href={`/verbs/${verbSlug(entry)}`}
              withLabel
            />
          </>
        }
      />

      {entry.notes ? (
        <Callout variant="info" title="Hinweis">
          <p>{entry.notes}</p>
        </Callout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {full.tables.map((table) => (
          <Card key={table.tense}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-3">
                <p className="font-semibold">{table.tense}</p>
                <p className="text-xs text-muted-foreground">{table.description}</p>
              </div>
              <table className="de-table">
                <tbody>
                  {PERSONS.map((person, index) => (
                    <tr key={person}>
                      <td className="w-28 text-muted-foreground">{person}</td>
                      <td className="font-medium">{table.forms[index]}</td>
                      <td className="w-10">
                        <AudioButton text={`${person === "er/sie/es" ? "er" : person} ${table.forms[index].replace(" … ", " ")}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.note ? <p className="mt-2 text-xs text-muted-foreground">{table.note}</p> : null}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="mb-3 font-semibold">Imperativ</p>
            <table className="de-table">
              <tbody>
                {["du", "ihr", "Sie"].map((person, index) => (
                  <tr key={person}>
                    <td className="w-28 text-muted-foreground">{person}</td>
                    <td className="font-medium">{full.imperative[index]}</td>
                    <td className="w-10">
                      <AudioButton text={full.imperative[index]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <p className="mb-3 font-semibold">Passiv</p>
            <table className="de-table">
              <tbody>
                <tr>
                  <td className="w-32 text-muted-foreground">Präsens</td>
                  <td className="font-medium">es {full.passive.praesens[2]}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Präteritum</td>
                  <td className="font-medium">es {full.passive.praeteritum[2]}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Perfekt</td>
                  <td className="font-medium">es {full.passive.perfekt[2]}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">Konjunktiv I</td>
                  <td className="font-medium">es {full.passive.konjunktiv1[2]}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              Das Passiv ist nur bei transitiven Verben (mit Akkusativobjekt) üblich.
            </p>
          </CardContent>
        </Card>
      </div>

      {entry.examples?.length ? (
        <Card className="mt-5">
          <CardContent className="pt-5 sm:pt-6">
            <p className="mb-3 font-semibold">Beispiele</p>
            <ul className="space-y-2">
              {entry.examples.map((example) => (
                <li key={example.de} className="flex items-start gap-2">
                  <AudioButton text={example.de} />
                  <div>
                    <p className="text-sm font-medium">{example.de}</p>
                    <p className="text-sm text-muted-foreground">{example.en}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
