import { NextResponse } from "next/server";
import { consumeToken, findUserByEmail, updateUser } from "@/lib/repo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ error: "Token missing." }, { status: 400 });

  const record = await consumeToken(token, "email-verification");
  if (!record) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  const user = await findUserByEmail(record.email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  await updateUser(user.id, { emailVerified: new Date().toISOString() });

  return NextResponse.json({ ok: true, email: user.email });
}
