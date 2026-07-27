import type { AusbildungResource } from "@/lib/types";

export const ausbildungResources: AusbildungResource[] = [
  {
    slug: "lebenslauf-vorlage",
    title: "Lebenslauf: Vorlage und Regeln",
    category: "cv",
    level: "A2",
    minutes: 25,
    summary:
      "German CVs are tabular, factual and never longer than two pages. Photo optional, signature expected, no invented content.",
    body: [
      {
        kind: "objectives",
        items: [
          "Build a tabular CV (tabellarischer Lebenslauf) in German",
          "Use the correct section order and date format",
          "Describe school, work and language skills the German way",
        ],
      },
      {
        kind: "text",
        title: "Die Regeln",
        body: [
          "Ein deutscher Lebenslauf ist tabellarisch: links das Datum (MM/JJJJ – MM/JJJJ), rechts die Information. Er wird rückwärts chronologisch geschrieben, also die neueste Station zuerst.",
          "Standardabschnitte: Persönliche Daten, Berufserfahrung, Schulbildung/Ausbildung, Sprachkenntnisse, EDV-Kenntnisse, Sonstiges (Führerschein, Ehrenamt). Ort, Datum und Unterschrift stehen am Ende.",
          "Ein Foto ist rechtlich nicht nötig, in der Praxis aber noch häufig. Lücken werden nicht versteckt, sondern kurz erklärt (z. B. „Sprachkurs Deutsch, Goethe-Institut Rabat“).",
        ],
      },
      {
        kind: "table",
        table: {
          title: "Aufbau im Überblick",
          headers: ["Abschnitt", "Inhalt", "Typischer Fehler"],
          rows: [
            ["Persönliche Daten", "Name, Adresse, Telefon, E-Mail, Geburtsdatum, Staatsangehörigkeit", "Familienstand und Religion sind nicht nötig"],
            ["Berufserfahrung", "Zeitraum, Position, Firma, Ort, 2–3 Aufgaben", "nur Stellenbezeichnung ohne Aufgaben"],
            ["Schulbildung", "Abschluss, Schule, Land, Note (falls gut)", "alle Schuljahre einzeln auflisten"],
            ["Sprachkenntnisse", "Sprache + Niveau nach GER (A1–C2)", "„gut“ statt „B1“ schreiben"],
            ["Sonstiges", "Führerschein, EDV, Ehrenamt", "Hobbys ohne Bezug zum Beruf"],
            ["Abschluss", "Ort, Datum, Unterschrift", "Unterschrift fehlt"],
          ],
        },
      },
      {
        kind: "tip",
        title: "Formatierung",
        body:
          "PDF, ein Dokument, Dateiname wie „Lebenslauf_Karim_Aziz.pdf“. Schriftgröße 11, eine Schriftart, klare Abstände. Kein buntes Design für Handwerk und Pflege.",
      },
      {
        kind: "mistakes",
        items: [
          { wrong: "Curriculum Vitae (englisch) als Überschrift", right: "Lebenslauf", why: "Deutsche Betriebe erwarten den deutschen Begriff." },
          { wrong: "Deutsch: sehr gut", right: "Deutsch: B1 (Goethe-Zertifikat, 2025)", why: "Niveaus nach GER sind überprüfbar." },
          { wrong: "Zeiträume wie „2 Jahre“", right: "09/2023 – 08/2025", why: "Konkrete Daten sind Pflicht." },
        ],
      },
    ],
    template: `LEBENSLAUF

Persönliche Daten
Name              Karim Aziz
Adresse           Hafenstraße 14, 04177 Leipzig
Telefon           +49 176 33 44 556
E-Mail            karim.aziz@mail.de
Geburtsdatum      12.04.2002 in Fès, Marokko
Staatsangehörigkeit  marokkanisch

Berufserfahrung
09/2024 – heute   Küchenhilfe (Teilzeit), Restaurant Sommer, Leipzig
                  - Vorbereitung von Speisen, Einhaltung der Hygienevorschriften (HACCP)
                  - Zusammenarbeit im Team von 6 Personen
06/2022 – 07/2024 Mitarbeiter Werkstatt, Atelier Mécanique Fès, Marokko
                  - Wartung und Reparatur von Heizungsanlagen
                  - Kundenbetreuung und Materialbestellung

Schulbildung
09/2018 – 06/2021 Baccalauréat, Schwerpunkt Technik, Lycée Ibn Khaldoun, Fès
                  Abschlussnote: 15/20 (gut)

Sprachkenntnisse
Arabisch          Muttersprache
Französisch       C1
Deutsch           B1 (Goethe-Zertifikat B1, 03/2026)
Englisch          A2

EDV-Kenntnisse
MS Office (Word, Excel), CAD-Grundkenntnisse

Sonstiges
Führerschein Klasse B
Ehrenamt: Jugendtrainer im Fußballverein (2019–2021)

Leipzig, 27.07.2026

Karim Aziz`,
    vocabulary: [
      { de: "der Lebenslauf", en: "CV", note: "tabellarisch = in table form" },
      { de: "die Staatsangehörigkeit", en: "nationality" },
      { de: "die Berufserfahrung", en: "work experience" },
      { de: "die Schulbildung", en: "school education" },
      { de: "die EDV-Kenntnisse", en: "IT skills" },
      { de: "der Führerschein Klasse B", en: "category B driving licence" },
    ],
  },
  {
    slug: "anschreiben-vorlage",
    title: "Anschreiben: Aufbau, Formulierungen, Vorlage",
    category: "cover-letter",
    level: "B1",
    minutes: 30,
    summary:
      "One page, four paragraphs, concrete references to the company. This is where German applications are won or lost.",
    body: [
      {
        kind: "objectives",
        items: [
          "Write a one-page German cover letter with the correct DIN layout",
          "Link your own experience to the requirements in the advert",
          "Close with a confident but polite call to action",
        ],
      },
      {
        kind: "text",
        title: "Der Aufbau",
        body: [
          "Oben rechts oder links Ihre Adresse, darunter die Firmenadresse, rechts Ort und Datum, dann die Betreffzeile (fett, ohne das Wort „Betreff“).",
          "Absatz 1 – Einstieg: Warum diese Firma? Nennen Sie etwas Konkretes (Produkt, Region, Ausbildungsangebot). Vermeiden Sie „Hiermit bewerbe ich mich“ als einzigen Satz.",
          "Absatz 2 – Ihre Qualifikation: zwei bis drei Beispiele mit Ergebnis. Absatz 3 – Motivation und Perspektive. Absatz 4 – Verfügbarkeit, Gesprächswunsch, Grußformel und Unterschrift.",
        ],
      },
      {
        kind: "examples",
        title: "Formulierungen, die funktionieren",
        items: [
          { de: "mit großem Interesse habe ich Ihre Ausbildungsanzeige gelesen.", en: "I read your training advert with great interest." },
          { de: "Besonders spricht mich an, dass Ihr Betrieb im Bereich Solartechnik arbeitet.", en: "I'm particularly drawn to the fact that your company works in solar technology." },
          { de: "In meiner Tätigkeit als … habe ich gelernt, …", en: "In my work as … I learned to …" },
          { de: "Über eine Einladung zu einem persönlichen Gespräch freue ich mich sehr.", en: "I would be delighted to be invited to an interview." },
          { de: "Ich stehe ab dem 1. September zur Verfügung.", en: "I am available from 1 September." },
        ],
      },
      {
        kind: "checklist",
        title: "Vor dem Absenden prüfen",
        items: [
          "Firmenname und Ansprechpartner korrekt geschrieben",
          "Betreffzeile mit Stellenbezeichnung und Referenznummer",
          "maximal eine Seite, 3–4 Absätze",
          "kein Satz aus einer Vorlage ohne Anpassung",
          "Rechtschreibprüfung durchgeführt",
          "PDF, Dateiname mit Ihrem Namen",
        ],
      },
      {
        kind: "warning",
        title: "Häufigster Fehler",
        body:
          "Ein Anschreiben, das zu 90 % über Sie selbst spricht und nie über den Betrieb. Nennen Sie in jedem Absatz einen Bezug zur Stelle.",
      },
    ],
    template: `Karim Aziz
Hafenstraße 14
04177 Leipzig
+49 176 33 44 556
karim.aziz@mail.de

Sommer Haustechnik GmbH
Frau Sabine Vogt
Industriestraße 8
04179 Leipzig

Leipzig, 27.07.2026

Bewerbung um einen Ausbildungsplatz als Anlagenmechaniker/-in SHK (Ref. AZ-2026-14)

Sehr geehrte Frau Vogt,

mit großem Interesse habe ich Ihre Ausbildungsanzeige auf der Website der Handwerkskammer gelesen. Besonders spricht mich an, dass Sie neben klassischer Heizungstechnik auch Wärmepumpen und Solaranlagen installieren – genau dieser Bereich interessiert mich seit meiner Schulzeit.

In Marokko habe ich zwei Jahre in einer Werkstatt für Heizungsanlagen gearbeitet. Dort habe ich gelernt, Kundenaufträge sorgfältig zu dokumentieren, Material zu bestellen und im Team zu arbeiten. Technische Zeichnungen kann ich lesen, und mit Werkzeugen gehe ich sicher um. Meine Deutschkenntnisse habe ich seit 2024 systematisch aufgebaut und im März das Goethe-Zertifikat B1 bestanden; parallel lerne ich Fachvokabular für Sanitär- und Heizungstechnik.

Eine Ausbildung in Deutschland ist für mich ein bewusster, langfristiger Schritt: Ich möchte einen anerkannten Abschluss erwerben und mich später zum Techniker weiterqualifizieren. Zuverlässigkeit und Pünktlichkeit sind für mich selbstverständlich, körperliche Arbeit macht mir Freude.

Ich stehe ab dem 1. September zur Verfügung und freue mich sehr über eine Einladung zu einem persönlichen Gespräch.

Mit freundlichen Grüßen

Karim Aziz

Anlagen: Lebenslauf, Schulabschluss (beglaubigte Übersetzung), Goethe-Zertifikat B1`,
    vocabulary: [
      { de: "die Betreffzeile", en: "subject line" },
      { de: "der Ansprechpartner", en: "contact person" },
      { de: "die Anlagen", en: "enclosures" },
      { de: "beglaubigte Übersetzung", en: "certified translation" },
      { de: "zur Verfügung stehen", en: "to be available" },
    ],
  },
  {
    slug: "vorstellungsgespraech-fragen",
    title: "50 Fragen im Vorstellungsgespräch — mit Musterantworten",
    category: "interview",
    level: "B1",
    minutes: 40,
    summary:
      "The questions German employers really ask, grouped by type, with model answers and the reasoning behind them.",
    body: [
      {
        kind: "text",
        title: "So läuft ein deutsches Gespräch ab",
        body: [
          "Begrüßung und Small Talk (2 Minuten), Selbstpräsentation (2–3 Minuten), Fragen zu Erfahrung und Motivation, Vorstellung des Betriebs, Ihre Fragen, Organisatorisches (Beginn, Vergütung, Unterlagen).",
          "Pünktlichkeit heißt: zehn Minuten vorher da sein. Händedruck, Blickkontakt, Siezen bis zum Angebot des Duzens. Handy aus.",
        ],
      },
      {
        kind: "table",
        table: {
          title: "Standardfragen und was dahintersteckt",
          headers: ["Frage", "Worauf der Betrieb achtet", "Kurze Musterantwort"],
          rows: [
            ["Erzählen Sie etwas über sich.", "Struktur, Sprache, Relevanz", "Herkunft, Ausbildung, Erfahrung, Ziel — in 60–90 Sekunden."],
            ["Warum dieser Beruf?", "echte Motivation", "„Weil ich gern praktisch arbeite und Ergebnisse sehen möchte.“"],
            ["Warum unser Betrieb?", "Vorbereitung", "Konkretes Detail aus Website/Anzeige nennen."],
            ["Ihre Stärken?", "Selbsteinschätzung", "Zwei Stärken + Beispiel."],
            ["Ihre Schwächen?", "Reflexion", "Echte Schwäche + Gegenmaßnahme."],
            ["Wie gehen Sie mit Kritik um?", "Lernbereitschaft", "Nachfragen, notieren, umsetzen."],
            ["Konflikt im Team — was tun?", "Sozialverhalten", "Direkt und sachlich ansprechen, ggf. Ausbilder einbeziehen."],
            ["Schichtarbeit möglich?", "Belastbarkeit", "Klar und ehrlich antworten."],
            ["Wo sehen Sie sich in fünf Jahren?", "Bindung", "Abschluss + Weiterbildung im Betrieb."],
            ["Haben Sie Fragen?", "Interesse", "Immer 2–3 Fragen vorbereiten."],
          ],
        },
      },
      {
        kind: "examples",
        title: "Formulierungen für schwierige Momente",
        items: [
          { de: "Könnten Sie die Frage bitte wiederholen?", en: "Could you repeat the question, please?" },
          { de: "Darf ich kurz überlegen?", en: "May I think for a moment?" },
          { de: "Habe ich Sie richtig verstanden, dass …?", en: "Did I understand you correctly that …?" },
          { de: "Das kann ich noch nicht, aber ich lerne schnell.", en: "I can't do that yet, but I learn quickly." },
        ],
      },
      {
        kind: "checklist",
        title: "Ihre Fragen an den Betrieb",
        items: [
          "Wie sieht der erste Monat konkret aus?",
          "Wer wäre mein Ausbilder oder meine Ansprechperson?",
          "Welche Abteilungen lerne ich kennen?",
          "Gibt es Unterstützung bei Sprachkursen?",
          "Wann können ich mit einer Rückmeldung rechnen?",
        ],
      },
    ],
    vocabulary: [
      { de: "die Selbstpräsentation", en: "self-presentation" },
      { de: "die Vergütung", en: "remuneration, pay" },
      { de: "der Ausbilder", en: "trainer, supervisor" },
      { de: "belastbar", en: "resilient, able to cope with pressure" },
      { de: "die Rückmeldung", en: "feedback, reply" },
    ],
  },
  {
    slug: "arbeitsplatz-wortschatz",
    title: "Wortschatz Arbeitsplatz & Büro",
    category: "vocabulary",
    level: "A2",
    minutes: 20,
    summary: "The 60 words you hear every day in a German workplace, sorted by situation.",
    body: [
      {
        kind: "table",
        table: {
          title: "Arbeitszeit und Organisation",
          headers: ["Deutsch", "Englisch", "Beispiel"],
          rows: [
            ["die Schicht", "shift", "Ich habe diese Woche Frühschicht."],
            ["die Pause", "break", "Die Pause dauert 30 Minuten."],
            ["der Feierabend", "end of the working day", "Schönen Feierabend!"],
            ["die Überstunde", "overtime hour", "Ich habe drei Überstunden gemacht."],
            ["der Urlaubsantrag", "holiday request", "Der Urlaubsantrag muss zwei Wochen vorher da sein."],
            ["die Besprechung", "meeting", "Die Besprechung beginnt um 9 Uhr."],
            ["der Dienstplan", "duty roster", "Der Dienstplan hängt im Pausenraum."],
            ["die Stempeluhr", "time clock", "Bitte an der Stempeluhr einstempeln."],
          ],
        },
      },
      {
        kind: "table",
        table: {
          title: "Büro und Kommunikation",
          headers: ["Deutsch", "Englisch", "Beispiel"],
          rows: [
            ["der Drucker", "printer", "Der Drucker hat keinen Toner mehr."],
            ["die Ablage", "filing", "Legen Sie das bitte in die Ablage."],
            ["die Vorlage", "template", "Nutzen Sie die Vorlage für Angebote."],
            ["der Anhang", "attachment", "Im Anhang finden Sie die Rechnung."],
            ["die Frist", "deadline", "Die Frist läuft am Freitag ab."],
            ["die Zuständigkeit", "responsibility", "Dafür ist Frau Vogt zuständig."],
            ["das Protokoll", "minutes", "Wer schreibt das Protokoll?"],
            ["die Absprache", "arrangement", "Nach Absprache mit dem Team."],
          ],
        },
      },
      {
        kind: "examples",
        title: "Sätze für den Alltag",
        items: [
          { de: "Können Sie mir kurz helfen?", en: "Could you help me for a moment?" },
          { de: "Ich bin noch nicht fertig, ich brauche zehn Minuten.", en: "I'm not finished yet, I need ten minutes." },
          { de: "Wo finde ich das Material für …?", en: "Where do I find the material for …?" },
          { de: "Ich habe eine Frage zum Dienstplan.", en: "I have a question about the roster." },
          { de: "Soll ich das übernehmen?", en: "Shall I take that on?" },
        ],
      },
    ],
    vocabulary: [
      { de: "einstempeln", en: "to clock in" },
      { de: "zuständig sein für", en: "to be responsible for" },
      { de: "übernehmen", en: "to take over, take on" },
      { de: "der Pausenraum", en: "break room" },
    ],
  },
  {
    slug: "pflege-wortschatz",
    title: "Wortschatz Pflege & Gesundheit",
    category: "vocabulary",
    level: "B1",
    minutes: 22,
    summary: "Care-sector vocabulary: handover, documentation, patient communication and safety.",
    body: [
      {
        kind: "table",
        table: {
          title: "Pflegealltag",
          headers: ["Deutsch", "Englisch", "Beispiel"],
          rows: [
            ["die Bewohnerin", "resident (care home)", "Die Bewohnerin in Zimmer 12 klingelt."],
            ["der Patient", "patient", "Der Patient hat Schmerzen im Rücken."],
            ["die Übergabe", "handover", "Die Übergabe ist um 14 Uhr."],
            ["die Dokumentation", "documentation", "Bitte die Dokumentation vollständig ausfüllen."],
            ["der Blutdruck", "blood pressure", "Ich messe jetzt den Blutdruck."],
            ["die Medikamentengabe", "medication administration", "Die Medikamentengabe erfolgt um 8 Uhr."],
            ["mobilisieren", "to mobilise (help move)", "Wir mobilisieren Frau Berg zweimal täglich."],
            ["die Sturzgefahr", "risk of falling", "Achtung, Sturzgefahr!"],
          ],
        },
      },
      {
        kind: "dialogue",
        title: "Am Bett: freundlich und klar",
        setting: "Pflegeheim, Morgenrunde",
        lines: [
          { speaker: "Pflegekraft", de: "Guten Morgen, Frau Berg. Haben Sie gut geschlafen?", en: "Good morning, Mrs Berg. Did you sleep well?" },
          { speaker: "Bewohnerin", de: "Nicht so gut, mein Rücken tut weh.", en: "Not so well, my back hurts." },
          { speaker: "Pflegekraft", de: "Das tut mir leid. Auf einer Skala von eins bis zehn: Wie stark sind die Schmerzen?", en: "I'm sorry. On a scale of one to ten, how strong is the pain?" },
          { speaker: "Bewohnerin", de: "Etwa sechs.", en: "About six." },
          { speaker: "Pflegekraft", de: "Ich gebe das an die Schichtleitung weiter und dokumentiere es. Darf ich Ihnen jetzt beim Aufstehen helfen?", en: "I'll pass that on to the shift lead and document it. May I help you get up now?" },
        ],
      },
      {
        kind: "tip",
        title: "Kommunikationsregel",
        body:
          "Kurze Sätze, Blickkontakt, immer ankündigen, was Sie tun: „Ich hebe jetzt Ihren Arm.“ Das ist fachlich korrekt und sprachlich einfach.",
      },
    ],
    vocabulary: [
      { de: "die Schichtleitung", en: "shift lead" },
      { de: "weitergeben", en: "to pass on" },
      { de: "die Pflegedokumentation", en: "care documentation" },
      { de: "die Vitalzeichen", en: "vital signs" },
    ],
  },
  {
    slug: "bau-handwerk-wortschatz",
    title: "Wortschatz Bau & Handwerk",
    category: "vocabulary",
    level: "B1",
    minutes: 20,
    summary: "Tools, materials, safety and instructions on a German building site.",
    body: [
      {
        kind: "table",
        table: {
          title: "Werkzeug und Material",
          headers: ["Deutsch", "Englisch", "Beispiel"],
          rows: [
            ["der Bohrer", "drill bit", "Ich brauche einen 8er-Bohrer."],
            ["die Bohrmaschine", "drill", "Die Bohrmaschine ist im Wagen."],
            ["der Zollstock", "folding ruler", "Hast du einen Zollstock dabei?"],
            ["die Wasserwaage", "spirit level", "Prüf das mit der Wasserwaage."],
            ["die Zange", "pliers", "Gib mir bitte die Zange."],
            ["das Rohr", "pipe", "Das Rohr ist undicht."],
            ["die Dichtung", "seal, gasket", "Die Dichtung muss getauscht werden."],
            ["der Estrich", "screed", "Der Estrich muss zwei Tage trocknen."],
          ],
        },
      },
      {
        kind: "table",
        table: {
          title: "Sicherheit",
          headers: ["Deutsch", "Englisch", "Hinweis"],
          rows: [
            ["der Schutzhelm", "safety helmet", "Auf der Baustelle Pflicht"],
            ["die Sicherheitsschuhe", "safety boots", "S3 üblich"],
            ["die Schutzbrille", "safety goggles", "beim Bohren und Schleifen"],
            ["die Absperrung", "barrier", "Bereich absperren"],
            ["die Gefahrenstelle", "hazard point", "melden und sichern"],
            ["die Unterweisung", "safety briefing", "vor Arbeitsbeginn"],
          ],
        },
      },
      {
        kind: "examples",
        title: "Anweisungen verstehen",
        items: [
          { de: "Halt das mal kurz fest.", en: "Hold this for a moment." },
          { de: "Reich mir mal die Wasserwaage.", en: "Pass me the spirit level." },
          { de: "Das muss noch verputzt werden.", en: "That still needs plastering." },
          { de: "Räum bitte die Baustelle auf.", en: "Please tidy up the site." },
          { de: "Vorsicht, das ist scharf!", en: "Careful, that's sharp!" },
        ],
      },
      {
        kind: "warning",
        title: "Wichtig",
        body:
          "Wenn Sie eine Anweisung nicht verstehen, fragen Sie sofort nach: „Entschuldigung, was soll ich genau machen?“ Sicherheit geht vor Höflichkeit.",
      },
    ],
    vocabulary: [
      { de: "undicht", en: "leaking" },
      { de: "verputzen", en: "to plaster" },
      { de: "absperren", en: "to cordon off" },
      { de: "die Unterweisung", en: "safety instruction" },
    ],
  },
  {
    slug: "telefonieren-am-arbeitsplatz",
    title: "Telefonieren am Arbeitsplatz",
    category: "phone",
    level: "B1",
    minutes: 20,
    summary: "Answering, transferring, taking messages and dealing with poor connections.",
    body: [
      {
        kind: "table",
        table: {
          title: "Bausteine für jedes Telefonat",
          headers: ["Situation", "Formulierung"],
          rows: [
            ["Anruf annehmen", "Sommer Haustechnik, Aziz am Telefon, guten Tag."],
            ["Anrufer verstehen", "Entschuldigung, wie war Ihr Name bitte?"],
            ["Weiterleiten", "Einen Moment bitte, ich verbinde Sie mit Frau Vogt."],
            ["Person nicht da", "Frau Vogt ist gerade im Termin. Möchten Sie eine Nachricht hinterlassen?"],
            ["Notieren", "Ich notiere: Herr Brandt, Rückruf unter 0341 …, bis 16 Uhr."],
            ["Schlechte Verbindung", "Die Verbindung ist schlecht. Können Sie mich noch hören?"],
            ["Abschluss", "Vielen Dank für Ihren Anruf. Auf Wiederhören."],
          ],
        },
      },
      {
        kind: "dialogue",
        title: "Beispiel: Nachricht aufnehmen",
        lines: [
          { speaker: "Karim", de: "Sommer Haustechnik, Aziz am Telefon, guten Tag." },
          { speaker: "Anrufer", de: "Guten Tag, Brandt hier. Ich möchte Frau Vogt sprechen." },
          { speaker: "Karim", de: "Frau Vogt ist gerade in einer Besprechung. Möchten Sie eine Nachricht hinterlassen?" },
          { speaker: "Anrufer", de: "Ja, bitte. Es geht um Auftrag 8842, die Lieferung fehlt noch." },
          { speaker: "Karim", de: "Ich notiere: Auftrag 8842, Lieferung fehlt. Unter welcher Nummer erreicht Sie Frau Vogt?" },
          { speaker: "Anrufer", de: "0341 55 21 90, am besten bis 16 Uhr." },
          { speaker: "Karim", de: "Alles notiert. Ich gebe es sofort weiter. Auf Wiederhören." },
        ],
      },
      {
        kind: "tip",
        title: "Trick für Zahlen",
        body:
          "Wiederholen Sie Zahlen und Namen immer laut zurück („Ich notiere: null drei vier eins …“). So vermeiden Sie Fehler und gewinnen Zeit.",
      },
    ],
    vocabulary: [
      { de: "verbinden", en: "to connect, transfer" },
      { de: "eine Nachricht hinterlassen", en: "to leave a message" },
      { de: "der Rückruf", en: "call back" },
      { de: "Auf Wiederhören.", en: "Goodbye (on the phone)." },
    ],
  },
  {
    slug: "arbeitskultur-deutschland",
    title: "Deutsche Arbeitskultur verstehen",
    category: "culture",
    level: "B1",
    minutes: 25,
    summary:
      "Punctuality, directness, hierarchy, breaks, holidays, sick leave and the unwritten rules that surprise newcomers.",
    body: [
      {
        kind: "culture",
        title: "Sieben Regeln, die wirklich zählen",
        body: [
          "Pünktlichkeit ist Respekt. „Pünktlich“ heißt: fünf bis zehn Minuten vorher da. Wer sich verspätet, ruft an – vorher, nicht danach.",
          "Direktheit ist keine Unhöflichkeit. Ein deutsches „Das ist falsch“ bezieht sich auf die Sache, nicht auf die Person. Rückfragen sind erwünscht.",
          "Trennung von Arbeit und Privatleben: Nach Feierabend erwartet niemand Antworten auf Nachrichten. Auch Sie dürfen abschalten.",
          "Pausen werden eingehalten, nicht durchgearbeitet. Wer die Pause streicht, wirkt nicht fleißig, sondern schlecht organisiert.",
          "Krankmeldung am ersten Tag, vor Arbeitsbeginn, telefonisch. Die Bescheinigung folgt nach den betrieblichen Regeln.",
          "Urlaub wird früh beantragt und dann respektiert. Im Urlaub ruft man nicht an.",
          "Sicherheit vor Geschwindigkeit: Wer eine Schutzausrüstung weglässt, um schneller zu sein, macht keinen guten Eindruck, sondern einen gefährlichen Fehler.",
        ],
      },
      {
        kind: "table",
        table: {
          title: "Siezen und Duzen",
          headers: ["Situation", "Anrede", "Hinweis"],
          rows: [
            ["Erstes Gespräch, Behörde, Kunden", "Sie", "Immer mit Sie beginnen."],
            ["Handwerk, Baustelle, junge Teams", "oft du", "Warten, bis das Du angeboten wird."],
            ["Vorgesetzte", "Sie", "Auch wenn das Team sich duzt."],
            ["Schriftliche Bewerbung", "Sie", "Ausnahmslos."],
          ],
        },
      },
      {
        kind: "mistakes",
        items: [
          { wrong: "Ich melde mich nach der Schicht krank.", right: "Ich melde mich vor Schichtbeginn krank.", why: "Der Betrieb muss Ersatz organisieren." },
          { wrong: "Ich frage nicht nach, um höflich zu sein.", right: "Ich frage sofort nach.", why: "Nichtverstehen wird als Risiko gewertet, Nachfragen als Verantwortung." },
          { wrong: "Ich komme genau zur Minute.", right: "Ich komme fünf Minuten früher.", why: "Umkleiden und Vorbereitung zählen nicht als Arbeitsbeginn." },
        ],
      },
    ],
    vocabulary: [
      { de: "der Feierabend", en: "end of the working day" },
      { de: "die Schutzausrüstung", en: "protective equipment" },
      { de: "den Urlaub beantragen", en: "to request holiday" },
      { de: "das Du anbieten", en: "to offer the informal you" },
    ],
  },
  {
    slug: "situationen-behoerden",
    title: "Behörden und typische Situationen",
    category: "situations",
    level: "B1",
    minutes: 25,
    summary:
      "Anmeldung, Ausländerbehörde, bank account, Krankenkasse: what to say and which documents to bring.",
    body: [
      {
        kind: "table",
        table: {
          title: "Wohin, warum, was mitnehmen",
          headers: ["Behörde / Stelle", "Anlass", "Unterlagen"],
          rows: [
            ["Einwohnermeldeamt", "Anmeldung der Wohnung (14 Tage)", "Pass, Wohnungsgeberbestätigung, Formular"],
            ["Ausländerbehörde", "Aufenthaltstitel, Verlängerung", "Pass, Foto, Ausbildungsvertrag, Nachweis Krankenversicherung"],
            ["Krankenkasse", "Anmeldung zur Versicherung", "Pass, Anmeldung, Ausbildungsvertrag, Sozialversicherungsnummer"],
            ["Bank", "Girokonto eröffnen", "Pass, Anmeldebestätigung, Ausbildungsvertrag"],
            ["Handwerks-/IHK-Kammer", "Anerkennung, Ausbildungsvertrag", "Zeugnisse mit Übersetzung"],
            ["Finanzamt", "Steuer-ID", "kommt meist automatisch nach der Anmeldung"],
          ],
        },
      },
      {
        kind: "examples",
        title: "Sätze am Schalter",
        items: [
          { de: "Guten Tag, ich habe einen Termin um 10 Uhr bei Frau Klein.", en: "Hello, I have an appointment at 10 with Ms Klein." },
          { de: "Ich möchte meinen Wohnsitz anmelden.", en: "I'd like to register my residence." },
          { de: "Welche Unterlagen brauche ich noch?", en: "Which documents do I still need?" },
          { de: "Könnten Sie mir das bitte langsamer erklären?", en: "Could you explain that to me more slowly, please?" },
          { de: "Wie lange dauert die Bearbeitung etwa?", en: "Roughly how long does processing take?" },
          { de: "Kann ich die Unterlagen auch per E-Mail nachreichen?", en: "Can I also submit the documents later by email?" },
        ],
      },
      {
        kind: "tip",
        title: "Termin zuerst",
        body:
          "Fast alle Behörden arbeiten nur mit Termin. Buchen Sie online, notieren Sie die Buchungsnummer und erscheinen Sie mit allen Originalen plus Kopien.",
      },
      {
        kind: "checklist",
        title: "Notfall-Mappe (immer bereit)",
        items: [
          "Pass und Aufenthaltstitel (Original + Kopie)",
          "Anmeldebestätigung der Wohnung",
          "Ausbildungs- oder Arbeitsvertrag",
          "Nachweis der Krankenversicherung",
          "Zeugnisse mit beglaubigter Übersetzung",
          "Sprachzertifikate",
          "Kontodaten (IBAN)",
        ],
      },
    ],
    vocabulary: [
      { de: "die Wohnungsgeberbestätigung", en: "landlord confirmation of residence" },
      { de: "die Bearbeitung", en: "processing" },
      { de: "nachreichen", en: "to submit subsequently" },
      { de: "der Wohnsitz", en: "place of residence" },
    ],
  },
  {
    slug: "professionelle-emails",
    title: "Professionelle E-Mails im Betrieb",
    category: "email",
    level: "B1",
    minutes: 22,
    summary: "Five email templates you can reuse: question, delay, sick note, request, thank you.",
    body: [
      {
        kind: "table",
        table: {
          title: "Register: von neutral bis formell",
          headers: ["Zweck", "Anrede", "Grußformel"],
          rows: [
            ["Kollege im Team (Du-Kultur)", "Hallo Lena,", "Viele Grüße"],
            ["Vorgesetzte", "Sehr geehrte Frau Vogt,", "Mit freundlichen Grüßen"],
            ["Unbekannt / Behörde", "Sehr geehrte Damen und Herren,", "Mit freundlichen Grüßen"],
            ["Kunde nach Beschwerde", "Sehr geehrter Herr Brandt,", "Mit freundlichen Grüßen"],
          ],
        },
      },
      {
        kind: "examples",
        title: "Fünf Bausteine",
        items: [
          { de: "Betreff: Rückfrage zum Dienstplan KW 32", en: "Subject: Question about the roster, week 32" },
          { de: "ich habe eine kurze Rückfrage zu …", en: "I have a brief question about …" },
          { de: "leider verspäte ich mich heute um etwa 20 Minuten, weil die S-Bahn ausgefallen ist.", en: "unfortunately I'll be about 20 minutes late today because the train was cancelled." },
          { de: "hiermit melde ich mich für heute krank; die Bescheinigung reiche ich nach.", en: "I hereby report sick for today; I'll submit the certificate later." },
          { de: "vielen Dank für Ihre Unterstützung bei …", en: "thank you for your support with …" },
        ],
      },
      {
        kind: "checklist",
        title: "Vor dem Senden",
        items: [
          "Betreff konkret (Thema + Nummer/Datum)",
          "eine Bitte pro E-Mail",
          "Anhang wirklich angehängt",
          "richtige Anrede und Grußformel",
          "Signatur mit Name, Funktion, Telefon",
        ],
      },
    ],
    vocabulary: [
      { de: "die Rückfrage", en: "query" },
      { de: "nachreichen", en: "to submit later" },
      { de: "die Signatur", en: "signature block" },
      { de: "der Anhang", en: "attachment" },
    ],
  },
  {
    slug: "nuetzliche-ausdruecke-arbeit",
    title: "80 nützliche Ausdrücke für den Arbeitsalltag",
    category: "expressions",
    level: "A2",
    minutes: 18,
    summary: "Ready-made sentences for asking, confirming, apologising, offering help and closing a conversation.",
    body: [
      {
        kind: "table",
        table: {
          title: "Nachfragen und Verstehen",
          headers: ["Deutsch", "Englisch"],
          rows: [
            ["Entschuldigung, das habe ich nicht verstanden.", "Sorry, I didn't understand that."],
            ["Können Sie das bitte wiederholen?", "Could you repeat that, please?"],
            ["Wie schreibt man das?", "How do you spell that?"],
            ["Was bedeutet …?", "What does … mean?"],
            ["Habe ich das richtig verstanden: …?", "Did I understand correctly: …?"],
            ["Bitte etwas langsamer.", "A bit more slowly, please."],
          ],
        },
      },
      {
        kind: "table",
        table: {
          title: "Hilfe anbieten und bitten",
          headers: ["Deutsch", "Englisch"],
          rows: [
            ["Soll ich das übernehmen?", "Shall I take that on?"],
            ["Brauchen Sie Hilfe?", "Do you need help?"],
            ["Könnten Sie mir kurz helfen?", "Could you help me briefly?"],
            ["Ich schaffe das nicht allein.", "I can't manage that alone."],
            ["Wo finde ich …?", "Where do I find …?"],
            ["An wen kann ich mich wenden?", "Who can I turn to?"],
          ],
        },
      },
      {
        kind: "table",
        table: {
          title: "Fehler, Entschuldigung, Lösung",
          headers: ["Deutsch", "Englisch"],
          rows: [
            ["Entschuldigung, das war mein Fehler.", "Sorry, that was my mistake."],
            ["Ich habe es notiert und mache es sofort.", "I've noted it and I'll do it right away."],
            ["Das kommt nicht wieder vor.", "It won't happen again."],
            ["Wie machen wir das am besten?", "How should we best do this?"],
            ["Ich melde mich, sobald ich fertig bin.", "I'll get in touch as soon as I'm done."],
          ],
        },
      },
    ],
    vocabulary: [
      { de: "übernehmen", en: "to take on" },
      { de: "sich wenden an", en: "to turn to someone" },
      { de: "notieren", en: "to note down" },
      { de: "sich melden", en: "to get in touch" },
    ],
  },
];
