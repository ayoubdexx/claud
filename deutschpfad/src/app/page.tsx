import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  FileText,
  Headphones,
  Layers,
  Mic,
  PenLine,
  Sparkles,
  SpellCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { courses, contentStats } from "@/content";
import { LEVELS } from "@/lib/types";

const features = [
  { icon: SpellCheck, title: "Grammar that finally clicks", body: `${contentStats.grammarTopics} topics with simple and detailed explanations, tables, visual patterns, common mistakes, practice and cheat sheets.` },
  { icon: Layers, title: "Spaced repetition vocabulary", body: `${contentStats.words} curated words with article, plural, IPA, examples, synonyms, opposites and memory tips — scheduled by an SM-2 algorithm.` },
  { icon: Headphones, title: "Listening at your speed", body: "Dialogues and announcements rendered by a German speech engine with 0.6×–1.15× playback, transcripts and exam-style questions." },
  { icon: Mic, title: "Speaking with feedback", body: "Roleplays, interviews and presentation practice. Speech recognition scores how close you are to the target sentence." },
  { icon: PenLine, title: "Writing correction", body: "Instant analysis of length, register, connectors, verb position and typical learner errors — plus model and native-level answers." },
  { icon: Award, title: "Goethe & telc simulation", body: `${contentStats.exams} full mock exams with timer, modular scoring, detailed corrections and printable papers.` },
  { icon: FileText, title: "Printable everything", body: "Professionally laid out A4 PDFs for lessons, grammar sheets, worksheets, vocabulary lists, revision notes and exams." },
  { icon: Users, title: "Study together", body: "Study groups with invite codes, group challenges, leaderboards and a discussion board." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-glow">
              DP
            </span>
            <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">DeutschPfad</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/courses" className="transition-colors hover:text-foreground">Courses</Link>
            <Link href="/grammar" className="transition-colors hover:text-foreground">Grammar</Link>
            <Link href="/exams" className="transition-colors hover:text-foreground">Exams</Link>
            <Link href="/ausbildung" className="transition-colors hover:text-foreground">Ausbildung</Link>
            <Link href="/downloads" className="transition-colors hover:text-foreground">Downloads</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" variant="gradient" asChild>
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
        <div className="container relative py-20 text-center sm:py-28">
          <Badge variant="default" className="mx-auto mb-6 gap-1.5 px-3 py-1">
            <Sparkles className="size-3.5" /> A1 → B2 · Goethe · telc · Ausbildung
          </Badge>
          <h1 className="mx-auto max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
            Learn German from your first <span className="text-primary">Hallo</span> to a confident{" "}
            <span className="text-accent">B2</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-relaxed text-muted-foreground">
            One platform with the full CEFR curriculum, grammar that makes sense, spaced-repetition vocabulary,
            listening and speaking practice, written feedback, exam simulations and printable materials for every
            lesson. No other website needed.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/dashboard">
                Open the platform <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Browse the curriculum</Link>
            </Button>
          </div>

          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "Lessons", value: contentStats.lessons },
              { label: "Grammar topics", value: contentStats.grammarTopics },
              { label: "Exercises", value: `${contentStats.exercises}+` },
              { label: "Dictionary entries", value: contentStats.dictionaryEntries },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Levels */}
      <section className="border-t border-border bg-surface py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">Four levels, one clear path</h2>
            <p className="mt-3 text-muted-foreground">
              Each level has modules, lessons, exercises, a mini test, a final mock exam and a certificate.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <Card key={course.level} interactive className="h-full">
                <CardContent className="flex h-full flex-col gap-3 pt-6">
                  <LevelBadge level={course.level} className="w-fit" />
                  <p className="font-display text-lg font-semibold">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.subtitle}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {course.canDo.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <p className="text-xs text-muted-foreground">
                      {course.modules.length} modules · {course.hours} h · {course.vocabularyTarget} words
                    </p>
                    <Button variant="secondary" size="sm" className="mt-3 w-full" asChild>
                      <Link href={`/courses/${course.level.toLowerCase()}`}>
                        Open {course.level} <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
              Everything a German learner needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built around what actually moves you forward: understanding, repetition, output and exam technique.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardContent className="pt-6">
                  <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ausbildung */}
      <section className="border-y border-border bg-surface py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-4">Ausbildung track</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
              Moving to Germany for an Ausbildung?
            </h2>
            <p className="mt-4 text-muted-foreground">
              A dedicated section with a German CV and cover-letter template you can copy, 50 interview questions
              with model answers, workplace, office, construction and healthcare vocabulary, phone dialogues,
              professional email patterns and the unwritten rules of German working culture.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Lebenslauf", "Anschreiben", "Vorstellungsgespräch", "Pflege", "Handwerk", "Behörden"].map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <Button className="mt-7" asChild>
              <Link href="/ausbildung">
                Open the Ausbildung section <ArrowRight />
              </Link>
            </Button>
          </div>
          <Card className="shadow-lift">
            <CardContent className="pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sample from the platform
              </p>
              <div className="space-y-3 text-sm">
                <p className="font-medium">Bewerbung um einen Ausbildungsplatz als Anlagenmechaniker/-in SHK</p>
                <p className="text-muted-foreground">
                  Sehr geehrte Frau Vogt, mit großem Interesse habe ich Ihre Ausbildungsanzeige gelesen. Besonders
                  spricht mich an, dass Sie neben klassischer Heizungstechnik auch Wärmepumpen und Solaranlagen
                  installieren …
                </p>
                <div className="rounded-xl bg-surface p-3 text-xs">
                  <p className="font-semibold">Checked automatically</p>
                  <p className="mt-1 text-muted-foreground">
                    Register: formal ✓ · Greeting ✓ · Closing ✓ · Connectors: 5 ✓ · Length 214 words ✓
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lift">
            <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
              <BookOpen className="size-10 opacity-90" />
              <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em]">
                Start today at your level — {LEVELS.join(", ")} are all included
              </h2>
              <p className="max-w-xl opacity-90">
                Your progress, flashcards and notes are saved automatically. Create an account to sync across
                devices and study with friends.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Create free account</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10" asChild>
                  <Link href="/dashboard">Continue as guest</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>DeutschPfad · Learn German A1–B2. Content aligned with the CEFR.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/help" className="hover:text-foreground">Help</Link>
            <Link href="/downloads" className="hover:text-foreground">Downloads</Link>
            <Link href="/community" className="hover:text-foreground">Community</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
