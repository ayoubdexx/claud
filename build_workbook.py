"""
build_workbook.py
Generates "Payroll_Management_System.xlsx" - a complete, automated payroll
workbook for a Moroccan company. Uses the dependency-free xlsxgen engine.
"""

import datetime as dt
from xlsxgen import Workbook, Chart, col_letter

# --------------------------------------------------------------------------- #
#  Capacities & layout constants
# --------------------------------------------------------------------------- #
LIST_ROWS = 80                     # employees per list
L_FIRST, L_LAST = 4, 4 + LIST_ROWS - 1          # 4 .. 83

ATT_ROWS = 160                     # attendance capacity (workers + laborers)
A_FIRST, A_LAST = 5, 5 + ATT_ROWS - 1           # 5 .. 164

FD = 4                             # first Day column (D)
LD = FD + 2 * 31 - 1               # last OT column   (BM = 65)
FH_LAST = FD + 2 * 15 - 1          # first-half last col (AG = 33)
SH_FIRST = FH_LAST + 1             # second-half first col (AH = 34)
T_WORKED = LD + 1                  # BN 66
T_OT = LD + 2                      # BO 67
T_REG = LD + 3                     # BP 68
T_OTSAL = LD + 4                   # BQ 69
T_TOTAL = LD + 5                   # BR 70

CL = col_letter

# --------------------------------------------------------------------------- #
#  Colour palette
# --------------------------------------------------------------------------- #
NAVY     = "FF1F3864"
NAVY2    = "FF2E4E7E"
BLUE     = "FF2E75B6"
BLUE_LT  = "FFDDEBF7"
BLUE_XL  = "FFEAF1FA"
BLUE_MED = "FFBDD7EE"
GREEN    = "FF548235"
GREEN_LT = "FFE2EFDA"
GREEN_HD = "FF70AD47"
GOLD     = "FFBF9000"
GOLD_LT  = "FFFFF2CC"
GRAY_LT  = "FFF2F2F2"
GRAY_MD  = "FFD9D9D9"
GRAY_TX  = "FF808080"
RED      = "FFC00000"
RED_LT   = "FFF8CBAD"
WHITE    = "FFFFFFFF"
TEAL     = "FF2A9D8F"
GREEN_OK = "FFC6EFCE"
GREEN_OKT= "FF006100"
AMBER    = "FFFFEB9C"
AMBER_TX = "FF9C6500"

# Number formats
MAD  = '#,##0.00" MAD"'
INT  = '#,##0'
DEC1 = '0.0'
DATE = 'dd/mm/yyyy'
TEXT = '@'

wb = Workbook()
wb.active_tab = 3          # open on Daily Attendance (index 3)

# --------------------------------------------------------------------------- #
#  Style helpers
# --------------------------------------------------------------------------- #
def border(*sides, style="thin", color=GRAY_MD):
    return {s: {"style": style, "color": color} for s in sides}

ALL = ("left", "right", "top", "bottom")

S = {}
def reg(name, spec):
    S[name] = wb.style(spec)
    return S[name]

# Titles / banners
reg("title",     {"font": {"bold": True, "size": 20, "color": WHITE, "name": "Calibri"},
                  "fill": NAVY, "align": {"horizontal": "left", "vertical": "center"}})
reg("title_c",   {"font": {"bold": True, "size": 20, "color": WHITE},
                  "fill": NAVY, "align": {"horizontal": "center", "vertical": "center"}})
reg("subtitle",  {"font": {"size": 10, "italic": True, "color": WHITE},
                  "fill": NAVY2, "align": {"horizontal": "left", "vertical": "center"}})
reg("banner",    {"font": {"bold": True, "size": 12, "color": WHITE},
                  "fill": BLUE, "align": {"horizontal": "left", "vertical": "center"}})

