import type { Achievement, DownloadItem } from "@/lib/types";

export const achievements: Achievement[] = [
  { id: "first-lesson", title: "Erster Schritt", description: "Complete your first lesson.", icon: "Footprints", tier: "bronze", metric: "lessons", target: 1, xp: 20 },
  { id: "five-lessons", title: "In Fahrt", description: "Complete five lessons.", icon: "Rocket", tier: "bronze", metric: "lessons", target: 5, xp: 50 },
  { id: "module-master", title: "Modul-Meister", description: "Complete ten lessons.", icon: "Layers", tier: "silver", metric: "lessons", target: 10, xp: 120 },
  { id: "level-finisher", title: "Levelabschluss", description: "Complete twenty lessons.", icon: "Trophy", tier: "gold", metric: "lessons", target: 20, xp: 300 },
  { id: "streak-3", title: "Drei Tage dabei", description: "Study three days in a row.", icon: "Flame", tier: "bronze", metric: "streak", target: 3, xp: 30 },
  { id: "streak-7", title: "Wochenstreak", description: "Study seven days in a row.", icon: "Flame", tier: "silver", metric: "streak", target: 7, xp: 90 },
  { id: "streak-30", title: "Monatsdisziplin", description: "Study thirty days in a row.", icon: "Flame", tier: "gold", metric: "streak", target: 30, xp: 400 },
  { id: "streak-100", title: "Hundert Tage", description: "A 100-day streak. Respekt!", icon: "Crown", tier: "platinum", metric: "streak", target: 100, xp: 1000 },
  { id: "words-100", title: "100 Wörter", description: "Learn 100 vocabulary cards.", icon: "BookMarked", tier: "bronze", metric: "words", target: 100, xp: 60 },
  { id: "words-500", title: "500 Wörter", description: "Learn 500 vocabulary cards.", icon: "Library", tier: "silver", metric: "words", target: 500, xp: 200 },
  { id: "words-2000", title: "2000 Wörter", description: "Learn 2000 vocabulary cards.", icon: "Library", tier: "gold", metric: "words", target: 2000, xp: 600 },
  { id: "minutes-600", title: "Zehn Stunden", description: "Study for 600 minutes in total.", icon: "Clock", tier: "bronze", metric: "minutes", target: 600, xp: 80 },
  { id: "minutes-3000", title: "50 Stunden", description: "Study for 3000 minutes in total.", icon: "Hourglass", tier: "silver", metric: "minutes", target: 3000, xp: 250 },
  { id: "exam-first", title: "Erste Mock-Prüfung", description: "Finish one mock exam.", icon: "ClipboardCheck", tier: "silver", metric: "exams", target: 1, xp: 120 },
  { id: "exam-three", title: "Prüfungsprofi", description: "Finish three mock exams.", icon: "Medal", tier: "gold", metric: "exams", target: 3, xp: 350 },
  { id: "perfect-quiz", title: "Fehlerfrei", description: "Score 100 % in a quiz.", icon: "Target", tier: "silver", metric: "perfectQuizzes", target: 1, xp: 100 },
  { id: "perfect-ten", title: "Zehnmal perfekt", description: "Score 100 % in ten quizzes.", icon: "Crosshair", tier: "gold", metric: "perfectQuizzes", target: 10, xp: 400 },
  { id: "writer-5", title: "Schreiber", description: "Submit five writing tasks.", icon: "PenLine", tier: "bronze", metric: "writing", target: 5, xp: 70 },
  { id: "writer-20", title: "Textprofi", description: "Submit twenty writing tasks.", icon: "PenTool", tier: "gold", metric: "writing", target: 20, xp: 320 },
  { id: "speaker-10", title: "Sprechmut", description: "Complete ten speaking tasks.", icon: "Mic", tier: "silver", metric: "speaking", target: 10, xp: 150 },
  { id: "grammar-all-a1", title: "A1-Grammatik", description: "Study all ten A1 grammar topics.", icon: "SpellCheck", tier: "silver", metric: "grammar", target: 10, xp: 180 },
  { id: "grammar-30", title: "Grammatik-Sammler", description: "Study thirty grammar topics.", icon: "GraduationCap", tier: "platinum", metric: "grammar", target: 30, xp: 600 },
];

