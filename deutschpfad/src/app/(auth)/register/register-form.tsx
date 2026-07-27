"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { LEVELS, type Level } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Please enter your name."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "At least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/\d/, "Include at least one number."),
    confirmPassword: z.string(),
    level: z.enum(["A1", "A2", "B1", "B2"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { level: "A1" } });

  const level = watch("level");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { error?: string; verifyUrl?: string };

    if (!response.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    setVerifyUrl(data.verifyUrl ?? null);

    const login = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!login?.error) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (verifyUrl) {
    return (
      <div className="mt-8 space-y-4 rounded-2xl border border-success/30 bg-success/5 p-5">
        <p className="flex items-center gap-2 font-medium text-success">
          <CheckCircle2 className="size-5" /> Account created
        </p>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email address. In this environment you can confirm directly:
        </p>
        <Button asChild size="sm">
          <Link href={verifyUrl}>Verify email now</Link>
        </Button>
        <p className="text-sm">
          Or go straight to your{" "}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      {error ? (
        <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <Field label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" placeholder="Nour Benali" {...register("name")} />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Field label="Repeat password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </Field>
      </div>

      <Field label="Starting level" error={errors.level?.message}>
        <div className="grid grid-cols-4 gap-2">
          {LEVELS.map((item: Level) => (
            <button
              key={item}
              type="button"
              onClick={() => setValue("level", item)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                level === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-ring",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </Field>

      <Button type="submit" className="w-full" variant="gradient" loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-xs text-muted-foreground">
        By creating an account you agree to store your learning progress. You can delete your data at any time in
        Settings.
      </p>
    </form>
  );
}
