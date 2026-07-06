"""
build_attendance.py - Monthly attendance grid + auto daily print sheet.

Produces `Gestion_Presences.xlsm`, a macro-enabled French attendance tool for a
construction company, built entirely with the standard library (xlsxgen for
packaging, vbagen for the VBA project).

Two synchronised sheets:

  * "Présence du Mois"  - all workers (rows) x every day of the month (columns).
    Double-click a cell to mark a worker present (green checkmark) for that day.
    A per-worker total and a per-day total update automatically. Weekends are
    shaded and days outside the month are greyed out.

  * "Feuille du Jour"   - a print-ready A4 sheet that automatically lists the
    workers present on the selected day (defaults to today). Change the day and
    the list rebuilds itself; it always reflects what is marked in the grid.
"""

from __future__ import annotations

import datetime as dt

from xlsxgen import Workbook, col_letter
from vbagen import VbaProject


# --------------------------------------------------------------------------- #
#  Palette (sober / modern)
# --------------------------------------------------------------------------- #
INK        = "FF2C3E50"
INK_LT     = "FF34495E"
WHITE      = "FFFFFFFF"
GREEN      = "FF27AE60"
GREEN_LT   = "FFD5F5E3"
GREEN_TX   = "FF1E8449"
BAND       = "FFF4F6F7"
LINE       = "FFBDC3C7"
LABEL_BG   = "FFECF0F1"
INPUT_BG   = "FFFEF9E7"
INPUT_TX   = "FF7D6608"
SUB_TX     = "FF7F8C8D"
WEEKEND    = "FFEAF1F8"
INVALID    = "FFE3E7E9"


def _bd(color: str = LINE, style: str = "thin") -> dict:
    side = {"style": style, "color": color}
    return {"left": side, "right": side, "top": side, "bottom": side}


# --------------------------------------------------------------------------- #
#  Sample workers  (id, nom, poste)
# --------------------------------------------------------------------------- #
WORKERS = [
    ("EMP-001", "Youssef El Amrani", "Chef de chantier"),
    ("EMP-002", "Rachid Benali",     "Maçon"),
    ("EMP-003", "Hassan Toumi",      "Coffreur"),
    ("EMP-004", "Karim Idrissi",     "Ferrailleur"),
    ("EMP-005", "Said Ouazzani",     "Manœuvre"),
    ("EMP-006", "Mohamed Fassi",     "Électricien"),
    ("EMP-007", "Abdellah Naciri",   "Plombier"),
    ("EMP-008", "Omar Sabri",        "Grutier"),
    ("EMP-009", "Brahim Alaoui",     "Peintre"),
    ("EMP-010", "Nabil Chraibi",     "Manœuvre"),
]

# ---- grid layout ---------------------------------------------------------- #
M_WEEKDAY = 4        # weekday-initial row
M_HEADER = 5         # day-number row (and left column headers)
M_DATA = 6           # first worker row
M_MAX = 85           # last worker row (80 workers)
M_NUM, M_ID, M_NOM, M_POSTE, M_TOTAL = 2, 3, 4, 5, 6   # B, C, D, E, F
M_DAY1 = 7           # G  = day 1
NDAYS = 31
M_DAYN = M_DAY1 + NDAYS - 1                              # AK = day 31
M_TOTALROW = M_MAX + 1

# ---- print layout --------------------------------------------------------- #
J_HEADER = 5
J_DATA = 6
J_NUM, J_ID, J_NOM, J_POSTE, J_SIGN = 2, 3, 4, 5, 6

CHECK = "\u2713"     # ✓  (written by VBA via ChrW(10003))


