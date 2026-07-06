"""
build_attendance.py
Génère « Gestion_Presences.xlsm » : un véritable logiciel de gestion des
présences pour une entreprise de construction, entièrement en français,
avec macros VBA fonctionnelles, boutons, synchronisation automatique,
historique, impression et export PDF.

    python3.12 build_attendance.py

Dépendances (VBA) : voir vbagen.py / _vbatools.
"""

import datetime as dt

from xlsxgen import Workbook, Shape, col_letter
import vbagen
import vba_sources

CL = col_letter

# --------------------------------------------------------------------------- #
#  Palette (couleurs sobres) + formats
# --------------------------------------------------------------------------- #
NAVY     = "FF1F3864"
NAVY2    = "FF2E4E7E"
BLUE     = "FF2E75B6"
BLUE_LT  = "FFDDEBF7"
BLUE_XL  = "FFEAF1FA"
TEAL     = "FF2A9D8F"
GREEN    = "FF548235"
GREEN_HD = "FF70AD47"
GREEN_LT = "FFE2EFDA"
GREEN_OK = "FFC6EFCE"
GREEN_TX = "FF006100"
GOLD     = "FFBF9000"
GOLD_LT  = "FFFFF2CC"
GRAY_LT  = "FFF2F2F2"
GRAY_MD  = "FFD9D9D9"
GRAY_DK  = "FF808080"
RED      = "FFC0504E"
RED_LT   = "FFF8CBAD"
RED_TX   = "FF9C0006"
WHITE    = "FFFFFFFF"
INPUT_BG = "FFFFF2CC"      # jaune très clair = cellule à saisir

DATEF = "dd/mm/yyyy"
PCT   = "0%"
INTG  = "0"

wb = Workbook()
wb.title = "Gestion des Présences"

ALL = ("left", "right", "top", "bottom")


def border(*sides, style="thin", color=GRAY_MD):
    return {s: {"style": style, "color": color} for s in sides}


S = {}


def reg(name, spec):
    S[name] = wb.style(spec)
    return S[name]


# --- bannières / titres ---
reg("title",   {"font": {"bold": True, "size": 20, "color": WHITE, "name": "Calibri"},
                "fill": NAVY, "align": {"horizontal": "left", "vertical": "center"}})
reg("title_c", {"font": {"bold": True, "size": 20, "color": WHITE},
                "fill": NAVY, "align": {"horizontal": "center", "vertical": "center"}})
reg("subtitle", {"font": {"size": 11, "italic": True, "color": WHITE},
                 "fill": NAVY2, "align": {"horizontal": "left", "vertical": "center"}})
reg("subtitle_c", {"font": {"size": 12, "bold": True, "color": WHITE},
                   "fill": NAVY2, "align": {"horizontal": "center", "vertical": "center"}})

# --- en-têtes de tableau ---
reg("hdr",   {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": NAVY,
              "align": {"horizontal": "center", "vertical": "center", "wrap": True},
              "border": border(*ALL, color=NAVY)})
reg("hdr_l", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": NAVY,
              "align": {"horizontal": "left", "vertical": "center"},
              "border": border(*ALL, color=NAVY)})

# --- libellés ---
reg("lbl_r", {"font": {"bold": True, "size": 11, "color": NAVY},
              "align": {"horizontal": "right", "vertical": "center"}})
reg("lbl_l", {"font": {"bold": True, "size": 11, "color": NAVY},
              "align": {"horizontal": "left", "vertical": "center"}})

# --- saisie ---
reg("inp",   {"fill": INPUT_BG, "locked": False, "border": border(*ALL),
              "align": {"vertical": "center"}})
