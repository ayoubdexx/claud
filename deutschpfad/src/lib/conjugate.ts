import type { VerbEntry } from "@/lib/types";
import { verbs } from "@/content/verbs";

export const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"] as const;
export type PersonIndex = 0 | 1 | 2 | 3 | 4 | 5;

const PRESENT_ENDINGS = ["e", "st", "t", "en", "t", "en"];
const PRETERITE_STRONG_ENDINGS = ["", "st", "", "en", "t", "en"];
const PRETERITE_WEAK_ENDINGS = ["e", "est", "e", "en", "et", "en"];
const KONJUNKTIV1_ENDINGS = ["e", "est", "e", "en", "et", "en"];

export interface ConjugationTable {
  tense: string;
  description: string;
  forms: string[];
  /** Position of the separable prefix / participle when the clause is built. */
  note?: string;
}

function splitPrefix(verb: VerbEntry) {
  const prefix = verb.separablePrefix ?? "";
  const reflexive = verb.infinitive.startsWith("sich ");
  const base = verb.infinitive.replace(/^sich /, "");
  const core = prefix && base.startsWith(prefix) ? base.slice(prefix.length) : base;
  return { prefix, core, reflexive };
}

function stemOf(core: string) {
  if (core.endsWith("eln") || core.endsWith("ern")) return core.slice(0, -1);
  if (core.endsWith("en")) return core.slice(0, -2);
  if (core.endsWith("n")) return core.slice(0, -1);
  return core;
}

const REFLEXIVE_ACC = ["mich", "dich", "sich", "uns", "euch", "sich"];

/** Adds the connecting -e for stems in -t/-d and handles stems in -s/-ß/-z. */
function presentForm(stem: string, index: number) {
  const ending = PRESENT_ENDINGS[index];
  const needsE = /(?:[td]|[^aeiouäöü][mn])$/.test(stem);
  const sibilant = /(?:s|ß|z|x|chs)$/.test(stem);

  if (needsE && (ending === "st" || ending === "t")) return stem + "e" + ending;
  if (sibilant && ending === "st") return stem + "t";
  if (ending === "e" && /e$/.test(stem)) return stem;
  return stem + ending;
}

function preteriteForm(verb: VerbEntry, index: number) {
  const endings = verb.strong ? PRETERITE_STRONG_ENDINGS : PRETERITE_WEAK_ENDINGS;
  const stem = verb.preteriteStem;
  if (!verb.strong && /(?:te|t)$/.test(stem)) {
    // weak stems are stored already containing the -t (e.g. "lernt")
    return stem + endings[index];
  }
  return stem + endings[index];
}

function addUmlaut(stem: string) {
  return stem
    .replace(/a(?![eiouäöü])/, "ä")
    .replace(/^([^oö]*)o(?![eiouäöü])/, "$1ö")
    .replace(/^([^uü]*)u(?![eiouäöü])/, "$1ü");
}

export function conjugatePresent(verb: VerbEntry): string[] {
  const { core, prefix, reflexive } = splitPrefix(verb);
  const stem = stemOf(core);
  return PERSONS.map((_, index) => {
    const override = verb.presentOverrides?.[index as PersonIndex];
    const useChange = Boolean(verb.presentStemChange) && (index === 1 || index === 2);
    const activeStem = useChange ? (verb.presentStemChange as string) : stem;
    const form = override ?? presentForm(activeStem, index);
    const reflex = reflexive ? ` ${REFLEXIVE_ACC[index]}` : "";
    return prefix ? `${form}${reflex} … ${prefix}` : `${form}${reflex}`;
  });
}

export function conjugatePreterite(verb: VerbEntry): string[] {
  const { prefix, reflexive } = splitPrefix(verb);
  return PERSONS.map((_, index) => {
    const form = preteriteForm(verb, index);
    const reflex = reflexive ? ` ${REFLEXIVE_ACC[index]}` : "";
    return prefix ? `${form}${reflex} … ${prefix}` : `${form}${reflex}`;
  });
}

