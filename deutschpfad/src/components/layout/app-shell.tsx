"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Flame, LogOut, Menu, Search, Sparkles, Zap } from "lucide-react";
import { Icon } from "@/components/icon";
import { navigation } from "@/components/layout/nav-config";
import { CommandPalette, useCommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage, Tooltip } from "@/components/ui/misc";
import { useLearner, overallProgress } from "@/lib/store";
import { cn, initials } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 pb-8" data-app-nav>
      {navigation.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200 ease-apple",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      name={item.icon}
                      className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <Badge variant="accent" className="ml-auto text-[10px]">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-3 py-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-glow">
        DP
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold tracking-[-0.01em]">DeutschPfad</span>
        <span className="block text-[11px] text-muted-foreground">Deutsch A1 → B2</span>
      </span>
    </Link>
  );
}

function ProgressWidget() {
  const { state, streak } = useLearner();
  const progress = overallProgress(state);

  return (
    <div className="mx-3 mb-4 rounded-2xl border border-border bg-surface p-3.5">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Flame className="size-3.5 text-warning" />
          {streak} day{streak === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5 font-medium tabular-nums">
          <Zap className="size-3.5 text-primary" />
          {state.xp} XP
        </span>
      </div>
      <Progress value={progress.percent} className="h-1.5" />
      <p className="mt-2 text-[11px] text-muted-foreground">
        {progress.completed} of {progress.total} lessons · {progress.percent}%
      </p>
    </div>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const { state } = useLearner();
  const name = session?.user?.name ?? state.profile.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted" aria-label="Account menu">
          <Avatar className="size-8">
            {session?.user?.image ? <AvatarImage src={session.user.image} alt={name} /> : null}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{session?.user?.email ?? "Guest (local progress)"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/statistics">Statistics</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {session?.user ? (
          <DropdownMenuItem destructive onClick={() => void signOut({ callbackUrl: "/" })}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/login">Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <CommandPalette open={open} onOpenChange={setOpen} />

      {/* Sidebar (desktop) */}
      <aside
        data-app-sidebar
        className="fixed inset-y-0 left-0 z-30 hidden w-[266px] flex-col border-r border-border bg-background lg:flex"
      >
        <div className="px-3 py-4">
          <Brand />
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto px-3">
          <NavLinks />
        </div>
        <ProgressWidget />
      </aside>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="px-3 py-4">
            <Brand onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="scroll-slim flex-1 overflow-y-auto px-3">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
          <ProgressWidget />
        </SheetContent>
      </Dialog>

      <div className="lg:pl-[266px]">
        {/* Topbar */}
        <header
          data-app-header
          className="glass sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border px-3 sm:px-5"
        >
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>

          <button
            onClick={() => setOpen(true)}
            className="flex h-9 flex-1 items-center gap-2.5 rounded-full border border-border bg-background px-3.5 text-sm text-muted-foreground transition-colors hover:border-ring sm:max-w-md"
          >
            <Search className="size-4" />
            <span className="truncate">Search everything…</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:block">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Tooltip content="Daily plan">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/daily" aria-label="Daily plan">
                  <Sparkles />
                </Link>
              </Button>
            </Tooltip>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>

        <footer className="no-print mx-auto w-full max-w-[1180px] px-4 py-8 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p>DeutschPfad · Learn German from A1 to B2. Built for Goethe, telc and Ausbildung.</p>
            <div className="flex gap-4">
              <Link href="/help" className="hover:text-foreground">
                Help
              </Link>
              <Link href="/downloads" className="hover:text-foreground">
                Downloads
              </Link>
              <Link href="/settings" className="hover:text-foreground">
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