# Table headers
reg("hdr",       {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": NAVY,
                  "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                  "border": border(*ALL, color=NAVY)})
reg("hdr_l",     {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": NAVY,
                  "align": {"horizontal": "left", "vertical": "center"},
                  "border": border(*ALL, color=NAVY)})
reg("hdr_fh",    {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": GREEN_HD,
                  "align": {"horizontal": "center", "vertical": "center"},
                  "border": border(*ALL, color=WHITE)})
reg("hdr_sh",    {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": BLUE,
                  "align": {"horizontal": "center", "vertical": "center"},
                  "border": border(*ALL, color=WHITE)})
reg("hdr_sub",   {"font": {"bold": True, "size": 8, "color": NAVY}, "fill": GRAY_LT,
                  "align": {"horizontal": "center", "vertical": "center"},
                  "border": border(*ALL)})
reg("hdr_sum",   {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": GOLD,
                  "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                  "border": border(*ALL, color=WHITE)})

# Data - input (editable)
reg("inp",       {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                  "align": {"vertical": "center"}})
reg("inp_c",     {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_date",  {"fill": GOLD_LT, "locked": False, "border": border(*ALL), "numfmt": DATE,
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_txt",   {"fill": GOLD_LT, "locked": False, "border": border(*ALL), "numfmt": TEXT,
                  "align": {"horizontal": "center", "vertical": "center"}})

# Attendance day-entry cells
reg("day",       {"locked": False, "border": border(*ALL), "font": {"size": 10},
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("ot",        {"locked": False, "border": border(*ALL), "numfmt": DEC1, "fill": BLUE_XL,
                  "font": {"size": 10, "color": GRAY_TX},
                  "align": {"horizontal": "center", "vertical": "center"}})

# Data - formula (locked)
reg("f_id",      {"font": {"bold": True, "color": NAVY}, "border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt",     {"border": border(*ALL), "align": {"vertical": "center"}})
reg("f_ctr",     {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_int",     {"border": border(*ALL), "numfmt": INT, "fill": GREEN_LT,
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("f_dec",     {"border": border(*ALL), "numfmt": DEC1, "fill": GREEN_LT,
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("f_mad",     {"border": border(*ALL), "numfmt": MAD, "fill": GREEN_LT,
                  "align": {"horizontal": "right", "vertical": "center"}})
reg("f_mad_b",   {"font": {"bold": True, "color": NAVY}, "border": border(*ALL),
                  "numfmt": MAD, "fill": BLUE_LT,
                  "align": {"horizontal": "right", "vertical": "center"}})

# Row banding (applied through conditional formatting instead of per-cell)
band_dxf = wb.dxf({"fill": BLUE_LT})
worked_dxf = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_OKT, "bold": True}})
ot_dxf = wb.dxf({"fill": AMBER, "font": {"color": AMBER_TX, "bold": True}})
active_dxf = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_OKT}})
inactive_dxf = wb.dxf({"fill": RED_LT, "font": {"color": RED}})

# Legend swatches
reg("lg_inp",  {"fill": GOLD_LT, "border": border(*ALL),
                "font": {"size": 9}, "align": {"horizontal": "center", "vertical": "center"}})
reg("lg_frm",  {"fill": GREEN_LT, "border": border(*ALL),
                "font": {"size": 9}, "align": {"horizontal": "center", "vertical": "center"}})
reg("lg_sum",  {"fill": BLUE_LT, "border": border(*ALL),
                "font": {"size": 9}, "align": {"horizontal": "center", "vertical": "center"}})
reg("lg_lbl",  {"font": {"size": 9, "color": GRAY_TX}, "align": {"vertical": "center"}})


# --------------------------------------------------------------------------- #
#  1. CONFIG (hidden) - rates & company info
# --------------------------------------------------------------------------- #
cfg = wb.add_sheet("Config")
cfg.hidden = True
cfg.set_col(1, 26); cfg.set_col(2, 26)
lbl = wb.style({"font": {"bold": True, "color": NAVY}, "align": {"vertical": "center"}})
val = wb.style({"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "center", "vertical": "center"}})
val_mad = wb.style({"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                    "numfmt": MAD, "align": {"horizontal": "center", "vertical": "center"}})

cfg.cell("A1", "CONFIGURATION (rates & company)", S["banner"])
cfg.merge("A1:B1")
rows_cfg = [
    ("Company Name", "Societe Exemple SARL", val, "CompanyName"),
    ("Payroll Month", "Janvier 2026", val, "PayrollMonth"),
    ("Worker Daily Wage", 150, val_mad, "Worker_DailyWage"),
    ("Worker Overtime Rate", 16.66, val_mad, "Worker_OTRate"),
    ("Laborer Daily Wage", 100, val_mad, "Laborer_DailyWage"),
    ("Laborer Overtime Rate", 11.11, val_mad, "Laborer_OTRate"),
]
r = 3
for name, default, style, defname in rows_cfg:
    cfg.cell(f"A{r}", name, lbl)
    cfg.write(r, 2, default, style)
    wb.define_name(defname, f"Config!$B${r}")
    r += 1
cfg.protect = True

# --------------------------------------------------------------------------- #
#  Named ranges for the two employee lists
# --------------------------------------------------------------------------- #
def col_range(sheet, col, r1, r2):
    return f"'{sheet}'!${col}${r1}:${col}${r2}"

wb.define_name("Workers_ID",   col_range("Workers List", "A", L_FIRST, L_LAST))
wb.define_name("Workers_Name", col_range("Workers List", "B", L_FIRST, L_LAST))
wb.define_name("Workers_Data", f"'Workers List'!$A${L_FIRST}:$H${L_LAST}")
wb.define_name("Laborers_ID",   col_range("Laborers List", "A", L_FIRST, L_LAST))
wb.define_name("Laborers_Name", col_range("Laborers List", "B", L_FIRST, L_LAST))
wb.define_name("Laborers_Data", f"'Laborers List'!$A${L_FIRST}:$H${L_LAST}")

# Attendance-derived named ranges
wb.define_name("Att_ID",     col_range("Daily Attendance", "A", A_FIRST, A_LAST))
wb.define_name("Att_Name",   col_range("Daily Attendance", "B", A_FIRST, A_LAST))
wb.define_name("Att_Type",   col_range("Daily Attendance", "C", A_FIRST, A_LAST))
wb.define_name("Att_Worked", col_range("Daily Attendance", CL(T_WORKED), A_FIRST, A_LAST))
wb.define_name("Att_OT",     col_range("Daily Attendance", CL(T_OT), A_FIRST, A_LAST))
wb.define_name("Att_Reg",    col_range("Daily Attendance", CL(T_REG), A_FIRST, A_LAST))
wb.define_name("Att_OTSal",  col_range("Daily Attendance", CL(T_OTSAL), A_FIRST, A_LAST))
wb.define_name("Att_Total",  col_range("Daily Attendance", CL(T_TOTAL), A_FIRST, A_LAST))
# Payroll half totals
wb.define_name("Pay_ID",     col_range("Payroll", "A", A_FIRST, A_LAST))
wb.define_name("Pay_FH",     col_range("Payroll", "H", A_FIRST, A_LAST))
wb.define_name("Pay_SH",     col_range("Payroll", "M", A_FIRST, A_LAST))


# --------------------------------------------------------------------------- #
#  Helper: build a legend strip
# --------------------------------------------------------------------------- #
def legend(sheet, row, start_col=1):
    c = start_col
    items = [("Input", "lg_inp"), ("Auto/Formula", "lg_frm"), ("Summary", "lg_sum")]
    for text, st in items:
        sheet.write(row, c, "", S[st])
        sheet.write(row, c + 1, text, S["lg_lbl"])
        c += 3


# --------------------------------------------------------------------------- #
#  Employee-list sheets (Workers / Laborers)
# --------------------------------------------------------------------------- #
LIST_HEADERS = ["Employee ID", "Full Name", "CIN Number", "CNSS Number",
                "Phone Number", "Position", "Start Date", "Status"]
LIST_WIDTHS = [16, 26, 15, 16, 16, 22, 14, 12]

def build_list_sheet(title, subtitle, tab_color):
    sh = wb.add_sheet(title)
    sh.tab_color = tab_color
    for i, w in enumerate(LIST_WIDTHS, start=1):
        sh.set_col(i, w)
    # Title
    sh.merge("A1:H1"); sh.cell("A1", "  " + title.upper(), S["title"])
    sh.set_row(1, 34)
    sh.merge("A2:H2"); sh.cell("A2", "  " + subtitle, S["subtitle"])
    sh.set_row(2, 16)
    # Header row is on row 3 (L_FIRST - 1); data begins on row 4.
    return sh

# NOTE: list data rows begin at L_FIRST (4); header on row 3.
def fill_list_sheet(sh):
    hdr_row = L_FIRST - 1  # 3
    for i, h in enumerate(LIST_HEADERS, start=1):
        sh.write(hdr_row, i, h, S["hdr"])
    sh.set_row(hdr_row, 26)
    # data input cells
    for r in range(L_FIRST, L_LAST + 1):
        sh.write(r, 1, None, S["inp_c"])                 # ID
        sh.write(r, 2, None, S["inp"])                   # name
        sh.write(r, 3, None, S["inp_txt"])               # CIN
        sh.write(r, 4, None, S["inp_txt"])               # CNSS
        sh.write(r, 5, None, S["inp_txt"])               # phone
        sh.write(r, 6, None, S["inp"])                   # position
        sh.write(r, 7, None, S["inp_date"])              # start date
        sh.write(r, 8, None, S["inp_c"])                 # status
    # status dropdown
    sh.add_list_validation(f"H{L_FIRST}:H{L_LAST}", '"Active,Inactive"')
    # conditional format for status
    sh.add_cond_expr(f"H{L_FIRST}:H{L_LAST}", f'$H{L_FIRST}="Active"', active_dxf, 1)
    sh.add_cond_expr(f"H{L_FIRST}:H{L_LAST}", f'$H{L_FIRST}="Inactive"', inactive_dxf, 2)
    sh.freeze_panes(hdr_row, 0)
    sh.protect = True
    sh.setup_page(orientation="landscape")
    sh.set_print_area(f"$A$1:$H${L_LAST}")

workers = build_list_sheet("Workers List",
                           "Employees paid 150.00 MAD / day  -  overtime 16.66 MAD / hour   (\u0639\u0645\u0627\u0644)",
                           BLUE)
fill_list_sheet(workers)
laborers = build_list_sheet("Laborers List",
                            "Employees paid 100.00 MAD / day  -  overtime 11.11 MAD / hour   (\u062e\u062f\u0627\u0645)",
                            TEAL)
fill_list_sheet(laborers)

# seed a couple of example rows so the workbook demonstrates itself
def seed(sh, rows):
    r = L_FIRST
    for rec in rows:
        for i, v in enumerate(rec, start=1):
            st = [S["inp_c"], S["inp"], S["inp_txt"], S["inp_txt"], S["inp_txt"],
                  S["inp"], S["inp_date"], S["inp_c"]][i - 1]
            sh.write(r, i, v, st)
        r += 1

seed(workers, [
    ("W-1001", "Youssef El Amrani", "AB12345", "1234567", "0612345678", "Mason",       dt.date(2022, 3, 1),  "Active"),
    ("W-1002", "Karim Benali",      "AB67890", "2345678", "0623456789", "Carpenter",   dt.date(2021, 7, 15), "Active"),
    ("W-1003", "Rachid Toumi",      "AC11223", "3456789", "0634567890", "Electrician", dt.date(2023, 1, 10), "Active"),
])
seed(laborers, [
    ("L-2001", "Hassan Cherki",   "BE55667", "4567890", "0645678901", "Helper",  dt.date(2023, 5, 20), "Active"),
    ("L-2002", "Said Mansouri",       "BE77889", "5678901", "0656789012", "Loader",  dt.date(2022, 11, 3), "Active"),
])



# --------------------------------------------------------------------------- #
#  3. DAILY ATTENDANCE & OVERTIME ENTRY  (main data-entry page)
# --------------------------------------------------------------------------- #
att = wb.add_sheet("Daily Attendance")
att.tab_color = NAVY
att.show_gridlines = False

worked_cols = [FD + 2 * (d - 1) for d in range(1, 32)]
ot_cols = [c + 1 for c in worked_cols]

D = CL(FD); BM = CL(LD)
BNc, BOc, BPc, BQc, BRc = (CL(T_WORKED), CL(T_OT), CL(T_REG), CL(T_OTSAL), CL(T_TOTAL))

# column widths
att.set_col(1, 15); att.set_col(2, 24); att.set_col(3, 12)
for c in worked_cols:
    att.set_col(c, 4.0)
    att.set_col(c + 1, 4.6)
for c, w in ((T_WORKED, 9), (T_OT, 9), (T_REG, 14), (T_OTSAL, 14), (T_TOTAL, 15)):
    att.set_col(c, w)

last_col = CL(T_TOTAL)
# Title / subtitle
att.merge(f"A1:{last_col}1")
att.cell("A1", "  DAILY ATTENDANCE & OVERTIME  \u2014  monthly entry sheet", S["title"])
att.set_row(1, 34)
att.merge(f"A2:{last_col}2")
att.write(2, 1, None, S["subtitle"],
          formula='"  Month: "&PayrollMonth&"     Enter 1 (present) or 0 (absent) under Wk, and overtime hours under OT.   '
                  'Green = present, Amber = overtime.  Names and totals fill in automatically."')
att.set_row(2, 18)
# put a live month/company banner via formula in A2 is tricky (merged text). Keep static hint above.

# Group header row 3 & sub header row 4
att.set_row(3, 20); att.set_row(4, 18)
att.merge("A3:A4"); att.cell("A3", "Employee ID", S["hdr"])
att.merge("B3:B4"); att.cell("B3", "Employee Name", S["hdr"])
att.merge("C3:C4"); att.cell("C3", "Type", S["hdr"])
for d in range(1, 32):
    wcol = FD + 2 * (d - 1)
    ocol = wcol + 1
    att.merge(f"{CL(wcol)}3:{CL(ocol)}3")
    att.write(3, wcol, d, S["hdr_fh"] if d <= 15 else S["hdr_sh"])
    att.write(4, wcol, "Wk", S["hdr_sub"])
    att.write(4, ocol, "OT", S["hdr_sub"])
# totals group
att.merge(f"{BNc}3:{BRc}3"); att.write(3, T_WORKED, "MONTHLY SUMMARY", S["hdr_sum"])
for c, t in ((T_WORKED, "Worked Days"), (T_OT, "OT Hrs"), (T_REG, "Regular Salary"),
             (T_OTSAL, "Overtime Pay"), (T_TOTAL, "Total Salary")):
    att.write(4, c, t, S["hdr_sum"])

# Data rows
K = "(ROW()-4)"
nW, nL = "COUNTA(Workers_ID)", "COUNTA(Laborers_ID)"
for r in range(A_FIRST, A_LAST + 1):
    id_f = (f'IFERROR(IF({K}<={nW},INDEX(Workers_ID,{K}),'
            f'IF({K}<={nW}+{nL},INDEX(Laborers_ID,{K}-{nW}),"")),"")')
    att.write(r, 1, None, S["f_id"], formula=id_f)
    att.write(r, 2, None, S["f_txt"],
              formula=(f'IF($A{r}="","",IFERROR(VLOOKUP($A{r},Workers_Data,2,FALSE),'
                       f'IFERROR(VLOOKUP($A{r},Laborers_Data,2,FALSE),"")))'))
    att.write(r, 3, None, S["f_ctr"],
              formula=(f'IF($A{r}="","",IF(COUNTIF(Workers_ID,$A{r})>0,"Worker",'
                       f'IF(COUNTIF(Laborers_ID,$A{r})>0,"Laborer","")))'))
    # empty day / ot cells
    for c in worked_cols:
        att.write(r, c, None, S["day"])
        att.write(r, c + 1, None, S["ot"])
    # totals
    att.write(r, T_WORKED, None, S["f_int"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN(${D}{r}:${BM}{r})-COLUMN(${D}{r}),2)=0)'
                       f'*${D}{r}:${BM}{r}))'))
    att.write(r, T_OT, None, S["f_dec"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN(${D}{r}:${BM}{r})-COLUMN(${D}{r}),2)=1)'
                       f'*${D}{r}:${BM}{r}))'))
    att.write(r, T_REG, None, S["f_mad"],
              formula=(f'IF($A{r}="","",${BNc}{r}*IF($C{r}="Worker",Worker_DailyWage,'
                       f'IF($C{r}="Laborer",Laborer_DailyWage,0)))'))
    att.write(r, T_OTSAL, None, S["f_mad"],
              formula=(f'IF($A{r}="","",${BOc}{r}*IF($C{r}="Worker",Worker_OTRate,'
                       f'IF($C{r}="Laborer",Laborer_OTRate,0)))'))
    att.write(r, T_TOTAL, None, S["f_mad_b"],
              formula=f'IF($A{r}="","",${BPc}{r}+${BQc}{r})')

# validation & conditional formatting over the day/ot ranges
worked_sqref = " ".join(f"{CL(c)}{A_FIRST}:{CL(c)}{A_LAST}" for c in worked_cols)
ot_sqref = " ".join(f"{CL(c)}{A_FIRST}:{CL(c)}{A_LAST}" for c in ot_cols)
att.add_number_validation(worked_sqref, "between", "0", "1", decimal=False)
att.add_number_validation(ot_sqref, "greaterThanOrEqual", "0", decimal=True)
# highlight present / overtime
att.add_cond_cellis(worked_sqref, "equal", "1", worked_dxf, priority=1)
att.add_cond_cellis(ot_sqref, "greaterThan", "0", ot_dxf, priority=2)
# row banding across info + totals
att.add_cond_expr(f"A{A_FIRST}:C{A_LAST}", "MOD(ROW(),2)=0", band_dxf, priority=6)
att.add_cond_expr(f"{BNc}{A_FIRST}:{BRc}{A_LAST}", "MOD(ROW(),2)=0", band_dxf, priority=6)

att.freeze_panes(4, 3)
att.protect = True
att.setup_page(orientation="landscape", fit_width=1, fit_height=0)
att.set_print_area(f"$A$1:${last_col}${A_LAST}")



# --------------------------------------------------------------------------- #
#  4. PAYROLL  (First half / Second half)
# --------------------------------------------------------------------------- #
reg("sub_fh", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": GREEN_HD,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True},
               "border": border(*ALL, color=WHITE)})
reg("sub_sh", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": BLUE,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True},
               "border": border(*ALL, color=WHITE)})

pay = wb.add_sheet("Payroll")
pay.tab_color = GOLD
pay.show_gridlines = False
ATT = "'Daily Attendance'!"
AGc = CL(FH_LAST); AHc = CL(SH_FIRST)

widths = [14, 24, 12, 10, 9, 13, 13, 14, 10, 9, 13, 13, 14, 15]
for i, w in enumerate(widths, start=1):
    pay.set_col(i, w)

pay.merge("A1:N1"); pay.cell("A1", "  PAYROLL  \u2014  first & second half of the month", S["title"])
pay.set_row(1, 34)
pay.merge("A2:N2")
pay.cell("A2", "  Automatically split from the Daily Attendance sheet. First Half = days 1-15, "
               "Second Half = days 16-31.", S["subtitle"])
pay.set_row(2, 16)

pay.set_row(3, 20); pay.set_row(4, 26)
pay.merge("A3:A4"); pay.cell("A3", "Employee ID", S["hdr"])
pay.merge("B3:B4"); pay.cell("B3", "Employee Name", S["hdr"])
pay.merge("C3:C4"); pay.cell("C3", "Type", S["hdr"])
pay.merge("D3:H3"); pay.cell("D3", "FIRST HALF  (Days 1 - 15)", S["hdr_fh"])
pay.merge("I3:M3"); pay.cell("I3", "SECOND HALF  (Days 16 - 31)", S["hdr_sh"])
pay.merge("N3:N4"); pay.cell("N3", "Month Total", S["hdr_sum"])
subs = ["Worked Days", "OT Hours", "Regular Pay", "Overtime Pay", "Total Due"]
for i, t in enumerate(subs):
    pay.write(4, 4 + i, t, S["sub_fh"])
    pay.write(4, 9 + i, t, S["sub_sh"])

wage = lambda r: f'IF($C{r}="Worker",Worker_DailyWage,IF($C{r}="Laborer",Laborer_DailyWage,0))'
rate = lambda r: f'IF($C{r}="Worker",Worker_OTRate,IF($C{r}="Laborer",Laborer_OTRate,0))'

for r in range(A_FIRST, A_LAST + 1):
    pay.write(r, 1, None, S["f_id"], formula=f'IF({ATT}A{r}="","",{ATT}A{r})')
    pay.write(r, 2, None, S["f_txt"], formula=f'IF($A{r}="","",{ATT}B{r})')
    pay.write(r, 3, None, S["f_ctr"], formula=f'IF($A{r}="","",{ATT}C{r})')
    # first half
    pay.write(r, 4, None, S["f_int"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN({ATT}$D{r}:${AGc}{r})-COLUMN({ATT}$D{r}),2)=0)'
                       f'*{ATT}$D{r}:${AGc}{r}))'))
    pay.write(r, 5, None, S["f_dec"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN({ATT}$D{r}:${AGc}{r})-COLUMN({ATT}$D{r}),2)=1)'
                       f'*{ATT}$D{r}:${AGc}{r}))'))
    pay.write(r, 6, None, S["f_mad"], formula=f'IF($A{r}="","",$D{r}*{wage(r)})')
    pay.write(r, 7, None, S["f_mad"], formula=f'IF($A{r}="","",$E{r}*{rate(r)})')
    pay.write(r, 8, None, S["f_mad_b"], formula=f'IF($A{r}="","",$F{r}+$G{r})')
    # second half
    pay.write(r, 9, None, S["f_int"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN({ATT}${AHc}{r}:$BM{r})-COLUMN({ATT}${AHc}{r}),2)=0)'
                       f'*{ATT}${AHc}{r}:$BM{r}))'))
    pay.write(r, 10, None, S["f_dec"],
              formula=(f'IF($A{r}="","",SUMPRODUCT((MOD(COLUMN({ATT}${AHc}{r}:$BM{r})-COLUMN({ATT}${AHc}{r}),2)=1)'
                       f'*{ATT}${AHc}{r}:$BM{r}))'))
    pay.write(r, 11, None, S["f_mad"], formula=f'IF($A{r}="","",$I{r}*{wage(r)})')
    pay.write(r, 12, None, S["f_mad"], formula=f'IF($A{r}="","",$J{r}*{rate(r)})')
    pay.write(r, 13, None, S["f_mad_b"], formula=f'IF($A{r}="","",$K{r}+$L{r})')
    pay.write(r, 14, None, S["f_mad_b"], formula=f'IF($A{r}="","",$H{r}+$M{r})')

