import { NextResponse } from "next/server";
import { z } from "zod";
import { getWriting } from "@/content";
import { analyseWriting } from "@/lib/writing-check";

export const runtime = "nodejs";

const schema = z.object({
  text: z.string().min(1).max(20000),
  taskSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide the text to review." }, { status: 422 });
  }

  const task = parsed.data.taskSlug ? getWriting(parsed.data.taskSlug) : undefined;
  const feedback = analyseWriting(parsed.data.text, task);

  return NextResponse.json({
    ok: true,
    feedback,
    sampleAnswer: task?.sampleAnswer,
    nativeVersion: task?.nativeVersion,
  });
}