export const downloads: DownloadItem[] = [
  { slug: "grammar-a1", title: "A1 Grammar Sheets (all 10 topics)", category: "grammar-sheet", level: "A1", pages: 24, description: "Every A1 grammar topic with tables, examples, mistakes and a cheat sheet.", href: "/api/pdf/grammar/A1" },
  { slug: "grammar-a2", title: "A2 Grammar Sheets (all 8 topics)", category: "grammar-sheet", level: "A2", pages: 22, description: "Dative, two-way prepositions, Präteritum, adjective endings and more.", href: "/api/pdf/grammar/A2" },
  { slug: "grammar-b1", title: "B1 Grammar Sheets (all 7 topics)", category: "grammar-sheet", level: "B1", pages: 20, description: "Konjunktiv II, passive, relative clauses, genitive, verb + preposition.", href: "/api/pdf/grammar/B1" },
  { slug: "grammar-b2", title: "B2 Grammar Sheets (all 6 topics)", category: "grammar-sheet", level: "B2", pages: 18, description: "Reported speech, participial attributes, passive alternatives, nominal style.", href: "/api/pdf/grammar/B2" },
  { slug: "cheatsheet-all", title: "Master Cheat Sheet A1–B2", category: "cheat-sheet", level: "ALL", pages: 6, description: "Every grammar table on six pages — print it and stick it on the wall.", href: "/api/pdf/cheatsheet/all" },
  { slug: "vocab-a1", title: "A1 Vocabulary Lists", category: "vocabulary-list", level: "A1", pages: 10, description: "Six A1 decks with article, plural, IPA, example and memory tip.", href: "/api/pdf/vocabulary/A1" },
  { slug: "vocab-a2", title: "A2 Vocabulary Lists", category: "vocabulary-list", level: "A2", pages: 9, description: "Work, health, shopping, travel and daily routine.", href: "/api/pdf/vocabulary/A2" },
  { slug: "vocab-b1", title: "B1 Vocabulary Lists", category: "vocabulary-list", level: "B1", pages: 8, description: "Education, environment, media and character.", href: "/api/pdf/vocabulary/B1" },
  { slug: "vocab-b2", title: "B2 Vocabulary Lists", category: "vocabulary-list", level: "B2", pages: 8, description: "Workplace, society, academic language and idioms.", href: "/api/pdf/vocabulary/B2" },
  { slug: "verbs-all", title: "Irregular Verb Tables", category: "study-guide", level: "ALL", pages: 12, description: "45 verbs with Präsens, Präteritum, Partizip II and auxiliary.", href: "/api/pdf/verbs/all" },
  { slug: "worksheet-a1", title: "A1 Worksheets with Solutions", category: "worksheet", level: "A1", pages: 16, description: "Printable exercises for all A1 lessons, solutions included.", href: "/api/pdf/worksheets/A1" },
  { slug: "worksheet-a2", title: "A2 Worksheets with Solutions", category: "worksheet", level: "A2", pages: 15, description: "Printable exercises for all A2 lessons, solutions included.", href: "/api/pdf/worksheets/A2" },
  { slug: "worksheet-b1", title: "B1 Worksheets with Solutions", category: "worksheet", level: "B1", pages: 14, description: "Printable exercises for all B1 lessons, solutions included.", href: "/api/pdf/worksheets/B1" },
  { slug: "worksheet-b2", title: "B2 Worksheets with Solutions", category: "worksheet", level: "B2", pages: 14, description: "Printable exercises for all B2 lessons, solutions included.", href: "/api/pdf/worksheets/B2" },
  { slug: "mock-goethe-a1", title: "Goethe A1 Mock Exam (printable)", category: "mock-exam", level: "A1", pages: 12, description: "Full paper with answer key and assessment notes.", href: "/api/pdf/exam/goethe-a1-mock-1" },
  { slug: "mock-goethe-a2", title: "Goethe A2 Mock Exam (printable)", category: "mock-exam", level: "A2", pages: 14, description: "Full paper with answer key and assessment notes.", href: "/api/pdf/exam/goethe-a2-mock-1" },
  { slug: "mock-goethe-b1", title: "Goethe B1 Mock Exam (printable)", category: "mock-exam", level: "B1", pages: 18, description: "All four modules with answer key and model answers.", href: "/api/pdf/exam/goethe-b1-mock-1" },
  { slug: "mock-goethe-b2", title: "Goethe B2 Mock Exam (printable)", category: "mock-exam", level: "B2", pages: 20, description: "All four modules with answer key and model answers.", href: "/api/pdf/exam/goethe-b2-mock-1" },
  { slug: "mock-telc-b1", title: "telc B1 Mock Exam (printable)", category: "mock-exam", level: "B1", pages: 16, description: "Including Sprachbausteine and the letter task.", href: "/api/pdf/exam/telc-b1-mock-1" },
  { slug: "mock-telc-b2", title: "telc B2 Mock Exam (printable)", category: "mock-exam", level: "B2", pages: 18, description: "Including Sprachbausteine and the formal letter.", href: "/api/pdf/exam/telc-b2-mock-1" },
  { slug: "ausbildung-pack", title: "Ausbildung Application Pack", category: "study-guide", level: "ALL", pages: 22, description: "Lebenslauf and Anschreiben templates, 50 interview questions, workplace vocabulary.", href: "/api/pdf/ausbildung/all" },
  { slug: "pronunciation-guide", title: "Pronunciation Guide", category: "study-guide", level: "ALL", pages: 10, description: "Alphabet, umlauts, ich/ach sounds, stress and sentence melody with IPA.", href: "/api/pdf/pronunciation/all" },
  { slug: "revision-a1", title: "A1 Revision Notes", category: "revision-notes", level: "A1", pages: 8, description: "One-page summaries for every A1 lesson.", href: "/api/pdf/revision/A1" },
  { slug: "revision-a2", title: "A2 Revision Notes", category: "revision-notes", level: "A2", pages: 8, description: "One-page summaries for every A2 lesson.", href: "/api/pdf/revision/A2" },
  { slug: "revision-b1", title: "B1 Revision Notes", category: "revision-notes", level: "B1", pages: 7, description: "One-page summaries for every B1 lesson.", href: "/api/pdf/revision/B1" },
  { slug: "revision-b2", title: "B2 Revision Notes", category: "revision-notes", level: "B2", pages: 7, description: "One-page summaries for every B2 lesson.", href: "/api/pdf/revision/B2" },
  { slug: "practice-test-a1", title: "A1 Practice Test (short)", category: "practice-test", level: "A1", pages: 6, description: "30-minute mini test with solutions for a quick check.", href: "/api/pdf/practice/A1" },
  { slug: "practice-test-b1", title: "B1 Practice Test (short)", category: "practice-test", level: "B1", pages: 7, description: "45-minute mini test with solutions for a quick check.", href: "/api/pdf/practice/B1" },
];

