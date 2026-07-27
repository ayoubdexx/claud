# DeutschPfad — Learn German from A1 to B2

A complete, production-ready German learning platform: the full CEFR curriculum (A1–B2), grammar
that is actually explained, spaced-repetition vocabulary, reading, listening, speaking and writing
practice with automatic feedback, Goethe and telc mock exams with scoring, an Ausbildung
preparation track, and a professionally typeset printable PDF for every piece of content.

Built with Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Radix/shadcn-style
primitives, Framer Motion, Prisma + PostgreSQL, NextAuth (Auth.js v5), TanStack Query, React Hook
Form + Zod and `@react-pdf/renderer`.

---

## Quick start

```bash
cd deutschpfad
npm install                 # runs prisma generate automatically
cp .env.example .env.local  # optional: everything has a working default
npm run dev                 # http://localhost:3000
```

**No database required.** With an empty `DATABASE_URL` the app uses a JSON file store under
`.data/`, so registration, login, progress sync, study groups and the discussion board all work out
of the box. Set `DATABASE_URL` and run `npm run db:push` to switch to PostgreSQL/Supabase — no code
changes needed (see `src/lib/repo.ts`).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run pdf:check` | Renders **all 86 PDF documents** and fails on any error |
| `npm run db:push` / `db:migrate` / `db:studio` | Prisma against PostgreSQL |

---

## What is inside

| Content | Count |
| --- | --- |
| Levels (A1, A2, B1, B2) | 4 courses, 15 modules, 24 lessons |
| Grammar topics | 31 — each with simple + detailed explanation, tables, visual patterns, examples, common mistakes, tips, practice, quiz, revision, cheat sheet |
| Vocabulary | 19 thematic decks, 170+ words with article, plural, IPA, example, synonyms, opposites, expressions, memory tip, difficulty |
| Reading | 8 graded texts with glossary, grammar highlights, questions, solutions |
| Listening | 8 tasks (dialogues, announcements, radio, lecture, discussion) with transcripts |
| Speaking | 9 tasks: roleplay, conversation, interview, presentation, discussion, pronunciation |
| Writing | 9 tasks with model answers and native-level rewrites |
| Pronunciation | 10 lessons with IPA, minimal pairs and error diagnostics |
| Verbs | 45 verbs, fully conjugated by an engine (10 tenses + imperative + passive) |
| Dictionary | 240+ merged entries with examples and expressions |
| Mock exams | 7 (Goethe A1/A2/B1/B2, telc A2/B1/B2) with per-module timing and scoring |
| Ausbildung | 11 resources: Lebenslauf, Anschreiben, 50 interview questions, workplace / office / construction / healthcare vocabulary, emails, phone calls, culture, authorities |
| Exercises | 400+ items across 9 exercise types |
| Printable PDFs | 86 generated documents (28 curated downloads + one per lesson/topic/exam) |

---

## Architecture

```
src/
  app/
    (app)/          # authenticated shell: 35 feature pages (dashboard … admin)
    (auth)/         # login, register, forgot/reset password, verify email
    api/            # auth, register, verification, progress sync, groups,
                    # posts, search, writing-review, pdf/[kind]/[slug]
    print/lesson/   # print-optimised HTML worksheet view (A4 CSS)
  components/
    ui/             # shadcn-style primitives (Radix based)
    layout/         # app shell, sidebar, command palette (⌘K), page header
    learn/          # exercise runner, flashcards, listening player, writing
                    # studio, speaking practice, exam runner, lesson renderer
  content/          # the entire curriculum as typed data (single source of truth)
  lib/
    conjugate.ts    # German verb conjugation engine
    exercises.ts    # answer checking for 9 exercise types (typo tolerant)
    srs.ts          # SM-2 spaced repetition
    scoring.ts      # exam scoring incl. Goethe modular pass rules
    writing-check.ts# rule-based writing feedback (register, connectors, errors)
    speech.ts       # de-DE text-to-speech + speech recognition hooks
    search.ts       # global search index (⌘K + /search)
    store.tsx       # learner state (progress, cards, notes, planner, attempts)
    repo.ts         # data access: Prisma or JSON file fallback
    auth.ts         # NextAuth credentials provider, roles, Zod schemas
    pdf/            # renderer-agnostic document spec + react-pdf renderer
prisma/schema.prisma# 20 models: users, progress, SRS, notes, groups, exams …
```

### Design decisions worth knowing

- **Content as typed data.** Every lesson, table and exercise is a TypeScript value validated by
  the compiler, which is what makes the same content renderable as HTML, as an exercise engine and
  as a PDF without duplication.
- **Audio without audio files.** Listening and pronunciation use the browser's German speech engine
  (`de-DE`), so playback speed is adjustable (0.6×–1.15×), everything works offline, and there are
  no MB of assets. Speaking practice scores your recording against the target sentence with the Web
  Speech API.
- **Works signed out.** Progress, flashcards, notes and the planner live in `localStorage` and are
  synced to the server (debounced) when you are signed in.
- **PDF as first-class output.** `src/lib/pdf/spec.ts` turns content into a renderer-agnostic
  document description; `render.tsx` typesets it with `@react-pdf/renderer` (cover, TOC, tables,
  answer lines, solution keys, running footer with page numbers). `npm run pdf:check` renders all
  86 documents as a regression test.
- **Exam realism.** Per-module timers, single-play listening parts, modular pass evaluation (a
  Goethe B1/B2 module below 60 % is flagged even when the average passes) and item-level correction.

---

## Accessibility, SEO and performance

- Semantic landmarks, skip link, focus-visible rings, `aria-*` on all interactive controls,
  keyboard-first command palette.
- Light/dark/system theme with no flash, full 1–100 opacity token scale, Apple-inspired easing.
- Per-page metadata, Open Graph, robots, sitemap-ready routes; 253 pages prerendered at build time.
- PWA: web manifest, offline shell service worker, `/offline` fallback, app shortcuts.
- Mobile-first layout with a drawer navigation; tables scroll horizontally instead of breaking.

---

## Roadmap (C1/C2 ready)

The domain model is level-agnostic: add `"C1"` to `Level` in `src/lib/types.ts`, drop a
`content/courses/c1.ts` and `content/grammar/c1.ts` in place, and every page, filter, PDF and search
index picks it up automatically.
