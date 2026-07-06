"""
build_attendance.py - Generate a professional French daily-attendance workbook.

Produces `Gestion_Presences.xlsm`, a macro-enabled Excel tool for a construction
company: mark present employees each morning with a double-click, save the day
to a history log, and open a print-ready A4 attendance sheet. Built entirely
with the standard library through xlsxgen (packaging) and vbagen (VBA project).

Daily workflow (under two minutes):
    1. Open the file (enable macros).
    2. Double-click the "Présent" column for each employee on site.
    3. Click "Enregistrer la journée".
    4. Click "Imprimer la liste".
"""

from __future__ import annotations

import datetime as dt

from xlsxgen import Workbook
from vbagen import VbaProject


# --------------------------------------------------------------------------- #
#  Palette (sober / modern)
# --------------------------------------------------------------------------- #
INK       = "FF2C3E50"   # titles / dark bars
INK_LT    = "FF34495E"   # table headers
WHITE     = "FFFFFFFF"
GREEN     = "FF27AE60"
GREEN_LT  = "FFE9F7EF"
GREEN_TX  = "FF1E8449"
RED_LT    = "FFFDECEA"
RED_TX    = "FF922B21"
BAND      = "FFF4F6F7"
LINE      = "FFBDC3C7"
LABEL_BG  = "FFECF0F1"
INPUT_BG  = "FFFEF9E7"
INPUT_TX  = "FF7D6608"
SUB_TX    = "FF7F8C8D"


def _bd(color: str = LINE, style: str = "thin") -> dict:
    side = {"style": style, "color": color}
    return {"left": side, "right": side, "top": side, "bottom": side}


# --------------------------------------------------------------------------- #
#  Sample master data  (id, nom, cin, cnss, poste, equipe, statut)
# --------------------------------------------------------------------------- #
EMPLOYES = [
    ("EMP-001", "Youssef El Amrani", "AB123456", "145782301", "Chef de chantier", "Équipe A", "Actif"),
    ("EMP-002", "Rachid Benali",     "AB234567", "145782302", "Maçon",            "Équipe A", "Actif"),
    ("EMP-003", "Hassan Toumi",      "AB345678", "145782303", "Coffreur",         "Équipe A", "Actif"),
    ("EMP-004", "Karim Idrissi",     "AB456789", "145782304", "Ferrailleur",      "Équipe B", "Actif"),
    ("EMP-005", "Said Ouazzani",     "AB567890", "145782305", "Manœuvre",         "Équipe B", "Actif"),
    ("EMP-006", "Mohamed Fassi",     "AB678901", "145782306", "Électricien",      "Équipe A", "Actif"),
    ("EMP-007", "Abdellah Naciri",   "AB789012", "145782307", "Plombier",         "Équipe B", "Actif"),
    ("EMP-008", "Omar Sabri",        "AB890123", "145782308", "Grutier",          "Équipe A", "Actif"),
    ("EMP-009", "Brahim Alaoui",     "AB901234", "145782309", "Peintre",          "Équipe B", "Inactif"),
    ("EMP-010", "Nabil Chraibi",     "AB012345", "145782310", "Manœuvre",         "Équipe A", "Actif"),
]

PRESENCE_MAX = 106      # last row of the presence table (rows 7..106)
EMP_MAX = 103           # last row of the employee table (rows 4..103)
IMPR_MAX = 45           # last data row of the printable list (rows 6..45)
HIST_MAX = 1003         # last pre-formatted history row (rows 4..1003)


