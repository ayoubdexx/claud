"""
build_workbook.py
------------------
Generates "Payroll_Management_System.xlsx" - a complete, automated and
professional payroll / employee-management workbook for a Moroccan company.

Design goals
    * Clean, modern business look:
        - slate gray  -> structure / headers / titles
        - emerald green -> Workers (عمال) and money totals
        - violet/purple -> Laborers (خدام)
        - amber        -> overtime
    * Real Excel Table objects (Ctrl+T): WorkersTable & LaborersTable, so lists
      grow without breaking a single formula (structured references).
    * Named ranges for every configurable setting.
    * Data validation, conditional formatting and drop-downs everywhere useful.
    * Formula cells are locked; only data-entry cells are editable.
    * No VBA / macros - pure Excel formulas.

Built on the dependency-free `xlsxgen` engine (standard library only).
Rebuild any time with:   python3 build_workbook.py
"""

import datetime as dt
from xlsxgen import Workbook, Table, Chart, col_letter

CL = col_letter

# --------------------------------------------------------------------------- #
#  Capacities & layout constants
# --------------------------------------------------------------------------- #
LIST_ROWS = 50                       # employees per list (>= 50 as required)
L_HDR = 3                            # list header row
L_FIRST, L_LAST = 4, 4 + LIST_ROWS - 1           # data rows 4 .. 53

ATT_ROWS = 100                       # attendance capacity (workers + laborers)
A_FIRST, A_LAST = 7, 7 + ATT_ROWS - 1            # data rows 7 .. 106

FD = 4                               # first Day column (D)
LD = FD + 2 * 31 - 1                 # last OT column   (BM = 65)
FH_LAST = FD + 2 * 15 - 1            # first-half last col (AG = 33)
SH_FIRST = FH_LAST + 1               # second-half first col (AH = 34)
T_WORKED = LD + 1                    # BN 66
T_OT     = LD + 2                    # BO 67
T_REG    = LD + 3                    # BP 68
T_OTSAL  = LD + 4                    # BQ 69
T_TOTAL  = LD + 5                    # BR 70

Dc, AGc, AHc, BMc = CL(FD), CL(FH_LAST), CL(SH_FIRST), CL(LD)
BNc, BOc, BPc, BQc, BRc = (CL(T_WORKED), CL(T_OT), CL(T_REG), CL(T_OTSAL), CL(T_TOTAL))

PR_FIRST = 5                         # Payroll data first row
PR_LAST = PR_FIRST + ATT_ROWS - 1    # 104

ATT = "'Attendance'!"

# --------------------------------------------------------------------------- #
#  Colour palette
# --------------------------------------------------------------------------- #
SLATE_900 = "FF0F172A"
SLATE_800 = "FF1E293B"
SLATE_700 = "FF334155"
SLATE_600 = "FF475569"
SLATE_500 = "FF64748B"
SLATE_200 = "FFE2E8F0"
SLATE_100 = "FFF1F5F9"
SLATE_50  = "FFF8FAFC"

EMERALD_700 = "FF047857"
EMERALD_600 = "FF059669"
EMERALD_500 = "FF10B981"
EMERALD_100 = "FFD1FAE5"
EMERALD_50  = "FFECFDF5"

VIOLET_700 = "FF6D28D9"
VIOLET_600 = "FF7C3AED"
VIOLET_500 = "FF8B5CF6"
VIOLET_100 = "FFEDE9FE"
VIOLET_50  = "FFF5F3FF"

AMBER_500 = "FFF59E0B"
AMBER_100 = "FFFEF3C7"
AMBER_700 = "FFB45309"

RED_600 = "FFDC2626"
RED_100 = "FFFEE2E2"
RED_700 = "FFB91C1C"

GREEN_OK  = "FFC6EFCE"
GREEN_OKT = "FF166534"
PINK_WKND = "FFFCE7F3"

WHITE = "FFFFFFFF"
BORDER_GRN = "FF10B981"

# Number formats
MAD  = '#,##0.00" MAD"'
INT  = '#,##0'
DEC  = '0.##'
DATE = 'dd/mm/yyyy'
MONYR = 'mmmm yyyy'
TEXT = '@'
CHECK = '[=1]"✓";[=0]"✗";General'

wb = Workbook()

# --------------------------------------------------------------------------- #
#  Style helpers
# --------------------------------------------------------------------------- #
ALL = ("left", "right", "top", "bottom")

def border(*sides, style="thin", color=SLATE_200):
    return {s: {"style": style, "color": color} for s in sides}

S = {}
def reg(name, spec):
    S[name] = wb.style(spec)
    return S[name]

# ---- Titles / banners ----
reg("title",    {"font": {"bold": True, "size": 20, "color": WHITE},
                 "fill": SLATE_800, "align": {"horizontal": "left", "vertical": "center"}})
reg("subtitle", {"font": {"size": 10, "italic": True, "color": SLATE_100},
                 "fill": SLATE_700, "align": {"horizontal": "left", "vertical": "center"}})
reg("note",     {"font": {"size": 9, "color": SLATE_600}, "fill": SLATE_50,
                 "align": {"horizontal": "left", "vertical": "center", "wrap": True},
                 "border": border(*ALL)})

# ---- Table / column headers ----
def hdr_style(fill, size=11):
    return {"font": {"bold": True, "size": size, "color": WHITE}, "fill": fill,
            "align": {"horizontal": "center", "vertical": "center", "wrap": True},
            "border": border(*ALL, color=WHITE)}
reg("hdr",   hdr_style(SLATE_700))
reg("hdr_em", hdr_style(EMERALD_600))
reg("hdr_vi", hdr_style(VIOLET_600))
reg("hdr_day", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": SLATE_600,
                "align": {"horizontal": "center", "vertical": "center"},
                "border": border(*ALL, color=WHITE)})
reg("hdr_dow", {"font": {"size": 8, "color": SLATE_100}, "fill": SLATE_500,
                "align": {"horizontal": "center", "vertical": "center"},
                "border": border(*ALL, color=WHITE)})
reg("hdr_sub", {"font": {"bold": True, "size": 8, "color": SLATE_700}, "fill": SLATE_100,
                "align": {"horizontal": "center", "vertical": "center"},
                "border": border(*ALL)})
