import { PrismaClient } from "@prisma/client";

/**
 * Prisma is optional: the platform runs fully without a database by falling back
 * to a JSON file store (see src/lib/repo.ts). This keeps local development and
 * previews friction-free while production uses Postgres/Supabase.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const prisma: PrismaClient | null = hasDatabase
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
