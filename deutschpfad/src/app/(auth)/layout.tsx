import Link from "next/link";
import { Check } from "lucide-react";
import { contentStats } from "@/content";

const highlights = [
  "Full A1–B2 curriculum with modules, lessons and certificates",
  "Spaced-repetition flashcards that adapt to your mistakes",
  "Goethe and telc mock exams with automatic scoring",
  "Printable PDFs for every lesson, grammar sheet and worksheet",
  "Ausbildung pack: CV, cover letter, interview and workplace German",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-glow">
              DP
            </span>
            <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">DeutschPfad</span>
          </Link>
          {children}
        </div>
      </div>

      <div className="relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br from-primary to-accent px-12 text-primary-foreground lg:flex">
        <div className="grid-bg absolute inset-0 opacity-10" aria-hidden />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Deutsch A1 → B2</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.02em]">
            Everything you need in one place — and nothing you don&apos;t.
          </h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 opacity-90" />
                <span className="opacity-95">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/25 pt-6 text-center">
            <div>
              <p className="font-display text-2xl font-semibold">{contentStats.lessons}</p>
              <p className="text-xs opacity-80">lessons</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">{contentStats.grammarTopics}</p>
              <p className="text-xs opacity-80">grammar topics</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">{contentStats.exams}</p>
              <p className="text-xs opacity-80">mock exams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