export const helpTopics = [
  {
    category: "Getting started",
    items: [
      {
        q: "How do I know which level to start with?",
        a: "Take the placement check on the dashboard. If you can introduce yourself and handle everyday shopping, start at A2; if you can argue an opinion in writing, start at B1. When in doubt, start one level lower and move fast — the first lessons will feel easy and build confidence.",
      },
      {
        q: "How much should I study per day?",
        a: "Consistency beats volume: 30–45 minutes daily is better than four hours on Sunday. Use the study planner to schedule a lesson, ten flashcards and one speaking or writing task per day.",
      },
      {
        q: "How long does each level take?",
        a: "Roughly 90 hours for A1, 110 for A2, 130 for B1 and 150 for B2 of focused study, plus homework. With one hour a day, A1 to B1 in about a year is realistic.",
      },
    ],
  },
  {
    category: "Learning features",
    items: [
      {
        q: "How does the flashcard system work?",
        a: "It uses spaced repetition (an SM-2 style algorithm). Cards you find easy come back after longer and longer intervals; cards you fail return the same day. Review every day — the schedule only works if you keep the queue empty.",
      },
      {
        q: "Where does the audio come from?",
        a: "Listening and pronunciation use your browser's German speech engine, so the platform works offline and you can change the playback speed from 0.6× to 1.2×. Choose a de-DE voice in Settings for the best quality.",
      },
      {
        q: "How is my speaking scored?",
        a: "Speech recognition compares what you said with the target sentence and reports a word-level match score. It is a practice aid, not an exam grade: aim for 80 % or higher, then move on.",
      },
      {
        q: "How does the writing check work?",
        a: "The checker looks for the criteria examiners use: length, content points, connectors, register, verb position and typical learner errors. It also shows a model answer and, where available, a native-level rewrite.",
      },
    ],
  },
  {
    category: "Exams",
    items: [
      {
        q: "What is the difference between Goethe and telc?",
        a: "Both are recognised. Goethe B1 and B2 are modular, so you can retake a single failed module. telc adds a pure grammar section (Sprachbausteine) and often uses a single combined reading paper. Practise both formats — the language is the same.",
      },
      {
        q: "What score do I need to pass?",
        a: "60 % is the pass mark for both providers. At Goethe B1/B2 each module needs 60 % separately.",
      },
      {
        q: "Which level do I need for an Ausbildung?",
        a: "Most companies ask for B1; nursing, healthcare and many technical trades ask for B2. Check the advert — and prepare the workplace vocabulary in the Ausbildung section either way.",
      },
    ],
  },
  {
    category: "Account & data",
    items: [
      {
        q: "Is my progress saved if I am not logged in?",
        a: "Yes. Progress, flashcards, notes and planner entries are stored locally in your browser. Create an account to sync across devices and to join study groups.",
      },
      {
        q: "Can I study with friends?",
        a: "Yes — create a study group in Community, share the invite code, and compare progress or run a group challenge.",
      },
      {
        q: "How do I print a lesson?",
        a: "Every lesson has a Print/PDF button. It generates a professionally laid out A4 document with grammar tables, vocabulary, exercises, solutions and homework.",
      },
    ],
  },
];
