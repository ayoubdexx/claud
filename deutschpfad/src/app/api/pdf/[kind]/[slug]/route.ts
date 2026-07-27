import { NextResponse } from "next/server";
import { pdfFileName, renderSpecToPdf } from "@/lib/pdf/render";
import {
  buildAusbildungDoc,
  buildCheatSheetDoc,
  buildExamDoc,
  buildGrammarLevelDoc,
  buildGrammarTopicDoc,
  buildLessonDoc,
  buildPracticeDoc,
  buildPronunciationDoc,
  buildRevisionDoc,
  buildVerbsDoc,
  buildVocabularyDoc,
  buildWorksheetDoc,
  type DocSpec,
} from "@/lib/pdf/spec";
import type { Level } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}

function buildSpec(kind: string, slug: string): DocSpec | null {
  switch (kind) {
    case "lesson":
      return buildLessonDoc(slug);
    case "grammar":
      return isLevel(slug) ? buildGrammarLevelDoc(slug) : buildGrammarTopicDoc(slug);
    case "vocabulary":
      return isLevel(slug) ? buildVocabularyDoc(slug) : null;
    case "verbs":
      return buildVerbsDoc();
    case "cheatsheet":
      return buildCheatSheetDoc();
    case "worksheets":
      return isLevel(slug) ? buildWorksheetDoc(slug) : null;
    case "revision":
      return isLevel(slug) ? buildRevisionDoc(slug) : null;
    case "exam":
      return buildExamDoc(slug);
    case "ausbildung":
      return buildAusbildungDoc();
    case "pronunciation":
      return buildPronunciationDoc();
    case "practice":
      return isLevel(slug) ? buildPracticeDoc(slug) : null;
    default:
      return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const { kind, slug } = await params;

  let spec: DocSpec | null = null;
  try {
    spec = buildSpec(kind, decodeURIComponent(slug));
  } catch (error) {
    console.error("PDF spec error", error);
    return NextResponse.json({ error: "Could not build this document." }, { status: 500 });
  }

  if (!spec) {
    return NextResponse.json({ error: `No document found for ${kind}/${slug}.` }, { status: 404 });
  }

  try {
    const buffer = await renderSpecToPdf(spec);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFileName(spec)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF render error", error);
    return NextResponse.json({ error: "PDF rendering failed." }, { status: 500 });
  }
}
