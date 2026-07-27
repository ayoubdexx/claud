import type { WritingTask } from "@/lib/types";

export interface WritingIssue {
  type: "error" | "warning" | "hint";
  category: "length" | "grammar" | "register" | "structure" | "spelling" | "vocabulary";
  message: string;
  suggestion?: string;
  excerpt?: string;
}

export interface WritingFeedback {
  words: number;
  sentences: number;
  averageSentenceLength: number;
  score: number;
  issues: WritingIssue[];
  strengths: string[];
  connectorsUsed: string[];
  suggestedPhrases: { de: string; en: string }[];
  registerDetected: "formal" | "informal" | "mixed" | "unclear";
}

const CONNECTORS = [
  "weil", "denn", "deshalb", "deswegen", "trotzdem", "obwohl", "damit", "dass", "wenn", "als",
  "außerdem", "zuerst", "danach", "dann", "schließlich", "zusammenfassend", "einerseits",
  "andererseits", "allerdings", "dennoch", "folglich", "zwar", "sondern", "während", "sobald",
  "aufgrund", "trotz", "hingegen", "zudem", "insgesamt", "beispielsweise",
];

const FORMAL_MARKERS = [
  "sehr geehrte", "mit freundlichen grüßen", "könnten sie", "würde ich mich freuen",
  "im voraus", "hiermit", "zur verfügung", "mitteilen", "bezüglich", "anbei",
];

const INFORMAL_MARKERS = [
  "hallo", "hi", "hey", "liebe grüße", "lg", "tschüss", "bis dann", "mach's gut", "ciao",
];

/** Frequent learner errors that can be detected with high precision. */
const ERROR_PATTERNS: {
  pattern: RegExp;
  message: string;
  suggestion: string;
  category: WritingIssue["category"];
}[] = [
  {
    pattern: /\bich\s+habe\s+\d{1,3}\s+jahre\b/i,
    message: "Age is expressed with sein, not haben.",
    suggestion: "Ich bin 24 Jahre alt.",
    category: "grammar",
  },
  {
    pattern: /\bich\s+bin\s+ein\s+(student|lehrer|arzt|elektriker|schüler)\b/i,
    message: "Professions take no article after sein.",
    suggestion: "Ich bin Student.",
    category: "grammar",
  },
  {
    pattern: /\bnicht\s+(zeit|geld|hunger|lust|kinder)\b/i,
    message: "Nouns without an article are negated with kein-.",
    suggestion: "Ich habe keine Zeit.",
    category: "grammar",
  },
  {
    pattern: /\bgrößer\s+wie\b|\bbesser\s+wie\b|\bmehr\s+wie\b/i,
    message: "Comparisons use als, not wie.",
    suggestion: "größer als …",
    category: "grammar",
  },
  {
    pattern: /\bweil\s+\w+\s+(ist|hat|kann|muss|wird)\s+\w+/i,
    message: "In a weil-clause the conjugated verb must be the last element.",
    suggestion: "…, weil das Wetter schlecht ist.",
    category: "grammar",
  },
  {
    pattern: /\bich\s+freue\s+(?!mich)\w+/i,
    message: "sich freuen needs a reflexive pronoun.",
    suggestion: "Ich freue mich auf …",
    category: "grammar",
  },
  {
    pattern: /\bwarte\s+für\b|\bwarten\s+für\b/i,
    message: "warten takes auf + accusative.",
    suggestion: "Ich warte auf die Antwort.",
    category: "grammar",
  },
  {
    pattern: /\bich\s+bin\s+einverstanden\s+mit\s+dich\b/i,
    message: "mit takes the dative.",
    suggestion: "einverstanden mit dir",
    category: "grammar",
  },
  {
    pattern: /\bhabe\s+nach\s+\w+\s+gefahren\b|\bhabe\s+.*\bgefahren\b/i,
    message: "Movement verbs form the Perfekt with sein.",
    suggestion: "Ich bin nach Berlin gefahren.",
    category: "grammar",
  },
  {
    pattern: /\bich\s+will\s+(einen|ein|eine)\s+(kaffee|tee|wasser|termin)\b/i,
    message: "wollen sounds blunt in service situations.",
    suggestion: "Ich möchte einen Kaffee, bitte.",
    category: "register",
  },
];

const SPELLING_HINTS: { pattern: RegExp; message: string; suggestion: string }[] = [
  { pattern: /\bdass\s+ist\b/i, message: "dass vs. das", suggestion: "Das ist … (article/pronoun) — dass only introduces a clause." },
  { pattern: /\bseit\s+ich\s+bin\b/i, message: "seit + Dativ or seit + clause", suggestion: "seit einem Jahr / seit ich hier bin" },
  { pattern: /\bstandart\b/i, message: "Spelling", suggestion: "Standard" },
  { pattern: /\bziemlich\s+gut\s+gut\b/i, message: "Repetition", suggestion: "Remove the duplicate word." },
];

