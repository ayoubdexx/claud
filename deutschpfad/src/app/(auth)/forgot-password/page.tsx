"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("Please enter a valid email address.") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { resetUrl?: string };
    setResetUrl(data.resetUrl ?? null);
    setSent(true);
  };

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Check your inbox</h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
          <p className="flex items-center gap-2 font-medium">
            <MailCheck className="size-5 text-primary" /> Reset link sent
          </p>
          <p className="text-sm text-muted-foreground">
            If an account exists for that address, a password reset link is on its way. The link expires in one hour.
          </p>
          {resetUrl ? (
            <Button size="sm" asChild>
              <Link href={resetUrl}>Open reset link (development)</Link>
            </Button>
          ) : null}
        </div>
        <p className="mt-6 text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the email address you registered with and we will send you a reset link.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
