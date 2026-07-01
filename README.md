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