export function analyseWriting(text: string, task?: WritingTask): WritingFeedback {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((part) => part.trim().length > 1).length : 0;
  const lower = trimmed.toLowerCase();
  const issues: WritingIssue[] = [];
  const strengths: string[] = [];

  /* ---- length ---- */
  if (task) {
    if (words < task.minWords) {
      issues.push({
        type: "error",
        category: "length",
        message: `Too short: ${words} of at least ${task.minWords} words.`,
        suggestion: `Add ${task.minWords - words} more words — usually one more argument with an example.`,
      });
    } else {
      strengths.push(`Length requirement met (${words} words).`);
    }
    if (task.maxWords && words > task.maxWords * 1.25) {
      issues.push({
        type: "warning",
        category: "length",
        message: `Quite long: ${words} words (target around ${task.maxWords}).`,
        suggestion: "Examiners reward precision; cut repetitions.",
      });
    }
  }

  /* ---- structure: greeting and closing ---- */
  const needsLetterForm = task && ["email", "letter", "message", "cover-letter"].includes(task.kind);
  if (needsLetterForm) {
    const hasGreeting = /(sehr geehrt|hallo|liebe|guten tag|guten morgen)/i.test(lower);
    const hasClosing = /(freundlichen grüßen|liebe grüße|viele grüße|beste grüße|lg\b)/i.test(lower);
    if (!hasGreeting) {
      issues.push({ type: "error", category: "structure", message: "Greeting missing.", suggestion: "Sehr geehrte Frau …, / Hallo …," });
    } else strengths.push("Greeting present.");
    if (!hasClosing) {
      issues.push({ type: "error", category: "structure", message: "Closing formula missing.", suggestion: "Mit freundlichen Grüßen / Liebe Grüße" });
    } else strengths.push("Closing formula present.");
  }

  /* ---- register ---- */
  const formalHits = FORMAL_MARKERS.filter((marker) => lower.includes(marker));
  const informalHits = INFORMAL_MARKERS.filter((marker) => lower.includes(marker));
  const duHits = /(^|\s)(du|dich|dir|dein)(\s|,|\.|!|\?)/i.test(trimmed);
  const sieHits = /(^|\s)(Sie|Ihnen|Ihre|Ihr)(\s|,|\.|!|\?)/.test(trimmed);

  let registerDetected: WritingFeedback["registerDetected"] = "unclear";
  if (formalHits.length && !informalHits.length) registerDetected = "formal";
  else if (informalHits.length && !formalHits.length) registerDetected = "informal";
  else if (formalHits.length && informalHits.length) registerDetected = "mixed";

  if (duHits && sieHits) {
    issues.push({
      type: "error",
      category: "register",
      message: "You mix du and Sie in the same text.",
      suggestion: "Choose one form and keep it throughout.",
    });
  }
  if (task && ["email", "letter", "cover-letter", "exam"].includes(task.kind) && registerDetected === "informal") {
    issues.push({
      type: "warning",
      category: "register",
      message: "The register looks informal for a formal task.",
      suggestion: "Use Sehr geehrte …, Sie-form and Mit freundlichen Grüßen.",
    });
  }

  /* ---- connectors ---- */
  const connectorsUsed = CONNECTORS.filter((connector) =>
    new RegExp(`(^|[^a-zäöüß])${connector}([^a-zäöüß]|$)`, "i").test(lower),
  );
  if (connectorsUsed.length >= 3) {
    strengths.push(`Good cohesion: ${connectorsUsed.slice(0, 5).join(", ")}.`);
  } else {
    issues.push({
      type: "hint",
      category: "structure",
      message: "Few connectors — the text may read like a list.",
      suggestion: "Add weil, deshalb, außerdem, zwar … aber, zusammenfassend.",
    });
  }

  /* ---- sentence length ---- */
  const avg = sentences ? Math.round((words / sentences) * 10) / 10 : 0;
  if (avg > 26) {
    issues.push({
      type: "warning",
      category: "structure",
      message: `Very long sentences (average ${avg} words).`,
      suggestion: "Split some sentences; German rewards clarity.",
    });
  } else if (sentences >= 3 && avg >= 8) {
    strengths.push(`Balanced sentence length (average ${avg} words).`);
  }

  /* ---- error patterns ---- */
  for (const rule of ERROR_PATTERNS) {
    const match = trimmed.match(rule.pattern);
    if (match) {
      issues.push({
        type: "error",
        category: rule.category,
        message: rule.message,
        suggestion: rule.suggestion,
        excerpt: match[0],
      });
    }
  }
  for (const rule of SPELLING_HINTS) {
    const match = trimmed.match(rule.pattern);
    if (match) {
      issues.push({
        type: "hint",
        category: "spelling",
        message: rule.message,
        suggestion: rule.suggestion,
        excerpt: match[0],
      });
    }
  }

  /* ---- capitalisation of nouns after articles (rough heuristic) ---- */
  const lowerNounAfterArticle = trimmed.match(/\b(der|die|das|ein|eine|einen|dem|den)\s+([a-zäöüß]{4,})\b/);
  if (lowerNounAfterArticle && !CONNECTORS.includes(lowerNounAfterArticle[2])) {
    issues.push({
      type: "warning",
      category: "spelling",
      message: "A noun after an article may be missing its capital letter.",
      suggestion: `${lowerNounAfterArticle[1]} ${lowerNounAfterArticle[2].charAt(0).toUpperCase()}${lowerNounAfterArticle[2].slice(1)}`,
      excerpt: lowerNounAfterArticle[0],
    });
  }

  /* ---- content checklist ---- */
  if (task) {
    const missing = task.checklist.filter((item) => {
      const keyword = item.split(/\s+/).find((word) => word.length > 6);
      return keyword ? !lower.includes(keyword.toLowerCase()) : false;
    });
    if (missing.length && words > 0) {
      issues.push({
        type: "hint",
        category: "structure",
        message: "Check the task points you may not have covered yet.",
        suggestion: missing.slice(0, 3).join(" · "),
      });
    }
  }

  const errorCount = issues.filter((issue) => issue.type === "error").length;
  const warningCount = issues.filter((issue) => issue.type === "warning").length;
  const base = words === 0 ? 0 : 100;
  const score = Math.max(
    0,
    Math.min(100, base - errorCount * 12 - warningCount * 5 - (connectorsUsed.length < 3 ? 6 : 0)),
  );

  return {
    words,
    sentences,
    averageSentenceLength: avg,
    score,
    issues,
    strengths,
    connectorsUsed,
    suggestedPhrases: task?.usefulPhrases.slice(0, 5) ?? [],
    registerDetected,
  };
}
