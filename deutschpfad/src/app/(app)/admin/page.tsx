import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, FileText, Megaphone, ShieldCheck, Users } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { listPosts, listUsers } from "@/lib/repo";
import {
  contentStats,
  courses,
  downloads,
  grammarTopics,
  lessons,
  mockExams,
  vocabDecks,
} from "@/content";

export const metadata: Metadata = { title: "Admin panel" };

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER";
  const users = isAdmin ? await listUsers(50) : [];
  const posts = isAdmin ? await listPosts() : [];

  return (
    <>
      <PageHeader
        title="Admin panel"
        description="Content inventory, users, moderation and platform health."
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Admin" }]}
        eyebrow={
          <>
            <Badge variant={isAdmin ? "success" : "warning"}>
              <ShieldCheck className="size-3" /> {session?.user?.role ?? "GUEST"}
            </Badge>
            <Badge variant="secondary">{hasDatabase ? "Postgres connected" : "File store (no DATABASE_URL)"}</Badge>
          </>
        }
      />

      {!isAdmin ? (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5 sm:pt-6">
            <p className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-warning" />
              You are viewing the read-only content inventory. User management requires a TEACHER or ADMIN account.
            </p>
            <Button size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lessons", value: contentStats.lessons },
          { label: "Grammar topics", value: contentStats.grammarTopics },
          { label: "Words", value: contentStats.words },
          { label: "Exercises", value: contentStats.exercises },
          { label: "Mock exams", value: contentStats.exams },
          { label: "Dictionary entries", value: contentStats.dictionaryEntries },
          { label: "Downloads", value: contentStats.downloads },
          { label: "Users", value: users.length || "—" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-5 sm:pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="font-display text-2xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="moderation">Moderation ({posts.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-5">
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <SectionTitle title="Courses & modules" />
                <div className="scroll-slim overflow-x-auto">
                  <table className="de-table">
                    <thead>
                      <tr>
                        <th>Level</th>
                        <th>Modules</th>
                        <th>Lessons</th>
                        <th>Hours</th>
                        <th>Vocabulary target</th>
                        <th>Final exam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.level}>
                          <td>
                            <LevelBadge level={course.level} />
                          </td>
                          <td>{course.modules.length}</td>
                          <td>{lessons.filter((lesson) => lesson.level === course.level).length}</td>
                          <td>{course.hours}</td>
                          <td>{course.vocabularyTarget}</td>
                          <td>
                            <Link href={`/exams/${course.finalExam}`} className="text-primary hover:underline">
                              {course.finalExam}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardContent className="pt-5 sm:pt-6">
                  <SectionTitle title="Grammar inventory" />
                  <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
                    {grammarTopics.map((topic) => (
                      <li key={topic.slug} className="flex items-center justify-between gap-2">
                        <Link href={`/grammar/${topic.slug}`} className="truncate hover:underline">
                          {topic.title}
                        </Link>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {topic.level} · {topic.practice.length + topic.quiz.length} items
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5 sm:pt-6">
                  <SectionTitle title="Vocabulary decks" />
                  <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
                    {vocabDecks.map((deck) => (
                      <li key={deck.id} className="flex items-center justify-between gap-2">
                        <Link href={`/vocabulary/${deck.slug}`} className="truncate hover:underline">
                          {deck.title}
                        </Link>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {deck.level} · {deck.words.length} words
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <SectionTitle title="Generated documents" description="All PDFs are rendered on demand from content." />
                <div className="flex flex-wrap gap-2">
                  {downloads.slice(0, 12).map((item) => (
                    <Button key={item.slug} size="sm" variant="outline" asChild>
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        <FileText /> {item.title}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <SectionTitle title="Exams" />
                <div className="scroll-slim overflow-x-auto">
                  <table className="de-table">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Provider</th>
                        <th>Level</th>
                        <th>Sections</th>
                        <th>Items</th>
                        <th>Minutes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockExams.map((exam) => (
                        <tr key={exam.slug}>
                          <td>
                            <Link href={`/exams/${exam.slug}`} className="text-primary hover:underline">
                              {exam.officialName}
                            </Link>
                          </td>
                          <td className="capitalize">{exam.provider}</td>
                          <td>{exam.level}</td>
                          <td>{exam.sections.length}</td>
                          <td>
                            {exam.sections.reduce(
                              (sum, section) =>
                                sum + section.parts.reduce((count, part) => count + part.items.length, 0),
                              0,
                            )}
                          </td>
                          <td>{exam.minutes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Registered users" description="Roles: STUDENT, TEACHER, ADMIN." />
              {users.length ? (
                <div className="scroll-slim overflow-x-auto">
                  <table className="de-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Level</th>
                        <th>XP</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="font-medium">{user.name}</td>
                          <td className="text-muted-foreground">{user.email}</td>
                          <td>
                            <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "TEACHER" ? "accent" : "secondary"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td>{user.level}</td>
                          <td className="tabular-nums">{user.xp}</td>
                          <td className="text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("de-DE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" /> No users visible. Sign in as TEACHER or ADMIN.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <SectionTitle title="Discussion threads" description="Hide inappropriate comments and pin useful answers." />
              {posts.length ? (
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li key={post.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{post.title}</p>
                        <Badge variant="secondary" className="capitalize">
                          {post.category}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.author} · {post.comments.length} replies ·{" "}
                        {new Date(post.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No threads yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <SectionTitle title="Announcements" />
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Megaphone className="size-4" /> No active announcements. Create one in the database
                  (Announcement model) to show a banner to all learners.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <SectionTitle title="Platform health" />
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database</span>
                    <Badge variant={hasDatabase ? "success" : "warning"}>
                      {hasDatabase ? "Postgres" : "File fallback"}
                    </Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">PDF engine</span>
                    <Badge variant="success">react-pdf (server)</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auth</span>
                    <Badge variant="success">NextAuth credentials (JWT)</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Content items indexed</span>
                    <Badge variant="secondary">{contentStats.lessons + contentStats.grammarTopics + contentStats.words}</Badge>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
