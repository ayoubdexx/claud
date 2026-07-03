# Payroll Management System (Excel)

A complete, automated and professional payroll / employee-management workbook
for a Moroccan company. The `.xlsx` file is generated programmatically in Python
with a small, dependency-free OOXML writer — **no `openpyxl`, no macros/VBA**.

## Files

| File | Purpose |
|------|---------|
| `Payroll_Management_System.xlsx` | The finished workbook (open this in Excel). |
| `build_workbook.py` | Defines every sheet, formula, table, style and chart. |
| `xlsxgen.py` | Minimal `.xlsx` engine: styles, formulas, validation, conditional formatting, **native Excel Tables**, named ranges, protection and charts. |

Rebuild the workbook at any time:

```bash
python3 build_workbook.py
```

## Design language

| Colour | Meaning |
|--------|---------|
| **Slate gray** | structure — titles, headers, framing |
| **Emerald green** | Workers (عمال) and all money totals |
| **Violet / purple** | Laborers (خدام) |
| **Amber** | overtime |
| White cell + green border | a cell you can type in |

Formula cells are **locked**; only data-entry cells are editable. Every sheet is
protected with no password, so you can unprotect any time via *Review ▸ Unprotect
Sheet*. Formulas recalculate on open (`fullCalcOnLoad`).

## Sheets

1. **Settings** *(hidden)* — company details, pay rates, currency, working hours,
   the two weekend days and the first-half cut-off day. Each value has a named
   range (`WorkerDailyWage`, `LaborerOvertimeRate`, `WeekendDay1`, …), so change a
   number here and the whole workbook updates. *To open it: right-click any sheet
   tab ▸ Unhide ▸ Settings.*
2. **Workers List** / **Laborers List** — real Excel **Tables** (`WorkersTable`,
   `LaborersTable`). Enter your own IDs (`W-001`, `L-001`, …), Full Name, CIN,
   CNSS, Phone, Position, Start Date and Status. Status is a dropdown; Active rows
   go green, Inactive red. Add rows freely — formulas auto-extend.
3. **Attendance** — the main daily-entry page. ID, Name and Type fill in
   automatically from the two lists. Enter `1`/`0` under each day's **P** column
   (shown as ✓ / ✗, green / red) and overtime hours under **OT** (amber). Weekend
   day headers are shaded pink, driven by the reporting month and the configurable
   weekend days. Worked days, OT hours and salaries are computed per employee.
4. **Payroll** — one row per employee split into **1st Half (days 1-15)**,
   **2nd Half (16-31)** and **Full Month**, with a grand-total row and summary
   cards (Total Regular Pay, Total Overtime Pay, Total Amount Due).
5. **Search** — pick an employee ID and get a full summary card: personal details
   plus half-by-half days, overtime, salary and the highlighted total amount due.
6. **Payslip** — a clean, A4-printable pay slip with company header, employee
   info, earnings breakdown, total due and signature lines.
7. **Dashboard** *(bonus)* — KPI cards and charts (headcount, payroll split,
   averages, min/max).
8. **Monthly Report** *(bonus)* — a printable table of every employee with a
   grand total.

## Notes

- **Scalable:** capacity is 50 workers + 50 laborers (100 total on Attendance,
  Payroll and the Report). Adding an employee never breaks a formula.
- **Reporting month:** set it on the Attendance sheet (top-left, `mmmm yyyy`);
  it drives weekend detection, Payroll, Search and the Payslip.
- Rates default to Worker 150 MAD/day · 16.66 MAD/OT-hr and Laborer 100 MAD/day ·
  11.11 MAD/OT-hr — all editable in **Settings**.
