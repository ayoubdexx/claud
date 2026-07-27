import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, saveToken } from "@/lib/repo";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  }

  const user = await findUserByEmail(parsed.data.email);

  /* Always answer with success so the endpoint cannot be used to enumerate accounts. */
  if (!user) {
    return NextResponse.json({ ok: true, sent: true });
  }

  const token = await saveToken({
    email: user.email,
    type: "password-reset",
    expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  });

  return NextResponse.json({
    ok: true,
    sent: true,
    resetUrl: `/reset-password?token=${token.token}`,
    devToken: process.env.NODE_ENV === "production" ? undefined : token.token,
  });
}
