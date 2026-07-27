import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadSnapshot, saveSnapshot } from "@/lib/repo";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: true, synced: false, state: null });
  }
  const state = await loadSnapshot(session.user.id);
  return NextResponse.json({ ok: true, synced: true, state });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    /* Guests keep their progress in localStorage only. */
    return NextResponse.json({ ok: true, synced: false });
  }

  const body = (await request.json().catch(() => null)) as { state?: unknown } | null;
  if (!body?.state) {
    return NextResponse.json({ error: "state missing" }, { status: 400 });
  }

  await saveSnapshot(session.user.id, body.state);
  return NextResponse.json({ ok: true, synced: true, at: new Date().toISOString() });
}
