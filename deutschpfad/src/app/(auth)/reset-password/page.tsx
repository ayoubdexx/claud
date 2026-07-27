"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters.")
      .regex(/[A-Za-z]/, "Include a letter.")
      .regex(/\d/, "Include a number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not reset the password.");
      return;
    }
    setDone(true);
  };

  if (!token) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Link missing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page needs a reset token. Request a new link on the{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Password updated</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" /> You can sign in with your new password now.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">At least 8 characters with a letter and a number.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {error ? (
          <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        ) : null}
        <Field label="New password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Field label="Repeat password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Save new password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <ResetPasswordInner />
    </React.Suspense>
  );
}
