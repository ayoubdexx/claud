"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CornerDownLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { flatNav } from "@/components/layout/nav-config";
import { groupByKind, kindLabels, search, type SearchItem } from "@/lib/search";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(() => (query.length >= 2 ? search(query, 30) : []), [query]);
  const grouped = React.useMemo(() => groupByKind(results), [results]);

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [onOpenChange, router],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" hideClose className="top-[15%] translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <Command shouldFilter={false} loop className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search lessons, grammar, words, exams…"
              className="h-8 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
              ESC
            </kbd>
          </div>

          <Command.List className="scroll-slim max-h-[60vh] overflow-y-auto p-2">
            {query.length < 2 ? (
              <Command.Group heading="Jump to" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                {flatNav.slice(0, 10).map((item) => (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => go(item.href)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-muted"
                  >
                    <span>{item.label}</span>
                    <CornerDownLeft className="size-3.5 text-muted-foreground opacity-0 data-[selected=true]:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            ) : (
              <>
                <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for “{query}”.
                </Command.Empty>
                {grouped.map(([kind, items]) => (
                  <Command.Group
                    key={kind}
                    heading={`${kindLabels[kind]} (${items.length})`}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {items.slice(0, 6).map((item: SearchItem) => (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => go(item.href)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-muted",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        {item.level ? <LevelBadge level={item.level} /> : <Badge variant="secondary">{kindLabels[item.kind]}</Badge>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
