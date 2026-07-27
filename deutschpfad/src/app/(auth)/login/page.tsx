import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to sync your progress, flashcards and notes across devices.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one free
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Or{" "}
        <Link href="/dashboard" className="font-medium text-primary hover:underline">
          continue as guest
        </Link>{" "}
        — progress is stored in this browser.
      </p>
    </div>
  );
}
