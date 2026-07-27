import { NextResponse } from "next/server";
import { hashPassword, registerSchema } from "@/lib/auth";
import { createUser, findUserByEmail, saveToken } from "@/lib/repo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { name, email, password, level } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash, level });

  const token = await saveToken({
    email: user.email,
    type: "email-verification",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });

  /**
   * In production this token is emailed (Resend/Supabase/SMTP). For local and
   * preview environments it is returned so the flow can be completed end to end.
   */
  const verifyUrl = `/verify-email?token=${token.token}`;

  return NextResponse.json(
    {
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, level: user.level },
      verifyUrl,
      devToken: process.env.NODE_ENV === "production" ? undefined : token.token,
    },
    { status: 201 },
  );
}