# =========================================================================== #
#  Style registration
# =========================================================================== #
def register_styles(wb: Workbook) -> dict:
    s = {}
    s["title"] = wb.style({"font": {"bold": True, "size": 20, "color": WHITE},
                           "fill": INK, "align": {"horizontal": "center", "vertical": "center"}})
    s["subtitle"] = wb.style({"font": {"italic": True, "size": 11, "color": SUB_TX},
                              "align": {"horizontal": "left", "vertical": "center"}})
    s["hint"] = wb.style({"font": {"italic": True, "size": 10, "color": SUB_TX},
                          "align": {"horizontal": "left", "vertical": "center"}})
    s["header"] = wb.style({"font": {"bold": True, "size": 11, "color": WHITE},
                            "fill": INK_LT, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center", "wrap": True}})
    s["label"] = wb.style({"font": {"bold": True, "size": 11, "color": INK},
                           "align": {"horizontal": "right", "vertical": "center"}})
    s["date_in"] = wb.style({"font": {"bold": True, "size": 12, "color": INPUT_TX},
                             "fill": INPUT_BG, "border": _bd(), "numfmt": "dd/mm/yyyy",
                             "align": {"horizontal": "center", "vertical": "center"},
                             "locked": False})
    s["text_in"] = wb.style({"font": {"bold": True, "size": 12, "color": INPUT_TX},
                             "fill": INPUT_BG, "border": _bd(),
                             "align": {"horizontal": "left", "vertical": "center"},
                             "locked": False})
    s["kpi_label"] = wb.style({"font": {"bold": True, "size": 11, "color": INK},
                               "fill": LABEL_BG, "border": _bd(),
                               "align": {"horizontal": "left", "vertical": "center"}})
    s["kpi_value"] = wb.style({"font": {"bold": True, "size": 18, "color": GREEN_TX},
                               "fill": WHITE, "border": _bd(),
                               "align": {"horizontal": "center", "vertical": "center"}})
    # data cells
    s["check"] = wb.style({"font": {"bold": True, "size": 16, "color": GREEN},
                           "border": _bd(), "locked": False,
                           "align": {"horizontal": "center", "vertical": "center"}})
    s["id"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                        "align": {"horizontal": "center", "vertical": "center"}})
    s["nom"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                         "align": {"horizontal": "left", "vertical": "center"}})
    s["poste"] = wb.style({"font": {"size": 11, "color": SUB_TX}, "border": _bd(),
                           "align": {"horizontal": "left", "vertical": "center"}})
    s["cell_c"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center"}})
    s["cell_l"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                            "align": {"horizontal": "left", "vertical": "center"}})
    s["statut"] = wb.style({"font": {"bold": True, "size": 11, "color": INK}, "border": _bd(),
                            "align": {"horizontal": "center", "vertical": "center"},
                            "locked": False})
    s["date_cell"] = wb.style({"font": {"size": 11, "color": INK}, "border": _bd(),
                               "numfmt": "dd/mm/yyyy",
                               "align": {"horizontal": "center", "vertical": "center"}})
    s["sign"] = wb.style({"border": _bd(), "align": {"horizontal": "left", "vertical": "center"}})
    s["foot_label"] = wb.style({"font": {"bold": True, "size": 11, "color": INK},
                                "align": {"horizontal": "right", "vertical": "center"}})
    s["foot_line"] = wb.style({"border": {"bottom": {"style": "medium", "color": INK}}})
    s["foot_val"] = wb.style({"font": {"bold": True, "size": 12, "color": GREEN_TX},
                              "align": {"horizontal": "left", "vertical": "center"}})
    return s


def register_dxf(wb: Workbook) -> dict:
    d = {}
    d["present"] = wb.dxf({"fill": GREEN_LT, "font": {"bold": True, "color": GREEN_TX}})
    d["band"] = wb.dxf({"fill": BAND})
    d["actif"] = wb.dxf({"fill": GREEN_LT, "font": {"bold": True, "color": GREEN_TX}})
    d["inactif"] = wb.dxf({"fill": RED_LT, "font": {"bold": True, "color": RED_TX}})
    d["oui"] = wb.dxf({"fill": GREEN_LT, "font": {"color": GREEN_TX}})
    d["non"] = wb.dxf({"fill": RED_LT, "font": {"color": RED_TX}})
    return d


