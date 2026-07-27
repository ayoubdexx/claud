"use client";

import * as React from "react";
import { FolderOpen, Pin, Plus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useLearner } from "@/lib/store";
import type { Note } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function emptyNote(): Note {
  return {
    id: crypto.randomUUID(),
    title: "",
    folder: "Allgemein",
    content: "",
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function NotesPage() {
  const { state, dispatch } = useLearner();
  const [draft, setDraft] = React.useState<Note | null>(null);
  const [query, setQuery] = React.useState("");
  const [folder, setFolder] = React.useState("all");

  const folders = Array.from(new Set(state.notes.map((note) => note.folder)));
  const filtered = state.notes
    .filter((note) => (folder === "all" ? true : note.folder === folder))
    .filter((note) => {
      if (query.trim().length < 2) return true;
      const haystack = `${note.title} ${note.content} ${note.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || b.updatedAt.localeCompare(a.updatedAt));

  const save = () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein.");
      return;
    }
    dispatch({ type: "note-save", note: { ...draft, updatedAt: new Date().toISOString() } });
    toast.success("Notiz gespeichert");
    setDraft(null);
  };

  return (
    <>
      <PageHeader
        title="Notes"
        description="Your own notebook: rules you keep forgetting, phrases from conversations, corrections from your teacher. Organise by folder, tag and search."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Notes" }]}
        eyebrow={<Badge variant="secondary">{state.notes.length} notes</Badge>}
        actions={
          <Button onClick={() => setDraft(emptyNote())}>
            <Plus /> New note
          </Button>
        }
      />

      {draft ? (
        <Card className="mb-6">
          <CardContent className="space-y-4 pt-5 sm:pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="note-title">
                <Input
                  id="note-title"
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="z. B. Wechselpräpositionen — meine Fehler"
                />
              </Field>
              <Field label="Folder" htmlFor="note-folder">
                <Input
                  id="note-folder"
                  value={draft.folder}
                  onChange={(event) => setDraft({ ...draft, folder: event.target.value })}
                  placeholder="Grammatik / Wortschatz / Prüfung"
                />
              </Field>
            </div>
            <Field label="Content" htmlFor="note-content" hint="Markdown-style plain text">
              <Textarea
                id="note-content"
                rows={10}
                value={draft.content}
                onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                placeholder="Schreiben Sie hier…"
              />
            </Field>
            <Field label="Tags" htmlFor="note-tags" hint="comma separated">
              <Input
                id="note-tags"
                value={draft.tags.join(", ")}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="dativ, prüfung, b1"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={save}>
                <Save /> Save note
              </Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => setDraft({ ...draft, pinned: !draft.pinned })}
                className={cn(draft.pinned && "border-primary text-primary")}
              >
                <Pin /> {draft.pinned ? "Pinned" : "Pin"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFolder("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              folder === "all" ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            All folders
          </button>
          {folders.map((item) => (
            <button
              key={item}
              onClick={() => setFolder(item)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                folder === item ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              <FolderOpen className="size-3" /> {item}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <Card key={note.id}>
              <CardContent className="flex h-full flex-col gap-2 pt-5 sm:pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-snug">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.folder} · {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  {note.pinned ? <Pin className="size-4 shrink-0 text-primary" /> : null}
                </div>
                <p className="line-clamp-5 whitespace-pre-line text-sm text-muted-foreground">{note.content}</p>
                {note.tags.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto flex gap-2 pt-3">
                  <Button size="sm" variant="outline" onClick={() => setDraft(note)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      dispatch({ type: "note-delete", id: note.id });
                      toast.info("Notiz gelöscht");
                    }}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notes yet"
          description="Create your first note — for example the three grammar rules you keep getting wrong."
          icon={<Plus className="size-6" />}
          action={<Button onClick={() => setDraft(emptyNote())}>New note</Button>}
        />
      )}
    </>
  );
}