reg("inp_c", {"fill": INPUT_BG, "locked": False, "border": border(*ALL),
              "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_date", {"fill": INPUT_BG, "locked": False, "border": border(*ALL), "numfmt": DATEF,
                 "font": {"bold": True, "size": 12, "color": NAVY},
                 "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_txt", {"fill": INPUT_BG, "locked": False, "border": border(*ALL), "numfmt": "@",
                "align": {"vertical": "center"}})

# --- présence (case à cocher) ---
reg("pres", {"locked": False, "border": border(*ALL),
             "font": {"bold": True, "size": 12, "color": GREEN_TX},
             "align": {"horizontal": "center", "vertical": "center"}})

# --- cellules formule (verrouillées) ---
reg("f_id",  {"font": {"bold": True, "color": NAVY}, "border": border(*ALL),
              "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt", {"border": border(*ALL), "align": {"vertical": "center"}})
reg("f_ctr", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})

# --- compteurs (cartes) ---
def card_lbl(color):
    return wb.style({"font": {"bold": True, "size": 10, "color": WHITE}, "fill": color,
                     "align": {"horizontal": "center", "vertical": "center"},
                     "border": border(*ALL, color=WHITE)})
S["k_actifs"] = card_lbl(BLUE)
S["k_pres"]   = card_lbl(GREEN)
S["k_abs"]    = card_lbl(RED)
S["k_taux"]   = card_lbl(GOLD)
reg("kv_int", {"font": {"bold": True, "size": 22, "color": NAVY}, "fill": GRAY_LT, "numfmt": INTG,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})
reg("kv_pct", {"font": {"bold": True, "size": 22, "color": GREEN}, "fill": GRAY_LT, "numfmt": PCT,
               "align": {"horizontal": "center", "vertical": "center"}, "border": border(*ALL)})

# --- divers ---
reg("note", {"font": {"size": 9, "italic": True, "color": GRAY_DK},
             "align": {"vertical": "center", "wrap": True}})
reg("cell_border", {"border": border(*ALL)})

# conditional-format differential styles
dxf_band    = wb.dxf({"fill": BLUE_XL})
dxf_present = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TX, "bold": True}})
dxf_actif   = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TX}})
dxf_inactif = wb.dxf({"fill": RED_LT, "font": {"color": RED_TX}})

# --------------------------------------------------------------------------- #
#  Capacités
# --------------------------------------------------------------------------- #
EMP_FIRST, EMP_LAST = 4, 303            # 300 employés
PRES_FIRST, PRES_LAST = 15, 314
IMP_FIRST = 6

# --------------------------------------------------------------------------- #
#  Utilitaires boutons (placement précis en EMU)
# --------------------------------------------------------------------------- #
EMU = 9525


def w2px(w):
    return int(round(w * 7)) + 5


def _edges(widths):
    e = [0]
    for w in widths:
        e.append(e[-1] + w2px(w) * EMU)
    return e


def _emu_to_col(edges, x):
    if x >= edges[-1]:
        c = len(edges) - 2
        return c, edges[-1] - edges[c]
    for c in range(len(edges) - 1):
        if edges[c] <= x < edges[c + 1]:
            return c, x - edges[c]
    return 0, 0


def button_band(sheet, widths, first_col, last_col, top_row, bottom_row,
                buttons, gap_px=6, font_size=10):
    """Place a horizontal band of equally-sized macro buttons."""
    edges = _edges(widths)
    x0 = edges[first_col]
    x1 = edges[last_col + 1]
    gap = gap_px * EMU
    n = len(buttons)
    bw = (x1 - x0 - gap * (n + 1)) / n
    for i, (text, macro, fill) in enumerate(buttons):
        bx0 = x0 + gap + i * (bw + gap)
        bx1 = bx0 + bw
        fc, fco = _emu_to_col(edges, bx0)
        tc, tco = _emu_to_col(edges, bx1)
        anchor = (fc, int(fco), top_row, gap, tc, int(tco), bottom_row + 1, 0)
        wb.add_shape(sheet, Shape(text, macro=macro, fill=fill,
                                  font_size=font_size), anchor)


# =========================================================================== #
#  Ordre des feuilles
# =========================================================================== #
# 0 Employés | 1 Présence du Jour | 2 Liste à imprimer | 3 Historique
# 4 Paramètres | 5 Guide d'utilisation
wb.active_tab = 1


# --------------------------------------------------------------------------- #
#  Feuille 1 : EMPLOYÉS
# --------------------------------------------------------------------------- #
emp = wb.add_sheet("Employés")
emp.code_name = vba_sources.CODE_EMP
emp.tab_color = BLUE
emp.show_gridlines = False
EMP_W = [3, 16, 32, 20, 16, 14]            # A..F
for i, w in enumerate(EMP_W, start=1):
    emp.set_col(i, w)
emp.set_col(8, 12)                          # H : rang (masqué)

emp.merge("B1:F1"); emp.cell("B1", "  EMPLOYÉS", S["title"]); emp.set_row(1, 40)
emp.merge("B2:F2")
emp.write(2, 2, None, S["subtitle"],
          formula='"Liste du personnel  —  "&NomEntreprise')
