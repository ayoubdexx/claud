import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createGroup, joinGroup, listGroups } from "@/lib/repo";

export const runtime = "nodejs";

export async function GET() {
  const groups = await listGroups();
  return NextResponse.json({ ok: true, groups });
}

const createSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(3),
  description: z.string().max(400).default(""),
  level: z.enum(["A1", "A2", "B1", "B2"]),
  visibility: z.enum(["public", "private"]).default("public"),
});

const joinSchema = z.object({
  action: z.literal("join"),
  code: z.string().min(4),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to manage study groups." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const create = createSchema.safeParse(payload);

  if (create.success) {
    const group = await createGroup({
      ...create.data,
      owner: {
        userId: session.user.id,
        name: session.user.name ?? "Lernende:r",
        level: session.user.level,
      },
    });
    return NextResponse.json({ ok: true, group }, { status: 201 });
  }

  const join = joinSchema.safeParse(payload);
  if (join.success) {
    const groupId = await joinGroup(join.data.code, {
      userId: session.user.id,
      name: session.user.name ?? "Lernende:r",
      level: session.user.level,
    });
    if (!groupId) return NextResponse.json({ error: "No group found for this code." }, { status: 404 });
    return NextResponse.json({ ok: true, groupId });
  }

  return NextResponse.json({ error: "Invalid payload." }, { status: 422 });
}