pay.add_cond_expr(f"A{A_FIRST}:N{A_LAST}", "MOD(ROW(),2)=0", band_dxf, priority=6)
pay.freeze_panes(4, 3)
pay.protect = True
pay.setup_page(orientation="landscape", fit_width=1, fit_height=0)
pay.set_print_area(f"$A$1:$N${A_LAST}")



# --------------------------------------------------------------------------- #
#  5. SEARCH DASHBOARD
# --------------------------------------------------------------------------- #
reg("c_hdr",   {"font": {"bold": True, "size": 13, "color": WHITE}, "fill": NAVY,
                "align": {"horizontal": "center", "vertical": "center"},
                "border": border(*ALL, color=NAVY)})
reg("c_sec",   {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": BLUE,
                "align": {"horizontal": "left", "vertical": "center"},
                "border": border(*ALL, color=WHITE)})
reg("c_lbl",   {"font": {"bold": True, "size": 10, "color": NAVY}, "fill": GRAY_LT,
                "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("c_val",   {"font": {"size": 11}, "align": {"horizontal": "left", "vertical": "center"},
                "border": border(*ALL), "fill": WHITE})
reg("c_valc",  {"font": {"size": 11, "bold": True, "color": NAVY},
                "align": {"horizontal": "center", "vertical": "center"},
                "border": border(*ALL), "fill": WHITE})