emp.set_row(2, 18)

emp_headers = ["ID Employé", "Nom et Prénom", "Poste", "Équipe", "Statut"]
for i, h in enumerate(emp_headers, start=2):
    emp.write(3, i, h, S["hdr"])
emp.set_row(3, 26)

# lignes de données
emp.write(3, 8, 0, S["f_ctr"])              # H3 = 0 (base du rang)
for r in range(EMP_FIRST, EMP_LAST + 1):
    emp.write(r, 2, None, S["inp_c"])       # ID
    emp.write(r, 3, None, S["inp"])         # Nom
    emp.write(r, 4, None, S["inp"])         # Poste
    emp.write(r, 5, None, S["inp"])         # Équipe
    emp.write(r, 6, None, S["inp_c"])       # Statut
    # colonne H : rang des employés actifs (pour la synchronisation)
    emp.write(r, 8, None, S["f_ctr"],
              formula=(f'IF($B{r}="","",IF($F{r}="Actif",'
                       f'MAX($H$3:H{r-1})+1,""))'))

emp.add_list_validation(f"F{EMP_FIRST}:F{EMP_LAST}", '"Actif,Inactif"')
emp.add_cond_expr(f"F{EMP_FIRST}:F{EMP_LAST}", f'$F{EMP_FIRST}="Actif"', dxf_actif, 1)
emp.add_cond_expr(f"F{EMP_FIRST}:F{EMP_LAST}", f'$F{EMP_FIRST}="Inactif"', dxf_inactif, 2)
emp.add_cond_expr(f"B{EMP_FIRST}:F{EMP_LAST}", "MOD(ROW(),2)=0", dxf_band, 6)
emp.set_col(8, 12)
emp.autofilter_ref = f"B3:F{EMP_LAST}"
emp.hidden_cols = [8]
emp.freeze_panes(3, 0)
emp.protect = True
emp.setup_page(orientation="landscape")
emp.set_print_area(f"$B$1:$F${EMP_LAST}")

# exemples de départ
examples = [
    ("EMP-001", "Youssef El Amrani", "Maçon",        "Équipe A", "Actif"),
    ("EMP-002", "Karim Benali",      "Charpentier",  "Équipe A", "Actif"),
    ("EMP-003", "Rachid Toumi",      "Électricien",  "Équipe B", "Actif"),
    ("EMP-004", "Hassan Cherki",     "Manœuvre",     "Équipe B", "Actif"),
    ("EMP-005", "Saïd Mansouri",     "Grutier",      "Équipe C", "Actif"),
    ("EMP-006", "Omar Fassi",        "Plombier",     "Équipe C", "Actif"),
    ("EMP-007", "Nabil Idrissi",     "Peintre",      "Équipe A", "Inactif"),
]
er = EMP_FIRST
for rec in examples:
    for i, v in enumerate(rec, start=2):
        st = S["inp_c"] if i in (2, 6) else S["inp"]
        emp.write(er, i, v, st)
    er += 1

# named ranges (synchronisation)
wb.define_name("Emp_ID",     f"'Employés'!$B${EMP_FIRST}:$B${EMP_LAST}")
wb.define_name("Emp_Nom",    f"'Employés'!$C${EMP_FIRST}:$C${EMP_LAST}")
wb.define_name("Emp_Poste",  f"'Employés'!$D${EMP_FIRST}:$D${EMP_LAST}")
wb.define_name("Emp_Equipe", f"'Employés'!$E${EMP_FIRST}:$E${EMP_LAST}")
wb.define_name("Emp_Statut", f"'Employés'!$F${EMP_FIRST}:$F${EMP_LAST}")
wb.define_name("Emp_Rang",   f"'Employés'!$H${EMP_FIRST}:$H${EMP_LAST}")


# --------------------------------------------------------------------------- #
#  Feuille 2 : PRÉSENCE DU JOUR  (feuille principale)
# --------------------------------------------------------------------------- #
pres = wb.add_sheet("Présence du Jour")
pres.code_name = vba_sources.CODE_PRES
pres.tab_color = GREEN
pres.show_gridlines = False
PRES_W = [3, 14, 15, 40, 26]                # A..E
for i, w in enumerate(PRES_W, start=1):
    pres.set_col(i, w)

