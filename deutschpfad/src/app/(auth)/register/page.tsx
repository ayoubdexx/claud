import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free, no card needed. Pick your starting level — you can change it any time.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
