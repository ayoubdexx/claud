"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!token) return;
    setStatus("loading");
    void fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string; email?: string };
        if (!response.ok) {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
          return;
        }
        setStatus("done");
        setMessage(data.email ?? "");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Email verification</h1>

      {!token ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Open the link from your email to verify your address. If the link expired, sign in and request a new one.
        </p>
      ) : null}

      {status === "loading" ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Verifying your email…
        </p>
      ) : null}

      {status === "done" ? (
        <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-5">
          <p className="flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="size-5" /> Email verified
          </p>
          {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Start learning</Link>
          </Button>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="size-5" /> {message}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <VerifyEmailInner />
    </React.Suspense>
  );
}