pres.merge("B1:E1"); pres.cell("B1", "  GESTION DES PRÉSENCES", S["title"]); pres.set_row(1, 40)
pres.merge("B2:E2")
pres.write(2, 2, None, S["subtitle"],
           formula='"Feuille de présence journalière   —   "&NomEntreprise')
pres.set_row(2, 18)
pres.set_row(3, 6)

# Date + Chantier
pres.cell("B4", "Date :", S["lbl_r"])
pres.write(4, 3, dt.date.today(), S["inp_date"])
pres.cell("D4", "Chantier :", S["lbl_r"])
pres.write(4, 5, None, S["inp"])
pres.set_row(4, 24)
pres.set_row(5, 6)

# Compteurs
pres.write(6, 2, "Employés actifs", S["k_actifs"])
pres.write(6, 3, "Présents", S["k_pres"])
pres.write(6, 4, "Absents", S["k_abs"])
pres.write(6, 5, "Taux de présence", S["k_taux"])
pres.write(7, 2, None, S["kv_int"], formula='COUNTIF(Emp_Statut,"Actif")')
pres.write(7, 3, None, S["kv_int"], formula="COUNTA(Pres_Check)")
pres.write(7, 4, None, S["kv_int"], formula="MAX(0,$B$7-$C$7)")
pres.write(7, 5, None, S["kv_pct"], formula="IF($B$7=0,0,$C$7/$B$7)")
pres.set_row(7, 30)
pres.set_row(8, 6)

# Recherche
pres.cell("B9", "Recherche :", S["lbl_r"])
pres.merge("C9:E9"); pres.write(9, 3, None, S["inp"])
pres.set_row(9, 20)
pres.set_row(10, 6)

# Bande de boutons (lignes 11-12, index 0-based 10..11)
pres.set_row(11, 21)
pres.set_row(12, 21)
button_band(
    pres, PRES_W, first_col=1, last_col=4, top_row=10, bottom_row=11,
    buttons=[
        ("Nouvelle\njournée",        "NouvelleJournee",   BLUE),
        ("Tout\ncocher",             "ToutCocher",        TEAL),
        ("Tout\ndécocher",           "ToutDecocher",      GRAY_DK),
        ("Enregistrer\nla journée",  "EnregistrerJournee", GREEN),
        ("Imprimer",                 "Imprimer",          NAVY),
        ("Exporter\nen PDF",         "ExporterPDF",       GOLD),
    ], font_size=10)
pres.set_row(13, 6)

# En-tête du tableau
pres.write(14, 2, "Présent", S["hdr"])
pres.write(14, 3, "ID", S["hdr"])
pres.write(14, 4, "Nom et Prénom", S["hdr"])
pres.write(14, 5, "Poste", S["hdr"])
pres.set_row(14, 24)

for r in range(PRES_FIRST, PRES_LAST + 1):
    k = r - 14
    pres.write(r, 2, None, S["pres"])       # case Présent (saisie/double-clic)
    pres.write(r, 3, None, S["f_id"],
               formula=f'IFERROR(INDEX(Emp_ID,MATCH({k},Emp_Rang,0)),"")')
    pres.write(r, 4, None, S["f_txt"],
               formula=f'IF($C{r}="","",IFERROR(INDEX(Emp_Nom,MATCH($C{r},Emp_ID,0)),""))')
    pres.write(r, 5, None, S["f_ctr"],
               formula=f'IF($C{r}="","",IFERROR(INDEX(Emp_Poste,MATCH($C{r},Emp_ID,0)),""))')

pres.add_cond_expr(f"B{PRES_FIRST}:B{PRES_LAST}", f'$B{PRES_FIRST}<>""', dxf_present, 1)
pres.add_cond_expr(f"C{PRES_FIRST}:E{PRES_LAST}", "MOD(ROW(),2)=0", dxf_band, 6)
pres.freeze_panes(14, 0)
pres.protect = True
pres.setup_page(orientation="portrait", fit_width=1, fit_height=0)
pres.set_print_area(f"$B$1:$E${PRES_LAST}")

wb.define_name("Pres_Check", f"'Présence du Jour'!$B${PRES_FIRST}:$B${PRES_LAST}")
wb.define_name("Pres_ID",    f"'Présence du Jour'!$C${PRES_FIRST}:$C${PRES_LAST}")


