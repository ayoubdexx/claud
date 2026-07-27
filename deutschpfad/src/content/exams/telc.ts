import type { MockExam } from "@/lib/types";

export const telcExams: MockExam[] = [
  {
    slug: "telc-a2-mock-1",
    provider: "telc",
    level: "A2",
    title: "telc Deutsch A2 — Mock exam 1",
    officialName: "telc Deutsch A2",
    minutes: 85,
    passMark: 60,
    description:
      "Schriftliche Prüfung (70 min: Hörverstehen, Leseverstehen, Sprachbausteine, Schreiben) plus mündliche Prüfung (ca. 15 min in Paaren).",
    strategies: [
      { title: "Sprachbausteine are pure grammar", body: "telc always includes a gap-fill grammar section. Revise articles, prepositions and verb position — that is 80 % of the points." },
      { title: "Answer sheet discipline", body: "telc uses an Antwortbogen. Transfer your answers with 5 minutes left, and never leave a gap blank." },
      { title: "Speaking is paired", body: "Part 1 introduce yourself, part 2 talk about a topic, part 3 plan something together. Ask your partner questions — interaction is graded." },
    ],
    sections: [
      {
        id: "telc-a2-lesen",
        skill: "reading",
        title: "Leseverstehen & Sprachbausteine",
        minutes: 30,
        maxPoints: 25,
        weight: 30,
        parts: [
          {
            id: "telc-a2-lesen-1",
            title: "Teil 1 — Kurztexte",
            instructions: "Lesen Sie die Texte und entscheiden Sie.",
            skill: "reading",
            minutes: 15,
            maxPoints: 15,
            reading: [
              "Sprachschule Aktiv — Sommerangebot: Intensivkurs A2, 4 Wochen, Montag bis Freitag 9–12 Uhr, 320 €. Kleine Gruppen (max. 10 Personen). Kostenloser Einstufungstest. Anmeldung bis 15. Juni.",
              "Stadtbibliothek Leipzig: Ab September neuer Lesekreis „Einfach Deutsch“ für Lernende ab A2. Jeden zweiten Dienstag, 17–18:30 Uhr, kostenlos. Anmeldung per E-Mail an lesekreis@bibliothek-leipzig.de",
            ],
            items: [
              {
                id: "t-a2-l1-1", type: "multiple-choice",
                prompt: "Wie lange dauert der Intensivkurs?",
                options: ["2 Wochen", "4 Wochen", "6 Wochen", "3 Monate"],
                answerIndex: 1, explanation: "„4 Wochen“.", skill: "reading", points: 3,
              },
              {
                id: "t-a2-l1-2", type: "true-false",
                prompt: "Der Einstufungstest kostet extra.", answer: false,
                explanation: "„Kostenloser Einstufungstest“.", skill: "reading", points: 3,
              },
              {
                id: "t-a2-l1-3", type: "multiple-choice",
                prompt: "Wie oft trifft sich der Lesekreis?",
                options: ["Jeden Tag", "Jede Woche", "Jeden zweiten Dienstag", "Einmal im Monat"],
                answerIndex: 2, explanation: "„Jeden zweiten Dienstag“.", skill: "reading", points: 3,
              },
              {
                id: "t-a2-l1-4", type: "multiple-choice",
                prompt: "Sie arbeiten vormittags. Welches Angebot passt?",
                options: ["Der Intensivkurs", "Der Lesekreis", "Beide", "Keins"],
                answerIndex: 1, explanation: "Der Lesekreis ist am Abend.", skill: "reading", points: 3,
              },
              {
                id: "t-a2-l1-5", type: "fill-blank",
                prompt: "Bis wann ist die Anmeldung für den Kurs möglich?",
                sentence: "Bis zum ___. ___.", answers: [["15"], ["Juni"]],
                explanation: "„Anmeldung bis 15. Juni“.", skill: "reading", points: 3,
              },
            ],
          },
          {
            id: "telc-a2-bausteine",
            title: "Teil 2 — Sprachbausteine",
            instructions: "Welches Wort passt? Wählen Sie a, b oder c.",
            skill: "grammar",
            minutes: 15,
            maxPoints: 10,
            reading: [
              "Liebe Frau Berger,\n\nich kann morgen leider nicht ___ (1) Unterricht kommen, weil ich ___ (2) Arzt gehen muss. Können Sie mir sagen, ___ (3) wir für Freitag machen sollen? Ich möchte ___ (4) verpassen.\n\nMit freundlichen Grüßen\nNour",
            ],
            items: [
              {
                id: "t-a2-b-1", type: "multiple-choice",
                prompt: "Lücke 1", options: ["zum", "zur", "in den"], answerIndex: 0,
                explanation: "zu dem Unterricht → zum Unterricht.", skill: "grammar", points: 2, grammar: "dativ",
              },
              {
                id: "t-a2-b-2", type: "multiple-choice",
                prompt: "Lücke 2", options: ["zu", "zum", "nach"], answerIndex: 1,
                explanation: "zum Arzt gehen.", skill: "grammar", points: 3, grammar: "dativ",
              },
              {
                id: "t-a2-b-3", type: "multiple-choice",
                prompt: "Lücke 3", options: ["was", "dass", "ob"], answerIndex: 0,
                explanation: "Indirekte W-Frage: was wir machen sollen.", skill: "grammar", points: 3, grammar: "indirekte-fragen",
              },
              {
                id: "t-a2-b-4", type: "multiple-choice",
                prompt: "Lücke 4", options: ["nichts", "nicht", "kein"], answerIndex: 0,
                explanation: "nichts verpassen = miss nothing.", skill: "grammar", points: 2, grammar: "negation-nicht-kein",
              },
            ],
          },
        ],
      },
      {
        id: "telc-a2-hoeren",
        skill: "listening",
        title: "Hörverstehen",
        minutes: 20,
        maxPoints: 15,
        weight: 25,
        parts: [
          {
            id: "telc-a2-hoeren-1",
            title: "Teil 1 — Alltagssituationen",
            instructions: "Sie hören drei kurze Texte.",
            skill: "listening",
            minutes: 20,
            maxPoints: 15,
            playLimit: 2,
            audio: [
              { speaker: "Ansage", de: "Achtung: Die Buslinie neunundsiebzig fährt heute wegen einer Baustelle nicht bis zum Krankenhaus, sondern nur bis zur Marktstraße." },
              { speaker: "Kollege", de: "Kannst du morgen die Frühschicht übernehmen? Ich habe einen Zahnarzttermin um acht." },
              { speaker: "Mailbox", de: "Guten Tag, Frau Benali, Praxis Dr. Hoffmann. Ihr Termin am Freitag um neun Uhr dreißig ist bestätigt. Bringen Sie bitte Ihre Versichertenkarte mit." },
            ],
            items: [
              {
                id: "t-a2-h-1", type: "multiple-choice",
                prompt: "Wo endet die Buslinie 79 heute?",
                options: ["Am Krankenhaus", "An der Marktstraße", "Am Bahnhof", "Am Markt 79"],
                answerIndex: 1, explanation: "„nur bis zur Marktstraße“.", skill: "listening", points: 5,
              },
              {
                id: "t-a2-h-2", type: "multiple-choice",
                prompt: "Was möchte der Kollege?",
                options: ["Einen freien Tag", "Dass jemand die Frühschicht übernimmt", "Einen Zahnarzttermin buchen", "Später kommen"],
                answerIndex: 1, explanation: "„Kannst du morgen die Frühschicht übernehmen?“", skill: "listening", points: 5,
              },
              {
                id: "t-a2-h-3", type: "fill-blank",
                prompt: "Wann ist der Termin?",
                sentence: "Freitag um ___ Uhr ___.",
                answers: [["9", "neun"], ["30", "dreißig"]],
                explanation: "9:30.", skill: "listening", points: 5,
              },
            ],
          },
        ],
      },
      {
        id: "telc-a2-schreiben",
        skill: "writing",
        title: "Schreiben",
        minutes: 20,
        maxPoints: 15,
        weight: 20,
        parts: [
          {
            id: "telc-a2-schreiben-1",
            title: "Eine Mitteilung schreiben",
            instructions:
              "Ihre Kollegin hat Geburtstag. Schreiben Sie eine Einladung an drei Kollegen: Anlass, Ort und Zeit, Bitte um Rückmeldung.",
            skill: "writing",
            minutes: 20,
            maxPoints: 15,
            items: [
              {
                id: "t-a2-s-1", type: "writing",
                prompt: "Schreiben Sie die Einladung (ca. 40 Wörter).",
                minWords: 40,
                checklist: ["Anrede", "Anlass", "Ort und Zeit", "Bitte um Antwort", "Gruß"],
                sampleAnswer:
                  "Hallo alle,\n\nam Freitag hat Lena Geburtstag. Wir möchten sie überraschen und treffen uns um 15 Uhr im Pausenraum. Es gibt Kuchen und Kaffee. Bitte sagt mir bis Mittwoch, ob ihr kommt.\n\nViele Grüße\nKarim",
                skill: "writing", points: 15,
              },
            ],
          },
        ],
      },
      {
        id: "telc-a2-sprechen",
        skill: "speaking",
        title: "Mündliche Prüfung",
        minutes: 15,
        maxPoints: 15,
        weight: 25,
        parts: [
          {
            id: "telc-a2-sprechen-1",
            title: "Teil 1–3",
            instructions: "Sich vorstellen, über ein Thema sprechen, gemeinsam planen.",
            skill: "speaking",
            minutes: 15,
            maxPoints: 15,
            items: [
              {
                id: "t-a2-sp-1", type: "speaking",
                prompt: "Teil 1: Stellen Sie sich vor (Name, Herkunft, Wohnort, Arbeit, Sprachen, Hobby).",
                target: "Ich heiße Nour Benali, ich komme aus Marokko und wohne seit acht Monaten in Leipzig. Ich arbeite in einem Café und lerne abends Deutsch.",
                skill: "speaking", points: 5,
              },
              {
                id: "t-a2-sp-2", type: "speaking",
                prompt: "Teil 2: Thema „Einkaufen“ — erzählen Sie, wo und wie oft Sie einkaufen.",
                target: "Ich kaufe meistens am Samstagmorgen im Supermarkt ein, weil dann noch nicht so viele Leute da sind. Obst und Gemüse kaufe ich lieber auf dem Markt.",
                skill: "speaking", points: 5,
              },
              {
                id: "t-a2-sp-3", type: "speaking",
                prompt: "Teil 3: Planen Sie mit Ihrem Partner ein gemeinsames Abendessen.",
                target: "Wollen wir am Samstag zusammen kochen? Ich schlage 18 Uhr bei mir vor. Kannst du Salat mitbringen?",
                skill: "speaking", points: 5,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "telc-b1-mock-1",
    provider: "telc",
    level: "B1",
    title: "telc Deutsch B1 — Mock exam 1",
    officialName: "telc Deutsch B1 / Zertifikat Deutsch",
    minutes: 170,
    passMark: 60,
    description:
      "Schriftliche Prüfung (150 min: Leseverstehen, Sprachbausteine, Hörverstehen, Schreiben) und mündliche Prüfung (ca. 15 min).",
    strategies: [
      { title: "Sprachbausteine Teil 1 & 2", body: "Teil 1 tests grammar in context, Teil 2 tests fixed expressions and connectors. Learn the connector list by heart." },
      { title: "Letter task has fixed points", body: "The written task always lists content points. Number them in your draft and tick them off." },
      { title: "Speaking part 3 = agreement", body: "You must reach a joint decision. Say the final arrangement out loud: „Also, wir machen …“" },
    ],
    sections: [
      {
        id: "telc-b1-lesen",
        skill: "reading",
        title: "Leseverstehen & Sprachbausteine",
        minutes: 60,
        maxPoints: 30,
        weight: 30,
        parts: [
          {
            id: "telc-b1-lesen-1",
            title: "Teil 1 — Überschriften zuordnen",
            instructions: "Welche Überschrift passt zu welchem Absatz?",
            skill: "reading",
            minutes: 20,
            maxPoints: 12,
            reading: [
              "1) Wer eine Ausbildung beginnt, unterschreibt einen Vertrag mit dem Betrieb. Darin stehen Beginn, Dauer, Arbeitszeit und die monatliche Vergütung.",
              "2) Neben der Arbeit im Betrieb besuchen Auszubildende die Berufsschule. Dort werden Fachtheorie, Mathematik und Deutsch unterrichtet.",
              "3) Am Ende steht eine Prüfung vor der Kammer. Sie besteht aus einem schriftlichen und einem praktischen Teil.",
              "4) Nach dem Abschluss kann man sich weiterqualifizieren, zum Beispiel zum Meister oder Techniker.",
            ],
            items: [
              {
                id: "t-b1-l1-1", type: "match",
                prompt: "Ordnen Sie die Überschriften zu.",
                pairs: [
                  { left: "Der Ausbildungsvertrag", right: "Absatz 1" },
                  { left: "Lernen in der Berufsschule", right: "Absatz 2" },
                  { left: "Die Abschlussprüfung", right: "Absatz 3" },
                  { left: "Wege nach der Ausbildung", right: "Absatz 4" },
                ],
                explanation: "Jeder Absatz hat ein klares Thema.", skill: "reading", points: 8,
              },
              {
                id: "t-b1-l1-2", type: "multiple-choice",
                prompt: "Woraus besteht die Abschlussprüfung?",
                options: ["Nur schriftlich", "Nur praktisch", "Schriftlich und praktisch", "Mündlich und schriftlich"],
                answerIndex: 2, explanation: "Absatz 3.", skill: "reading", points: 4,
              },
            ],
          },
          {
            id: "telc-b1-bausteine",
            title: "Teil 2 — Sprachbausteine",
            instructions: "Wählen Sie das passende Wort.",
            skill: "grammar",
            minutes: 20,
            maxPoints: 12,
            reading: [
              "Sehr geehrte Damen und Herren,\n\nich habe Ihre Anzeige gelesen und interessiere mich ___ (1) den Ausbildungsplatz. ___ (2) ich noch keine Erfahrung in Deutschland habe, arbeite ich seit zwei Jahren in einer Werkstatt. Ich würde mich freuen, ___ (3) Sie mich zu einem Gespräch einladen. Meine Unterlagen finden Sie ___ (4) Anhang.",
            ],
            items: [
              {
                id: "t-b1-b-1", type: "multiple-choice",
                prompt: "Lücke 1", options: ["für", "auf", "über"], answerIndex: 0,
                explanation: "sich interessieren für.", skill: "grammar", points: 3, grammar: "verben-mit-praeposition",
              },
              {
                id: "t-b1-b-2", type: "multiple-choice",
                prompt: "Lücke 2", options: ["Weil", "Obwohl", "Damit"], answerIndex: 1,
                explanation: "Konzessiv: obwohl ich keine Erfahrung habe.", skill: "grammar", points: 3, grammar: "nebensaetze-a2",
              },
              {
                id: "t-b1-b-3", type: "multiple-choice",
                prompt: "Lücke 3", options: ["dass", "wenn", "ob"], answerIndex: 0,
                explanation: "sich freuen, dass …", skill: "grammar", points: 3, grammar: "nebensaetze-a2",
              },
              {
                id: "t-b1-b-4", type: "multiple-choice",
                prompt: "Lücke 4", options: ["in", "im", "am"], answerIndex: 1,
                explanation: "im Anhang.", skill: "grammar", points: 3, grammar: "wechselpraepositionen",
              },
            ],
          },
          {
            id: "telc-b1-lesen-3",
            title: "Teil 3 — Anzeigen und Personen",
            instructions: "Welche Anzeige passt zu welcher Person?",
            skill: "reading",
            minutes: 20,
            maxPoints: 6,
            reading: [
              "A) Minijob im Lager, 12 €/h, flexible Abendstunden.",
              "B) Deutschkurs mit Kinderbetreuung, vormittags, gefördert.",
              "C) Praktikum im Krankenhaus, 4 Wochen, ab B1.",
            ],
            items: [
              {
                id: "t-b1-l3-1", type: "multiple-choice",
                prompt: "Amina hat ein kleines Kind und möchte vormittags lernen.",
                options: ["A", "B", "C"], answerIndex: 1,
                explanation: "Kurs mit Kinderbetreuung.", skill: "reading", points: 3,
              },
              {
                id: "t-b1-l3-2", type: "multiple-choice",
                prompt: "Yassin möchte Erfahrung in der Pflege sammeln.",
                options: ["A", "B", "C"], answerIndex: 2,
                explanation: "Praktikum im Krankenhaus.", skill: "reading", points: 3,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b1-hoeren",
        skill: "listening",
        title: "Hörverstehen",
        minutes: 30,
        maxPoints: 25,
        weight: 25,
        parts: [
          {
            id: "telc-b1-hoeren-1",
            title: "Teil 1 — Globalverstehen",
            instructions: "Sie hören fünf kurze Texte einmal.",
            skill: "listening",
            minutes: 15,
            maxPoints: 15,
            playLimit: 1,
            audio: [
              { speaker: "Ansage", de: "Wegen eines technischen Problems öffnet die Bibliothek heute erst um vierzehn Uhr." },
              { speaker: "Chef", de: "Frau Benali, könnten Sie morgen zwei Stunden früher anfangen? Wir erwarten eine große Lieferung." },
              { speaker: "Radio", de: "Am Wochenende bleibt es kühl, am Sonntag steigen die Temperaturen auf achtzehn Grad." },
              { speaker: "Freundin", de: "Ich habe die Wohnung bekommen! Ich ziehe am ersten Oktober ein." },
              { speaker: "Arzt", de: "Nehmen Sie die Tabletten dreimal täglich nach dem Essen, aber maximal eine Woche." },
            ],
            items: [
              {
                id: "t-b1-h-1", type: "multiple-choice",
                prompt: "Wann öffnet die Bibliothek?",
                options: ["10 Uhr", "12 Uhr", "14 Uhr", "16 Uhr"], answerIndex: 2,
                explanation: "„erst um vierzehn Uhr“.", skill: "listening", points: 3,
              },
              {
                id: "t-b1-h-2", type: "multiple-choice",
                prompt: "Was möchte der Chef?",
                options: ["Später anfangen", "Zwei Stunden früher anfangen", "Überstunden am Abend", "Urlaub verschieben"],
                answerIndex: 1, explanation: "„zwei Stunden früher anfangen“.", skill: "listening", points: 3,
              },
              {
                id: "t-b1-h-3", type: "fill-blank",
                prompt: "Wie warm wird es am Sonntag?",
                sentence: "___ Grad.", answers: [["18", "achtzehn"]],
                explanation: "18 Grad.", skill: "listening", points: 3,
              },
              {
                id: "t-b1-h-4", type: "fill-blank",
                prompt: "Wann zieht die Freundin ein?",
                sentence: "Am ___. ___.", answers: [["1", "ersten"], ["Oktober"]],
                explanation: "1. Oktober.", skill: "listening", points: 3,
              },
              {
                id: "t-b1-h-5", type: "multiple-choice",
                prompt: "Wie oft soll man die Tabletten nehmen?",
                options: ["Einmal täglich", "Zweimal täglich", "Dreimal täglich", "Nach Bedarf"],
                answerIndex: 2, explanation: "„dreimal täglich nach dem Essen“.", skill: "listening", points: 3,
              },
            ],
          },
          {
            id: "telc-b1-hoeren-2",
            title: "Teil 2 — Detailverstehen",
            instructions: "Sie hören ein Gespräch zweimal.",
            skill: "listening",
            minutes: 15,
            maxPoints: 10,
            playLimit: 2,
            audio: [
              { speaker: "Beraterin", de: "Für die Anerkennung Ihres Abschlusses brauchen wir das Originalzeugnis und eine beglaubigte Übersetzung." },
              { speaker: "Karim", de: "Wie lange dauert das Verfahren?" },
              { speaker: "Beraterin", de: "In der Regel drei bis vier Monate. Wenn Unterlagen fehlen, dauert es länger." },
              { speaker: "Karim", de: "Und was kostet es?" },
              { speaker: "Beraterin", de: "Die Gebühr liegt zwischen hundert und sechshundert Euro, je nach Beruf. In manchen Fällen übernimmt die Arbeitsagentur die Kosten." },
            ],
            items: [
              {
                id: "t-b1-h2-1", type: "multiple-choice",
                prompt: "Welche Unterlagen sind nötig?",
                options: [
                  "Nur das Originalzeugnis",
                  "Originalzeugnis und beglaubigte Übersetzung",
                  "Nur eine Kopie",
                  "Ein Sprachzertifikat",
                ],
                answerIndex: 1, explanation: "Erster Beitrag.", skill: "listening", points: 4,
              },
              {
                id: "t-b1-h2-2", type: "multiple-choice",
                prompt: "Wie lange dauert das Verfahren normalerweise?",
                options: ["1 Monat", "3–4 Monate", "6 Monate", "1 Jahr"],
                answerIndex: 1, explanation: "„drei bis vier Monate“.", skill: "listening", points: 3,
              },
              {
                id: "t-b1-h2-3", type: "true-false",
                prompt: "Die Arbeitsagentur kann die Kosten übernehmen.", answer: true,
                explanation: "„In manchen Fällen übernimmt die Arbeitsagentur die Kosten.“", skill: "listening", points: 3,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b1-schreiben",
        skill: "writing",
        title: "Schreiben",
        minutes: 30,
        maxPoints: 25,
        weight: 25,
        parts: [
          {
            id: "telc-b1-schreiben-1",
            title: "Brief / E-Mail",
            instructions:
              "Sie haben einen Deutschkurs gebucht, können aber nicht teilnehmen. Schreiben Sie an die Sprachschule: Situation erklären, Frage zur Rückzahlung, Bitte um Alternative (ca. 80 Wörter).",
            skill: "writing",
            minutes: 30,
            maxPoints: 25,
            items: [
              {
                id: "t-b1-s-1", type: "writing",
                prompt: "Schreiben Sie den Brief.",
                minWords: 80,
                checklist: [
                  "formelle Anrede und Grußformel",
                  "Bezug (Kurs, Datum, Buchungsnummer)",
                  "Grund erklärt",
                  "Frage zur Rückzahlung",
                  "Bitte um Alternative",
                ],
                sampleAnswer:
                  "Sehr geehrte Damen und Herren,\n\nich habe am 3. Juni den Abendkurs B1 (Buchungsnummer 4471) gebucht. Leider hat mein Arbeitgeber meinen Dienstplan geändert, sodass ich dienstags und donnerstags arbeiten muss und den Kurs nicht besuchen kann.\n\nKönnten Sie mir bitte mitteilen, ob eine Rückzahlung der Kursgebühr möglich ist? Alternativ würde ich gern in einen Samstagskurs wechseln, falls noch Plätze frei sind.\n\nVielen Dank für Ihre Hilfe.\n\nMit freundlichen Grüßen\nKarim Aziz",
                skill: "writing", points: 25,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b1-sprechen",
        skill: "speaking",
        title: "Mündliche Prüfung",
        minutes: 15,
        maxPoints: 20,
        weight: 20,
        parts: [
          {
            id: "telc-b1-sprechen-1",
            title: "Teil 1–3",
            instructions: "Kontaktaufnahme, über ein Thema sprechen, gemeinsam eine Aufgabe lösen.",
            skill: "speaking",
            minutes: 15,
            maxPoints: 20,
            items: [
              {
                id: "t-b1-sp-1", type: "speaking",
                prompt: "Teil 1: Kontaktaufnahme — stellen Sie Ihrem Partner drei Fragen.",
                target: "Wie lange lernst du schon Deutsch? Was machst du beruflich? Was möchtest du nach der Prüfung machen?",
                skill: "speaking", points: 5,
              },
              {
                id: "t-b1-sp-2", type: "speaking",
                prompt: "Teil 2: Thema „Arbeit und Freizeit“ — sprechen Sie zwei Minuten.",
                target:
                  "Ich arbeite von Montag bis Freitag und habe am Wochenende frei. Früher habe ich auch samstags gearbeitet, aber das war zu viel. In meiner Freizeit spiele ich Fußball und lerne Deutsch, weil ich eine Ausbildung machen möchte.",
                skill: "speaking", points: 7,
              },
              {
                id: "t-b1-sp-3", type: "speaking",
                prompt: "Teil 3: Planen Sie gemeinsam einen Ausflug für den Deutschkurs.",
                target:
                  "Ich schlage vor, wir fahren am Samstag nach Dresden. Wir könnten uns um acht Uhr am Hauptbahnhof treffen und ein Gruppenticket kaufen. Also, wir machen es so: Treffpunkt acht Uhr, Rückfahrt um achtzehn Uhr.",
                tips: ["Vorschlag machen", "auf den Partner reagieren", "Ergebnis zusammenfassen"],
                skill: "speaking", points: 8,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "telc-b2-mock-1",
    provider: "telc",
    level: "B2",
    title: "telc Deutsch B2 — Mock exam 1",
    officialName: "telc Deutsch B2",
    minutes: 180,
    passMark: 60,
    description:
      "Schriftliche Prüfung (150 min) mit Leseverstehen, Sprachbausteinen, Hörverstehen und einem formellen Schreiben, dazu die mündliche Prüfung (ca. 15 min).",
    strategies: [
      { title: "Register is graded", body: "At B2 telc explicitly grades appropriateness. A formal letter with informal phrases loses points even if the grammar is perfect." },
      { title: "Sprachbausteine test connectors", body: "Learn the B2 connector set: dennoch, folglich, hingegen, zumal, sofern, indem, wobei." },
      { title: "Discussion needs strategies", body: "Interrupt politely, ask for clarification, summarise. These moves are on the assessment grid." },
    ],
    sections: [
      {
        id: "telc-b2-lesen",
        skill: "reading",
        title: "Leseverstehen & Sprachbausteine",
        minutes: 60,
        maxPoints: 30,
        weight: 30,
        parts: [
          {
            id: "telc-b2-lesen-1",
            title: "Teil 1 — Fachtext",
            instructions: "Lesen Sie den Text und wählen Sie die richtige Antwort.",
            skill: "reading",
            minutes: 25,
            maxPoints: 15,
            reading: [
              "Die Anerkennung ausländischer Berufsqualifikationen gilt als Schlüssel zur Integration in den Arbeitsmarkt. Zwar besteht seit 2012 ein gesetzlicher Anspruch auf ein Verfahren, doch die Praxis bleibt komplex: Zuständig sind je nach Beruf unterschiedliche Kammern, Behörden und in einigen Fällen die Bundesländer.",
              "Kritisiert wird vor allem die Dauer. Werden Unterlagen nachgefordert, verlängert sich das Verfahren erheblich; Betroffene berichten von Wartezeiten über ein Jahr. Hinzu kommen Kosten für beglaubigte Übersetzungen, die nicht überall erstattet werden.",
              "Fachleute schlagen daher vor, Verfahren zu digitalisieren und Teilanerkennungen konsequenter zu nutzen. Wer nur einzelne Module nachholen muss, könnte parallel arbeiten, statt auf den vollständigen Bescheid zu warten. Erste Bundesländer erproben dieses Modell mit Erfolg.",
            ],
            items: [
              {
                id: "t-b2-l1-1", type: "multiple-choice",
                prompt: "Was ist seit 2012 gesetzlich geregelt?",
                options: [
                  "Die volle Anerkennung aller Abschlüsse",
                  "Ein Anspruch auf ein Anerkennungsverfahren",
                  "Die Kostenübernahme durch den Staat",
                  "Die Zuständigkeit der Bundesländer",
                ],
                answerIndex: 1, explanation: "Absatz 1.", skill: "reading", points: 5,
              },
              {
                id: "t-b2-l1-2", type: "multiple-choice",
                prompt: "Was verlängert das Verfahren besonders?",
                options: ["Fehlende Sprachkenntnisse", "Nachgeforderte Unterlagen", "Zu viele Anträge", "Fehlende Gebühren"],
                answerIndex: 1, explanation: "Absatz 2.", skill: "reading", points: 5,
              },
              {
                id: "t-b2-l1-3", type: "multiple-choice",
                prompt: "Welchen Vorschlag nennen Fachleute?",
                options: [
                  "Verfahren abschaffen",
                  "Digitalisierung und Teilanerkennungen",
                  "Höhere Gebühren",
                  "Nur EU-Abschlüsse anerkennen",
                ],
                answerIndex: 1, explanation: "Absatz 3.", skill: "reading", points: 5,
              },
            ],
          },
          {
            id: "telc-b2-bausteine",
            title: "Teil 2 — Sprachbausteine",
            instructions: "Wählen Sie den passenden Konnektor bzw. die passende Form.",
            skill: "grammar",
            minutes: 20,
            maxPoints: 9,
            reading: [
              "Das Verfahren dauert lange, ___ (1) viele Bewerber parallel arbeiten möchten. ___ (2) einer Teilanerkennung könnten sie sofort beginnen. Die Unterlagen sind vollständig ___ (3).",
            ],
            items: [
              {
                id: "t-b2-b-1", type: "multiple-choice",
                prompt: "Lücke 1", options: ["zumal", "obwohl", "damit"], answerIndex: 0,
                explanation: "zumal = besonders weil (verstärkender Grund).", skill: "grammar", points: 3,
              },
              {
                id: "t-b2-b-2", type: "multiple-choice",
                prompt: "Lücke 2", options: ["Wegen", "Mithilfe", "Trotz"], answerIndex: 1,
                explanation: "mithilfe + Genitiv = by means of.", skill: "grammar", points: 3, grammar: "genitiv",
              },
              {
                id: "t-b2-b-3", type: "multiple-choice",
                prompt: "Lücke 3", options: ["einzureichen", "eingereicht", "zu einreichen"], answerIndex: 0,
                explanation: "sein + zu + Infinitiv (Passiversatz).", skill: "grammar", points: 3, grammar: "passiversatzformen",
              },
            ],
          },
          {
            id: "telc-b2-lesen-3",
            title: "Teil 3 — Meinungen",
            instructions: "Positiv, negativ oder neutral?",
            skill: "reading",
            minutes: 15,
            maxPoints: 6,
            reading: [
              "A) „Endlich läuft die Anerkennung digital — ich habe den Bescheid nach acht Wochen bekommen.“",
              "B) „Ich habe vierzehn Monate gewartet und musste dreimal Unterlagen nachreichen.“",
              "C) „Das Verfahren ist unterschiedlich, je nach Beruf und Bundesland.“",
            ],
            items: [
              {
                id: "t-b2-l3-1", type: "match",
                prompt: "Ordnen Sie zu.",
                pairs: [
                  { left: "A", right: "positiv" },
                  { left: "B", right: "negativ" },
                  { left: "C", right: "neutral" },
                ],
                explanation: "Signalwörter: endlich (positiv), vierzehn Monate gewartet (negativ), sachliche Feststellung (neutral).",
                skill: "reading", points: 6,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b2-hoeren",
        skill: "listening",
        title: "Hörverstehen",
        minutes: 30,
        maxPoints: 25,
        weight: 25,
        parts: [
          {
            id: "telc-b2-hoeren-1",
            title: "Teil 1 — Interview",
            instructions: "Sie hören das Interview einmal.",
            skill: "listening",
            minutes: 15,
            maxPoints: 13,
            playLimit: 1,
            audio: [
              { speaker: "Moderatorin", de: "Frau Ott, Sie begleiten Betriebe bei der Einarbeitung internationaler Fachkräfte. Was wird am häufigsten unterschätzt?" },
              { speaker: "Frau Ott", de: "Die ersten sechs Wochen. Fachlich sind die meisten sehr gut vorbereitet; was fehlt, ist Orientierung: Wer entscheidet was, wie wird kommuniziert, welche Regeln gelten informell." },
              { speaker: "Moderatorin", de: "Was empfehlen Sie konkret?" },
              { speaker: "Frau Ott", de: "Drei Dinge: eine feste Patin oder einen Paten, ein Glossar der betrieblichen Fachbegriffe und ein kurzes wöchentliches Feedbackgespräch von fünfzehn Minuten." },
              { speaker: "Moderatorin", de: "Und wirkt das messbar?" },
              { speaker: "Frau Ott", de: "Ja. In den von uns begleiteten Betrieben sank die Abbruchquote im ersten Jahr von etwa achtzehn auf sieben Prozent." },
            ],
            items: [
              {
                id: "t-b2-h-1", type: "multiple-choice",
                prompt: "Was wird laut Frau Ott unterschätzt?",
                options: ["Die Fachkenntnisse", "Die ersten sechs Wochen", "Die Bezahlung", "Die Sprachkurse"],
                answerIndex: 1, explanation: "„Die ersten sechs Wochen.“", skill: "listening", points: 4,
              },
              {
                id: "t-b2-h-2", type: "multiple-choice",
                prompt: "Welche drei Maßnahmen empfiehlt sie?",
                options: [
                  "Pate, Glossar, wöchentliches Feedback",
                  "Prämien, Überstunden, Schulungen",
                  "Sprachkurs, Wohnung, Auto",
                  "Mentor, Prüfung, Zertifikat",
                ],
                answerIndex: 0, explanation: "Dritter Beitrag.", skill: "listening", points: 5,
              },
              {
                id: "t-b2-h-3", type: "fill-blank",
                prompt: "Wie veränderte sich die Abbruchquote?",
                sentence: "Von etwa ___ auf ___ Prozent.",
                answers: [["18", "achtzehn"], ["7", "sieben"]],
                explanation: "18 % → 7 %.", skill: "listening", points: 4,
              },
            ],
          },
          {
            id: "telc-b2-hoeren-2",
            title: "Teil 2 — Kurzvorträge",
            instructions: "Ordnen Sie die Aussagen den Sprechenden zu.",
            skill: "listening",
            minutes: 15,
            maxPoints: 12,
            playLimit: 1,
            audio: [
              { speaker: "Sprecher 1", de: "Ohne verbindliche Präsenztage verlieren Teams ihren Zusammenhalt." },
              { speaker: "Sprecher 2", de: "Entscheidend ist nicht der Ort, sondern ob Ergebnisse überprüfbar sind." },
              { speaker: "Sprecher 3", de: "Für Familien mit langen Arbeitswegen ist Homeoffice eine erhebliche Entlastung." },
              { speaker: "Sprecher 4", de: "Ich warne vor Entgrenzung: Wer immer erreichbar ist, erholt sich nicht." },
            ],
            items: [
              {
                id: "t-b2-h2-1", type: "match",
                prompt: "Ordnen Sie zu.",
                pairs: [
                  { left: "Teamzusammenhalt", right: "Sprecher 1" },
                  { left: "Ergebnisorientierung", right: "Sprecher 2" },
                  { left: "Entlastung für Familien", right: "Sprecher 3" },
                  { left: "Gefahr der Entgrenzung", right: "Sprecher 4" },
                ],
                explanation: "Jeder Beitrag enthält ein Schlüsselwort.", skill: "listening", points: 12,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b2-schreiben",
        skill: "writing",
        title: "Schreiben",
        minutes: 30,
        maxPoints: 25,
        weight: 25,
        parts: [
          {
            id: "telc-b2-schreiben-1",
            title: "Formeller Brief",
            instructions:
              "Sie haben an einer Weiterbildung teilgenommen, die nicht dem Programm entsprach. Schreiben Sie eine sachliche Beschwerde an den Anbieter mit einer klaren Forderung (ca. 150 Wörter).",
            skill: "writing",
            minutes: 30,
            maxPoints: 25,
            items: [
              {
                id: "t-b2-s-1", type: "writing",
                prompt: "Schreiben Sie den Brief.",
                minWords: 150,
                checklist: [
                  "Betreff mit Kursnummer und Datum",
                  "sachliche Schilderung mit Fakten",
                  "zwei konkrete Kritikpunkte",
                  "klare Forderung mit Frist",
                  "formelle Grußformel",
                  "Nominalstil und Passiv verwendet",
                ],
                sampleAnswer:
                  "Betreff: Beschwerde zur Weiterbildung „Projektmanagement kompakt“ (Kurs-Nr. 7712, 12.–16. Mai)\n\nSehr geehrte Damen und Herren,\n\nleider muss ich Ihnen mitteilen, dass die genannte Weiterbildung in wesentlichen Punkten nicht dem angekündigten Programm entsprach.\n\nErstens wurden von den beschriebenen fünf Modulen lediglich drei behandelt; die Einheiten zu Risikomanagement und Kostenplanung fielen ohne Ankündigung aus. Zweitens war der Raum mit 24 Teilnehmenden deutlich überbelegt, obwohl in der Ausschreibung von maximal zwölf Personen die Rede war. Praktische Übungen konnten dadurch nicht durchgeführt werden.\n\nAufgrund dieser Abweichungen bitte ich Sie, entweder die fehlenden Module kostenfrei nachzuholen oder 40 % der Teilnahmegebühr zu erstatten. Über eine Rückmeldung bis zum 15. Juni wäre ich Ihnen dankbar.\n\nMit freundlichen Grüßen\nKarim Aziz",
                skill: "writing", points: 25,
              },
            ],
          },
        ],
      },
      {
        id: "telc-b2-sprechen",
        skill: "speaking",
        title: "Mündliche Prüfung",
        minutes: 15,
        maxPoints: 20,
        weight: 20,
        parts: [
          {
            id: "telc-b2-sprechen-1",
            title: "Teil 1–3",
            instructions: "Präsentation, Diskussion, gemeinsame Problemlösung.",
            skill: "speaking",
            minutes: 15,
            maxPoints: 20,
            items: [
              {
                id: "t-b2-sp-1", type: "speaking",
                prompt: "Teil 1: Präsentieren Sie Ihre Position zu „Weiterbildung: Pflicht oder freiwillig?“",
                target:
                  "Ich vertrete die Auffassung, dass Weiterbildung verbindlich, aber flexibel organisiert sein sollte. Zunächst verändert sich Technik so schnell, dass Wissen veraltet. Darüber hinaus profitieren Betriebe unmittelbar. Einzuwenden wäre allerdings, dass Pflichtangebote ohne Mitbestimmung Widerstand erzeugen.",
                skill: "speaking", points: 7,
              },
              {
                id: "t-b2-sp-2", type: "speaking",
                prompt: "Teil 2: Widersprechen Sie höflich und fragen Sie nach.",
                target:
                  "Da bin ich nicht ganz Ihrer Meinung. Könnten Sie präzisieren, wie Sie die Freistellung finanzieren würden? Meines Erachtens greift das Argument zu kurz.",
                skill: "speaking", points: 6,
              },
              {
                id: "t-b2-sp-3", type: "speaking",
                prompt: "Teil 3: Finden Sie mit Ihrem Partner eine gemeinsame Lösung und fassen Sie sie zusammen.",
                target:
                  "Können wir uns darauf einigen, dass jährlich zwei Pflichttage vorgesehen werden und weitere Angebote freiwillig bleiben? Zusammenfassend: zwei Pflichttage, Budget aus dem Betrieb, Auswahl durch die Beschäftigten.",
                skill: "speaking", points: 7,
              },
            ],
          },
        ],
      },
    ],
  },
];
