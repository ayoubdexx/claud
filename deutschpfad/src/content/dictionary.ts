import type { DictionaryEntry } from "@/lib/types";

/**
 * Additional dictionary entries. The full dictionary is built at runtime by
 * merging every vocabulary deck with this list (see src/content/index.ts),
 * which keeps a single source of truth for words used in lessons.
 */
export const extraDictionaryEntries: DictionaryEntry[] = [
  {
    id: "d-anmeldung", de: "Anmeldung", article: "die", plural: "die Anmeldungen", pos: "noun",
    en: ["registration", "sign-up", "check-in"], ipa: "ˈanmɛldʊŋ", level: "A2", topic: "bureaucracy",
    examples: [
      { de: "Die Anmeldung beim Einwohnermeldeamt ist innerhalb von 14 Tagen Pflicht.", en: "Registration at the residents' office is obligatory within 14 days." },
    ],
    synonyms: ["die Registrierung"], opposites: ["die Abmeldung"],
    expressions: [{ de: "sich anmelden", en: "to register" }],
    verb: "anmelden",
  },
  {
    id: "d-aufenthaltstitel", de: "Aufenthaltstitel", article: "der", plural: "die Aufenthaltstitel", pos: "noun",
    en: ["residence permit"], ipa: "ˈaʊfɛnthalt͡sˌtiːtl̩", level: "B1", topic: "bureaucracy",
    examples: [{ de: "Für die Ausbildung brauchen Sie einen gültigen Aufenthaltstitel.", en: "You need a valid residence permit for the training." }],
    expressions: [{ de: "die Aufenthaltserlaubnis", en: "residence permit (general term)" }],
  },
  {
    id: "d-bescheid", de: "Bescheid", article: "der", plural: "die Bescheide", pos: "noun",
    en: ["official decision", "notification"], ipa: "bəˈʃaɪt", level: "B1", topic: "bureaucracy",
    examples: [{ de: "Der Bescheid der Behörde kam nach sechs Wochen.", en: "The authority's decision arrived after six weeks." }],
    expressions: [
      { de: "Bescheid geben", en: "to let someone know" },
      { de: "Bescheid wissen", en: "to be in the know" },
    ],
  },
  {
    id: "d-bewerbung", de: "Bewerbung", article: "die", plural: "die Bewerbungen", pos: "noun",
    en: ["application"], ipa: "bəˈvɛʁbʊŋ", level: "A2", topic: "work",
    examples: [{ de: "Ich habe meine Bewerbung gestern abgeschickt.", en: "I sent off my application yesterday." }],
    expressions: [{ de: "sich um eine Stelle bewerben", en: "to apply for a job" }],
    verb: "sich bewerben",
  },
  {
    id: "d-lebenslauf", de: "Lebenslauf", article: "der", plural: "die Lebensläufe", pos: "noun",
    en: ["CV", "résumé"], ipa: "ˈleːbn̩sˌlaʊf", level: "A2", topic: "work",
    examples: [{ de: "Der Lebenslauf sollte tabellarisch und maximal zwei Seiten lang sein.", en: "The CV should be in table form and at most two pages long." }],
    expressions: [{ de: "tabellarischer Lebenslauf", en: "tabular CV" }],
  },
  {
    id: "d-anschreiben", de: "Anschreiben", article: "das", plural: "die Anschreiben", pos: "noun",
    en: ["cover letter"], ipa: "ˈanˌʃʁaɪbn̩", level: "B1", topic: "work",
    examples: [{ de: "Im Anschreiben erklären Sie, warum Sie sich für diese Stelle interessieren.", en: "In the cover letter you explain why you're interested in this position." }],
  },
  {
    id: "d-zeugnis", de: "Zeugnis", article: "das", plural: "die Zeugnisse", pos: "noun",
    en: ["certificate", "school report", "reference"], ipa: "ˈt͡sɔɪknɪs", level: "A2", topic: "education",
    examples: [{ de: "Bitte legen Sie beglaubigte Kopien Ihrer Zeugnisse bei.", en: "Please enclose certified copies of your certificates." }],
    expressions: [{ de: "das Arbeitszeugnis", en: "employment reference" }],
  },
  {
    id: "d-versicherung", de: "Versicherung", article: "die", plural: "die Versicherungen", pos: "noun",
    en: ["insurance"], ipa: "fɛɐ̯ˈzɪçəʁʊŋ", level: "A2", topic: "bureaucracy",
    examples: [{ de: "In Deutschland ist eine Krankenversicherung Pflicht.", en: "Health insurance is obligatory in Germany." }],
    expressions: [{ de: "die Haftpflichtversicherung", en: "liability insurance" }],
  },
  {
    id: "d-steuer", de: "Steuer", article: "die", plural: "die Steuern", pos: "noun",
    en: ["tax"], ipa: "ˈʃtɔɪ̯ɐ", level: "B1", topic: "bureaucracy",
    examples: [{ de: "Die Lohnsteuer wird direkt vom Gehalt abgezogen.", en: "Income tax is deducted directly from your salary." }],
    expressions: [{ de: "die Steuererklärung", en: "tax return" }, { de: "die Steuerklasse", en: "tax bracket" }],
  },
  {
    id: "d-kuendigungsfrist", de: "Kündigungsfrist", article: "die", plural: "die Kündigungsfristen", pos: "noun",
    en: ["notice period"], ipa: "ˈkʏndɪɡʊŋsˌfʁɪst", level: "B2", topic: "work",
    examples: [{ de: "Die Kündigungsfrist beträgt drei Monate zum Quartalsende.", en: "The notice period is three months to the end of the quarter." }],
  },
  {
    id: "d-schichtdienst", de: "Schichtdienst", article: "der", plural: "die Schichtdienste", pos: "noun",
    en: ["shift work"], ipa: "ˈʃɪçtˌdiːnst", level: "B1", topic: "work",
    examples: [{ de: "In der Pflege arbeitet man häufig im Schichtdienst.", en: "In nursing you often work shifts." }],
    expressions: [{ de: "die Frühschicht / Spätschicht / Nachtschicht", en: "early / late / night shift" }],
  },
  {
    id: "d-sorgfaeltig", de: "sorgfältig", pos: "adjective",
    en: ["careful", "thorough"], ipa: "ˈzɔʁkfɛltɪç", level: "B1", topic: "work",
    examples: [{ de: "Sie arbeitet sehr sorgfältig und macht kaum Fehler.", en: "She works very carefully and hardly makes mistakes." }],
    synonyms: ["gründlich", "genau"], opposites: ["nachlässig"],
  },
  {
    id: "d-zuverlaessig", de: "zuverlässig", pos: "adjective",
    en: ["reliable", "dependable"], ipa: "ˈt͡suːfɛɐ̯ˌlɛsɪç", level: "B1", topic: "work",
    examples: [{ de: "Herr Aziz ist ein zuverlässiger Mitarbeiter.", en: "Mr Aziz is a reliable employee." }],
    synonyms: ["verlässlich"], opposites: ["unzuverlässig"],
  },
  {
    id: "d-belastbar", de: "belastbar", pos: "adjective",
    en: ["resilient", "able to work under pressure"], ipa: "bəˈlastbaːɐ̯", level: "B2", topic: "work",
    examples: [{ de: "Wir suchen eine belastbare Person für den Nachtdienst.", en: "We're looking for a resilient person for night duty." }],
    expressions: [{ de: "körperlich belastbar", en: "physically fit for demanding work" }],
  },
  {
    id: "d-einarbeitung", de: "Einarbeitung", article: "die", plural: "die Einarbeitungen", pos: "noun",
    en: ["onboarding", "induction"], ipa: "ˈaɪnˌʔaʁbaɪtʊŋ", level: "B2", topic: "work",
    examples: [{ de: "Die Einarbeitung dauert etwa vier Wochen.", en: "The induction takes about four weeks." }],
  },
  {
    id: "d-uebrigens", de: "übrigens", pos: "adverb",
    en: ["by the way", "incidentally"], ipa: "ˈyːbʁɪɡn̩s", level: "A2", topic: "discourse",
    examples: [{ de: "Übrigens, der Kurs beginnt eine Woche früher.", en: "By the way, the course starts a week earlier." }],
  },
  {
    id: "d-allerdings", de: "allerdings", pos: "adverb",
    en: ["however", "although", "admittedly"], ipa: "ˈalɐˌdɪŋs", level: "B1", topic: "discourse",
    examples: [{ de: "Die Wohnung ist schön, allerdings ist die Miete hoch.", en: "The flat is nice; however, the rent is high." }],
    synonyms: ["jedoch", "freilich"],
  },
  {
    id: "d-deshalb", de: "deshalb", pos: "adverb",
    en: ["therefore", "that's why"], ipa: "ˈdɛshalp", level: "A2", topic: "discourse",
    examples: [{ de: "Es regnete, deshalb sind wir zu Hause geblieben.", en: "It was raining, that's why we stayed at home." }],
    synonyms: ["deswegen", "darum", "folglich"],
  },
  {
    id: "d-trotzdem", de: "trotzdem", pos: "adverb",
    en: ["nevertheless", "anyway"], ipa: "ˈtʁɔt͡sdeːm", level: "A2", topic: "discourse",
    examples: [{ de: "Es war spät. Trotzdem haben wir weitergelernt.", en: "It was late. Nevertheless we kept studying." }],
  },
  {
    id: "d-beziehungsweise", de: "beziehungsweise", pos: "conjunction",
    en: ["or rather", "respectively"], ipa: "bəˈt͡siːʊŋsˌvaɪzə", level: "B2", topic: "discourse",
    examples: [{ de: "Der Kurs findet montags bzw. mittwochs statt.", en: "The course takes place on Mondays or Wednesdays respectively." }],
    expressions: [{ de: "bzw. (Abkürzung)", en: "abbreviation of beziehungsweise" }],
  },
  {
    id: "d-anlagenmechaniker", de: "Anlagenmechaniker", article: "der", plural: "die Anlagenmechaniker", pos: "noun",
    en: ["plant mechanic (heating/sanitary)"], ipa: "ˈanlaːɡn̩meçaˌniːkɐ", level: "B1", topic: "professions",
    examples: [{ de: "Er macht eine Ausbildung als Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik.", en: "He is training as a plant mechanic for sanitary, heating and air-conditioning technology." }],
  },
  {
    id: "d-pflegefachkraft", de: "Pflegefachkraft", article: "die", plural: "die Pflegefachkräfte", pos: "noun",
    en: ["qualified nurse", "care professional"], ipa: "ˈpfleːɡəfaxˌkʁaft", level: "B1", topic: "professions",
    examples: [{ de: "Pflegefachkräfte werden in ganz Deutschland gesucht.", en: "Qualified nurses are sought throughout Germany." }],
  },
  {
    id: "d-baustelle", de: "Baustelle", article: "die", plural: "die Baustellen", pos: "noun",
    en: ["building site"], ipa: "ˈbaʊˌʃtɛlə", level: "A2", topic: "construction",
    examples: [{ de: "Auf der Baustelle ist ein Helm Pflicht.", en: "A helmet is obligatory on the building site." }],
    expressions: [{ de: "die Baustellenordnung", en: "site rules" }],
  },
  {
    id: "d-werkzeug", de: "Werkzeug", article: "das", plural: "die Werkzeuge", pos: "noun",
    en: ["tool"], ipa: "ˈvɛʁkˌt͡sɔɪ̯k", level: "A2", topic: "construction",
    examples: [{ de: "Räum bitte das Werkzeug in den Kasten.", en: "Please put the tools back in the box." }],
  },
  {
    id: "d-sicherheitsvorschrift", de: "Sicherheitsvorschrift", article: "die", plural: "die Sicherheitsvorschriften", pos: "noun",
    en: ["safety regulation"], ipa: "ˈzɪçɐhaɪt͡sˌfoːɐ̯ʃʁɪft", level: "B1", topic: "construction",
    examples: [{ de: "Bitte beachten Sie alle Sicherheitsvorschriften.", en: "Please observe all safety regulations." }],
  },
  {
    id: "d-blutdruck", de: "Blutdruck", article: "der", plural: "—", pos: "noun",
    en: ["blood pressure"], ipa: "ˈbluːtˌdʁʊk", level: "B1", topic: "healthcare",
    examples: [{ de: "Ich messe jetzt Ihren Blutdruck.", en: "I'll measure your blood pressure now." }],
  },
  {
    id: "d-medikament", de: "Medikament", article: "das", plural: "die Medikamente", pos: "noun",
    en: ["medicine", "medication"], ipa: "medikaˈmɛnt", level: "A2", topic: "healthcare",
    examples: [{ de: "Nehmen Sie das Medikament dreimal täglich nach dem Essen.", en: "Take the medicine three times a day after meals." }],
  },
  {
    id: "d-bewohner", de: "Bewohner", article: "der", plural: "die Bewohner", pos: "noun",
    en: ["resident"], ipa: "bəˈvoːnɐ", level: "B1", topic: "healthcare",
    examples: [{ de: "Die Bewohnerin in Zimmer 12 braucht Hilfe beim Aufstehen.", en: "The resident in room 12 needs help getting up." }],
  },
  {
    id: "d-uebergabe", de: "Übergabe", article: "die", plural: "die Übergaben", pos: "noun",
    en: ["handover"], ipa: "ˈyːbɐˌɡaːbə", level: "B2", topic: "healthcare",
    examples: [{ de: "Die Übergabe findet um 14 Uhr im Stationszimmer statt.", en: "The handover takes place at 2 pm in the ward office." }],
  },
  {
    id: "d-angebot-erstellen", de: "ein Angebot erstellen", pos: "phrase",
    en: ["to prepare a quotation"], ipa: "aɪn ˈanɡəboːt ɛɐ̯ˈʃtɛlən", level: "B2", topic: "office",
    examples: [{ de: "Können Sie bis Freitag ein Angebot erstellen?", en: "Can you prepare a quotation by Friday?" }],
  },
  {
    id: "d-rueckfrage", de: "Rückfrage", article: "die", plural: "die Rückfragen", pos: "noun",
    en: ["follow-up question", "query"], ipa: "ˈʁʏkˌfʁaːɡə", level: "B2", topic: "office",
    examples: [{ de: "Bei Rückfragen stehe ich Ihnen gern zur Verfügung.", en: "If you have any questions, I'll be glad to help." }],
  },
  {
    id: "d-verfuegung", de: "zur Verfügung stehen", pos: "phrase",
    en: ["to be available"], ipa: "t͡suːɐ̯ fɛɐ̯ˈfyːɡʊŋ ˈʃteːən", level: "B2", topic: "office",
    examples: [{ de: "Ich stehe Ihnen ab dem 1. September zur Verfügung.", en: "I am available from 1 September." }],
  },
];