# --------------------------------------------------------------------------- #
#  Feuille 3 : LISTE À IMPRIMER
# --------------------------------------------------------------------------- #
imp = wb.add_sheet("Liste à imprimer")
imp.code_name = vba_sources.CODE_IMP
imp.tab_color = GRAY_DK
imp.show_gridlines = False
IMP_W = [3, 8, 16, 40, 28]                  # A..E
for i, w in enumerate(IMP_W, start=1):
    imp.set_col(i, w)
imp.set_col(7, 16); imp.set_col(8, 16)      # G,H : zone boutons (hors impression)
imp.set_col(9, 14)                          # I : dates (masquée)

imp.merge("B1:E1")
imp.write(1, 2, None, S["title_c"], formula="NomEntreprise")
imp.set_row(1, 30)
imp.merge("B2:E2"); imp.cell("B2", "LISTE DE PRÉSENCE", S["subtitle_c"]); imp.set_row(2, 24)

imp.cell("B3", "Date :", S["lbl_r"])
imp.write(3, 3, dt.date.today(), S["inp_date"])
imp.cell("D3", "Chantier :", S["lbl_r"])
imp.write(3, 5, None, wb.style({"border": border(*ALL), "font": {"bold": True},
                                "align": {"horizontal": "left", "vertical": "center"}}))
imp.set_row(3, 22)
imp.set_row(4, 6)

# En-tête
imp.write(5, 2, "N°", S["hdr"])
imp.write(5, 3, "ID", S["hdr"])
imp.write(5, 4, "Nom et Prénom", S["hdr"])
imp.write(5, 5, "Poste", S["hdr"])
imp.set_row(5, 24)

# dropdown de dates
imp.add_list_validation("C3", "DatesDisponibles")
wb.define_name(
    "DatesDisponibles",
    "OFFSET('Liste à imprimer'!$I$2,0,0,MAX(1,COUNTA('Liste à imprimer'!$I$2:$I$5000)),1)")

# boutons (colonnes G:H, hors zone d'impression)
wb.add_shape(imp, Shape("Imprimer", macro="Imprimer", fill=NAVY, font_size=11), (6, 2, 8, 4))
wb.add_shape(imp, Shape("Exporter en PDF", macro="ExporterPDF", fill=GOLD, font_size=11), (6, 5, 8, 7))
wb.add_shape(imp, Shape("Retour à la saisie", macro="AllerSaisie", fill=GREEN, font_size=11), (6, 8, 8, 10))

imp.hidden_cols = [9]
imp.protect = True
imp.setup_page(orientation="portrait", fit_width=1, fit_height=1)
imp.set_print_area("$B$1:$E$60")


# --------------------------------------------------------------------------- #
#  Feuille 4 : HISTORIQUE
# --------------------------------------------------------------------------- #
hist = wb.add_sheet("Historique")
hist.code_name = vba_sources.CODE_HIST
hist.tab_color = NAVY
hist.show_gridlines = False
HIST_W = [3, 14, 16, 30, 22, 12, 20]        # A..G
for i, w in enumerate(HIST_W, start=1):
    hist.set_col(i, w)

hist.merge("B1:G1"); hist.cell("B1", "  HISTORIQUE DES PRÉSENCES", S["title"]); hist.set_row(1, 40)
hist.merge("B2:G2")
hist.cell("B2", "  Chaque journée enregistrée est conservée ici. Ne pas modifier ni supprimer manuellement.",
          S["subtitle"])
hist.set_row(2, 18)

for i, h in enumerate(["Date", "ID", "Nom et Prénom", "Poste", "Présent", "Chantier"], start=2):
    hist.write(3, i, h, S["hdr"])
hist.set_row(3, 26)

hist.autofilter_ref = "B3:G3"
hist.freeze_panes(3, 0)
hist.protect = True
hist.setup_page(orientation="landscape", fit_width=1, fit_height=0)
hist.set_print_area("$B$1:$G$3")


# --------------------------------------------------------------------------- #
#  Feuille 5 : PARAMÈTRES
# --------------------------------------------------------------------------- #
par = wb.add_sheet("Paramètres")
par.code_name = vba_sources.CODE_PARAM
par.tab_color = TEAL
par.show_gridlines = False
par.set_col(1, 3); par.set_col(2, 34); par.set_col(3, 44); par.set_col(4, 30)

