"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/misc";
import { LearnerProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LearnerProvider>
            <TooltipProvider delayDuration={250}>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "rounded-xl border border-border bg-card text-card-foreground shadow-lift",
                }}
              />
            </TooltipProvider>
          </LearnerProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