# =========================================================================== #
#  Sheet builders
# =========================================================================== #
def build_presence(wb, S, D):
    sh = wb.add_sheet("Présence du Jour")
    sh.code_name = "wsPresence"
    sh.show_gridlines = False
    sh.default_row_height = 19
    sh.freeze_panes(6, 0)

    sh.set_col(1, 2.5)
    sh.set_col(2, 12)      # Présent
    sh.set_col(3, 15)      # ID
    sh.set_col(4, 34)      # Nom
    sh.set_col(5, 22)      # Poste
    sh.set_col(6, 3)

    # title / subtitle / hint
    sh.merge("B1:E1"); sh.cell("B1", "PRÉSENCE DU JOUR", S["title"]); sh.set_row(1, 34)
    sh.merge("B2:E2"); sh.cell("B2", "Pointage quotidien du chantier", S["subtitle"]); sh.set_row(2, 18)

    # date + chantier
    sh.cell("B3", "Date :", S["label"])
    sh.cell("C3", dt.date.today(), S["date_in"])
    sh.cell("D3", "Chantier :", S["label"])
    sh.cell("E3", "", S["text_in"])
    sh.set_row(3, 24)

    # KPI: présents cochés
    sh.merge("B4:C4"); sh.cell("B4", "Présents cochés :", S["kpi_label"]); sh.cell("C4", "", S["kpi_label"])
    sh.merge("D4:E4")
    sh.cell("D4", None, S["kpi_value"], formula='COUNTA(B7:B%d)&"  /  "&COUNTA(C7:C%d)' % (PRESENCE_MAX, PRESENCE_MAX))
    sh.cell("E4", "", S["kpi_value"])
    sh.set_row(4, 28)

    sh.merge("B5:E5")
    sh.cell("B5", "Astuce : double-cliquez dans la colonne « Présent » pour cocher (✓) un employé.", S["hint"])
    sh.set_row(5, 18)

    # header row 6
    sh.cell("B6", "Présent", S["header"])
    sh.cell("C6", "ID", S["header"])
    sh.cell("D6", "Nom et Prénom", S["header"])
    sh.cell("E6", "Poste", S["header"])
    sh.set_row(6, 22)

    # data rows 7.. : pre-fill active employees
    actifs = [e for e in EMPLOYES if e[6].lower() == "actif"]
    row = 7
    for r in range(7, PRESENCE_MAX + 1):
        sh.write(r, 2, None, S["check"])
        if r - 7 < len(actifs):
            emp = actifs[r - 7]
            sh.write(r, 3, emp[0], S["id"])
            sh.write(r, 4, emp[1], S["nom"])
            sh.write(r, 5, emp[4], S["poste"])
        else:
            sh.write(r, 3, None, S["id"])
            sh.write(r, 4, None, S["nom"])
            sh.write(r, 5, None, S["poste"])

    rng = f"B7:E{PRESENCE_MAX}"
    sh.add_cond_expr(rng, "LEN($B7)>0", D["present"], priority=1)
    sh.add_cond_expr(rng, "MOD(ROW(),2)=0", D["band"], priority=2)
    return sh


def build_employes(wb, S, D):
    sh = wb.add_sheet("Employés")
    sh.code_name = "wsEmployes"
    sh.show_gridlines = False
    sh.default_row_height = 18
    sh.freeze_panes(3, 0)

    widths = {1: 2.5, 2: 14, 3: 30, 4: 14, 5: 16, 6: 20, 7: 14, 8: 12}
    for c, w in widths.items():
        sh.set_col(c, w)

    sh.merge("B1:H1"); sh.cell("B1", "EMPLOYÉS", S["title"]); sh.set_row(1, 34)
    sh.merge("B2:H2"); sh.cell("B2", "Fichier du personnel — informations fixes", S["subtitle"]); sh.set_row(2, 18)

    headers = ["ID Employé", "Nom et Prénom", "CIN", "CNSS", "Poste", "Équipe", "Statut"]
    for i, h in enumerate(headers):
        sh.write(3, 2 + i, h, S["header"])
    sh.set_row(3, 22)

    styles = [S["id"], S["nom"], S["cell_c"], S["cell_c"], S["cell_l"], S["cell_c"], S["statut"]]
    for r in range(4, EMP_MAX + 1):
        idx = r - 4
        emp = EMPLOYES[idx] if idx < len(EMPLOYES) else None
        for col in range(7):
            val = emp[col] if emp else None
            sh.write(r, 2 + col, val, styles[col])

    # data validation for Statut + conditional colours
    sh.add_list_validation(f"H4:H{EMP_MAX}", "Actif,Inactif")
    sh.add_cond_cellis(f"H4:H{EMP_MAX}", "equal", '"Actif"', D["actif"], priority=1)
    sh.add_cond_cellis(f"H4:H{EMP_MAX}", "equal", '"Inactif"', D["inactif"], priority=2)
    sh.add_cond_expr(f"B4:H{EMP_MAX}", "MOD(ROW(),2)=0", D["band"], priority=3)
    return sh


