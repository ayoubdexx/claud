import type { PronunciationLesson } from "@/lib/types";

export const pronunciationLessons: PronunciationLesson[] = [
  {
    slug: "das-alphabet",
    title: "Das Alphabet und Buchstabieren",
    group: "alphabet",
    explanation:
      "German spelling is highly regular: once you know the letter names and a handful of rules, you can read almost any word aloud correctly. Spelling your name on the phone (buchstabieren) is a real exam task at A1.",
    howTo: [
      "Learn the letter names in groups: A–H, I–P, Q–Z.",
      "Watch the four letters that trap English speakers: E [eː], I [iː], J [jɔt], V [faʊ].",
      "ß is called Eszett or scharfes S and is always pronounced [s].",
      "On the phone Germans often use names: A wie Anton, B wie Berta.",
    ],
    examples: [
      { de: "A B C D E F G", ipa: "aː beː t͡seː deː eː ɛf ɡeː", en: "letter names" },
      { de: "V wie Viktor", ipa: "faʊ viː ˈvɪktɔɐ̯", en: "V as in Viktor" },
      { de: "Benali: B–E–N–A–L–I", ipa: "beː eː ɛn aː ɛl iː", en: "spelling a surname" },
      { de: "Straße mit Eszett", ipa: "ˈʃtʁaːsə mɪt ɛsˈt͡sɛt", en: "Straße with ß" },
    ],
    mistakes: [
      { wrong: "J = [dʒeɪ]", right: "J = [jɔt]", why: "German J sounds like English 'y' in yes." },
      { wrong: "V = [viː]", right: "V = [faʊ], sound [f]", why: "Vater is pronounced [ˈfaːtɐ]." },
      { wrong: "W = [ˈdʌbəljuː]", right: "W = [veː], sound [v]", why: "Wasser is [ˈvasɐ]." },
    ],
  },
  {
    slug: "umlaute-ae-oe-ue",
    title: "Die Umlaute ä, ö, ü",
    group: "umlauts",
    ipa: "ɛː · øː · yː",
    explanation:
      "Umlauts are separate sounds, not decoration. Mixing them up changes meaning: Mutter (mother) vs. Mütter (mothers), schon (already) vs. schön (beautiful).",
    howTo: [
      "ä = say the e in 'bed', slightly longer: Käse, Mädchen.",
      "ö = say 'e' as in bed, then round your lips without moving your tongue: schön, können.",
      "ü = say 'ee' as in see, then round your lips tightly: über, müssen, Tür.",
      "Practise in front of a mirror — if your lips do not move, the sound is wrong.",
    ],
    examples: [
      { de: "Käse", ipa: "ˈkɛːzə", en: "cheese" },
      { de: "schön", ipa: "ʃøːn", en: "beautiful" },
      { de: "über", ipa: "ˈyːbɐ", en: "over, about" },
      { de: "Tür", ipa: "tyːɐ̯", en: "door" },
      { de: "Frühstück", ipa: "ˈfʁyːʃtʏk", en: "breakfast" },
    ],
    minimalPairs: [
      { a: "Mutter", b: "Mütter", note: "singular vs. plural" },
      { a: "schon", b: "schön", note: "already vs. beautiful" },
      { a: "Kuchen", b: "Küchen", note: "cake vs. kitchens" },
      { a: "lesen", b: "lösen", note: "to read vs. to solve" },
    ],
    mistakes: [
      { wrong: "Ich mochte einen Kaffee.", right: "Ich möchte einen Kaffee.", why: "mochte = liked (past); möchte = would like." },
      { wrong: "Tur", right: "Tür", why: "Without the Umlaut the word does not exist." },
      { wrong: "fur mich", right: "für mich", why: "für needs the rounded ü." },
    ],
  },
  {
    slug: "ich-laut-ach-laut",
    title: "Der ich-Laut und der ach-Laut",
    group: "consonants",
    ipa: "ç · x",
    explanation:
      "The letter combination ch has two main pronunciations. After i, e, ä, ö, ü, ei, eu and consonants it is the soft [ç] (ich-Laut); after a, o, u, au it is the throaty [x] (ach-Laut).",
    howTo: [
      "[ç]: start to say 'h' in 'hue' with the tongue high and front — ich, nicht, Milch, möchte.",
      "[x]: as in Scottish 'loch', air friction at the back — Nacht, machen, Buch, auch.",
      "-ig at the end of a word is pronounced [ɪç]: wichtig, richtig, günstig.",
      "chs is pronounced [ks]: sechs, wachsen.",
    ],
    examples: [
      { de: "ich möchte nicht", ipa: "ɪç ˈmøçtə nɪçt", en: "I don't want to" },
      { de: "die Nacht", ipa: "diː naxt", en: "the night" },
      { de: "wichtig", ipa: "ˈvɪçtɪç", en: "important" },
      { de: "sechs Bücher", ipa: "zɛks ˈbyːçɐ", en: "six books" },
    ],
    minimalPairs: [
      { a: "dich", b: "doch", note: "[ç] vs. [x]" },
      { a: "Nichte", b: "nachte", note: "front vs. back friction" },
    ],
    mistakes: [
      { wrong: "ich = [ɪk]", right: "ich = [ɪç]", why: "Never pronounce ch like a k in this position." },
      { wrong: "ich = [ɪʃ]", right: "ich = [ɪç]", why: "[ʃ] is the sch sound — a different phoneme." },
      { wrong: "richtig = [ˈʁɪçtɪk]", right: "[ˈvɪçtɪç]-type ending [ɪç]", why: "Standard German softens final -ig." },
    ],
  },
  {
    slug: "r-und-vokalisiertes-r",
    title: "Das deutsche R und das vokalisierte r",
    group: "consonants",
    ipa: "ʁ · ɐ̯",
    explanation:
      "At the beginning of a syllable, r is produced at the back of the mouth [ʁ]. After a vowel, especially in -er endings, it turns into a vowel-like [ɐ̯] — which is why Vater sounds like 'Fahta'.",
    howTo: [
      "Initial r: gargle gently — Rot, Reise, richtig.",
      "After a long vowel: r becomes [ɐ̯] — Uhr, Tür, hier.",
      "Ending -er is [ɐ]: Lehrer, Wasser, Zucker, immer.",
      "Do not use the American retroflex r; it makes German very hard to understand.",
    ],
    examples: [
      { de: "der Lehrer", ipa: "deːɐ̯ ˈleːʁɐ", en: "the teacher" },
      { de: "vier Uhr", ipa: "fiːɐ̯ ˈʔuːɐ̯", en: "four o'clock" },
      { de: "Wasser mit Zucker", ipa: "ˈvasɐ mɪt ˈt͡sʊkɐ", en: "water with sugar" },
      { de: "richtig reagieren", ipa: "ˈʁɪçtɪç ʁeaˈɡiːʁən", en: "to react correctly" },
    ],
    mistakes: [
      { wrong: "Lehrer with a hard final r", right: "Lehre[ɐ]", why: "Final -er is a vowel sound in standard German." },
      { wrong: "Rolling the r with the tongue tip everywhere", right: "Uvular [ʁ] at the back", why: "Tongue-tip r sounds regional/Bavarian and is harder to produce quickly." },
    ],
  },
  {
    slug: "z-s-und-st-sp",
    title: "z, s, sch und st/sp am Wortanfang",
    group: "clusters",
    ipa: "t͡s · z · ʃ",
    explanation:
      "z is always [t͡s], never [z]. Single s before a vowel is [z], and st- and sp- at the beginning of a word or syllable are pronounced [ʃt] and [ʃp].",
    howTo: [
      "z = ts: Zeit, zehn, Zucker, tanzen.",
      "s before a vowel = [z]: sagen, Sonne, lesen.",
      "ss / ß = [s]: essen, Straße.",
      "Word-initial st-/sp- = [ʃt]/[ʃp]: Straße, Stunde, sprechen, Sport.",
    ],
    examples: [
      { de: "zehn Zimmer", ipa: "t͡seːn ˈt͡sɪmɐ", en: "ten rooms" },
      { de: "die Sonne", ipa: "diː ˈzɔnə", en: "the sun" },
      { de: "Straße", ipa: "ˈʃtʁaːsə", en: "street" },
      { de: "Sport sprechen studieren", ipa: "ʃpɔʁt ˈʃpʁɛçn̩ ʃtuˈdiːʁən", en: "sport, to speak, to study" },
    ],
    minimalPairs: [
      { a: "Zeit", b: "seit", note: "[t͡saɪt] vs. [zaɪt]" },
      { a: "reisen", b: "reißen", note: "[z] vs. [s]" },
    ],
    mistakes: [
      { wrong: "Zeit = [zaɪt]", right: "Zeit = [t͡saɪt]", why: "German z always contains a t." },
      { wrong: "Straße = [ˈstʁaːsə]", right: "[ˈʃtʁaːsə]", why: "Initial st- is pronounced scht-." },
    ],
  },
  {
    slug: "lange-kurze-vokale",
    title: "Lange und kurze Vokale",
    group: "vowels",
    explanation:
      "Vowel length is meaning-bearing in German. A vowel is long before a single consonant, before h and when doubled; it is short before two or more consonants.",
    howTo: [
      "Long: Wahl, Bahn, sehen, Boot, Miete (vowel + h, vowel + single consonant, doubled vowel).",
      "Short: Wall, Bann, Bett, Bitte, offen (before double consonants).",
      "ie is always long [iː]: wieder, Miete, Liebe.",
      "Say the pairs aloud and clap on the long vowel to feel the difference.",
    ],
    examples: [
      { de: "Miete – Mitte", ipa: "ˈmiːtə – ˈmɪtə", en: "rent – middle" },
      { de: "Staat – Stadt", ipa: "ʃtaːt – ʃtat", en: "state – city" },
      { de: "Ofen – offen", ipa: "ˈoːfn̩ – ˈɔfn̩", en: "oven – open" },
      { de: "beten – Betten", ipa: "ˈbeːtn̩ – ˈbɛtn̩", en: "to pray – beds" },
    ],
    minimalPairs: [
      { a: "Miete", b: "Mitte", note: "long [iː] vs. short [ɪ]" },
      { a: "Staat", b: "Stadt", note: "long [aː] vs. short [a]" },
      { a: "Ofen", b: "offen", note: "long [oː] vs. short [ɔ]" },
    ],
    mistakes: [
      { wrong: "Stadt with a long a", right: "Stadt [ʃtat] short", why: "Two consonants (dt) shorten the vowel." },
      { wrong: "ihn and in pronounced the same", right: "ihn [iːn] vs. in [ɪn]", why: "h marks the long vowel." },
    ],
  },
  {
    slug: "wortakzent",
    title: "Wortakzent: wo liegt die Betonung?",
    group: "prosody",
    explanation:
      "German stress usually falls on the first syllable of the stem. Separable prefixes are stressed, inseparable prefixes are not — which is how you hear whether a verb splits.",
    howTo: [
      "Native words: stress the stem — ARbeiten, LEHrerin, WOHnung.",
      "Separable prefix = stressed: AUFstehen, EINkaufen, ANrufen.",
      "Inseparable prefix = unstressed: verSTEhen, beKOMmen, erKLÄren.",
      "Loanwords often stress the last syllable: StuDENT, TeleFON, ReparaTUR, UniversiTÄT.",
      "Compounds stress the first element: HAUStür, ARbeitsplatz, KRANkenkasse.",
    ],
    examples: [
      { de: "Ich rufe dich an. (AN-rufen)", ipa: "ˈanʁuːfn̩", en: "separable, stressed prefix" },
      { de: "Ich verstehe nicht. (ver-STE-hen)", ipa: "fɛɐ̯ˈʃteːən", en: "inseparable, unstressed prefix" },
      { de: "die Universität", ipa: "univɛʁziˈtɛːt", en: "stress on the last syllable" },
      { de: "der Arbeitsplatz", ipa: "ˈaʁbaɪt͡splat͡s", en: "compound: first element stressed" },
    ],
    mistakes: [
      { wrong: "verSTEhen said as VERstehen", right: "verSTEhen", why: "Wrong stress makes listeners expect a separable verb." },
      { wrong: "STUdent", right: "StuDENT", why: "Latin loanwords keep late stress." },
    ],
  },
  {
    slug: "satzmelodie",
    title: "Satzmelodie und Rhythmus",
    group: "prosody",
    explanation:
      "German sentence melody carries grammar: statements fall, yes/no questions rise, W-questions fall. Unstressed syllables are reduced, which produces the typical German rhythm.",
    howTo: [
      "Statement: melody falls at the end. Ich komme morgen. ↘",
      "Yes/no question: melody rises. Kommst du morgen? ↗",
      "W-question: melody falls. Wann kommst du? ↘",
      "Stress the content words, weaken articles and pronouns: ich HAbe einen TERmin beim ARZT.",
      "Pause at commas before subordinate clauses — it helps the listener parse verb-final order.",
    ],
    examples: [
      { de: "Ich habe morgen einen Termin. ↘", ipa: "ɪç ˈhaːbə ˈmɔʁɡn̩ ˈaɪnən tɛɐ̯ˈmiːn", en: "statement, falling" },
      { de: "Hast du morgen Zeit? ↗", ipa: "hast duː ˈmɔʁɡn̩ t͡saɪt", en: "yes/no question, rising" },
      { de: "Warum lernst du Deutsch? ↘", ipa: "vaˈʁʊm lɛʁnst duː dɔɪ̯tʃ", en: "W-question, falling" },
    ],
    mistakes: [
      { wrong: "Rising melody in a statement", right: "Falling melody", why: "A rising statement sounds like a question or like uncertainty." },
      { wrong: "Stressing every word equally", right: "Stress content words only", why: "Equal stress sounds robotic and is tiring to follow." },
    ],
  },
  {
    slug: "auslautverhaertung",
    title: "Auslautverhärtung: b, d, g am Wortende",
    group: "consonants",
    explanation:
      "At the end of a word or syllable, b, d and g are pronounced as their hard partners p, t and k. That is why Kind sounds like 'Kint' and Tag like 'Tak'.",
    howTo: [
      "b → [p]: Ich habe ein Ho[p]by; gel[p] (gelb).",
      "d → [t]: Kin[t] (Kind), Han[t] (Hand), un[t] (und).",
      "g → [k]: Ta[k] (Tag), Zu[k] (Zug), Ber[k] (Berg).",
      "When an ending follows, the soft sound comes back: Kinder [d], Tage [ɡ], gelbe [b].",
    ],
    examples: [
      { de: "das Kind – die Kinder", ipa: "kɪnt – ˈkɪndɐ", en: "final [t] vs. medial [d]" },
      { de: "der Tag – die Tage", ipa: "taːk – ˈtaːɡə", en: "final [k] vs. medial [ɡ]" },
      { de: "gelb – gelbe Blumen", ipa: "ɡɛlp – ˈɡɛlbə", en: "final [p] vs. medial [b]" },
    ],
    mistakes: [
      { wrong: "Kind with a clear [d]", right: "Kin[t]", why: "German devoices final stops." },
      { wrong: "Kinder with [t]", right: "Kin[d]er", why: "The consonant is no longer final, so it stays voiced." },
    ],
  },
  {
    slug: "typische-fehler",
    title: "Die häufigsten Aussprachefehler",
    group: "mistakes",
    explanation:
      "A short diagnostic list: if you fix these ten habits, your German immediately becomes far easier to understand.",
    howTo: [
      "Record yourself reading a short text once a week and compare with the model audio.",
      "Work on one sound per week, not on everything at once.",
      "Exaggerate the target sound while practising; it will normalise in real speech.",
    ],
    examples: [
      { de: "vier – wir", ipa: "fiːɐ̯ – viːɐ̯", en: "v = [f], w = [v]" },
      { de: "Zeit – seit", ipa: "t͡saɪt – zaɪt", en: "z = [ts]" },
      { de: "Sport", ipa: "ʃpɔʁt", en: "sp- = [ʃp]" },
      { de: "möchte – mochte", ipa: "ˈmøçtə – ˈmɔxtə", en: "Umlaut changes meaning" },
      { de: "sechs", ipa: "zɛks", en: "chs = [ks]" },
    ],
    mistakes: [
      { wrong: "Wasser with [w] as in English 'water'", right: "[ˈvasɐ]", why: "German w = [v]." },
      { wrong: "Vater with [v]", right: "[ˈfaːtɐ]", why: "German v = [f] in native words." },
      { wrong: "sch pronounced [sk]", right: "[ʃ]", why: "Schule = [ˈʃuːlə]." },
      { wrong: "Final -en fully pronounced ('machEN')", right: "[ˈmaxn̩]", why: "The e is reduced or dropped in normal speech." },
      { wrong: "Glottal stop missing before vowels", right: "am ʔAnfang", why: "German separates words with a light glottal stop." },
    ],
  },
];
