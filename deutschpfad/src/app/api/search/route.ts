import { NextResponse } from "next/server";
import { search } from "@/lib/search";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const results = search(query, Number.isFinite(limit) ? limit : 20);
  return NextResponse.json({ ok: true, query, count: results.length, results });
}
