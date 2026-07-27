import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { LessonBlocks } from "@/components/learn/blocks";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { CopyBlock } from "@/components/learn/copy-block";
import { ausbildungResources, getAusbildung } from "@/content";

export function generateStaticParams() {
  return ausbildungResources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = getAusbildung(slug);
  if (!resource) return { title: "Resource not found" };
  return { title: resource.title, description: resource.summary };
}

export default async function AusbildungDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getAusbildung(slug);
  if (!resource) notFound();

  return (
    <>
      <PageHeader
        title={resource.title}
        description={resource.summary}
        breadcrumbs={[{ label: "Ausbildung", href: "/ausbildung" }, { label: resource.title }]}
        eyebrow={
          <>
            <LevelBadge level={resource.level} />
            <Badge variant="secondary" className="capitalize">
              {resource.category.replace(/-/g, " ")}
            </Badge>
            <Badge variant="outline">{resource.minutes} min</Badge>
          </>
        }
        actions={
          <>
            <BookmarkButton
              id={`ausbildung-${resource.slug}`}
              kind="ausbildung"
              title={resource.title}
              href={`/ausbildung/${resource.slug}`}
              withLabel
            />
            <Button variant="outline" asChild>
              <a href="/api/pdf/ausbildung/all" target="_blank" rel="noopener noreferrer">
                <Download /> Pack PDF
              </a>
            </Button>
          </>
        }
      />

      <LessonBlocks blocks={resource.body} />

      {resource.template ? <CopyBlock title="Vorlage zum Kopieren" content={resource.template} /> : null}

      {resource.vocabulary?.length ? (
        <Card className="mt-5">
          <CardContent className="pt-5 sm:pt-6">
            <p className="mb-3 font-semibold">Wortschatz</p>
            <div className="scroll-slim overflow-x-auto">
              <table className="de-table">
                <thead>
                  <tr>
                    <th>Deutsch</th>
                    <th>Englisch</th>
                    <th>Hinweis</th>
                  </tr>
                </thead>
                <tbody>
                  {resource.vocabulary.map((entry) => (
                    <tr key={entry.de}>
                      <td className="font-medium">{entry.de}</td>
                      <td>{entry.en}</td>
                      <td className="text-muted-foreground">{entry.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