function auxPresent(aux: "haben" | "sein") {
  return aux === "haben"
    ? ["habe", "hast", "hat", "haben", "habt", "haben"]
    : ["bin", "bist", "ist", "sind", "seid", "sind"];
}

function auxPreterite(aux: "haben" | "sein") {
  return aux === "haben"
    ? ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"]
    : ["war", "warst", "war", "waren", "wart", "waren"];
}

const WERDEN_PRESENT = ["werde", "wirst", "wird", "werden", "werdet", "werden"];
const WERDEN_PRETERITE = ["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"];
const WERDEN_KONJ1 = ["werde", "werdest", "werde", "werden", "werdet", "werden"];
const WUERDE = ["würde", "würdest", "würde", "würden", "würdet", "würden"];

export function conjugatePerfect(verb: VerbEntry): string[] {
  const aux = auxPresent(verb.auxiliary);
  const { reflexive } = splitPrefix(verb);
  return aux.map((a, i) => `${a}${reflexive ? ` ${REFLEXIVE_ACC[i]}` : ""} ${verb.partizip2}`);
}

export function conjugatePluperfect(verb: VerbEntry): string[] {
  const aux = auxPreterite(verb.auxiliary);
  const { reflexive } = splitPrefix(verb);
  return aux.map((a, i) => `${a}${reflexive ? ` ${REFLEXIVE_ACC[i]}` : ""} ${verb.partizip2}`);
}

export function conjugateFutureI(verb: VerbEntry): string[] {
  const { reflexive } = splitPrefix(verb);
  const inf = verb.infinitive.replace(/^sich /, "");
  return WERDEN_PRESENT.map((w, i) => `${w}${reflexive ? ` ${REFLEXIVE_ACC[i]}` : ""} ${inf}`);
}

export function conjugateFutureII(verb: VerbEntry): string[] {
  return WERDEN_PRESENT.map((w) => `${w} ${verb.partizip2} ${verb.auxiliary}`);
}

export function conjugateKonjunktiv1(verb: VerbEntry): string[] {
  if (verb.infinitive === "sein") return ["sei", "seist", "sei", "seien", "seiet", "seien"];
  const { core, prefix } = splitPrefix(verb);
  const stem = stemOf(core);
  return KONJUNKTIV1_ENDINGS.map((ending, i) => {
    const form = i === 0 || i === 2 ? `${stem}e` : `${stem}${ending}`;
    return prefix ? `${form} … ${prefix}` : form;
  });
}

export function conjugateKonjunktiv2(verb: VerbEntry): string[] {
  const { prefix, reflexive } = splitPrefix(verb);
  const inf = verb.infinitive.replace(/^sich /, "");
  const stem = verb.konjunktiv2Stem ?? (verb.strong ? addUmlaut(verb.preteriteStem) : null);

  if (!stem) {
    return WUERDE.map((w, i) => `${w}${reflexive ? ` ${REFLEXIVE_ACC[i]}` : ""} ${inf}`);
  }
  return PRETERITE_WEAK_ENDINGS.map((ending, i) => {
    const form = `${stem}${ending}`;
    const reflex = reflexive ? ` ${REFLEXIVE_ACC[i]}` : "";
    return prefix ? `${form}${reflex} … ${prefix}` : `${form}${reflex}`;
  });
}