reg("hdr_sum", {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": EMERALD_700,
                "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                "border": border(*ALL, color=WHITE)})

# ---- Input (editable) cells ----
def inp(fill=WHITE, numfmt=None, align="left", mono=False):
    spec = {"fill": fill, "locked": False,
            "border": border(*ALL, color=BORDER_GRN),
            "align": {"horizontal": align, "vertical": "center"}}
    if numfmt:
        spec["numfmt"] = numfmt
    if mono:
        spec["font"] = {"name": "Consolas", "bold": True, "color": SLATE_800}
    return spec
reg("inp",      inp())
reg("inp_c",    inp(align="center"))
reg("inp_txt",  inp(numfmt=TEXT, align="center"))
reg("inp_date", inp(numfmt=DATE, align="center"))
reg("inp_num",  inp(numfmt=INT, align="center"))
reg("inp_mad",  inp(numfmt=MAD, align="right"))
reg("id_em",    inp(fill=EMERALD_100, align="center", mono=True))
reg("id_vi",    inp(fill=VIOLET_100, align="center", mono=True))

# ---- Attendance entry cells ----
reg("day", {"locked": False, "numfmt": CHECK, "font": {"size": 10, "bold": True},
            "border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("ot",  {"locked": False, "numfmt": DEC, "fill": SLATE_50, "font": {"size": 9, "color": SLATE_500},
            "border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})

# ---- Formula (locked) cells ----
reg("f_id",  {"font": {"name": "Consolas", "bold": True, "color": SLATE_800},
              "border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt", {"border": border(*ALL), "align": {"vertical": "center"}})
reg("f_ctr", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_int", {"border": border(*ALL), "numfmt": INT, "fill": SLATE_50,
              "align": {"horizontal": "center", "vertical": "center"}})
reg("f_dec", {"border": border(*ALL), "numfmt": DEC, "fill": SLATE_50,
              "align": {"horizontal": "center", "vertical": "center"}})
reg("f_mad", {"border": border(*ALL), "numfmt": MAD, "fill": EMERALD_50,
              "align": {"horizontal": "right", "vertical": "center"}})
reg("f_mad_b", {"font": {"bold": True, "color": EMERALD_700}, "border": border(*ALL),
                "numfmt": MAD, "fill": EMERALD_100, "align": {"horizontal": "right", "vertical": "center"}})

# ---- Differential formats (conditional formatting) ----
dxf_present = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_OKT, "bold": True}})
dxf_absent  = wb.dxf({"fill": RED_100, "font": {"color": RED_700, "bold": True}})
dxf_ot      = wb.dxf({"fill": AMBER_100, "font": {"color": AMBER_700, "bold": True}})
dxf_active  = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_OKT}})
dxf_inactive = wb.dxf({"fill": RED_100, "font": {"color": RED_700}})
dxf_band    = wb.dxf({"fill": SLATE_50})
dxf_weekend = wb.dxf({"fill": PINK_WKND})


# =========================================================================== #
#  SHEET 0 : SETTINGS  (first sheet, hidden but accessible)
# =========================================================================== #
st = wb.add_sheet("Settings")
st.hidden = True
st.show_gridlines = False
st.tab_color = SLATE_700
st.set_col(1, 30); st.set_col(2, 34)

st.merge("A1:B1"); st.cell("A1", "  ⚙  SETTINGS  &  CONFIGURATION", S["title"]); st.set_row(1, 30)