def build_impression(wb, S, D):
    sh = wb.add_sheet("Liste à imprimer")
    sh.code_name = "wsImpression"
    sh.show_gridlines = False
    sh.setup_page(orientation="portrait", fit_width=1, fit_height=0, paper=9,
                  margins=(0.5, 0.5, 0.6, 0.6, 0.3, 0.3))

    sh.set_col(1, 2.5)
    sh.set_col(2, 6)       # N°
    sh.set_col(3, 14)      # ID
    sh.set_col(4, 32)      # Nom
    sh.set_col(5, 20)      # Poste
    sh.set_col(6, 24)      # Signature

    sh.merge("B1:F1"); sh.cell("B1", "LISTE DE PRÉSENCE", S["title"]); sh.set_row(1, 34)
    sh.merge("B2:F2"); sh.cell("B2", "Feuille de présence quotidienne du chantier", S["subtitle"]); sh.set_row(2, 18)

    sh.cell("B3", "Date :", S["label"])
    sh.cell("C3", None, S["date_cell"])
    sh.cell("D3", "Chantier :", S["label"])
    sh.merge("E3:F3"); sh.cell("E3", "", S["cell_l"]); sh.cell("F3", "", S["cell_l"])
    sh.set_row(3, 22)

    headers = ["N°", "ID", "Nom et Prénom", "Poste", "Signature"]
    for i, h in enumerate(headers):
        sh.write(5, 2 + i, h, S["header"])
    sh.set_row(5, 22)

    st = [S["cell_c"], S["id"], S["nom"], S["poste"], S["sign"]]
    for r in range(6, IMPR_MAX + 1):
        for col in range(5):
            sh.write(r, 2 + col, None, st[col])
        sh.set_row(r, 24)

    # footer: total + signature line
    sh.cell(f"C{IMPR_MAX + 2}", "Nombre de présents :", S["foot_label"])
    sh.merge(f"C{IMPR_MAX + 2}:D{IMPR_MAX + 2}")
    sh.cell(f"E{IMPR_MAX + 2}", None, S["foot_val"], formula=f"COUNT(B6:B{IMPR_MAX})")
    sh.cell(f"C{IMPR_MAX + 4}", "Signature du responsable :", S["foot_label"])
    sh.merge(f"C{IMPR_MAX + 4}:D{IMPR_MAX + 4}")
    sh.cell(f"E{IMPR_MAX + 4}", "", S["foot_line"])
    sh.merge(f"E{IMPR_MAX + 4}:F{IMPR_MAX + 4}"); sh.cell(f"F{IMPR_MAX + 4}", "", S["foot_line"])

    sh.set_print_area(f"B1:F{IMPR_MAX + 5}")
    return sh


def build_historique(wb, S, D):
    sh = wb.add_sheet("Historique")
    sh.code_name = "wsHistorique"
    sh.show_gridlines = False
    sh.default_row_height = 18
    sh.freeze_panes(3, 0)

    sh.set_col(1, 2.5)
    sh.set_col(2, 14)      # Date
    sh.set_col(3, 14)      # ID
    sh.set_col(4, 32)      # Nom
    sh.set_col(5, 12)      # Présent

    sh.merge("B1:E1"); sh.cell("B1", "HISTORIQUE DES PRÉSENCES", S["title"]); sh.set_row(1, 34)
    sh.merge("B2:E2"); sh.cell("B2", "Journées enregistrées — archivage automatique", S["subtitle"]); sh.set_row(2, 18)

    for i, h in enumerate(["Date", "ID", "Nom et Prénom", "Présent"]):
        sh.write(3, 2 + i, h, S["header"])
    sh.set_row(3, 22)

    for r in range(4, HIST_MAX + 1):
        sh.write(r, 2, None, S["date_cell"])
        sh.write(r, 3, None, S["id"])
        sh.write(r, 4, None, S["nom"])
        sh.write(r, 5, None, S["cell_c"])

    sh.add_cond_cellis(f"E4:E{HIST_MAX}", "equal", '"Oui"', D["oui"], priority=1)
    sh.add_cond_cellis(f"E4:E{HIST_MAX}", "equal", '"Non"', D["non"], priority=2)
    sh.add_cond_expr(f"B4:E{HIST_MAX}", "MOD(ROW(),2)=0", D["band"], priority=3)
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


