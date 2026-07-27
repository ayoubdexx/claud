import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail, findUserById } from "@/lib/repo";
import type { Level, Role } from "@/lib/types";

export const credentialsSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your name."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/\d/, "Include at least one number."),
    confirmPassword: z.string(),
    level: z.enum(["A1", "A2", "B1", "B2"]).default("A1"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      level: Level;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "deutschpfad-development-secret-change-me",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login", error: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role,
          level: user.level,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typed = user as unknown as { id: string; role: Role; level: Level };
        token.uid = typed.id;
        token.role = typed.role;
        token.level = typed.level;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.level = (token.level as Level) ?? "A1";
      }
      return session;
    },
  },
});

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return findUserById(session.user.id);
}

export async function requireRole(roles: Role[]) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, status: 401, session: null };
  if (!roles.includes(session.user.role)) return { ok: false as const, status: 403, session };
  return { ok: true as const, status: 200, session };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
