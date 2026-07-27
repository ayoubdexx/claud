import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { addComment, createPost, listPosts } from "@/lib/repo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const posts = await listPosts(category);
  return NextResponse.json({ ok: true, posts });
}

const postSchema = z.object({
  action: z.literal("post"),
  category: z.string().default("general"),
  title: z.string().min(3).max(140),
  body: z.string().min(3).max(4000),
  level: z.enum(["A1", "A2", "B1", "B2"]).optional(),
});

const commentSchema = z.object({
  action: z.literal("comment"),
  postId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to take part in the discussion." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));

  const post = postSchema.safeParse(payload);
  if (post.success) {
    const created = await createPost({
      userId: session.user.id,
      author: session.user.name ?? "Lernende:r",
      ...post.data,
    });
    return NextResponse.json({ ok: true, post: created }, { status: 201 });
  }

  const comment = commentSchema.safeParse(payload);
  if (comment.success) {
    const ok = await addComment(comment.data.postId, {
      userId: session.user.id,
      author: session.user.name ?? "Lernende:r",
      body: comment.data.body,
    });
    if (!ok) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid payload." }, { status: 422 });
}
