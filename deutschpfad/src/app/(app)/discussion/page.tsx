"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, MessagesSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/misc";
import type { Level } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";

interface Post {
  id: string;
  author: string;
  category: string;
  title: string;
  body: string;
  level?: Level;
  createdAt: string;
  comments: { id: string; author: string; body: string; createdAt: string }[];
}

const categories = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "grammar", label: "Grammar help" },
  { id: "exams", label: "Exams" },
  { id: "ausbildung", label: "Ausbildung" },
  { id: "motivation", label: "Motivation" },
];

export default function DiscussionPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [category, setCategory] = React.useState("all");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [postCategory, setPostCategory] = React.useState("general");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      return (await response.json()) as { posts: Post[] };
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "post", title, body, category: postCategory }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Failed");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Question posted");
      setTitle("");
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addComment = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", postId, body: reply }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Failed");
      return response.json();
    },
    onSuccess: () => {
      setReply("");
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const posts = (data?.posts ?? []).filter((post) => (category === "all" ? true : post.category === category));

  return (
    <>
      <PageHeader
        title="Discussion"
        description="Ask about a grammar rule, share an exam experience, find a study partner. Be precise and always include your example sentence."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Discussion" }]}
        eyebrow={<Badge variant="secondary">{data?.posts.length ?? 0} threads</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              {categories.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading threads…</p>
          ) : posts.length ? (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {post.category}
                    </Badge>
                    {post.level ? <LevelBadge level={post.level} /> : null}
                    <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                  </div>

                  <p className="font-display text-lg font-semibold tracking-[-0.01em]">{post.title}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {post.body}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="size-6">
                      <AvatarFallback>{initials(post.author)}</AvatarFallback>
                    </Avatar>
                    {post.author} · {post.comments.length} replies
                  </div>

                  {post.comments.length ? (
                    <ul className="mt-4 space-y-3 border-t border-border pt-4">
                      {post.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-3">
                          <Avatar className="size-7 shrink-0">
                            <AvatarFallback>{initials(comment.author)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium">
                              {comment.author}{" "}
                              <span className="font-normal text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </p>
                            <p className="text-sm">{comment.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {replyTo === post.id ? (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        rows={3}
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Ihre Antwort…"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addComment.mutate(post.id)}
                          loading={addComment.isPending}
                          disabled={!reply.trim()}
                        >
                          <Send /> Reply
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-3"
                      onClick={() => setReplyTo(post.id)}
                      disabled={!session?.user}
                    >
                      Reply
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No threads in this category"
              description="Be the first to ask a question — most grammar questions get answered within a day."
              icon={<MessagesSquare className="size-6" />}
            />
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3 pt-5 sm:pt-6">
              <SectionTitle title="Ask a question" />
              {!session?.user ? (
                <p className="text-sm text-muted-foreground">
                  Sign in to post. You can read every thread without an account.
                </p>
              ) : null}
              <Field label="Title" htmlFor="post-title">
                <Input
                  id="post-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Wann benutzt man „seit“ und wann „vor“?"
                />
              </Field>
              <Field label="Category">
                <select
                  value={postCategory}
                  onChange={(event) => setPostCategory(event.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {categories
                    .filter((item) => item.id !== "all")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Your question" htmlFor="post-body">
                <Textarea
                  id="post-body"
                  rows={5}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Beschreiben Sie Ihr Problem mit einem Beispielsatz."
                />
              </Field>
              <Button
                onClick={() => createPost.mutate()}
                loading={createPost.isPending}
                disabled={!session?.user || !title.trim() || !body.trim()}
              >
                <MessageSquarePlus /> Post question
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="How to get a good answer" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>· Include the full sentence you are unsure about.</li>
                <li>· Say what you think the rule is — even if you are wrong.</li>
                <li>· Mention your level (A1–B2) and the exam you are preparing for.</li>
                <li>· One question per thread keeps answers focused.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