par.merge("B1:D1"); par.cell("B1", "  PARAMÈTRES DU CLASSEUR", S["title"]); par.set_row(1, 40)
par.merge("B2:D2")
par.cell("B2", "  Configurez ici le classeur sans toucher aux formules ni au code.", S["subtitle"])
par.set_row(2, 18)

sec = wb.style({"font": {"bold": True, "size": 12, "color": WHITE}, "fill": BLUE,
                "align": {"horizontal": "left", "vertical": "center"},
                "border": border(*ALL, color=BLUE)})


def param_row(r, label, name, default="", note=""):
    par.cell(f"B{r}", label, S["lbl_l"])
    par.write(r, 3, default if default != "" else None, S["inp"])
    if name:
        wb.define_name(name, f"'Paramètres'!$C${r}")
    if note:
        par.cell(f"D{r}", note, S["note"])
    par.set_row(r, 22)


par.merge("B4:D4"); par.cell("B4", "  Général", sec); par.set_row(4, 20)
param_row(5, "Nom de l'entreprise", "NomEntreprise", "Mon Entreprise BTP",
          "Apparaît sur toutes les feuilles et l'impression.")
param_row(6, "Chantier par défaut", "ChantierDefaut", "Chantier principal",
          "Proposé automatiquement chaque matin.")

par.merge("B8:D8"); par.cell("B8", "  Impression / PDF", sec); par.set_row(8, 20)
param_row(9, "Dossier d'export PDF", "CheminPDF", "",
          "Laisser vide = dossier du classeur.")
param_row(10, "Marque de présence", None, "X", "Symbole utilisé pour cocher (info).")

par.merge("B12:D12"); par.cell("B12", "  Logo de l'entreprise", sec); par.set_row(12, 20)
par.merge("B13:C18")
par.write(13, 2, "  (Insérez ici le logo : Insertion ▸ Images)", wb.style(
    {"font": {"italic": True, "color": GRAY_DK, "size": 11},
     "fill": GRAY_LT, "align": {"horizontal": "center", "vertical": "center"},
     "border": border(*ALL, style="dashed", color=GRAY_DK)}))
par.cell("D13", "Emplacement réservé au logo. L'image n'est pas gérée par les macros.", S["note"])

par.merge("B20:D20"); par.cell("B20", "  Options générales", sec); par.set_row(20, 20)
par.cell("B21", "Capacité employés", S["lbl_l"]); par.cell("C21", "300 employés", S["cell_border"])
par.cell("B22", "Capacité historique", S["lbl_l"]); par.cell("C22", "Illimitée (plusieurs milliers)", S["cell_border"])
par.set_row(21, 20); par.set_row(22, 20)

par.protect = True
par.setup_page(orientation="portrait")
par.set_print_area("$B$1:$D$22")


# --------------------------------------------------------------------------- #
#  Feuille 6 : GUIDE D'UTILISATION
# --------------------------------------------------------------------------- #
guide = wb.add_sheet("Guide d'utilisation")
guide.code_name = vba_sources.CODE_GUIDE
guide.tab_color = GOLD
guide.show_gridlines = False
guide.set_col(1, 3); guide.set_col(2, 100)

h_sec = wb.style({"font": {"bold": True, "size": 14, "color": WHITE}, "fill": NAVY,
                  "align": {"horizontal": "left", "vertical": "center"}})
h_txt = wb.style({"font": {"size": 11, "color": "FF000000"},
                  "align": {"horizontal": "left", "vertical": "top", "wrap": True}})
h_step = wb.style({"font": {"size": 11, "bold": True, "color": NAVY},
                   "align": {"horizontal": "left", "vertical": "top", "wrap": True}})

guide.cell("B1", "  GUIDE D'UTILISATION", S["title"]); guide.set_row(1, 40)

grow = 3


def g_section(title):
    global grow
    guide.cell(f"B{grow}", "  " + title, h_sec); guide.set_row(grow, 24)
    grow += 1


def g_text(text, style=None, height=None):
    global grow
    guide.write(grow, 2, text, style or h_txt)
    if height:
        guide.set_row(grow, height)
    grow += 1


g_text("Bienvenue ! Ce classeur est un logiciel de gestion des présences. "
       "Suivez ce guide pour l'utiliser chaque matin en moins de deux minutes.", h_step, 32)
grow += 1

g_section("1. Première configuration (à faire une seule fois)")
g_text("• Ouvrez l'onglet « Paramètres » et saisissez le nom de votre entreprise "
       "et le chantier par défaut.", height=30)
