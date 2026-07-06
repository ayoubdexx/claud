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

Outil Excel **en français** pour gérer les présences quotidiennes sur un
chantier de construction. Le classeur est **macro-activé** (`.xlsm`) : trois
gros boutons automatisent tout le travail du matin. Comme le reste du dépôt, il
est généré en Python **sans aucune dépendance** — y compris le projet VBA, qui
est écrit octet par octet (compression MS-OVBA + fichier composé OLE2).

## Fichiers

| Fichier | Rôle |
|---------|------|
| `Gestion_Presences.xlsm` | Le classeur fini (ouvrez-le dans Excel). |
| `build_attendance.py` | Construit les 4 feuilles, les styles, les données d'exemple et le code VBA. |
| `vbagen.py` | Générateur de projet VBA (`vbaProject.bin`) sans dépendance : compression MS-OVBA, chiffrement CMG/DPB/GC, écriture du fichier composé OLE2. |
| `xlsxgen.py` | Moteur `.xlsx`/`.xlsm` (styles, formules, validations, mises en forme conditionnelles, VBA). |

Régénérer le classeur :

```bash
python3 build_attendance.py
```

## Utilisation quotidienne (moins de 2 minutes)

1. **Ouvrez** `Gestion_Presences.xlsm` et **activez les macros** (barre jaune
   « Activer le contenu »).
2. **Double-cliquez** dans la colonne *Présent* pour cocher (✓) chaque employé
   présent sur le chantier.
3. Cliquez sur **Enregistrer la journée**.
4. Cliquez sur **Imprimer la liste**.

## Les feuilles

1. **Présence du Jour** *(feuille principale)* — date, chantier, et la liste des
   employés actifs remplie automatiquement. On coche uniquement les présents
   (double-clic). Un compteur affiche « présents / total ».
2. **Employés** — le fichier du personnel (informations fixes) : ID Employé,
   Nom et Prénom, CIN, CNSS, Poste, Équipe, Statut (*Actif/Inactif* via liste
   déroulante). Les IDs sont saisis manuellement.
3. **Liste à imprimer** — feuille prête à imprimer en **A4** : N°, ID, Nom,
   Poste, Signature, plus la date, le chantier, le total et la signature du
   responsable. Elle ne contient que les employés cochés présents.
4. **Historique** — chaque journée enregistrée est archivée (Date, ID, Nom,
   Présent) pour consulter n'importe quel jour passé.

## Les trois boutons (macros VBA)

| Bouton | Action |
|--------|--------|
| **Nouvelle journée** | Recharge la liste des employés actifs, décoche tout et met la date du jour. |
| **Enregistrer la journée** | Copie les présences dans l'*Historique* (ré-enregistrer une même date la met à jour) et régénère la *Liste à imprimer*. |
| **Imprimer la liste** | Construit la liste des présents et ouvre l'aperçu avant impression. |

## Notes de conception

- **Interface sobre et moderne** : police Calibri, en-têtes ardoise, lignes
  alternées, employés présents surlignés en vert (mise en forme conditionnelle).
- **Case à cocher = double-clic** dans la colonne *Présent* — aucune saisie,
  aucun objet fragile ; fonctionne quel que soit le nombre d'employés.
- Les boutons sont (re)créés automatiquement à l'ouverture par le code VBA.
- Le classeur est livré avec 10 employés d'exemple (9 actifs) pour être
  utilisable immédiatement ; remplacez-les par les vôtres dans la feuille
  *Employés*.