export function conjugateImperative(verb: VerbEntry): string[] {
  const { core, prefix, reflexive } = splitPrefix(verb);
  const stem = stemOf(core);
  if (verb.infinitive === "sein") return ["Sei!", "Seid!", "Seien Sie!"];

  // du: keep e→i change, drop a→ä umlaut
  let duStem = stem;
  if (verb.presentStemChange && !/^..?ä/.test(verb.presentStemChange)) {
    duStem = verb.presentStemChange;
  }
  const needsE = /(?:[td]|[^aeiouäöü][mn])$/.test(duStem);
  const du = `${duStem}${needsE ? "e" : ""}`;
  const ihr = presentForm(stem, 4);
  const sie = core;
  const reflexDu = reflexive ? " dich" : "";
  const reflexIhr = reflexive ? " euch" : "";
  const reflexSie = reflexive ? " sich" : "";

  return [
    `${du}${reflexDu}${prefix ? ` ${prefix}` : ""}!`,
    `${ihr}${reflexIhr}${prefix ? ` ${prefix}` : ""}!`,
    `${sie} Sie${reflexSie}${prefix ? ` ${prefix}` : ""}!`,
  ];
}

export function conjugatePassive(verb: VerbEntry) {
  return {
    praesens: WERDEN_PRESENT.map((w) => `${w} ${verb.partizip2}`),
    praeteritum: WERDEN_PRETERITE.map((w) => `${w} ${verb.partizip2}`),
    perfekt: auxPresent("sein").map((a) => `${a} ${verb.partizip2} worden`),
    konjunktiv1: WERDEN_KONJ1.map((w) => `${w} ${verb.partizip2}`),
  };
}

export interface FullConjugation {
  verb: VerbEntry;
  tables: ConjugationTable[];
  imperative: string[];
  passive: ReturnType<typeof conjugatePassive>;
  /** Example sentence pattern with a separable prefix resolved. */
  sample: string;
}

export function conjugate(verb: VerbEntry): FullConjugation {
  const tables: ConjugationTable[] = [
    {
      tense: "Präsens",
      description: "Present — the default tense for now and for the near future.",
      forms: conjugatePresent(verb),
      note: verb.separablePrefix ? `Separable: the prefix “${verb.separablePrefix}” moves to the end of the clause.` : undefined,
    },
    {
      tense: "Präteritum",
      description: "Simple past — written narration; spoken mainly with sein, haben and modals.",
      forms: conjugatePreterite(verb),
    },
    {
      tense: "Perfekt",
      description: `Spoken past — ${verb.auxiliary} + ${verb.partizip2}.`,
      forms: conjugatePerfect(verb),
    },
    {
      tense: "Plusquamperfekt",
      description: "Past perfect — an event before another past event.",
      forms: conjugatePluperfect(verb),
    },
    {
      tense: "Futur I",
      description: "Future / prediction / assumption with werden + Infinitiv.",
      forms: conjugateFutureI(verb),
    },
    {
      tense: "Futur II",
      description: "Completed in the future or an assumption about the past.",
      forms: conjugateFutureII(verb),
    },
    {
      tense: "Konjunktiv I",
      description: "Reported speech (indirekte Rede), mainly 3rd person singular.",
      forms: conjugateKonjunktiv1(verb),
    },
    {
      tense: "Konjunktiv II",
      description: "Polite requests, wishes and hypotheses.",
      forms: conjugateKonjunktiv2(verb),
    },
  ];

  return {
    verb,
    tables,
    imperative: conjugateImperative(verb),
    passive: conjugatePassive(verb),
    sample: verb.examples?.[0]?.de ?? "",
  };
}

export function getVerb(infinitive: string) {
  const needle = decodeURIComponent(infinitive).toLowerCase();
  return verbs.find(
    (v) => v.infinitive.toLowerCase() === needle || v.infinitive.replace(/^sich /, "").toLowerCase() === needle,
  );
}

export function verbSlug(verb: VerbEntry) {
  return encodeURIComponent(verb.infinitive.replace(/^sich /, ""));
}

export const verbKinds = [
  { id: "all", label: "All verbs" },
  { id: "irregular", label: "Irregular" },
  { id: "regular", label: "Regular" },
  { id: "modal", label: "Modal" },
  { id: "separable", label: "Separable" },
  { id: "reflexive", label: "Reflexive" },
  { id: "mixed", label: "Mixed" },
  { id: "auxiliary", label: "Auxiliary" },
] as const;