g_text("• Ouvrez l'onglet « Employés » et saisissez vos employés : ID, Nom et Prénom, "
       "Poste, Équipe et Statut (Actif/Inactif). Les ID existent déjà chez vous, "
       "il n'y a rien à générer.", height=44)
g_text("• Pour modifier un employé : changez simplement son nom ou son poste ; "
       "la modification apparaît automatiquement partout.", height=30)
g_text("• Pour désactiver un employé : mettez son Statut sur « Inactif ». "
       "Il disparaît alors de la feuille de présence, sans perdre son historique.", height=30)
g_text("• Enregistrez le fichier au format .xlsm (Fichier ▸ Enregistrer sous ▸ "
       "« Classeur Excel prenant en charge les macros (*.xlsm) »).", height=30)
g_text("• À la première ouverture, cliquez sur « Activer les macros » "
       "(barre d'avertissement jaune en haut).", height=30)
grow += 1

g_section("2. Utilisation quotidienne (chaque matin)")
g_text("1)  Ouvrez le fichier.", h_step)
g_text("2)  Allez sur l'onglet « Présence du Jour ».", h_step)
g_text("3)  Vérifiez la date (elle se met automatiquement au jour actuel).", h_step)
g_text("4)  Cochez les employés présents : double-cliquez dans la colonne « Présent » "
       "(un « X » vert apparaît). Double-cliquez à nouveau pour décocher.", h_step, 32)
g_text("5)  Cliquez sur le bouton « Enregistrer la journée ».", h_step)
g_text("6)  Vérifiez la feuille « Liste à imprimer » (elle est générée automatiquement).", h_step, 30)
g_text("7)  Cliquez sur « Imprimer » ou « Exporter en PDF ».", h_step)
g_text("Astuce : utilisez « Tout cocher » / « Tout décocher » et la barre de recherche "
       "pour aller encore plus vite.", None, 30)
grow += 1

g_section("3. Consulter et réimprimer une journée passée")
g_text("• Allez sur l'onglet « Liste à imprimer ».", height=20)
g_text("• Dans la case « Date », choisissez une date dans la liste déroulante : "
       "la liste des présents de ce jour s'affiche automatiquement.", height=30)
g_text("• Cliquez sur « Imprimer » ou « Exporter en PDF » pour cette journée.", height=20)
g_text("• L'onglet « Historique » conserve toutes les journées enregistrées. "
       "Ne le modifiez pas manuellement.", height=30)
grow += 1

g_section("4. Sauvegarde et bonnes pratiques")
g_text("• Le classeur se sauvegarde automatiquement avant chaque impression/export.", height=20)
g_text("• Faites régulièrement une copie de sécurité du fichier .xlsm "
       "(sur une clé USB ou un espace partagé).", height=30)
g_text("• Ne supprimez jamais la feuille « Historique » ni la feuille « Employés ».", height=20)
g_text("• Si un bouton ne réagit pas, vérifiez que les macros sont activées.", height=20)
grow += 1

g_section("5. Les feuilles du classeur")
g_text("• Employés : la liste de votre personnel (informations fixes).", height=20)
g_text("• Présence du Jour : la saisie quotidienne (feuille principale).", height=20)
g_text("• Liste à imprimer : la liste propre, prête à imprimer.", height=20)
g_text("• Historique : l'archive de toutes les journées.", height=20)
g_text("• Paramètres : la configuration du classeur.", height=20)

guide.protect = True
guide.setup_page(orientation="portrait", fit_width=1, fit_height=0)
guide.set_print_area(f"$B$1:$B${grow}")


# =========================================================================== #
#  Compilation du projet VBA + sauvegarde du classeur
# =========================================================================== #
def build():
    guid = {"workbook": vbagen.GUID_WORKBOOK, "worksheet": vbagen.GUID_WORKSHEET}
    mods = [vbagen.make_module(n, c, k, guid.get(g) if g else None)
            for n, c, k, g in vba_sources.module_specs()]
    vba_bin = "_vbatools/_project.bin"
    vbagen.build_vba_project(vba_bin, mods, project_name="GestionPresences")
    with open(vba_bin, "rb") as fh:
        wb.set_vba_project(fh.read())

    out = "Gestion_Presences.xlsm"
    wb.save(out)
    print("Classeur créé :", out)


if __name__ == "__main__":
    build()