def _ws_header(code_name: str) -> str:
    return 'Attribute VB_Name = "%s"\n' % code_name + WS_ATTR


THISWORKBOOK_CODE = (
    'Attribute VB_Name = "ThisWorkbook"\n' + WB_ATTR +
    "Private Sub Workbook_Open()\n"
    "    modPresence.InitialiserOutil\n"
    "End Sub\n"
)

WSPRESENCE_CODE = _ws_header("wsPresence") + (
    "Private Sub Worksheet_Activate()\n"
    "    On Error Resume Next\n"
    "    modPresence.CreerBoutons\n"
    "End Sub\n"
    "\n"
    "Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)\n"
    "    modPresence.BasculerPresence Target, Cancel\n"
    "End Sub\n"
)

MODPRESENCE_CODE = (
    'Attribute VB_Name = "modPresence"\n'
    "Option Explicit\n"
    "\n"
    "' ===== Noms des feuilles =====\n"
    'Public Const NOM_PRESENCE As String = "Présence du Jour"\n'
    'Public Const NOM_EMPLOYES As String = "Employés"\n'
    'Public Const NOM_IMPRESSION As String = "Liste à imprimer"\n'
    'Public Const NOM_HISTORIQUE As String = "Historique"\n'
    "\n"
    "' ===== Feuille Présence =====\n"
    "Public Const P_HEADER As Long = 6\n"
    "Public Const P_DATA As Long = 7\n"
    "Public Const P_MAX As Long = 106\n"
    "Public Const P_CHECK As Long = 2\n"
    "Public Const P_ID As Long = 3\n"
    "Public Const P_NOM As Long = 4\n"
    "Public Const P_POSTE As Long = 5\n"
    'Public Const CELL_DATE As String = "C3"\n'
    'Public Const CELL_CHANTIER As String = "E3"\n'
    "\n"
    "' ===== Feuille Employés =====\n"
    "Public Const E_DATA As Long = 4\n"
    "Public Const E_ID As Long = 2\n"
    "Public Const E_NOM As Long = 3\n"
    "Public Const E_POSTE As Long = 6\n"
    "Public Const E_STATUT As Long = 8\n"
    "\n"
    "' ===== Feuille Liste à imprimer =====\n"
    "Public Const L_DATA As Long = 6\n"
    "Public Const L_NUM As Long = 2\n"
    "Public Const L_ID As Long = 3\n"
    "Public Const L_NOM As Long = 4\n"
    "Public Const L_POSTE As Long = 5\n"
    'Public Const CELL_L_DATE As String = "C3"\n'
    'Public Const CELL_L_CHANTIER As String = "E3"\n'
    "\n"
    "' ===== Feuille Historique =====\n"
    "Public Const H_DATA As Long = 4\n"
    "Public Const H_DATE As Long = 2\n"
    "Public Const H_ID As Long = 3\n"
    "Public Const H_NOM As Long = 4\n"
    "Public Const H_PRESENT As Long = 5\n"
    "\n"
    "Public Function Coche() As String\n"
    "    Coche = ChrW(10003)\n"
    "End Function\n"
    "\n"
    "' Lancé à l'ouverture du classeur.\n"
    "Public Sub InitialiserOutil()\n"
    "    On Error Resume Next\n"
    "    CreerBoutons\n"
    "    On Error GoTo 0\n"
    "    Dim wsP As Worksheet\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    If Not IsDate(wsP.Range(CELL_DATE).Value) Then wsP.Range(CELL_DATE).Value = Date\n"
    '    If Trim$(CStr(wsP.Cells(P_DATA, P_ID).Value)) = "" Then RemplirPresence\n'
    "    wsP.Activate\n"
    "End Sub\n"
    "\n"
    "' (Re)crée les trois gros boutons de la feuille Présence.\n"
    "Public Sub CreerBoutons()\n"
    "    Dim ws As Worksheet\n"
    "    Set ws = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    Dim shp As Shape\n"
    "    For Each shp In ws.Shapes\n"
    '        If Left$(shp.Name, 4) = "btn_" Then shp.Delete\n'
    "    Next shp\n"
    "    Dim g As Double, t As Double, w As Double, h As Double\n"
    '    g = ws.Range("G2").Left\n'
    '    t = ws.Range("G2").Top\n'
    "    w = 190\n"
    "    h = 42\n"
    '    AjouterBouton ws, "btn_nouvelle", "Nouvelle journée", "NouvelleJournee", g, t, w, h, RGB(41, 128, 185)\n'
    '    AjouterBouton ws, "btn_enregistrer", "Enregistrer la journée", "EnregistrerJournee", g, t + (h + 8), w, h, RGB(39, 174, 96)\n'
    '    AjouterBouton ws, "btn_imprimer", "Imprimer la liste", "ImprimerListe", g, t + 2 * (h + 8), w, h, RGB(230, 126, 34)\n'
    "End Sub\n"
    "\n"
    "Private Sub AjouterBouton(ws As Worksheet, nom As String, texte As String, macro As String, _\n"
    "        g As Double, t As Double, w As Double, h As Double, couleur As Long)\n"
    "    Dim b As Shape\n"
    "    Set b = ws.Shapes.AddShape(msoShapeRoundedRectangle, g, t, w, h)\n"
    "    b.Name = nom\n"
    '    b.OnAction = "'"'"'" & ThisWorkbook.Name & "'"'"'!" & macro\n'
    "    b.Fill.ForeColor.RGB = couleur\n"
    "    b.Line.Visible = msoFalse\n"
    "    With b.TextFrame\n"
    "        .Characters.Text = texte\n"
    "        .Characters.Font.Size = 12\n"
    "        .Characters.Font.Bold = True\n"
    '        .Characters.Font.Name = "Calibri"\n'
    "        .Characters.Font.Color = RGB(255, 255, 255)\n"
    "        .HorizontalAlignment = xlHAlignCenter\n"
    "        .VerticalAlignment = xlVAlignCenter\n"
    "    End With\n"
    "End Sub\n"
    "\n"
    "' Remplit la liste avec les employés actifs (vide les cases cochées).\n"
    "Public Sub RemplirPresence()\n"
    "    Dim wsE As Worksheet, wsP As Worksheet\n"
    "    Set wsE = ThisWorkbook.Worksheets(NOM_EMPLOYES)\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    Application.ScreenUpdating = False\n"
    "    wsP.Range(wsP.Cells(P_DATA, P_CHECK), wsP.Cells(P_MAX, P_POSTE)).ClearContents\n"
    "    Dim lastE As Long, r As Long, dst As Long\n"
    "    lastE = wsE.Cells(wsE.Rows.Count, E_ID).End(xlUp).Row\n"
    "    dst = P_DATA\n"
    "    For r = E_DATA To lastE\n"
    '        If Trim$(CStr(wsE.Cells(r, E_ID).Value)) <> "" _\n'
    '           And LCase$(Trim$(CStr(wsE.Cells(r, E_STATUT).Value))) = "actif" Then\n'
    "            If dst > P_MAX Then Exit For\n"
    "            wsP.Cells(dst, P_ID).Value = wsE.Cells(r, E_ID).Value\n"
    "            wsP.Cells(dst, P_NOM).Value = wsE.Cells(r, E_NOM).Value\n"
    "            wsP.Cells(dst, P_POSTE).Value = wsE.Cells(r, E_POSTE).Value\n"
    "            dst = dst + 1\n"
    "        End If\n"
    "    Next r\n"
    "    Application.ScreenUpdating = True\n"
    "End Sub\n"
    "\n"
    "' Bouton : prépare une nouvelle journée.\n"
    "Public Sub NouvelleJournee()\n"
    "    Dim wsP As Worksheet\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    RemplirPresence\n"
    "    wsP.Range(CELL_DATE).Value = Date\n"
    "    wsP.Activate\n"
    "    Application.Goto wsP.Range(CELL_DATE), False\n"
    '    MsgBox "Nouvelle journée prête pour le " & Format$(Date, "dd/mm/yyyy") & "." & vbCrLf & vbCrLf & _\n'
    '        "Double-cliquez dans la colonne « Présent » pour cocher les employés présents.", _\n'
    '        vbInformation, "Présence du Jour"\n'
    "End Sub\n"
    "\n"
    "' Double-clic dans la colonne Présent : coche / décoche.\n"
    "Public Sub BasculerPresence(ByVal Target As Range, ByRef Cancel As Boolean)\n"
    "    Dim wsP As Worksheet\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    If Target.Column <> P_CHECK Then Exit Sub\n"
    "    If Target.Row < P_DATA Or Target.Row > P_MAX Then Exit Sub\n"
    '    If Trim$(CStr(wsP.Cells(Target.Row, P_ID).Value)) = "" Then Exit Sub\n'
    "    Cancel = True\n"
    "    If Trim$(CStr(Target.Value)) = Coche() Then\n"
    "        Target.ClearContents\n"
    "    Else\n"
    "        Target.Value = Coche()\n"
    "    End If\n"
    "End Sub\n"
    "\n"
    "' Bouton : enregistre la journée dans l'historique + met à jour la liste.\n"
    "Public Sub EnregistrerJournee()\n"
    "    Dim wsP As Worksheet, wsH As Worksheet\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    Set wsH = ThisWorkbook.Worksheets(NOM_HISTORIQUE)\n"
    "    Dim vDate As Variant\n"
    "    vDate = wsP.Range(CELL_DATE).Value\n"
    "    If Not IsDate(vDate) Then\n"
    '        MsgBox "Veuillez d\'abord saisir une date valide.", vbExclamation, "Présence du Jour"\n'
    "        wsP.Activate: wsP.Range(CELL_DATE).Select\n"
    "        Exit Sub\n"
    "    End If\n"
    "    Dim d As Date\n"
    "    d = CDate(vDate)\n"
    "    Dim lastP As Long\n"
    "    lastP = wsP.Cells(wsP.Rows.Count, P_ID).End(xlUp).Row\n"
    "    If lastP < P_DATA Then\n"
    '        MsgBox "La liste est vide. Cliquez d\'abord sur « Nouvelle journée ».", vbExclamation, "Présence du Jour"\n'
    "        Exit Sub\n"
    "    End If\n"
    "    Application.ScreenUpdating = False\n"
    "    SupprimerDateHistorique d\n"
    "    Dim lastH As Long, dst As Long\n"
    "    lastH = wsH.Cells(wsH.Rows.Count, H_DATE).End(xlUp).Row\n"
    "    If lastH < H_DATA Then\n"
    "        dst = H_DATA\n"
    "    Else\n"
    "        dst = lastH + 1\n"
    "    End If\n"
    "    Dim r As Long, total As Long, presents As Long\n"
    "    Dim estPresent As Boolean\n"
    "    For r = P_DATA To lastP\n"
    '        If Trim$(CStr(wsP.Cells(r, P_ID).Value)) <> "" Then\n'
    "            estPresent = (Trim$(CStr(wsP.Cells(r, P_CHECK).Value)) = Coche())\n"
    "            wsH.Cells(dst, H_DATE).Value = d\n"
    '            wsH.Cells(dst, H_DATE).NumberFormat = "dd/mm/yyyy"\n'
    "            wsH.Cells(dst, H_ID).Value = wsP.Cells(r, P_ID).Value\n"
    "            wsH.Cells(dst, H_NOM).Value = wsP.Cells(r, P_NOM).Value\n"
    '            wsH.Cells(dst, H_PRESENT).Value = IIf(estPresent, "Oui", "Non")\n'
    "            If estPresent Then presents = presents + 1\n"
    "            total = total + 1\n"
    "            dst = dst + 1\n"
    "        End If\n"
    "    Next r\n"
    "    ConstruireListeImpression\n"
    "    Application.ScreenUpdating = True\n"
    '    MsgBox "Journée enregistrée : " & Format$(d, "dd/mm/yyyy") & "." & vbCrLf & vbCrLf & _\n'
    '        presents & " présent(s) sur " & total & " employé(s)." & vbCrLf & _\n'
    '        "L\'historique et la liste à imprimer ont été mis à jour.", vbInformation, "Présence du Jour"\n'
    "End Sub\n"
    "\n"
    "Private Sub SupprimerDateHistorique(ByVal d As Date)\n"
    "    Dim wsH As Worksheet\n"
    "    Set wsH = ThisWorkbook.Worksheets(NOM_HISTORIQUE)\n"
    "    Dim lastH As Long, r As Long\n"
    "    lastH = wsH.Cells(wsH.Rows.Count, H_DATE).End(xlUp).Row\n"
    "    For r = lastH To H_DATA Step -1\n"
    "        If IsDate(wsH.Cells(r, H_DATE).Value) Then\n"
    "            If CDate(wsH.Cells(r, H_DATE).Value) = d Then wsH.Rows(r).Delete\n"
    "        End If\n"
    "    Next r\n"
    "End Sub\n"
    "\n"
    "' Construit la feuille imprimable avec les seuls employés présents.\n"
    "Public Sub ConstruireListeImpression()\n"
    "    Dim wsP As Worksheet, wsL As Worksheet\n"
    "    Set wsP = ThisWorkbook.Worksheets(NOM_PRESENCE)\n"
    "    Set wsL = ThisWorkbook.Worksheets(NOM_IMPRESSION)\n"
    "    Dim lastL As Long\n"
    "    lastL = wsL.Cells(wsL.Rows.Count, L_ID).End(xlUp).Row\n"
    "    If lastL < L_DATA Then lastL = L_DATA\n"
    "    wsL.Range(wsL.Cells(L_DATA, L_NUM), wsL.Cells(lastL + 5, L_POSTE)).ClearContents\n"
    "    wsL.Range(CELL_L_DATE).Value = wsP.Range(CELL_DATE).Value\n"
    '    wsL.Range(CELL_L_DATE).NumberFormat = "dd/mm/yyyy"\n'
    "    wsL.Range(CELL_L_CHANTIER).Value = wsP.Range(CELL_CHANTIER).Value\n"
    "    Dim lastP As Long, r As Long, dst As Long, n As Long\n"
    "    lastP = wsP.Cells(wsP.Rows.Count, P_ID).End(xlUp).Row\n"
    "    dst = L_DATA\n"
    "    For r = P_DATA To lastP\n"
    "        If Trim$(CStr(wsP.Cells(r, P_CHECK).Value)) = Coche() Then\n"
    "            n = n + 1\n"
    "            wsL.Cells(dst, L_NUM).Value = n\n"
    "            wsL.Cells(dst, L_ID).Value = wsP.Cells(r, P_ID).Value\n"
    "            wsL.Cells(dst, L_NOM).Value = wsP.Cells(r, P_NOM).Value\n"
    "            wsL.Cells(dst, L_POSTE).Value = wsP.Cells(r, P_POSTE).Value\n"
    "            dst = dst + 1\n"
    "        End If\n"
    "    Next r\n"
    "End Sub\n"
    "\n"
    "' Bouton : ouvre l'aperçu avant impression de la liste.\n"
    "Public Sub ImprimerListe()\n"
    "    ConstruireListeImpression\n"
    "    Dim wsL As Worksheet\n"
    "    Set wsL = ThisWorkbook.Worksheets(NOM_IMPRESSION)\n"
    '    If Trim$(CStr(wsL.Cells(L_DATA, L_ID).Value)) = "" Then\n'
    '        MsgBox "Aucun employé n\'est coché comme présent." & vbCrLf & _\n'
    '            "Cochez au moins un employé avant d\'imprimer.", vbExclamation, "Présence du Jour"\n'
    "        ThisWorkbook.Worksheets(NOM_PRESENCE).Activate\n"
    "        Exit Sub\n"
    "    End If\n"
    "    wsL.Activate\n"
    "    wsL.PrintPreview\n"
    "End Sub\n"
)


def build_vba() -> VbaProject:
    proj = VbaProject("GestionPresences")
    proj.add_document_module("ThisWorkbook", _lf(THISWORKBOOK_CODE))
    proj.add_document_module("wsPresence", _lf(WSPRESENCE_CODE))
    proj.add_document_module("wsEmployes", _lf(_ws_header("wsEmployes")))
    proj.add_document_module("wsImpression", _lf(_ws_header("wsImpression")))
    proj.add_document_module("wsHistorique", _lf(_ws_header("wsHistorique")))
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

    build_presence(wb, S, D)
    build_employes(wb, S, D)
    build_impression(wb, S, D)
    build_historique(wb, S, D)
    wb.active_tab = 0

    wb.set_vba_project(build_vba().build(), code_name="ThisWorkbook")
    wb.save(path)
    print("Écrit :", path)


if __name__ == "__main__":
    main()
