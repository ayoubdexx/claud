import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { consumeToken, findUserByEmail, updateUser } from "@/lib/repo";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters and contain a letter and a number." },
      { status: 422 },
    );
  }

  const record = await consumeToken(parsed.data.token, "password-reset");
  if (!record) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const user = await findUserByEmail(record.email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  await updateUser(user.id, { passwordHash: await hashPassword(parsed.data.password) });

  return NextResponse.json({ ok: true });
}
