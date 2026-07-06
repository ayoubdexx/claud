# Payroll Management System (Excel)

A complete, automated payroll & employee-management workbook for a Moroccan
company. The Excel file is generated programmatically from Python using a small,
dependency-free OOXML writer (no `openpyxl`, no macros/VBA).

## Files

| File | Purpose |
|------|---------|
| `Payroll_Management_System.xlsx` | The finished workbook (open this in Excel). |
| `build_workbook.py` | Defines every sheet, formula, style and chart. |
| `xlsxgen.py` | Minimal `.xlsx` engine (styles, formulas, validation, conditional formatting, named ranges, protection, charts). |

Rebuild the workbook at any time:

```bash
python3 build_workbook.py
```

## Workbook contents

1. **Config** *(hidden)* — company name, payroll month and the pay rates
   (Worker: 150.00 MAD/day, 16.66 MAD/OT-hour · Laborer: 100.00 MAD/day,
   11.11 MAD/OT-hour). Change a rate here and the whole workbook updates.
2. **Workers List** & **Laborers List** — Employee ID (your own IDs, entered
   manually), Full Name, CIN, CNSS, Phone, Position, Start Date, Status.
3. **Daily Attendance** — the main daily-entry page. IDs, names and types fill
   in automatically; enter `1/0` for presence and hours for overtime per day
   (1–31). Present days turn green, overtime turns amber.
4. **Payroll** — automatic First Half (days 1–15) and Second Half (16–31)
   breakdown: worked days, overtime hours, regular pay, overtime pay, total due.
5. **Search** — pick an employee by ID or name and see a full summary card.
6. **Payslip** — one-click, A4-printable payslip with signature lines.
7. **Dashboard** — KPI cards + charts (headcount, totals, averages, min/max).
8. **Monthly Report** — printable table of every employee with a grand total.

## Design notes

- **Colour key:** gold = cells you type in, green = automatic results,
  blue = summary values.
- **Protected:** formula cells are locked; only data-entry cells are editable.
  Sheets are protected with no password, so you can unprotect them any time
  (Review ▸ Unprotect Sheet).
- **Scalable:** capacity is 80 workers + 80 laborers (160 total). Adding
  employees never breaks a formula.
- Formulas recalculate automatically on open (`fullCalcOnLoad`).




---

# Système de Gestion des Présences (Excel + VBA)

Outil Excel **en français** et **macro-activé** (`.xlsm`) pour pointer les
présences d'un chantier de construction. Tout est généré en Python **sans aucune
dépendance** — y compris le projet VBA, écrit octet par octet (compression
MS-OVBA + fichier composé OLE2).

Le principe : **une seule grille mensuelle** contient tous les ouvriers et tous
les jours du mois ; on coche les présents d'un double-clic. Une **feuille du
jour** imprimable donne automatiquement la liste des présents du jour choisi.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `Gestion_Presences.xlsm` | Le classeur fini (ouvrez-le dans Excel). |
| `build_attendance.py` | Construit les 2 feuilles, les styles, les données d'exemple et le code VBA. |
| `vbagen.py` | Générateur de projet VBA (`vbaProject.bin`) sans dépendance : compression MS-OVBA, chiffrement CMG/DPB/GC, écriture du fichier composé OLE2. |
| `xlsxgen.py` | Moteur `.xlsx`/`.xlsm` (styles, formules, validations, mises en forme conditionnelles, VBA). |

Régénérer le classeur :

```bash
python3 build_attendance.py
```

## Les deux feuilles

### 1. Présence du Mois *(feuille principale)*

- En haut : le **Mois** (une date, affichée « juillet 2026 ») et le **Chantier**.
- Chaque **ligne** = un ouvrier (N°, ID, Nom et Prénom, Poste — saisis une fois).
- Chaque **colonne** = un jour du mois (1 à 31), avec l'initiale du jour de la
  semaine. Les **week-ends sont grisés-bleutés** et les jours hors du mois
  (ex. 31 février) sont **grisés**.
- **Double-cliquez** sur une case (ouvrier × jour) pour marquer **✓ présent**
  (la case devient verte) ; double-cliquez à nouveau pour l'enlever.
- Colonne **Total** : nombre de jours de présence par ouvrier (automatique).
- Ligne **Présents / jour** : effectif présent chaque jour (automatique).
- Les noms et la colonne Total restent figés quand on fait défiler les jours.

### 2. Feuille du Jour *(impression, synchronisée)*

- Choisissez un **Jour** (1 à 31) — par défaut le **jour actuel**.
- La liste des **présents de ce jour** se construit automatiquement à partir de
  la grille (N°, ID, Nom, Poste, Signature), avec la **date complète**, le
  chantier, le **total** et la **signature du responsable**.
- Bouton **Aujourd'hui** (revenir au jour du jour) et bouton **Imprimer**
  (aperçu avant impression). Mise en page **A4**.

## Utilisation quotidienne

1. Ouvrez le fichier et **activez les macros**.
2. Sur *Présence du Mois*, **double-cliquez** les cases des ouvriers présents
   aujourd'hui.
3. Onglet *Feuille du Jour* (ou bouton **Feuille du jour**) → la liste du jour
   s'affiche → **Imprimer**.

Pour consulter/imprimer **n'importe quel autre jour**, changez simplement le
numéro dans la case *Jour* : la liste se met à jour toute seule.

## Notes de conception

- **Case à cocher = double-clic** dans la grille (aucun objet fragile, marche
  quel que soit le nombre d'ouvriers).
- Les feuilles sont **synchronisées** : la feuille du jour lit toujours la
  grille du mois.
- Police Calibri, en-têtes ardoise, présents en vert, week-ends grisés.
- Livré avec 10 ouvriers d'exemple ; remplacez-les par les vôtres. Capacité :
  80 ouvriers, 31 jours.