lbl = wb.style({"font": {"bold": True, "color": SLATE_700}, "fill": SLATE_100,
                "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
val_txt = S["inp"]
val_num = S["inp_num"]
val_mad = S["inp_mad"]
val_int = wb.style(inp(numfmt=INT, align="center"))

# (label, default, style, named-range) - rows 2..14
settings = [
    ("Company Name",             "PayrollPro Company",            val_txt, "CompanyName"),
    ("Company Address",          "123 Business Ave, Casablanca",  val_txt, "CompanyAddress"),
    ("Company Phone",            "+212 522 000 000",              val_txt, "CompanyPhone"),
    ("Company Email",            "hr@payrollpro.ma",              val_txt, "CompanyEmail"),
    ("Worker Daily Wage",        150,                             val_mad, "WorkerDailyWage"),
    ("Worker Overtime Rate",     16.66,                           val_mad, "WorkerOvertimeRate"),
    ("Laborer Daily Wage",       100,                             val_mad, "LaborerDailyWage"),
    ("Laborer Overtime Rate",    11.11,                           val_mad, "LaborerOvertimeRate"),
    ("Currency",                 "MAD",                           val_int, "Currency"),
    ("Working Hours Per Day",    8,                               val_int, "WorkingHoursPerDay"),
    ("Weekend Day 1 (1=Mon)",    5,                               val_int, "WeekendDay1"),
    ("Weekend Day 2 (1=Mon)",    6,                               val_int, "WeekendDay2"),
    ("First Half End Day",       15,                              val_int, "FirstHalfEndDay"),
]
r = 2
for label, default, style, defname in settings:
    st.cell(f"A{r}", label, lbl)
    st.write(r, 2, default, style)
    wb.define_name(defname, f"Settings!$B${r}")
    st.set_row(r, 20)
    r += 1

# B15 : shows the payroll month (authoritative editable cell lives on Attendance!C2)
st.cell("A15", "Current Payroll Month", lbl)
st.write(15, 2, None, wb.style({"fill": EMERALD_50, "numfmt": MONYR,
         "font": {"bold": True, "color": EMERALD_700}, "border": border(*ALL),
         "align": {"horizontal": "center", "vertical": "center"}}),
         formula="PayrollMonth")
st.set_row(15, 20)

# weekend-day and split validations
st.add_list_validation("B12:B13", '"1,2,3,4,5,6,7"')
st.add_number_validation("B14", "between", "1", "28", decimal=False)
st.cell("A17", "Weekend: 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat 7=Sun. "
               "Change any value above and the whole workbook updates automatically.", S["note"])
st.merge("A17:B18"); st.set_row(17, 26)
st.protect = True

# Named range for the payroll month (the editable cell lives on the Attendance
# sheet at B2 - the top-left of the merged B2:C2 month selector)
wb.define_name("PayrollMonth", "'Attendance'!$B$2")


# =========================================================================== #
#  SHEET 1 & 2 : WORKERS LIST / LABORERS LIST  (Excel Tables)
# =========================================================================== #
LIST_HEADERS = ["Employee ID", "Full Name", "CIN Number", "CNSS Number",
                "Phone", "Position", "Start Date", "Status"]
LIST_WIDTHS  = [15, 26, 15, 16, 16, 20, 14, 12]

def build_list(sheet_name, table_name, id_style, hdr_style_key, accent, accent_lt, subtitle):
    sh = wb.add_sheet(sheet_name)
    sh.tab_color = accent
    sh.show_gridlines = False
    for i, w in enumerate(LIST_WIDTHS, start=1):
        sh.set_col(i, w)

    sh.merge("A1:H1"); sh.cell("A1", "  " + sheet_name.upper(), S["title"]); sh.set_row(1, 30)
    sh.merge("A2:H2"); sh.cell("A2", "  " + subtitle, S["subtitle"]); sh.set_row(2, 18)

    # header row (row 3)
    for i, h in enumerate(LIST_HEADERS, start=1):
        sh.write(L_HDR, i, h, S[hdr_style_key])
    sh.set_row(L_HDR, 26)

    # pre-formatted data rows
    for row in range(L_FIRST, L_LAST + 1):
        sh.write(row, 1, None, S[id_style])       # Employee ID
        sh.write(row, 2, None, S["inp"])          # Full Name
        sh.write(row, 3, None, S["inp_txt"])      # CIN
        sh.write(row, 4, None, S["inp_txt"])      # CNSS
        sh.write(row, 5, None, S["inp_txt"])      # Phone
        sh.write(row, 6, None, S["inp"])          # Position
        sh.write(row, 7, None, S["inp_date"])     # Start Date
        sh.write(row, 8, None, S["inp_c"])        # Status

    # the actual Excel Table object (Ctrl+T)
    sh.add_table(Table(table_name, f"A{L_HDR}:H{L_LAST}", LIST_HEADERS))

    # Status dropdown + conditional formatting
    sh.add_list_validation(f"H{L_FIRST}:H{L_LAST}", '"Active,Inactive"')
    sh.add_cond_expr(f"H{L_FIRST}:H{L_LAST}", f'$H{L_FIRST}="Active"', dxf_active, 1)
    sh.add_cond_expr(f"H{L_FIRST}:H{L_LAST}", f'$H{L_FIRST}="Inactive"', dxf_inactive, 2)

    # count formula under the table
    cnt = L_LAST + 2
    sh.merge(f"A{cnt}:C{cnt}")
    sh.write(cnt, 1, None, wb.style({"font": {"bold": True, "color": WHITE}, "fill": accent,
             "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL, color=WHITE)}),
             formula=f'"   Total: "&COUNTA({table_name}[Employee ID])&"  (add rows anytime - formulas auto-extend)"')
    sh.set_row(cnt, 22)

    sh.freeze_panes(L_HDR, 3)
    sh.protect = True
    sh.setup_page(orientation="landscape")
    sh.set_print_area(f"$A$1:$H${cnt}")
    return sh

workers = build_list("Workers List", "WorkersTable", "id_em", "hdr_em",
                     EMERALD_600, EMERALD_100,
                     "عمال · paid the Worker daily wage - overtime at the Worker OT rate (see Settings)")
laborers = build_list("Laborers List", "LaborersTable", "id_vi", "hdr_vi",
                      VIOLET_600, VIOLET_100,
                      "خدام · paid the Laborer daily wage - overtime at the Laborer OT rate (see Settings)")

# seed a few example rows so the workbook demonstrates itself
def seed(sh, rows):
    styles = ["id_em", "inp", "inp_txt", "inp_txt", "inp_txt", "inp", "inp_date", "inp_c"]
    for k, rec in enumerate(rows):
        rr = L_FIRST + k
        for i, v in enumerate(rec, start=1):
            key = styles[i - 1]
            if i == 1 and sh is laborers:
                key = "id_vi"
            sh.write(rr, i, v, S[key])

seed(workers, [
    ("W-001", "Youssef El Amrani", "AB12345", "1234567", "0612345678", "Mason",       dt.date(2022, 3, 1),  "Active"),
    ("W-002", "Karim Benali",      "AB67890", "2345678", "0623456789", "Carpenter",   dt.date(2021, 7, 15), "Active"),
    ("W-003", "Rachid Toumi",      "AC11223", "3456789", "0634567890", "Electrician", dt.date(2023, 1, 10), "Active"),
])
seed(laborers, [
    ("L-001", "Hassan Cherki",  "BE55667", "4567890", "0645678901", "Helper", dt.date(2023, 5, 20), "Active"),
    ("L-002", "Said Mansouri",  "BE77889", "5678901", "0656789012", "Loader", dt.date(2022, 11, 3), "Active"),
])


# =========================================================================== #
#  SHEET 3 : ATTENDANCE  (main daily-entry page)
# =========================================================================== #
att = wb.add_sheet("Attendance")
att.tab_color = SLATE_800
att.show_gridlines = False

worked_cols = [FD + 2 * (d - 1) for d in range(1, 32)]
ot_cols = [c + 1 for c in worked_cols]
last_col = CL(T_TOTAL)

att.set_col(1, 14); att.set_col(2, 24); att.set_col(3, 12)
for c in worked_cols:
    att.set_col(c, 3.6)
    att.set_col(c + 1, 4.4)
for c, w in ((T_WORKED, 9), (T_OT, 8), (T_REG, 14), (T_OTSAL, 14), (T_TOTAL, 15)):
    att.set_col(c, w)

# Row 1: title
att.merge(f"A1:{last_col}1")
att.cell("A1", "  DAILY ATTENDANCE  &  OVERTIME", S["title"]); att.set_row(1, 30)

# Row 2: month selector + quick-fill assistant
att.cell("A2", "Reporting Month →", wb.style(
    {"font": {"bold": True, "color": SLATE_700}, "align": {"horizontal": "right", "vertical": "center"}}))
att.merge("B2:C2")
att.write(2, 2, dt.date(2026, 1, 1), wb.style(inp(fill=EMERALD_50, numfmt=MONYR, align="center")))  # PayrollMonth
att.cell(f"{CL(FD)}2", "Quick-Fill Day:", wb.style(
    {"font": {"bold": True, "size": 9, "color": SLATE_700}, "align": {"horizontal": "right", "vertical": "center"}}))
att.merge(f"{CL(FD)}2:{CL(FD+1)}2")
att.write(2, FD + 2, None, wb.style(inp(fill=AMBER_100, numfmt=INT, align="center")))
qf_from = CL(FD + 3)
att.merge(f"{qf_from}2:{last_col}2")
att.cell(f"{qf_from}2",
         "Tip: select a day's 'P' column, type 1 (all present) or 0 (all absent), press Ctrl+Enter, then adjust cells.",
         wb.style({"font": {"size": 9, "italic": True, "color": SLATE_600},
                   "fill": SLATE_50, "align": {"horizontal": "left", "vertical": "center"}}))
att.set_row(2, 20)

# Row 3: legend / instructions
att.merge(f"A3:{last_col}3")
att.cell("A3", "  Legend:  1 = ✓ Present (green)   ·   0 = ✗ Absent (red)   ·   OT = overtime hours (amber)   ·   "
               "Weekend day headers are shaded pink.   Name, Type and all salaries fill in automatically.",
         S["note"]); att.set_row(3, 22)

# Row 4/5/6 : group header (day number) / weekday / sub header
att.set_row(4, 18); att.set_row(5, 14); att.set_row(6, 16)
att.merge("A4:A6"); att.cell("A4", "Employee ID", S["hdr"])
att.merge("B4:B6"); att.cell("B4", "Employee Name", S["hdr"])
att.merge("C4:C6"); att.cell("C4", "Type", S["hdr"])

y = "YEAR(PayrollMonth)"
m = "MONTH(PayrollMonth)"
lastday = f"DAY(DATE({y},{m}+1,0))"
for d in range(1, 32):
    wcol = FD + 2 * (d - 1)
    ocol = wcol + 1
    wL, oL = CL(wcol), CL(ocol)
    # day number (merged across the P + OT pair)
    att.merge(f"{wL}4:{oL}4")
    att.write(4, wcol, d, S["hdr_day"])
    # weekday text (merged)
    att.merge(f"{wL}5:{oL}5")
    att.write(5, wcol, None, S["hdr_dow"],
              formula=f'IF({d}>{lastday},"",TEXT(DATE({y},{m},{d}),"ddd"))')
    # sub headers
    att.write(6, wcol, "P", S["hdr_sub"])
    att.write(6, ocol, "OT", S["hdr_sub"])
    # weekend shading rule for this day (constant expression -> whole header pink)
    wknd = (f'AND({d}<={lastday},OR(WEEKDAY(DATE({y},{m},{d}),2)=WeekendDay1,'
            f'WEEKDAY(DATE({y},{m},{d}),2)=WeekendDay2))')
    att.add_cond_expr(f"{wL}4:{oL}6", wknd, dxf_weekend, priority=4)

# Summary group header
att.merge(f"{BNc}4:{BRc}4"); att.write(4, T_WORKED, "MONTHLY SUMMARY", S["hdr_sum"])
for c, t in ((T_WORKED, "Worked Days"), (T_OT, "OT Hrs"), (T_REG, "Regular Salary"),
             (T_OTSAL, "Overtime Pay"), (T_TOTAL, "Total Salary")):
    att.merge(f"{CL(c)}5:{CL(c)}6")
    att.write(5, c, t, S["hdr_sum"])

# Data rows
nW = "COUNTA(WorkersTable[Employee ID])"
nL = "COUNTA(LaborersTable[Employee ID])"
for row in range(A_FIRST, A_LAST + 1):
    k = row - A_FIRST + 1                       # 1-based employee index
    id_f = (f'IFERROR(IF({k}<={nW},INDEX(WorkersTable[Employee ID],{k}),'
            f'IF({k}<={nW}+{nL},INDEX(LaborersTable[Employee ID],{k}-{nW}),"")),"")')
    att.write(row, 1, None, S["f_id"], formula=id_f)
    att.write(row, 2, None, S["f_txt"],
              formula=(f'IF($A{row}="","",IFERROR(VLOOKUP($A{row},WorkersTable,2,FALSE),'
                       f'IFERROR(VLOOKUP($A{row},LaborersTable,2,FALSE),"")))'))
    att.write(row, 3, None, S["f_ctr"],
              formula=(f'IF($A{row}="","",IF(COUNTIF(WorkersTable[Employee ID],$A{row})>0,"Worker",'
                       f'IF(COUNTIF(LaborersTable[Employee ID],$A{row})>0,"Laborer","")))'))
    for c in worked_cols:
        att.write(row, c, None, S["day"])
        att.write(row, c + 1, None, S["ot"])
    att.write(row, T_WORKED, None, S["f_int"],
              formula=(f'IF($A{row}="","",SUMPRODUCT((MOD(COLUMN(${Dc}{row}:${BMc}{row})-COLUMN(${Dc}{row}),2)=0)'
                       f'*${Dc}{row}:${BMc}{row}))'))
    att.write(row, T_OT, None, S["f_dec"],
              formula=(f'IF($A{row}="","",SUMPRODUCT((MOD(COLUMN(${Dc}{row}:${BMc}{row})-COLUMN(${Dc}{row}),2)=1)'
                       f'*${Dc}{row}:${BMc}{row}))'))
    att.write(row, T_REG, None, S["f_mad"],
              formula=(f'IF($A{row}="","",${BNc}{row}*IF($C{row}="Worker",WorkerDailyWage,'
                       f'IF($C{row}="Laborer",LaborerDailyWage,0)))'))
    att.write(row, T_OTSAL, None, S["f_mad"],
              formula=(f'IF($A{row}="","",${BOc}{row}*IF($C{row}="Worker",WorkerOvertimeRate,'
                       f'IF($C{row}="Laborer",LaborerOvertimeRate,0)))'))
    att.write(row, T_TOTAL, None, S["f_mad_b"],
              formula=f'IF($A{row}="","",${BPc}{row}+${BQc}{row})')

# validation + conditional formatting for day / OT cells
worked_sqref = " ".join(f"{CL(c)}{A_FIRST}:{CL(c)}{A_LAST}" for c in worked_cols)
ot_sqref = " ".join(f"{CL(c)}{A_FIRST}:{CL(c)}{A_LAST}" for c in ot_cols)
att.add_number_validation(worked_sqref, "between", "0", "1", decimal=False)
att.add_number_validation(ot_sqref, "greaterThanOrEqual", "0", decimal=True)
att.add_cond_cellis(worked_sqref, "equal", "1", dxf_present, priority=1)
att.add_cond_cellis(worked_sqref, "equal", "0", dxf_absent, priority=2)
att.add_cond_cellis(ot_sqref, "greaterThan", "0", dxf_ot, priority=3)
# row banding on info + summary columns
att.add_cond_expr(f"A{A_FIRST}:C{A_LAST}", "MOD(ROW(),2)=0", dxf_band, priority=7)
att.add_cond_expr(f"{BNc}{A_FIRST}:{BRc}{A_LAST}", "MOD(ROW(),2)=0", dxf_band, priority=7)

att.freeze_panes(6, 3)
att.protect = True
att.setup_page(orientation="landscape", fit_width=1, fit_height=0)
att.set_print_area(f"$A$1:${last_col}${A_LAST}")

# Attendance-derived named ranges
def crange(sheet, col, r1, r2):
    return f"'{sheet}'!${col}${r1}:${col}${r2}"
wb.define_name("Att_ID",     crange("Attendance", "A", A_FIRST, A_LAST))
wb.define_name("Att_Name",   crange("Attendance", "B", A_FIRST, A_LAST))
wb.define_name("Att_Type",   crange("Attendance", "C", A_FIRST, A_LAST))
wb.define_name("Att_Worked", crange("Attendance", BNc, A_FIRST, A_LAST))
wb.define_name("Att_OT",     crange("Attendance", BOc, A_FIRST, A_LAST))
wb.define_name("Att_Reg",    crange("Attendance", BPc, A_FIRST, A_LAST))
wb.define_name("Att_OTSal",  crange("Attendance", BQc, A_FIRST, A_LAST))
wb.define_name("Att_Total",  crange("Attendance", BRc, A_FIRST, A_LAST))
# dynamic list of every employee ID (contiguous, no blanks) for dropdowns
wb.define_name("AllIDs",
               f"OFFSET(Attendance!$A${A_FIRST},0,0,MAX(1,COUNTIF(Attendance!$A${A_FIRST}:$A${A_LAST},\"?*\")),1)")


# =========================================================================== #
#  SHEET 4 : PAYROLL  (1st Half / 2nd Half / Full Month)
# =========================================================================== #
pay = wb.add_sheet("Payroll")
pay.tab_color = EMERALD_700
pay.show_gridlines = False

reg("grp_fh", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": EMERALD_600,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("grp_sh", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": VIOLET_600,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("grp_fm", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": SLATE_700,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("sub_fh", {"font": {"bold": True, "size": 9, "color": EMERALD_700}, "fill": EMERALD_100,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True}, "border": border(*ALL)})
reg("sub_sh", {"font": {"bold": True, "size": 9, "color": VIOLET_700}, "fill": VIOLET_100,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True}, "border": border(*ALL)})
reg("sub_fm", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": SLATE_600,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True}, "border": border(*ALL, color=WHITE)})

pay_widths = [14, 24, 11] + [9, 8, 13, 13, 14] * 3
for i, w in enumerate(pay_widths, start=1):
    pay.set_col(i, w)
PAY_LAST_COL = CL(3 + 15)   # R (18)

pay.merge(f"A1:{PAY_LAST_COL}1")
pay.cell("A1", "  PAYROLL  ·  first half / second half / full month", S["title"]); pay.set_row(1, 30)
pay.merge(f"A2:{PAY_LAST_COL}2")
pay.write(2, 1, None, S["subtitle"],
          formula='"  Month: "&TEXT(PayrollMonth,"mmmm yyyy")&"     ·  First Half = days 1-'
                  '"&FirstHalfEndDay&",  Second Half = the rest.  All values come from the Attendance sheet."')
pay.set_row(2, 18)

# group header (row 3) + sub header (row 4)
pay.set_row(3, 20); pay.set_row(4, 28)
pay.merge("A3:A4"); pay.cell("A3", "Employee ID", S["hdr"])
pay.merge("B3:B4"); pay.cell("B3", "Employee Name", S["hdr"])
pay.merge("C3:C4"); pay.cell("C3", "Type", S["hdr"])
groups = [(4, "1ST HALF  (Days 1-15)", "grp_fh", "sub_fh"),
          (9, "2ND HALF  (Days 16-31)", "grp_sh", "sub_sh"),
          (14, "FULL MONTH", "grp_fm", "sub_fm")]
subs = ["Worked Days", "OT Hours", "Regular Pay", "Overtime Pay", "Total Due"]
for start, title, gstyle, sstyle in groups:
    pay.merge(f"{CL(start)}3:{CL(start+4)}3")
    pay.cell(f"{CL(start)}3", title, S[gstyle])
    for j, t in enumerate(subs):
        pay.write(4, start + j, t, S[sstyle])

wage = lambda rr: f'IF($C{rr}="Worker",WorkerDailyWage,IF($C{rr}="Laborer",LaborerDailyWage,0))'
otrate = lambda rr: f'IF($C{rr}="Worker",WorkerOvertimeRate,IF($C{rr}="Laborer",LaborerOvertimeRate,0))'

def half_sum(ar, c1, c2, parity):
    return (f'SUMPRODUCT((MOD(COLUMN({ATT}${c1}{ar}:${c2}{ar})-COLUMN({ATT}${c1}{ar}),2)={parity})'
            f'*{ATT}${c1}{ar}:${c2}{ar})')

for idx in range(ATT_ROWS):
    pr = PR_FIRST + idx
    ar = A_FIRST + idx
    pay.write(pr, 1, None, S["f_id"], formula=f'IF({ATT}A{ar}="","",{ATT}A{ar})')
    pay.write(pr, 2, None, S["f_txt"], formula=f'IF($A{pr}="","",{ATT}B{ar})')
    pay.write(pr, 3, None, S["f_ctr"], formula=f'IF($A{pr}="","",{ATT}C{ar})')
    # first half (cols D..AG)
    pay.write(pr, 4, None, S["f_int"], formula=f'IF($A{pr}="","",{half_sum(ar, Dc, AGc, 0)})')
    pay.write(pr, 5, None, S["f_dec"], formula=f'IF($A{pr}="","",{half_sum(ar, Dc, AGc, 1)})')
    pay.write(pr, 6, None, S["f_mad"], formula=f'IF($A{pr}="","",$D{pr}*{wage(pr)})')
    pay.write(pr, 7, None, S["f_mad"], formula=f'IF($A{pr}="","",$E{pr}*{otrate(pr)})')
    pay.write(pr, 8, None, S["f_mad_b"], formula=f'IF($A{pr}="","",$F{pr}+$G{pr})')
    # second half (cols AH..BM)
    pay.write(pr, 9, None, S["f_int"], formula=f'IF($A{pr}="","",{half_sum(ar, AHc, BMc, 0)})')
    pay.write(pr, 10, None, S["f_dec"], formula=f'IF($A{pr}="","",{half_sum(ar, AHc, BMc, 1)})')
    pay.write(pr, 11, None, S["f_mad"], formula=f'IF($A{pr}="","",$I{pr}*{wage(pr)})')
    pay.write(pr, 12, None, S["f_mad"], formula=f'IF($A{pr}="","",$J{pr}*{otrate(pr)})')
    pay.write(pr, 13, None, S["f_mad_b"], formula=f'IF($A{pr}="","",$K{pr}+$L{pr})')
    # full month
    pay.write(pr, 14, None, S["f_int"], formula=f'IF($A{pr}="","",$D{pr}+$I{pr})')
    pay.write(pr, 15, None, S["f_dec"], formula=f'IF($A{pr}="","",$E{pr}+$J{pr})')
    pay.write(pr, 16, None, S["f_mad"], formula=f'IF($A{pr}="","",$F{pr}+$K{pr})')
    pay.write(pr, 17, None, S["f_mad"], formula=f'IF($A{pr}="","",$G{pr}+$L{pr})')
    pay.write(pr, 18, None, S["f_mad_b"], formula=f'IF($A{pr}="","",$H{pr}+$M{pr})')

pay.add_cond_expr(f"A{PR_FIRST}:{PAY_LAST_COL}{PR_LAST}", "MOD(ROW(),2)=1", dxf_band, priority=7)

# Grand total row
GT = PR_LAST + 1
pay.merge(f"A{GT}:C{GT}")
pay.cell(f"A{GT}", "GRAND TOTAL", wb.style(
    {"font": {"bold": True, "color": WHITE}, "fill": SLATE_800,
     "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL, color=WHITE)}))
gt_int = wb.style({"font": {"bold": True, "color": SLATE_800}, "numfmt": INT, "fill": SLATE_100,
                   "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
gt_dec = wb.style({"font": {"bold": True, "color": SLATE_800}, "numfmt": DEC, "fill": SLATE_100,
                   "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
gt_mad = wb.style({"font": {"bold": True, "color": EMERALD_700}, "numfmt": MAD, "fill": EMERALD_100,
                   "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
for c in range(4, 19):
    col = CL(c)
    kind = (c - 4) % 5
    style = gt_int if kind == 0 else gt_dec if kind == 1 else gt_mad
    pay.write(GT, c, None, style, formula=f"SUM({col}{PR_FIRST}:{col}{PR_LAST})")
pay.set_row(GT, 22)

# Summary cards
def card(sheet, row, col1, col2, label, formula, accent):
    sheet.merge(f"{CL(col1)}{row}:{CL(col2)}{row}")
    sheet.write(row, col1, label, wb.style(
        {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": accent,
         "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)}))
    sheet.merge(f"{CL(col1)}{row+1}:{CL(col2)}{row+1}")
    sheet.write(row + 1, col1, None, wb.style(
        {"font": {"bold": True, "size": 16, "color": accent}, "numfmt": MAD, "fill": WHITE,
         "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=accent)}),
        formula=formula)
    sheet.set_row(row, 20); sheet.set_row(row + 1, 30)

cr = GT + 2
pay.cell(f"A{cr}", "MONTH TOTALS", wb.style({"font": {"bold": True, "color": SLATE_700}}))
card(pay, cr + 1, 1, 4, "Total Regular Pay",  f"SUM(P{PR_FIRST}:P{PR_LAST})", EMERALD_600)
card(pay, cr + 1, 6, 9, "Total Overtime Pay", f"SUM(Q{PR_FIRST}:Q{PR_LAST})", AMBER_500)
card(pay, cr + 1, 11, 15, "Total Amount Due", f"SUM(R{PR_FIRST}:R{PR_LAST})", EMERALD_700)

pay.freeze_panes(4, 3)
pay.protect = True
pay.setup_page(orientation="landscape", fit_width=1, fit_height=0)
pay.set_print_area(f"$A$1:${PAY_LAST_COL}${cr+2}")

# Payroll named ranges (row-aligned with Pay_ID) for Search / Payslip
wb.define_name("Pay_ID",        crange("Payroll", "A", PR_FIRST, PR_LAST))
wb.define_name("Pay_FH_Days",   crange("Payroll", "D", PR_FIRST, PR_LAST))
wb.define_name("Pay_FH_OT",     crange("Payroll", "E", PR_FIRST, PR_LAST))
wb.define_name("Pay_FH_Reg",    crange("Payroll", "F", PR_FIRST, PR_LAST))
wb.define_name("Pay_SH_Days",   crange("Payroll", "I", PR_FIRST, PR_LAST))
wb.define_name("Pay_SH_OT",     crange("Payroll", "J", PR_FIRST, PR_LAST))
wb.define_name("Pay_SH_Reg",    crange("Payroll", "K", PR_FIRST, PR_LAST))
wb.define_name("Pay_Full_Days", crange("Payroll", "N", PR_FIRST, PR_LAST))
wb.define_name("Pay_Full_OT",   crange("Payroll", "O", PR_FIRST, PR_LAST))
wb.define_name("Pay_Full_Reg",  crange("Payroll", "P", PR_FIRST, PR_LAST))
wb.define_name("Pay_Full_OTPay", crange("Payroll", "Q", PR_FIRST, PR_LAST))
wb.define_name("Pay_Full_Total", crange("Payroll", "R", PR_FIRST, PR_LAST))


# =========================================================================== #
#  SHEET 5 : SEARCH  (employee dashboard card)
# =========================================================================== #
srch = wb.add_sheet("Search")
srch.tab_color = EMERALD_600
srch.show_gridlines = False
for c, w in ((1, 3), (2, 26), (3, 30), (4, 6)):
    srch.set_col(c, w)

reg("c_lbl", {"font": {"bold": True, "size": 10, "color": SLATE_700}, "fill": SLATE_100,
              "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("c_val", {"font": {"size": 11, "color": SLATE_800}, "fill": WHITE,
              "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("c_val_b", {"font": {"size": 11, "bold": True, "color": SLATE_800}, "fill": WHITE,
                "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("c_mad", {"font": {"size": 11, "color": EMERALD_700}, "numfmt": MAD, "fill": EMERALD_50,
              "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("c_int", {"font": {"size": 11, "color": SLATE_800}, "numfmt": INT, "fill": WHITE,
              "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("c_date", {"font": {"size": 11, "color": SLATE_800}, "numfmt": DATE, "fill": WHITE,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("c_sec", {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": SLATE_600,
              "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL, color=WHITE)})

srch.merge("B1:C1"); srch.cell("B1", "  EMPLOYEE SEARCH DASHBOARD", S["title"]); srch.set_row(1, 30)
srch.cell("B3", "Select Employee:", wb.style(
    {"font": {"bold": True, "size": 11, "color": SLATE_700}, "align": {"horizontal": "right", "vertical": "center"}}))
srch.write(3, 3, None, S["inp_c"])
srch.add_list_validation("C3", "AllIDs")

# helper cells (kept off the print area)
srch.cell("H1", None, wb.style({"font": {"color": WHITE}}), formula="$C$3")
srch.cell("H2", None, wb.style({"font": {"color": WHITE}}), formula="IFERROR(MATCH(SelID,Pay_ID,0),0)")
wb.define_name("SelID", "Search!$H$1")
wb.define_name("SelRow", "Search!$H$2")

def sv(rng):
    return f'IF(OR(SelID="",SelRow=0),"",INDEX({rng},SelRow))'
def slk(col):
    return (f'IF(SelID="","",IFERROR(VLOOKUP(SelID,WorkersTable,{col},FALSE),'
            f'IFERROR(VLOOKUP(SelID,LaborersTable,{col},FALSE),"")))')
type_f = ('IF(SelID="","",IF(COUNTIF(WorkersTable[Employee ID],SelID)>0,"Worker",'
          'IF(COUNTIF(LaborersTable[Employee ID],SelID)>0,"Laborer","")))')

def field(row, label, style_key, formula, lblstyle="c_lbl"):
    srch.cell(f"B{row}", label, S[lblstyle])
    srch.write(row, 3, None, S[style_key], formula=formula)
    srch.set_row(row, 20)

field(7,  "Employee ID",   "c_val_b", 'IF(SelID="","",SelID)')
field(8,  "Full Name",     "c_val_b", sv("Att_Name"))
field(9,  "Type",          "c_val",   type_f)
field(10, "CIN Number",    "c_val",   slk(3))
field(11, "CNSS Number",   "c_val",   slk(4))
field(12, "Phone",         "c_val",   slk(5))
field(13, "Position",      "c_val",   slk(6))
field(14, "Start Date",    "c_date",  slk(7))
field(15, "Status",        "c_val",   slk(8))

srch.merge("B16:C16"); srch.cell("B16", "  PAYROLL SUMMARY", S["c_sec"]); srch.set_row(16, 20)
field(17, "Days Worked (1st Half)",   "c_int", sv("Pay_FH_Days"))
field(18, "Overtime Hours (1st Half)", "c_int", sv("Pay_FH_OT"))
field(19, "Salary (1st Half)",        "c_mad", sv("Pay_FH_Reg"))
field(20, "Days Worked (2nd Half)",   "c_int", sv("Pay_SH_Days"))
field(21, "Overtime Hours (2nd Half)", "c_int", sv("Pay_SH_OT"))
field(22, "Salary (2nd Half)",        "c_mad", sv("Pay_SH_Reg"))
field(23, "Monthly Salary",           "c_mad", sv("Pay_Full_Reg"))
field(24, "Total Overtime Pay",       "c_mad", sv("Pay_Full_OTPay"))

# Total Amount Due (bold, emerald)
srch.cell("B25", "TOTAL AMOUNT DUE", wb.style(
    {"font": {"bold": True, "size": 12, "color": WHITE}, "fill": EMERALD_700,
     "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL, color=WHITE)}))
srch.write(25, 3, None, wb.style(
    {"font": {"bold": True, "size": 14, "color": EMERALD_700}, "numfmt": MAD, "fill": EMERALD_100,
     "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL, color=EMERALD_600)}),
    formula=sv("Pay_Full_Total"))
srch.set_row(25, 30)

srch.protect = True
srch.setup_page(orientation="portrait")
srch.set_print_area("$B$1:$C$25")


# =========================================================================== #
#  SHEET 6 : PAYSLIP  (A4 printable)
# =========================================================================== #
slip = wb.add_sheet("Payslip")
slip.tab_color = SLATE_600
slip.show_gridlines = False
for c, w in ((1, 3), (2, 20), (3, 20), (4, 18), (5, 20), (6, 3)):
    slip.set_col(c, w)

reg("p_comp", {"font": {"bold": True, "size": 20, "color": SLATE_800},
               "align": {"horizontal": "center", "vertical": "center"}})
reg("p_meta", {"font": {"size": 9, "color": SLATE_500}, "align": {"horizontal": "center", "vertical": "center"}})
reg("p_sub",  {"font": {"bold": True, "size": 12, "color": EMERALD_700},
               "align": {"horizontal": "center", "vertical": "center"}})
reg("p_sec",  {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": SLATE_700,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("p_lbl",  {"font": {"bold": True, "size": 10, "color": SLATE_700}, "fill": SLATE_100,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("p_val",  {"font": {"size": 11, "color": SLATE_800}, "align": {"horizontal": "left", "vertical": "center"},
               "border": border(*ALL)})
reg("p_valc", {"font": {"size": 11, "color": SLATE_800}, "numfmt": DATE,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("p_mad",  {"font": {"size": 11, "bold": True, "color": SLATE_800}, "numfmt": MAD, "fill": EMERALD_50,
               "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("p_sign", {"border": {"top": {"style": "medium", "color": SLATE_700}},
               "align": {"horizontal": "center", "vertical": "top"},
               "font": {"size": 9, "color": SLATE_500}})

slip.merge("B1:E1"); slip.write(1, 2, None, S["p_comp"], formula="CompanyName"); slip.set_row(1, 28)
slip.merge("B2:E2"); slip.write(2, 2, None, S["p_meta"],
           formula='CompanyAddress&"   ·   "&CompanyPhone&"   ·   "&CompanyEmail'); slip.set_row(2, 16)
slip.merge("B3:E3"); slip.write(3, 2, None, S["p_sub"],
           formula='"PAYSLIP · BULLETIN DE PAIE  —  "&TEXT(PayrollMonth,"mmmm yyyy")'); slip.set_row(3, 22)

slip.cell("B5", "Select Employee ID:", wb.style(
    {"font": {"bold": True, "size": 11, "color": SLATE_700}, "align": {"horizontal": "right", "vertical": "center"}}))
slip.merge("C5:D5"); slip.write(5, 3, None, S["inp_c"])
slip.add_list_validation("C5:D5", "AllIDs")

slip.cell("H1", None, wb.style({"font": {"color": WHITE}}), formula="$C$5")
slip.cell("H2", None, wb.style({"font": {"color": WHITE}}), formula="IFERROR(MATCH(PS_ID,Pay_ID,0),0)")
wb.define_name("PS_ID", "Payslip!$H$1")
wb.define_name("PS_Row", "Payslip!$H$2")

def pv(rng):
    return f'IF(OR(PS_ID="",PS_Row=0),"",INDEX({rng},PS_Row))'
def plk(col):
    return (f'IF(PS_ID="","",IFERROR(VLOOKUP(PS_ID,WorkersTable,{col},FALSE),'
            f'IFERROR(VLOOKUP(PS_ID,LaborersTable,{col},FALSE),"")))')
ptype = ('IF(PS_ID="","",IF(COUNTIF(WorkersTable[Employee ID],PS_ID)>0,"Worker",'
         'IF(COUNTIF(LaborersTable[Employee ID],PS_ID)>0,"Laborer","")))')

# Employee information
slip.merge("B7:E7"); slip.cell("B7", "  EMPLOYEE INFORMATION", S["p_sec"]); slip.set_row(7, 20)
slip.cell("B8", "Employee ID", S["p_lbl"]);  slip.write(8, 3, None, S["p_val"], formula='IF(PS_ID="","",PS_ID)')
slip.cell("D8", "Type", S["p_lbl"]);         slip.write(8, 5, None, S["p_val"], formula=ptype)
slip.cell("B9", "Full Name", S["p_lbl"]);    slip.merge("C9:E9"); slip.write(9, 3, None, S["p_val"], formula=pv("Att_Name"))
slip.cell("B10", "CIN Number", S["p_lbl"]);  slip.write(10, 3, None, S["p_val"], formula=plk(3))
slip.cell("D10", "CNSS Number", S["p_lbl"]); slip.write(10, 5, None, S["p_val"], formula=plk(4))
slip.cell("B11", "Position", S["p_lbl"]);    slip.write(11, 3, None, S["p_val"], formula=plk(6))
slip.cell("D11", "Start Date", S["p_lbl"]);  slip.write(11, 5, None, S["p_valc"], formula=plk(7))

# Earnings
slip.merge("B13:E13"); slip.cell("B13", "  EARNINGS", S["p_sec"]); slip.set_row(13, 20)
slip.cell("B14", "Worked Days", S["p_lbl"]);    slip.write(14, 3, None, S["p_val"], formula=pv("Pay_Full_Days"))
slip.cell("D14", "Daily Wage", S["p_lbl"]);     slip.write(14, 5, None, S["p_mad"],
          formula='IF(PS_ID="","",IF(INDEX(Att_Type,PS_Row)="Worker",WorkerDailyWage,LaborerDailyWage))')
slip.cell("B15", "Regular Salary", S["p_lbl"]); slip.write(15, 3, None, S["p_mad"], formula=pv("Pay_Full_Reg"))
slip.cell("D15", "Overtime Hours", S["p_lbl"]); slip.write(15, 5, None, S["p_val"], formula=pv("Pay_Full_OT"))
slip.cell("B16", "Overtime Pay", S["p_lbl"]);   slip.write(16, 3, None, S["p_mad"], formula=pv("Pay_Full_OTPay"))
slip.cell("D16", "OT Rate / hr", S["p_lbl"]);   slip.write(16, 5, None, S["p_mad"],
          formula='IF(PS_ID="","",IF(INDEX(Att_Type,PS_Row)="Worker",WorkerOvertimeRate,LaborerOvertimeRate))')

# Net total
slip.merge("B18:C18"); slip.cell("B18", "TOTAL AMOUNT DUE", wb.style(
    {"font": {"bold": True, "size": 13, "color": WHITE}, "fill": EMERALD_700,
     "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)}))
slip.merge("D18:E18"); slip.write(18, 4, None, wb.style(
    {"font": {"bold": True, "size": 16, "color": EMERALD_700}, "numfmt": MAD, "fill": EMERALD_100,
     "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=EMERALD_600)}),
    formula=pv("Pay_Full_Total")); slip.set_row(18, 32)

# Signatures
slip.write(21, 2, None, S["p_meta"], formula='"Issued: "&TEXT(TODAY(),"dd/mm/yyyy")')
slip.merge("B21:C21")
slip.merge("B23:C23"); slip.cell("B23", "Employee Signature", S["p_sign"]); slip.set_row(23, 30)
slip.merge("D23:E23"); slip.cell("D23", "Employer Signature", S["p_sign"])

slip.protect = True
slip.setup_page(orientation="portrait", fit_width=1, fit_height=1)
slip.set_print_area("$A$1:$F$25")


# =========================================================================== #
#  SHEET 7 : DASHBOARD  (KPIs + charts)  -- bonus
# =========================================================================== #
dash = wb.add_sheet("Dashboard")
dash.tab_color = SLATE_700
dash.show_gridlines = False
dash.set_col(1, 3)
for c in range(2, 10):
    dash.set_col(c, 14)

def kpi_label(color):
    return wb.style({"font": {"bold": True, "size": 10, "color": WHITE}, "fill": color,
                     "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
kpi_int = wb.style({"font": {"bold": True, "size": 20, "color": SLATE_800}, "numfmt": INT, "fill": SLATE_50,
                    "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
kpi_mad = wb.style({"font": {"bold": True, "size": 15, "color": SLATE_800}, "numfmt": MAD, "fill": SLATE_50,
                    "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
ct_hd = wb.style({"font": {"bold": True, "size": 10, "color": SLATE_700}, "fill": SLATE_100,
                  "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
ct_v = wb.style({"numfmt": INT, "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
ct_m = wb.style({"numfmt": MAD, "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})

dash.merge("B1:I1"); dash.cell("B1", "  PAYROLL DASHBOARD", S["title"]); dash.set_row(1, 30)
dash.merge("B2:I2"); dash.cell("B2", "  Live statistics - everything recalculates as attendance is entered.",
                                S["subtitle"]); dash.set_row(2, 16)

kpis = [
    ("Total Workers",       "COUNTA(WorkersTable[Employee ID])",  kpi_int, EMERALD_600),
    ("Total Laborers",      "COUNTA(LaborersTable[Employee ID])", kpi_int, VIOLET_600),
    ("Total Worked Days",   "SUM(Att_Worked)",                    kpi_int, SLATE_700),
    ("Total Overtime Cost", "SUM(Att_OTSal)",                     kpi_mad, AMBER_500),
    ("Total Payroll",       "SUM(Att_Total)",                     kpi_mad, EMERALD_700),
    ("Average Salary",      'IFERROR(AVERAGEIF(Att_Total,">0"),0)', kpi_mad, SLATE_600),
    ("Highest Salary",      "IFERROR(MAX(Att_Total),0)",          kpi_mad, EMERALD_600),
    ("Lowest Salary",       'IFERROR(MINIFS(Att_Total,Att_Total,">0"),0)', kpi_mad, VIOLET_600),
]
positions = [(2, 3), (4, 5), (6, 7), (8, 9)]
for i, (label, formula, vstyle, color) in enumerate(kpis):
    block = i // 4
    lrow = 4 + block * 3
    vrow = lrow + 1
    c1, c2 = positions[i % 4]
    dash.merge(f"{CL(c1)}{lrow}:{CL(c2)}{lrow}")
    dash.write(lrow, c1, label, kpi_label(color)); dash.set_row(lrow, 20)
    dash.merge(f"{CL(c1)}{vrow}:{CL(c2)}{vrow}")
    dash.write(vrow, c1, None, vstyle, formula=formula); dash.set_row(vrow, 32)

dash.cell("B11", "Workforce", ct_hd); dash.cell("C11", "Count", ct_hd)
dash.cell("B12", "Workers", ct_hd);   dash.write(12, 3, None, ct_v, formula="COUNTA(WorkersTable[Employee ID])")
dash.cell("B13", "Laborers", ct_hd);  dash.write(13, 3, None, ct_v, formula="COUNTA(LaborersTable[Employee ID])")
dash.cell("E11", "Payroll Split", ct_hd); dash.cell("F11", "MAD", ct_hd)
dash.cell("E12", "Regular Pay", ct_hd);   dash.write(12, 6, None, ct_m, formula="SUM(Att_Reg)")
dash.cell("E13", "Overtime Pay", ct_hd);  dash.write(13, 6, None, ct_m, formula="SUM(Att_OTSal)")

pie = Chart("pie", "Workforce Split",
            cat_ref="Dashboard!$B$12:$B$13", val_ref="Dashboard!$C$12:$C$13",
            series_name="Dashboard!$B$11",
            colors=[EMERALD_600, VIOLET_600])
wb.add_chart(dash, pie, anchor=(1, 14, 5, 30))
bar = Chart("bar", "Payroll Composition (MAD)",
            cat_ref="Dashboard!$E$12:$E$13", val_ref="Dashboard!$F$12:$F$13",
            series_name="Dashboard!$E$11", colors=[EMERALD_600])
wb.add_chart(dash, bar, anchor=(5, 14, 9, 30))

dash.protect = True
dash.setup_page(orientation="landscape")
dash.set_print_area("$B$1:$I$30")


# =========================================================================== #
#  SHEET 8 : MONTHLY REPORT  -- bonus, printable
# =========================================================================== #
rep = wb.add_sheet("Monthly Report")
rep.tab_color = EMERALD_600
rep.show_gridlines = False
rcols = [("#", 5), ("Employee ID", 14), ("Name", 24), ("Type", 11), ("CIN", 13),
         ("CNSS", 14), ("Worked Days", 11), ("OT Hours", 10),
         ("Regular Salary", 14), ("Overtime Pay", 14), ("Total Salary", 15)]
for i, (_, w) in enumerate(rcols, start=1):
    rep.set_col(i, w)

rep.merge("A1:K1"); rep.cell("A1", "  MONTHLY PAYROLL REPORT", S["title"]); rep.set_row(1, 30)
rep.merge("A2:K2"); rep.write(2, 1, None, S["subtitle"],
          formula='"  "&CompanyName&"   ·   "&TEXT(PayrollMonth,"mmmm yyyy")'); rep.set_row(2, 18)

RHDR = 3
for i, (h, _) in enumerate(rcols, start=1):
    rep.write(RHDR, i, h, S["hdr"])
rep.set_row(RHDR, 24)

R_FIRST = RHDR + 1
for idx in range(ATT_ROWS):
    rr = R_FIRST + idx
    ar = A_FIRST + idx
    rep.write(rr, 1, None, S["f_ctr"], formula=f'IF($B{rr}="","",ROW()-{R_FIRST}+1)')
    rep.write(rr, 2, None, S["f_id"],  formula=f'IF({ATT}A{ar}="","",{ATT}A{ar})')
    rep.write(rr, 3, None, S["f_txt"], formula=f'IF($B{rr}="","",{ATT}B{ar})')
    rep.write(rr, 4, None, S["f_ctr"], formula=f'IF($B{rr}="","",{ATT}C{ar})')
    rep.write(rr, 5, None, S["f_ctr"],
              formula=(f'IF($B{rr}="","",IFERROR(VLOOKUP($B{rr},WorkersTable,3,FALSE),'
                       f'IFERROR(VLOOKUP($B{rr},LaborersTable,3,FALSE),"")))'))
    rep.write(rr, 6, None, S["f_ctr"],
              formula=(f'IF($B{rr}="","",IFERROR(VLOOKUP($B{rr},WorkersTable,4,FALSE),'
                       f'IFERROR(VLOOKUP($B{rr},LaborersTable,4,FALSE),"")))'))
    rep.write(rr, 7, None, S["f_int"], formula=f'IF($B{rr}="","",{ATT}{BNc}{ar})')
    rep.write(rr, 8, None, S["f_dec"], formula=f'IF($B{rr}="","",{ATT}{BOc}{ar})')
    rep.write(rr, 9, None, S["f_mad"], formula=f'IF($B{rr}="","",{ATT}{BPc}{ar})')
    rep.write(rr, 10, None, S["f_mad"], formula=f'IF($B{rr}="","",{ATT}{BQc}{ar})')
    rep.write(rr, 11, None, S["f_mad_b"], formula=f'IF($B{rr}="","",{ATT}{BRc}{ar})')

R_LAST = R_FIRST + ATT_ROWS - 1
GTR = R_LAST + 1
rep.merge(f"A{GTR}:F{GTR}")
rep.cell(f"A{GTR}", "GRAND TOTAL   ", wb.style(
    {"font": {"bold": True, "color": WHITE}, "fill": SLATE_800,
     "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL, color=WHITE)}))
rep.write(GTR, 7, None, gt_int, formula=f"SUM(G{R_FIRST}:G{R_LAST})")
rep.write(GTR, 8, None, gt_dec, formula=f"SUM(H{R_FIRST}:H{R_LAST})")
rep.write(GTR, 9, None, gt_mad, formula=f"SUM(I{R_FIRST}:I{R_LAST})")
rep.write(GTR, 10, None, gt_mad, formula=f"SUM(J{R_FIRST}:J{R_LAST})")
rep.write(GTR, 11, None, gt_mad, formula=f"SUM(K{R_FIRST}:K{R_LAST})")
rep.set_row(GTR, 22)

rep.add_cond_expr(f"A{R_FIRST}:K{R_LAST}", "MOD(ROW(),2)=0", dxf_band, priority=7)
rep.freeze_panes(RHDR, 0)
rep.protect = True
rep.setup_page(orientation="landscape", fit_width=1, fit_height=0)
rep.set_print_area(f"$A$1:$K${GTR}")


# --------------------------------------------------------------------------- #
#  Open on the Attendance sheet
# --------------------------------------------------------------------------- #
wb.active_tab = 3     # Attendance (0=Settings,1=Workers,2=Laborers,3=Attendance)

OUT = "Payroll_Management_System.xlsx"
wb.save(OUT)
print("Saved", OUT)