reg("c_mad",   {"font": {"size": 11}, "numfmt": MAD, "fill": GREEN_LT,
                "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("c_tot_l", {"font": {"bold": True, "size": 13, "color": WHITE}, "fill": GOLD,
                "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("c_tot_v", {"font": {"bold": True, "size": 18, "color": NAVY}, "fill": GOLD_LT, "numfmt": MAD,
                "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=GOLD)})
reg("s_lbl",   {"font": {"bold": True, "size": 11, "color": NAVY},
                "align": {"horizontal": "right", "vertical": "center"}})
reg("hlp",     {"font": {"size": 8, "color": WHITE}})

srch = wb.add_sheet("Search")
srch.tab_color = GREEN
srch.show_gridlines = False
for c, w in ((1, 3), (2, 20), (3, 22), (4, 20), (5, 20), (6, 22), (7, 6)):
    srch.set_col(c, w)

srch.merge("B1:G1"); srch.cell("B1", "  EMPLOYEE SEARCH", S["title"]); srch.set_row(1, 34)
srch.merge("B2:G2")
srch.cell("B2", "  Pick an Employee ID or a Name. The card fills instantly. (If both are set, Name wins.)",
          S["subtitle"]); srch.set_row(2, 16)

srch.cell("B4", "Search by Employee ID:", S["s_lbl"])
srch.merge("C4:D4"); srch.write(4, 3, None, S["inp_c"])
srch.cell("B5", "or Search by Name:", S["s_lbl"])
srch.merge("C5:E5"); srch.write(5, 3, None, S["inp"])
srch.add_list_validation("C4:D4", "Att_ID")
srch.add_list_validation("C5:E5", "Att_Name")

# helper cells (out of print area)
srch.cell("J1", None, S["hlp"],
          formula='IF($C$5<>"",IFERROR(INDEX(Att_ID,MATCH($C$5,Att_Name,0)),$C$4),$C$4)')
srch.cell("J2", None, S["hlp"], formula='IFERROR(MATCH(SelID,Att_ID,0),0)')
wb.define_name("SelID", "Search!$J$1")
wb.define_name("SelRow", "Search!$J$2")

def sv(rng):     # guarded index into a named range
    return f'IF(OR(SelID="",SelRow=0),"-",INDEX({rng},SelRow))'
def slk(col):    # guarded lookup across both lists
    return (f'IF(SelID="","-",IFERROR(VLOOKUP(SelID,Workers_Data,{col},FALSE),'
            f'IFERROR(VLOOKUP(SelID,Laborers_Data,{col},FALSE),"-")))')

# Card header
srch.merge("B7:G7"); srch.cell("B7", "EMPLOYEE SUMMARY", S["c_hdr"]); srch.set_row(7, 26)
# Info block
srch.cell("B8", "Employee Name", S["c_lbl"])
srch.merge("C8:G8"); srch.write(8, 3, None, S["c_valc"], formula=sv("Att_Name"))
srch.cell("B9", "Employee ID", S["c_lbl"])
srch.write(9, 3, None, S["c_valc"], formula=sv("Att_ID"))
srch.cell("D9", "Employee Type", S["c_lbl"])
srch.merge("E9:G9"); srch.write(9, 5, None, S["c_valc"], formula=sv("Att_Type"))
srch.cell("B10", "CIN Number", S["c_lbl"])
srch.write(10, 3, None, S["c_valc"], formula=slk(3))
srch.cell("D10", "CNSS Number", S["c_lbl"])
srch.merge("E10:G10"); srch.write(10, 5, None, S["c_valc"], formula=slk(4))
# Payroll block
srch.merge("B11:G11"); srch.cell("B11", "  PAYROLL DETAILS", S["c_sec"]); srch.set_row(11, 20)
srch.cell("B12", "Worked Days", S["c_lbl"])
srch.write(12, 3, None, S["c_valc"], formula=sv("Att_Worked"))
srch.cell("D12", "Overtime Hours", S["c_lbl"])
srch.merge("E12:G12"); srch.write(12, 5, None, S["c_valc"], formula=sv("Att_OT"))
srch.cell("B13", "First Half Salary", S["c_lbl"])
srch.write(13, 3, None, S["c_mad"], formula=sv("Pay_FH"))
srch.cell("D13", "Second Half Salary", S["c_lbl"])
srch.merge("E13:G13"); srch.write(13, 5, None, S["c_mad"], formula=sv("Pay_SH"))
srch.cell("B14", "Monthly (Regular) Salary", S["c_lbl"])
srch.write(14, 3, None, S["c_mad"], formula=sv("Att_Reg"))
srch.cell("D14", "Overtime Pay", S["c_lbl"])
srch.merge("E14:G14"); srch.write(14, 5, None, S["c_mad"], formula=sv("Att_OTSal"))
# Total
srch.merge("B15:C15"); srch.cell("B15", "TOTAL AMOUNT DUE", S["c_tot_l"])
srch.merge("D15:G15"); srch.write(15, 4, None, S["c_tot_v"], formula=sv("Att_Total"))
srch.set_row(15, 34)

srch.protect = True
srch.setup_page(orientation="portrait")
srch.set_print_area("$B$1:$G$15")



# --------------------------------------------------------------------------- #
#  6. PRINTABLE PAYSLIP (A4)
# --------------------------------------------------------------------------- #
reg("p_comp", {"font": {"bold": True, "size": 22, "color": NAVY},
               "align": {"horizontal": "center", "vertical": "center"}})
reg("p_sub",  {"font": {"size": 12, "italic": True, "color": GRAY_TX},
               "align": {"horizontal": "center", "vertical": "center"}})
reg("p_box",  {"border": border(*ALL, color=NAVY)})
reg("p_sec",  {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": NAVY,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL, color=NAVY)})
reg("p_lbl",  {"font": {"bold": True, "size": 10, "color": NAVY}, "fill": GRAY_LT,
               "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("p_val",  {"font": {"size": 11}, "align": {"horizontal": "left", "vertical": "center"},
               "border": border(*ALL)})
reg("p_mad",  {"font": {"size": 11, "bold": True}, "numfmt": MAD, "fill": GREEN_LT,
               "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("p_tot_l", {"font": {"bold": True, "size": 13, "color": WHITE}, "fill": GOLD,
                "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("p_tot_v", {"font": {"bold": True, "size": 18, "color": NAVY}, "fill": GOLD_LT, "numfmt": MAD,
                "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL, color=GOLD)})
reg("p_sign", {"border": border("top", style="medium", color=NAVY),
               "align": {"horizontal": "center", "vertical": "top"},
               "font": {"size": 9, "color": GRAY_TX}})
reg("p_selbl", {"font": {"bold": True, "size": 11, "color": NAVY},
                "align": {"horizontal": "right", "vertical": "center"}})

slip = wb.add_sheet("Payslip")
slip.tab_color = GRAY_TX
slip.show_gridlines = False
for c, w in ((1, 3), (2, 20), (3, 20), (4, 18), (5, 20), (6, 18), (7, 3)):
    slip.set_col(c, w)

slip.merge("B1:F1"); slip.write(1, 2, None, S["p_comp"], formula="CompanyName"); slip.set_row(1, 32)
slip.merge("B2:F2"); slip.write(2, 2, None, S["p_sub"],
            formula='"PAYSLIP  /  BULLETIN DE PAIE   -   "&PayrollMonth'); slip.set_row(2, 20)

slip.cell("B4", "Select Employee ID:", S["p_selbl"])
slip.merge("C4:D4"); slip.write(4, 3, None, S["inp_c"])
slip.add_list_validation("C4:D4", "Att_ID")
# helper
slip.cell("J1", None, S["hlp"], formula="$C$4")
slip.cell("J2", None, S["hlp"], formula='IFERROR(MATCH(PS_ID,Att_ID,0),0)')
wb.define_name("PS_ID", "Payslip!$J$1")
wb.define_name("PS_Row", "Payslip!$J$2")

def pv(rng):
    return f'IF(OR(PS_ID="",PS_Row=0),"-",INDEX({rng},PS_Row))'
def plk(col):
    return (f'IF(PS_ID="","-",IFERROR(VLOOKUP(PS_ID,Workers_Data,{col},FALSE),'
            f'IFERROR(VLOOKUP(PS_ID,Laborers_Data,{col},FALSE),"-")))')

slip.merge("B6:F6"); slip.cell("B6", "  EMPLOYEE INFORMATION", S["p_sec"]); slip.set_row(6, 20)
slip.cell("B7", "Employee ID", S["p_lbl"]);   slip.merge("C7:D7"); slip.write(7, 3, None, S["p_val"], formula=pv("Att_ID"))
slip.cell("E7", "Month", S["p_lbl"]);         slip.write(7, 6, None, S["p_val"], formula="PayrollMonth")
slip.cell("B8", "Employee Name", S["p_lbl"]); slip.merge("C8:F8"); slip.write(8, 3, None, S["p_val"], formula=pv("Att_Name"))
slip.cell("B9", "Employee Type", S["p_lbl"]); slip.merge("C9:D9"); slip.write(9, 3, None, S["p_val"], formula=pv("Att_Type"))
slip.cell("E9", "CIN Number", S["p_lbl"]);    slip.write(9, 6, None, S["p_val"], formula=plk(3))
slip.cell("B10", "CNSS Number", S["p_lbl"]);  slip.merge("C10:F10"); slip.write(10, 3, None, S["p_val"], formula=plk(4))

slip.merge("B12:F12"); slip.cell("B12", "  EARNINGS", S["p_sec"]); slip.set_row(12, 20)
slip.cell("B13", "Worked Days", S["p_lbl"]);      slip.merge("C13:D13"); slip.write(13, 3, None, S["p_val"], formula=pv("Att_Worked"))
slip.cell("E13", "Overtime Hours", S["p_lbl"]);   slip.write(13, 6, None, S["p_val"], formula=pv("Att_OT"))
slip.cell("B14", "Regular Salary", S["p_lbl"]);   slip.merge("C14:D14"); slip.write(14, 3, None, S["p_mad"], formula=pv("Att_Reg"))
slip.cell("E14", "Overtime Salary", S["p_lbl"]);  slip.write(14, 6, None, S["p_mad"], formula=pv("Att_OTSal"))
slip.merge("B16:C16"); slip.cell("B16", "TOTAL SALARY", S["p_tot_l"])
slip.merge("D16:F16"); slip.write(16, 4, None, S["p_tot_v"], formula=pv("Att_Total")); slip.set_row(16, 34)

# Signatures
slip.set_row(20, 30)
slip.write(20, 2, None, S["p_sign"], formula='"Date: "&TEXT(TODAY(),"dd/mm/yyyy")')
slip.merge("B20:C20")
slip.merge("B22:C22"); slip.cell("B22", "Employee Signature", S["p_sign"]); slip.set_row(22, 30)
slip.merge("E22:F22"); slip.cell("E22", "Manager Signature", S["p_sign"])

slip.protect = True
slip.setup_page(orientation="portrait", fit_width=1, fit_height=1)
slip.set_print_area("$A$1:$G$24")



# --------------------------------------------------------------------------- #
#  7. PAYROLL DASHBOARD  (KPIs + charts)
# --------------------------------------------------------------------------- #
def klbl(color):
    return wb.style({"font": {"bold": True, "size": 10, "color": WHITE}, "fill": color,
                     "align": {"horizontal": "center", "vertical": "center"},
                     "border": border(*ALL, color=WHITE)})
reg("k_int", {"font": {"bold": True, "size": 20, "color": NAVY}, "fill": GRAY_LT, "numfmt": INT,
              "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
reg("k_mad", {"font": {"bold": True, "size": 16, "color": NAVY}, "fill": GRAY_LT, "numfmt": MAD,
              "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
reg("ct_hd", {"font": {"bold": True, "size": 10, "color": NAVY}, "fill": GRAY_LT,
              "align": {"horizontal": "left", "vertical": "center"}, "border": border(*ALL)})
reg("ct_v",  {"numfmt": INT, "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})
reg("ct_m",  {"numfmt": MAD, "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})

dash = wb.add_sheet("Dashboard")
dash.tab_color = NAVY
dash.show_gridlines = False
for c in range(2, 10):
    dash.set_col(c, 14)
dash.set_col(1, 3)

dash.merge("B1:I1"); dash.cell("B1", "  PAYROLL DASHBOARD", S["title"]); dash.set_row(1, 34)
dash.merge("B2:I2"); dash.cell("B2", "  Live statistics \u2014 everything recalculates as attendance is entered.",
                                S["subtitle"]); dash.set_row(2, 16)

# KPI cards
kpis = [
    ("Total Workers",       "COUNTA(Workers_ID)",                  "k_int", BLUE),
    ("Total Laborers",      "COUNTA(Laborers_ID)",                 "k_int", TEAL),
    ("Total Worked Days",   "SUM(Att_Worked)",                     "k_int", GREEN),
    ("Total Overtime Cost", "SUM(Att_OTSal)",                      "k_mad", GOLD),
    ("Total Payroll",       "SUM(Att_Total)",                      "k_mad", NAVY),
    ("Average Salary",      'IFERROR(AVERAGEIF(Att_Total,">0"),0)',"k_mad", BLUE),
    ("Highest Salary",      "IFERROR(MAX(Att_Total),0)",           "k_mad", GREEN),
    ("Lowest Salary",       'IFERROR(MINIFS(Att_Total,Att_Total,">0"),0)', "k_mad", RED),
]
positions = [(2, 3), (4, 5), (6, 7), (8, 9)]
for i, (label, formula, vstyle, color) in enumerate(kpis):
    block = i // 4
    lrow = 4 + block * 3
    vrow = lrow + 1
    c1, c2 = positions[i % 4]
    dash.merge(f"{CL(c1)}{lrow}:{CL(c2)}{lrow}")
    dash.write(lrow, c1, label, klbl(color)); dash.set_row(lrow, 20)
    dash.merge(f"{CL(c1)}{vrow}:{CL(c2)}{vrow}")
    dash.write(vrow, c1, None, S[vstyle], formula=formula); dash.set_row(vrow, 34)

# Chart data tables
dash.cell("B11", "Workforce", S["ct_hd"]); dash.cell("C11", "Count", S["ct_hd"])
dash.cell("B12", "Workers", S["ct_hd"]);  dash.write(12, 3, None, S["ct_v"], formula="COUNTA(Workers_ID)")
dash.cell("B13", "Laborers", S["ct_hd"]); dash.write(13, 3, None, S["ct_v"], formula="COUNTA(Laborers_ID)")

dash.cell("E11", "Payroll Split", S["ct_hd"]); dash.cell("F11", "MAD", S["ct_hd"])
dash.cell("E12", "Regular Pay", S["ct_hd"]);  dash.write(12, 6, None, S["ct_m"], formula="SUM(Att_Reg)")
dash.cell("E13", "Overtime Pay", S["ct_hd"]); dash.write(13, 6, None, S["ct_m"], formula="SUM(Att_OTSal)")

# Charts
pie = Chart("pie", "Workforce Split",
            cat_ref="Dashboard!$B$12:$B$13", val_ref="Dashboard!$C$12:$C$13",
            series_name="Dashboard!$B$11")
wb.add_chart(dash, pie, anchor=(1, 14, 5, 30))   # 0-based cols/rows
bar = Chart("bar", "Payroll Composition (MAD)",
            cat_ref="Dashboard!$E$12:$E$13", val_ref="Dashboard!$F$12:$F$13",
            series_name="Dashboard!$E$11")
wb.add_chart(dash, bar, anchor=(5, 14, 9, 30))

dash.protect = True
dash.setup_page(orientation="landscape")
dash.set_print_area("$B$1:$I$30")



# --------------------------------------------------------------------------- #
#  8. MONTHLY PAYROLL REPORT
# --------------------------------------------------------------------------- #
reg("r_seq",  {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"},
               "font": {"color": GRAY_TX}})
reg("r_gt_l", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": GOLD,
               "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL, color=WHITE)})
reg("r_gt_i", {"font": {"bold": True, "color": NAVY}, "numfmt": INT, "fill": GOLD_LT,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
reg("r_gt_m", {"font": {"bold": True, "color": NAVY}, "numfmt": MAD, "fill": GOLD_LT,
               "align": {"horizontal": "right", "vertical": "center"}, "border": border(*ALL)})

rep = wb.add_sheet("Monthly Report")
rep.tab_color = GOLD
rep.show_gridlines = False
rcols = [("#", 5), ("Employee ID", 14), ("Name", 24), ("Type", 11), ("CIN Number", 14),
         ("CNSS Number", 15), ("Worked Days", 11), ("OT Hours", 10),
         ("Regular Salary", 14), ("Overtime Salary", 15), ("Total Salary", 15)]
for i, (_, w) in enumerate(rcols, start=1):
    rep.set_col(i, w)

rep.merge("A1:K1"); rep.cell("A1", "  MONTHLY PAYROLL REPORT", S["title"]); rep.set_row(1, 34)
rep.merge("A2:K2"); rep.write(2, 1, None, S["subtitle"],
          formula='"  Company: "&CompanyName&"     Month: "&PayrollMonth'); rep.set_row(2, 18)

RHDR = 3
for i, (h, _) in enumerate(rcols, start=1):
    rep.write(RHDR, i, h, S["hdr"])
rep.set_row(RHDR, 26)

R_FIRST = RHDR + 1                    # 4
for idx in range(ATT_ROWS):
    rr = R_FIRST + idx
    ar = A_FIRST + idx
    rep.write(rr, 1, None, S["r_seq"], formula=f'IF($B{rr}="","",ROW()-{R_FIRST}+1)')
    rep.write(rr, 2, None, S["f_id"],  formula=f'IF({ATT}A{ar}="","",{ATT}A{ar})')
    rep.write(rr, 3, None, S["f_txt"], formula=f'IF($B{rr}="","",{ATT}B{ar})')
    rep.write(rr, 4, None, S["f_ctr"], formula=f'IF($B{rr}="","",{ATT}C{ar})')
    rep.write(rr, 5, None, S["f_ctr"],
              formula=(f'IF($B{rr}="","",IFERROR(VLOOKUP($B{rr},Workers_Data,3,FALSE),'
                       f'IFERROR(VLOOKUP($B{rr},Laborers_Data,3,FALSE),"")))'))
    rep.write(rr, 6, None, S["f_ctr"],
              formula=(f'IF($B{rr}="","",IFERROR(VLOOKUP($B{rr},Workers_Data,4,FALSE),'
                       f'IFERROR(VLOOKUP($B{rr},Laborers_Data,4,FALSE),"")))'))
    rep.write(rr, 7, None, S["f_int"], formula=f'IF($B{rr}="","",{ATT}{BNc}{ar})')
    rep.write(rr, 8, None, S["f_dec"], formula=f'IF($B{rr}="","",{ATT}{BOc}{ar})')
    rep.write(rr, 9, None, S["f_mad"], formula=f'IF($B{rr}="","",{ATT}{BPc}{ar})')
    rep.write(rr, 10, None, S["f_mad"], formula=f'IF($B{rr}="","",{ATT}{BQc}{ar})')
    rep.write(rr, 11, None, S["f_mad_b"], formula=f'IF($B{rr}="","",{ATT}{BRc}{ar})')

R_LAST = R_FIRST + ATT_ROWS - 1
GT = R_LAST + 1
rep.merge(f"A{GT}:F{GT}"); rep.cell(f"A{GT}", "GRAND TOTAL   ", S["r_gt_l"]); rep.set_row(GT, 24)
rep.write(GT, 7, None, S["r_gt_i"], formula=f"SUM(G{R_FIRST}:G{R_LAST})")
rep.write(GT, 8, None, S["r_gt_i"], formula=f"SUM(H{R_FIRST}:H{R_LAST})")
rep.write(GT, 9, None, S["r_gt_m"], formula=f"SUM(I{R_FIRST}:I{R_LAST})")
rep.write(GT, 10, None, S["r_gt_m"], formula=f"SUM(J{R_FIRST}:J{R_LAST})")
rep.write(GT, 11, None, S["r_gt_m"], formula=f"SUM(K{R_FIRST}:K{R_LAST})")

rep.add_cond_expr(f"A{R_FIRST}:K{R_LAST}", "MOD(ROW(),2)=0", band_dxf, priority=6)
rep.freeze_panes(RHDR, 0)
rep.protect = True
rep.setup_page(orientation="landscape", fit_width=1, fit_height=0)
rep.set_print_area(f"$A$1:$K${GT}")

# --------------------------------------------------------------------------- #
#  SAVE
# --------------------------------------------------------------------------- #
OUT = "Payroll_Management_System.xlsx"
wb.save(OUT)
print("Saved", OUT)