# =========================================================================== #
#  Styles
# =========================================================================== #
def register_styles(wb: Workbook) -> dict:
    s = {}
    s["title"] = wb.style({"font": {"bold": True, "size": 18, "color": WHITE},
                           "fill": INK, "align": {"horizontal": "center", "vertical": "center"}})
    s["subtitle"] = wb.style({"font": {"italic": True, "size": 11, "color": SUB_TX},
                              "align": {"horizontal": "left", "vertical": "center"}})
    s["hint"] = wb.style({"font": {"italic": True, "size": 10, "color": SUB_TX},
                          "align": {"horizontal": "left", "vertical": "center"}})
    s["label"] = wb.style({"font": {"bold": True, "size": 11, "color": INK},
                           "align": {"horizontal": "right", "vertical": "center"}})
    s["month_in"] = wb.style({"font": {"bold": True, "size": 13, "color": INPUT_TX},
                              "fill": INPUT_BG, "border": _bd(), "numfmt": "mmmm yyyy",
                              "align": {"horizontal": "center", "vertical": "center"},
                              "locked": False})
    s["text_in"] = wb.style({"font": {"bold": True, "size": 12, "color": INPUT_TX},
                             "fill": INPUT_BG, "border": _bd(),
                             "align": {"horizontal": "left", "vertical": "center"},
                             "locked": False})
    s["day_in"] = wb.style({"font": {"bold": True, "size": 14, "color": INPUT_TX},
                            "fill": INPUT_BG, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center"},
                            "locked": False})
    s["date_disp"] = wb.style({"font": {"bold": True, "size": 14, "color": INK},
                               "align": {"horizontal": "left", "vertical": "center"}})
    s["chantier_disp"] = wb.style({"font": {"bold": True, "size": 12, "color": INK},
                                   "align": {"horizontal": "left", "vertical": "center"}})
    # headers
    s["header"] = wb.style({"font": {"bold": True, "size": 11, "color": WHITE},
                            "fill": INK_LT, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center", "wrap": True}})
    s["day_hdr"] = wb.style({"font": {"bold": True, "size": 10, "color": WHITE},
                             "fill": INK_LT, "border": _bd(),
                             "align": {"horizontal": "center", "vertical": "center"}})
    s["wk_hdr"] = wb.style({"font": {"size": 9, "color": WHITE},
                            "fill": INK, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center"}})
    # data
    s["num"] = wb.style({"font": {"size": 11, "color": SUB_TX}, "border": _bd(),
                         "align": {"horizontal": "center", "vertical": "center"}})
    s["id"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                        "align": {"horizontal": "center", "vertical": "center"}, "locked": False})
    s["nom"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                         "align": {"horizontal": "left", "vertical": "center"}, "locked": False})
    s["poste"] = wb.style({"font": {"size": 11, "color": SUB_TX}, "border": _bd(),
                           "align": {"horizontal": "left", "vertical": "center"}, "locked": False})
    s["total"] = wb.style({"font": {"bold": True, "size": 11, "color": GREEN_TX}, "border": _bd(),
                           "align": {"horizontal": "center", "vertical": "center"}})
    s["day"] = wb.style({"font": {"bold": True, "size": 12, "color": GREEN_TX}, "border": _bd(),
                         "align": {"horizontal": "center", "vertical": "center"}, "locked": False})
    s["dtot"] = wb.style({"font": {"bold": True, "size": 10, "color": INK}, "border": _bd(),
                          "fill": LABEL_BG,
                          "align": {"horizontal": "center", "vertical": "center"}})
    s["dtot_lbl"] = wb.style({"font": {"bold": True, "size": 10, "color": INK}, "fill": LABEL_BG,
                              "border": _bd(),
                              "align": {"horizontal": "right", "vertical": "center"}})
    # print
    s["p_header"] = wb.style({"font": {"bold": True, "size": 12, "color": WHITE},
                              "fill": INK_LT, "border": _bd(),
                              "align": {"horizontal": "center", "vertical": "center"}})
    return s


def register_dxf(wb: Workbook) -> dict:
    d = {}
    d["present"] = wb.dxf({"fill": GREEN_LT, "font": {"bold": True, "color": GREEN_TX}})
    d["weekend"] = wb.dxf({"fill": WEEKEND})
    d["invalid"] = wb.dxf({"fill": INVALID})
    d["band"] = wb.dxf({"fill": BAND})
    return d


# =========================================================================== #
#  Sheet: Présence du Mois  (the monthly grid)
# =========================================================================== #
def build_mois(wb, S, D):
    sh = wb.add_sheet("Présence du Mois")
    sh.code_name = "wsMois"
    sh.show_gridlines = False
    sh.default_row_height = 18
    sh.freeze_panes(M_HEADER, M_TOTAL)     # freeze rows 1-5 and columns A-F

    sh.set_col(1, 2.5)
    sh.set_col(M_NUM, 5)
    sh.set_col(M_ID, 13)
    sh.set_col(M_NOM, 28)
    sh.set_col(M_POSTE, 16)
    sh.set_col(M_TOTAL, 7)
    for c in range(M_DAY1, M_DAYN + 1):
        sh.set_col(c, 3.6)

    dcol = col_letter(M_DAYN)

    # title + navigation button area (button is drawn by VBA over D1:E2)
    sh.merge("B1:C1"); sh.cell("B1", "PRÉSENCE DU MOIS", S["title"]); sh.set_row(1, 30)

    sh.cell("B2", "Mois :", S["label"])
    first_of_month = dt.date(dt.date.today().year, dt.date.today().month, 1)
    sh.cell("C2", first_of_month, S["month_in"])
    sh.set_row(2, 22)

    sh.cell("B3", "Chantier :", S["label"])
    sh.merge("C3:E3"); sh.cell("C3", "", S["text_in"])
    sh.set_row(3, 20)

    # hint (left) + weekday initials (day columns) + Total header
    sh.merge("B4:E4")
    sh.cell("B4", "Double-cliquez sur une case pour marquer ✓ présent.", S["hint"])
    sh.merge("F4:F5"); sh.cell("F4", "Total", S["header"]); sh.cell("F5", "", S["header"])
    sh.set_row(4, 16)

    # left column headers (row 5)
    sh.cell("B5", "N°", S["header"])
    sh.cell("C5", "ID", S["header"])
    sh.cell("D5", "Nom et Prénom", S["header"])
    sh.cell("E5", "Poste", S["header"])
    sh.set_row(5, 20)

    # day columns: weekday initial (row 4) + day number (row 5), by formula
    for k in range(NDAYS):
        c = M_DAY1 + k
        L = col_letter(c)
        sh.write(M_WEEKDAY, c, None, S["wk_hdr"],
                 formula=f'IF({L}{M_HEADER}="","",LEFT(TEXT(DATE(YEAR($C$2),MONTH($C$2),{L}{M_HEADER}),"ddd"),1))')
        sh.write(M_HEADER, c, None, S["day_hdr"],
                 formula=f'IF(COLUMN()-{M_DAY1 - 1}<=DAY(EOMONTH($C$2,0)),COLUMN()-{M_DAY1 - 1},"")')

    # worker rows
    today = dt.date.today()
    demo_col = M_DAY1 + today.day - 1
    for r in range(M_DATA, M_MAX + 1):
        i = r - M_DATA
        w = WORKERS[i] if i < len(WORKERS) else None
        sh.write(r, M_NUM, (i + 1) if w else None, S["num"])
        sh.write(r, M_ID, w[0] if w else None, S["id"])
        sh.write(r, M_NOM, w[1] if w else None, S["nom"])
        sh.write(r, M_POSTE, w[2] if w else None, S["poste"])
        sh.write(r, M_TOTAL, None, S["total"],
                 formula=f'IF(C{r}="","",COUNTIF(G{r}:{dcol}{r},UNICHAR(10003)))')
        for c in range(M_DAY1, M_DAYN + 1):
            # pre-mark today for the first 6 workers so the demo is not empty
            mark = CHECK if (w and i < 6 and c == demo_col) else None
            sh.write(r, c, mark, S["day"])

    # per-day totals row
    sh.cell(f"E{M_TOTALROW}", "Présents / jour :", S["dtot_lbl"])
    sh.write(M_TOTALROW, M_TOTAL, None, S["dtot"])
    for c in range(M_DAY1, M_DAYN + 1):
        L = col_letter(c)
        sh.write(M_TOTALROW, c, None, S["dtot"],
                 formula=f'COUNTIF({L}{M_DATA}:{L}{M_MAX},UNICHAR(10003))')
    sh.set_row(M_TOTALROW, 20)

    # conditional formatting -------------------------------------------------
    data = f"G{M_DATA}:{dcol}{M_MAX}"
    sh.add_cond_expr(data, "G6=UNICHAR(10003)", D["present"], priority=1)
    sh.add_cond_expr(data, 'G$5=""', D["invalid"], priority=2)
    sh.add_cond_expr(data, 'AND(G$5<>"",WEEKDAY(DATE(YEAR($C$2),MONTH($C$2),G$5),2)>=6)',
                     D["weekend"], priority=3)
    hdr = f"G{M_WEEKDAY}:{dcol}{M_HEADER}"
    sh.add_cond_expr(hdr, 'G$5=""', D["invalid"], priority=4)
    sh.add_cond_expr(hdr, 'AND(G$5<>"",WEEKDAY(DATE(YEAR($C$2),MONTH($C$2),G$5),2)>=6)',
                     D["weekend"], priority=5)
    sh.add_cond_expr(f"B{M_DATA}:F{M_MAX}", "MOD(ROW(),2)=0", D["band"], priority=6)
    return sh


# =========================================================================== #
#  Sheet: Feuille du Jour  (auto daily print sheet)
# =========================================================================== #
def build_jour(wb, S, D):
    sh = wb.add_sheet("Feuille du Jour")
    sh.code_name = "wsJour"
    sh.show_gridlines = False
    sh.setup_page(orientation="portrait", fit_width=1, fit_height=0, paper=9,
                  margins=(0.5, 0.5, 0.6, 0.6, 0.3, 0.3))

    sh.set_col(1, 2.5)
    sh.set_col(J_NUM, 6)
    sh.set_col(J_ID, 14)
    sh.set_col(J_NOM, 32)
    sh.set_col(J_POSTE, 20)
    sh.set_col(J_SIGN, 26)

    sh.merge("B1:F1"); sh.cell("B1", "LISTE DE PRÉSENCE DU JOUR", S["title"]); sh.set_row(1, 30)
    sh.merge("B2:F2"); sh.cell("B2", "Générée automatiquement depuis la feuille « Présence du Mois »", S["subtitle"])
    sh.set_row(2, 18)

    sh.cell("B3", "Jour :", S["label"])
    sh.cell("C3", dt.date.today().day, S["day_in"])
    sh.cell("D3", "Date :", S["label"])
    sh.merge("E3:F3")
    sh.write(3, 5, None, S["date_disp"],
             formula='IF($C$3="","",TEXT(DATE(YEAR(\'Présence du Mois\'!$C$2),'
                     'MONTH(\'Présence du Mois\'!$C$2),$C$3),"dddd d mmmm yyyy"))')
    sh.set_row(3, 24)

    sh.cell("B4", "Chantier :", S["label"])
    sh.merge("C4:F4")
    sh.write(4, 3, None, S["chantier_disp"], formula="'Présence du Mois'!$C$3")
    sh.set_row(4, 20)

    for i, h in enumerate(["N°", "ID", "Nom et Prénom", "Poste", "Signature"]):
        sh.write(J_HEADER, J_NUM + i, h, S["p_header"])
    sh.set_row(J_HEADER, 22)

    # the day list + footer are filled/formatted by VBA (ConstruireJour)
    sh.add_number_validation(f"C3", "between", "1", "31")
    return sh


# =========================================================================== #
#  VBA project
# =========================================================================== #
def _lf(code: str) -> str:
    return code.replace("\n", "\r\n")


WS_ATTR = (
    'Attribute VB_Base = "0{00020820-0000-0000-C000-000000000046}"\n'
    'Attribute VB_GlobalNameSpace = False\n'
    'Attribute VB_Creatable = False\n'
    'Attribute VB_PredeclaredId = True\n'
    'Attribute VB_Exposed = True\n'
    'Attribute VB_TemplateDerived = False\n'
    'Attribute VB_Customizable = True\n'
)
WB_ATTR = (
    'Attribute VB_Base = "0{00020819-0000-0000-C000-000000000046}"\n'
    'Attribute VB_GlobalNameSpace = False\n'
    'Attribute VB_Creatable = False\n'
    'Attribute VB_PredeclaredId = True\n'
    'Attribute VB_Exposed = True\n'
    'Attribute VB_TemplateDerived = False\n'
    'Attribute VB_Customizable = True\n'
)

THISWORKBOOK_CODE = 'Attribute VB_Name = "ThisWorkbook"\n' + WB_ATTR + '''Private Sub Workbook_Open()
    modPresence.InitialiserOutil
End Sub
'''

WSMOIS_CODE = 'Attribute VB_Name = "wsMois"\n' + WS_ATTR + '''Private Sub Worksheet_Activate()
    On Error Resume Next
    modPresence.CreerBoutons
End Sub

Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    modPresence.BasculerJour Target, Cancel
End Sub
'''

WSJOUR_CODE = 'Attribute VB_Name = "wsJour"\n' + WS_ATTR + '''Private Sub Worksheet_Activate()
    On Error Resume Next
    modPresence.CreerBoutons
    If Not IsNumeric(Me.Range("C3").Value) Then Me.Range("C3").Value = Day(Date)
    modPresence.ConstruireJour
End Sub

Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range("C3")) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    modPresence.ConstruireJour
    Application.EnableEvents = True
End Sub
'''

MODPRESENCE_CODE = '''Attribute VB_Name = "modPresence"
Option Explicit

' ===== Feuilles =====
Public Const NOM_MOIS As String = "Présence du Mois"
Public Const NOM_JOUR As String = "Feuille du Jour"

' ===== Grille mensuelle =====
Public Const M_HEADER As Long = 5
Public Const M_DATA As Long = 6
Public Const M_MAX As Long = 85
Public Const M_ID As Long = 3
Public Const M_NOM As Long = 4
Public Const M_POSTE As Long = 5
Public Const M_DAY1 As Long = 7
Public Const M_DAYN As Long = 37
Public Const CELL_MOIS As String = "C2"
Public Const CELL_CHANTIER As String = "C3"

' ===== Feuille du jour =====
Public Const J_DATA As Long = 6
Public Const J_NUM As Long = 2
Public Const J_ID As Long = 3
Public Const J_NOM As Long = 4
Public Const J_POSTE As Long = 5
Public Const J_SIGN As Long = 6
Public Const CELL_JOUR As String = "C3"

Public Function Coche() As String
    Coche = ChrW(10003)
End Function

' Lancé à l'ouverture du classeur.
Public Sub InitialiserOutil()
    On Error Resume Next
    CreerBoutons
    On Error GoTo 0
    Dim wsM As Worksheet, wsJ As Worksheet
    Set wsM = ThisWorkbook.Worksheets(NOM_MOIS)
    Set wsJ = ThisWorkbook.Worksheets(NOM_JOUR)
    If Not IsDate(wsM.Range(CELL_MOIS).Value) Then
        wsM.Range(CELL_MOIS).Value = DateSerial(Year(Date), Month(Date), 1)
    End If
    If Not IsNumeric(wsJ.Range(CELL_JOUR).Value) Then wsJ.Range(CELL_JOUR).Value = Day(Date)
    ConstruireJour
    wsM.Activate
End Sub

' Double-clic dans la grille : marque / enlève la présence du jour.
Public Sub BasculerJour(ByVal Target As Range, ByRef Cancel As Boolean)
    Dim wsM As Worksheet
    Set wsM = ThisWorkbook.Worksheets(NOM_MOIS)
    If Target.Count <> 1 Then Exit Sub
    If Target.Column < M_DAY1 Or Target.Column > M_DAYN Then Exit Sub
    If Target.Row < M_DATA Or Target.Row > M_MAX Then Exit Sub
    If Trim$(CStr(wsM.Cells(Target.Row, M_ID).Value)) = "" Then Exit Sub
    If Trim$(CStr(wsM.Cells(M_HEADER, Target.Column).Value)) = "" Then Exit Sub
    Cancel = True
    If Trim$(CStr(Target.Value)) = Coche() Then
        Target.ClearContents
    Else
        Target.Value = Coche()
    End If
End Sub

' Construit la liste imprimable des présents pour le jour choisi.
Public Sub ConstruireJour()
    Dim wsM As Worksheet, wsJ As Worksheet
    Set wsM = ThisWorkbook.Worksheets(NOM_MOIS)
    Set wsJ = ThisWorkbook.Worksheets(NOM_JOUR)
    Application.ScreenUpdating = False
    wsJ.Range(wsJ.Cells(J_DATA, J_NUM), wsJ.Cells(500, J_SIGN)).Clear
    Dim vJ As Variant
    vJ = wsJ.Range(CELL_JOUR).Value
    Dim n As Long
    n = 0
    If IsNumeric(vJ) Then
        Dim jour As Long
        jour = CLng(vJ)
        If jour >= 1 And jour <= 31 Then
            Dim col As Long
            col = M_DAY1 + jour - 1
            Dim lastM As Long, r As Long, dst As Long
            lastM = wsM.Cells(wsM.Rows.Count, M_ID).End(xlUp).Row
            dst = J_DATA
            For r = M_DATA To lastM
                If Trim$(CStr(wsM.Cells(r, M_ID).Value)) <> "" Then
                    If Trim$(CStr(wsM.Cells(r, col).Value)) = Coche() Then
                        n = n + 1
                        wsJ.Cells(dst, J_NUM).Value = n
                        wsJ.Cells(dst, J_ID).Value = wsM.Cells(r, M_ID).Value
                        wsJ.Cells(dst, J_NOM).Value = wsM.Cells(r, M_NOM).Value
                        wsJ.Cells(dst, J_POSTE).Value = wsM.Cells(r, M_POSTE).Value
                        dst = dst + 1
                    End If
                End If
            Next r
        End If
    End If
    FormaterJour n
    Application.ScreenUpdating = True
End Sub

Private Sub FormaterJour(ByVal n As Long)
    Dim wsJ As Worksheet
    Set wsJ = ThisWorkbook.Worksheets(NOM_JOUR)
    Dim lastRow As Long
    If n > 0 Then
        Dim rng As Range
        Set rng = wsJ.Range(wsJ.Cells(J_DATA, J_NUM), wsJ.Cells(J_DATA + n - 1, J_SIGN))
        With rng.Borders
            .LineStyle = xlContinuous
            .Weight = xlThin
            .Color = RGB(189, 195, 199)
        End With
        rng.Font.Name = "Calibri"
        rng.Font.Size = 11
        rng.RowHeight = 22
        wsJ.Range(wsJ.Cells(J_DATA, J_NUM), wsJ.Cells(J_DATA + n - 1, J_NUM)).HorizontalAlignment = xlCenter
        wsJ.Range(wsJ.Cells(J_DATA, J_ID), wsJ.Cells(J_DATA + n - 1, J_ID)).HorizontalAlignment = xlCenter
        lastRow = J_DATA + n - 1
    Else
        wsJ.Cells(J_DATA, J_NOM).Value = "Aucun employé présent ce jour."
        wsJ.Cells(J_DATA, J_NOM).Font.Italic = True
        lastRow = J_DATA
    End If
    Dim fr As Long
    fr = lastRow + 2
    wsJ.Cells(fr, J_ID).Value = "Total présents :"
    wsJ.Cells(fr, J_ID).Font.Bold = True
    wsJ.Cells(fr, J_ID).HorizontalAlignment = xlRight
    wsJ.Cells(fr, J_NOM).Value = n
    wsJ.Cells(fr, J_NOM).Font.Bold = True
    Dim sr As Long
    sr = fr + 2
    wsJ.Cells(sr, J_ID).Value = "Signature du responsable :"
    wsJ.Cells(sr, J_ID).Font.Bold = True
    wsJ.Cells(sr, J_ID).HorizontalAlignment = xlRight
    With wsJ.Range(wsJ.Cells(sr, J_POSTE), wsJ.Cells(sr, J_SIGN)).Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .Weight = xlMedium
        .Color = RGB(44, 62, 80)
    End With
    wsJ.PageSetup.PrintArea = "$B$1:$F$" & (sr + 1)
End Sub

' Bouton (grille) : ouvre la feuille du jour pour aujourd'hui.
Public Sub OuvrirJour()
    Dim wsJ As Worksheet
    Set wsJ = ThisWorkbook.Worksheets(NOM_JOUR)
    wsJ.Range(CELL_JOUR).Value = Day(Date)
    wsJ.Activate
    ConstruireJour
End Sub

' Bouton (feuille du jour) : revenir à aujourd'hui.
Public Sub AujourdHui()
    ThisWorkbook.Worksheets(NOM_JOUR).Range(CELL_JOUR).Value = Day(Date)
    ConstruireJour
End Sub

' Bouton (feuille du jour) : aperçu avant impression.
Public Sub ImprimerJour()
    ConstruireJour
    ThisWorkbook.Worksheets(NOM_JOUR).Activate
    ThisWorkbook.Worksheets(NOM_JOUR).PrintPreview
End Sub

Public Sub CreerBoutons()
    Dim wsM As Worksheet, wsJ As Worksheet
    Set wsM = ThisWorkbook.Worksheets(NOM_MOIS)
    Set wsJ = ThisWorkbook.Worksheets(NOM_JOUR)
    SupprimerBoutons wsM
    SupprimerBoutons wsJ
    AjouterBouton wsM, "btn_jour", "Feuille du jour", "OuvrirJour", _
        wsM.Range("D1").Left, wsM.Range("D1").Top + 2, 175, 38, RGB(41, 128, 185)
    AjouterBouton wsJ, "btn_auj", "Aujourd'hui", "AujourdHui", _
        wsJ.Range("H3").Left, wsJ.Range("H3").Top, 150, 34, RGB(41, 128, 185)
    AjouterBouton wsJ, "btn_imp", "Imprimer", "ImprimerJour", _
        wsJ.Range("H3").Left, wsJ.Range("H3").Top + 42, 150, 34, RGB(39, 174, 96)
End Sub

Private Sub SupprimerBoutons(ws As Worksheet)
    Dim shp As Shape
    For Each shp In ws.Shapes
        If Left$(shp.Name, 4) = "btn_" Then shp.Delete
    Next shp
End Sub

Private Sub AjouterBouton(ws As Worksheet, nom As String, texte As String, macro As String, _
        g As Double, t As Double, w As Double, h As Double, couleur As Long)
    Dim b As Shape
    Set b = ws.Shapes.AddShape(msoShapeRoundedRectangle, g, t, w, h)
    b.Name = nom
    b.OnAction = "'" & ThisWorkbook.Name & "'!" & macro
    b.Fill.ForeColor.RGB = couleur
    b.Line.Visible = msoFalse
    With b.TextFrame
        .Characters.Text = texte
        .Characters.Font.Size = 12
        .Characters.Font.Bold = True
        .Characters.Font.Name = "Calibri"
        .Characters.Font.Color = RGB(255, 255, 255)
        .HorizontalAlignment = xlHAlignCenter
        .VerticalAlignment = xlVAlignCenter
    End With
End Sub
'''


def _ws_doc(code_name: str) -> str:
    return 'Attribute VB_Name = "%s"\n' % code_name + WS_ATTR


def build_vba() -> VbaProject:
    proj = VbaProject("GestionPresences")
    proj.add_document_module("ThisWorkbook", _lf(THISWORKBOOK_CODE))
    proj.add_document_module("wsMois", _lf(WSMOIS_CODE))
    proj.add_document_module("wsJour", _lf(WSJOUR_CODE))
    proj.add_procedural_module("modPresence", _lf(MODPRESENCE_CODE))
    return proj


# =========================================================================== #
#  Main
# =========================================================================== #
def main(path: str = "Gestion_Presences.xlsm"):
    wb = Workbook()
    wb.title = "Système de Gestion des Présences"
    S = register_styles(wb)
    D = register_dxf(wb)

    build_mois(wb, S, D)
    build_jour(wb, S, D)
    wb.active_tab = 0

    wb.set_vba_project(build_vba().build(), code_name="ThisWorkbook")
    wb.save(path)
    print("Écrit :", path)


if __name__ == "__main__":
    main()
