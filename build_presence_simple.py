"""
build_presence_simple.py
========================
Génère "Gestion_Presences.xlsx" - Système de gestion des présences
SANS VBA. Tout fonctionne avec des formules Excel uniquement.

Compatible Mac + PC, Excel en anglais ou français.
"""

import datetime as dt
from xlsxgen import Workbook, col_letter, cell_ref

# =============================================================================
# CONSTANTES
# =============================================================================
MAX_EMP = 50       # Nombre max d'employés
DATA_ROW = 7       # Première ligne de données dans "Presence"
EMP_ROW = 3        # Première ligne de données dans "Employes"
PRINT_ROW = 8      # Première ligne de données dans "Imprimer"
HIST_ROW = 2       # Première ligne de données dans "Historique"

# Palette
NAVY     = "FF1F3864"
NAVY2    = "FF2E4E7E"
BLUE     = "FF2E75B6"
BLUE_LT  = "FFDDEBF7"
BLUE_XL  = "FFEAF1FA"
GREEN    = "FF548235"
GREEN_LT = "FFE2EFDA"
GREEN_OK = "FFC6EFCE"
GREEN_TXT= "FF006100"
GOLD     = "FFBF9000"
GOLD_LT  = "FFFFF2CC"
GRAY_LT  = "FFF2F2F2"
GRAY_MD  = "FFD9D9D9"
GRAY_TX  = "FF808080"
RED      = "FFC00000"
RED_LT   = "FFF8CBAD"
WHITE    = "FFFFFFFF"
TEAL     = "FF2A9D8F"
BLACK    = "FF000000"

wb = Workbook()
wb.title = "Gestion des Presences"
wb.active_tab = 0

# =============================================================================
# STYLES
# =============================================================================
def border(*sides, style="thin", color=GRAY_MD):
    return {s: {"style": style, "color": color} for s in sides}

ALL = ("left", "right", "top", "bottom")
S = {}

def reg(name, spec):
    S[name] = wb.style(spec)

# Titres
reg("title", {"font": {"bold": True, "size": 18, "color": WHITE[2:]},
              "fill": NAVY, "align": {"horizontal": "left", "vertical": "center"}})
reg("title_c", {"font": {"bold": True, "size": 16, "color": WHITE[2:]},
                "fill": NAVY, "align": {"horizontal": "center", "vertical": "center"}})
reg("subtitle", {"font": {"size": 10, "italic": True, "color": WHITE[2:]},
                 "fill": NAVY2, "align": {"horizontal": "left", "vertical": "center"}})

# En-têtes
reg("hdr", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": NAVY,
            "align": {"horizontal": "center", "vertical": "center", "wrap": True},
            "border": border(*ALL, color=NAVY)})

# Données
reg("inp", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
            "align": {"horizontal": "center", "vertical": "center"},
            "font": {"size": 13, "bold": True, "color": GREEN[2:]}})
reg("inp_alt", {"fill": WHITE, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "center", "vertical": "center"},
                "font": {"size": 13, "bold": True, "color": GREEN[2:]}})
reg("inp_txt", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "left", "vertical": "center"}})
reg("inp_date", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                 "numfmt": "dd/mm/yyyy", "font": {"bold": True, "size": 12},
                 "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_emp", {"fill": WHITE, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "left", "vertical": "center"}})
reg("inp_emp_c", {"fill": WHITE, "locked": False, "border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_emp_alt", {"fill": BLUE_XL, "locked": False, "border": border(*ALL),
                    "align": {"horizontal": "left", "vertical": "center"}})
reg("inp_emp_c_alt", {"fill": BLUE_XL, "locked": False, "border": border(*ALL),
                      "align": {"horizontal": "center", "vertical": "center"}})

reg("f_id", {"font": {"bold": True, "color": NAVY[2:]}, "border": border(*ALL),
             "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt", {"border": border(*ALL), "align": {"horizontal": "left", "vertical": "center"}})
reg("f_ctr", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_id_alt", {"font": {"bold": True, "color": NAVY[2:]}, "fill": BLUE_XL,
                 "border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt_alt", {"fill": BLUE_XL, "border": border(*ALL),
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("f_ctr_alt", {"fill": BLUE_XL, "border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})

# Labels
reg("lbl", {"font": {"bold": True, "color": NAVY[2:], "size": 11},
            "align": {"horizontal": "right", "vertical": "center"}})
reg("lbl_val", {"font": {"bold": True, "size": 12},
                "align": {"horizontal": "left", "vertical": "center"}})
reg("counter_box", {"font": {"bold": True, "size": 18, "color": NAVY[2:]},
                    "align": {"horizontal": "center", "vertical": "center"},
                    "fill": GREEN_LT, "border": border(*ALL, color=GREEN)})
reg("counter_lbl", {"font": {"bold": True, "size": 9, "color": GREEN[2:]},
                    "align": {"horizontal": "center", "vertical": "center"}})

# Print
reg("pr_title", {"font": {"bold": True, "size": 16, "color": NAVY[2:]},
                 "align": {"horizontal": "center", "vertical": "center"}})
reg("pr_sub", {"font": {"size": 10, "italic": True, "color": GRAY_TX[2:]},
               "align": {"horizontal": "center", "vertical": "center"}})
reg("pr_lbl", {"font": {"bold": True, "size": 10, "color": NAVY[2:]},
               "align": {"horizontal": "right", "vertical": "center"}})
reg("pr_val", {"font": {"bold": True, "size": 11},
               "align": {"horizontal": "left", "vertical": "center"},
               "numfmt": "dd/mm/yyyy"})
reg("pr_hdr", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": NAVY,
               "align": {"horizontal": "center", "vertical": "center"},
               "border": border(*ALL, color=NAVY)})
reg("pr_num", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("pr_data", {"border": border(*ALL), "align": {"horizontal": "left", "vertical": "center"}})
reg("pr_data_c", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("pr_num_alt", {"border": border(*ALL), "fill": BLUE_XL,
                   "align": {"horizontal": "center", "vertical": "center"}})
reg("pr_data_alt", {"border": border(*ALL), "fill": BLUE_XL,
                    "align": {"horizontal": "left", "vertical": "center"}})
reg("pr_data_c_alt", {"border": border(*ALL), "fill": BLUE_XL,
                      "align": {"horizontal": "center", "vertical": "center"}})

# Paramètres
reg("param_lbl", {"font": {"bold": True, "color": NAVY[2:]}, "fill": GRAY_LT,
                  "border": border(*ALL), "align": {"horizontal": "left", "vertical": "center"}})
reg("param_val", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("param_desc", {"font": {"size": 9, "color": GRAY_TX[2:]},
                   "align": {"horizontal": "left", "vertical": "center"}})

# Guide
reg("g_section", {"font": {"bold": True, "size": 13, "color": BLUE[2:]},
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("g_step", {"font": {"bold": True, "size": 11, "color": GREEN[2:]},
               "align": {"horizontal": "left", "vertical": "center"}})
reg("g_text", {"font": {"size": 11}, "align": {"horizontal": "left", "vertical": "center", "wrap": True}})
reg("g_warn", {"font": {"bold": True, "size": 10, "color": RED[2:]},
               "align": {"horizontal": "left", "vertical": "center"}})

# Historique
reg("h_hdr", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": GOLD,
              "align": {"horizontal": "center", "vertical": "center"},
              "border": border(*ALL, color=GOLD)})
reg("h_data", {"border": border(*ALL), "locked": False,
               "align": {"horizontal": "center", "vertical": "center"}})

# Conditional formatting
dxf_present = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TXT[2:], "bold": True}})
dxf_absent = wb.dxf({"fill": RED_LT, "font": {"color": RED[2:]}})
dxf_actif = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TXT[2:]}})
dxf_inactif = wb.dxf({"fill": RED_LT, "font": {"color": RED[2:]}})


# =============================================================================
# FEUILLE 1: PRÉSENCE DU JOUR
# =============================================================================
ws = wb.add_sheet("Presence du Jour")
ws.tab_color = NAVY
ws.show_gridlines = False

ws.set_col(1, 14)   # Présent (X)
ws.set_col(2, 14)   # ID
ws.set_col(3, 32)   # Nom et Prénom
ws.set_col(4, 20)   # Poste

# Titre
ws.merge("A1:D1")
ws.cell("A1", "  GESTION DES PRÉSENCES", S["title"])
ws.set_row(1, 40)

# Sous-titre
ws.merge("A2:D2")
ws.cell("A2", "  Tapez X dans la colonne « Présent » pour chaque employé présent", S["subtitle"])
ws.set_row(2, 20)

# Date & Chantier (row 3-4)
ws.set_row(3, 26)
ws.set_row(4, 26)
ws.cell("A3", "Date :", S["lbl"])
ws.write(3, 2, dt.date.today(), S["inp_date"])
ws.cell("A4", "Chantier :", S["lbl"])
ws.write(4, 2, "", S["inp_txt"])

# Compteurs (row 3-4, colonnes C-D)
ws.cell("C3", "Présents", S["counter_lbl"])
ws.write(3, 4, None, S["counter_box"],
         formula=f'COUNTIF(A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1},"X")')
ws.cell("C4", "Total actifs", S["counter_lbl"])
ws.write(4, 4, None, S["counter_box"],
         formula=f'COUNTA(B{DATA_ROW}:B{DATA_ROW + MAX_EMP - 1})')

# Espacement
ws.set_row(5, 4)

# En-têtes (row 6)
ws.set_row(6, 26)
for col, h in enumerate(["✓ Présent", "ID", "Nom et Prénom", "Poste"], start=1):
    ws.write(6, col, h, S["hdr"])

# Données (row 7 à 7+MAX_EMP-1)
for i in range(MAX_EMP):
    r = DATA_ROW + i
    emp_r = EMP_ROW + i
    alt = i % 2 == 1
    ws.set_row(r, 24)
    
    # Col A: Saisie (X ou vide)
    ws.write(r, 1, "", S["inp_alt"] if alt else S["inp"])
    
    # Col B: ID (si Actif)
    ws.write(r, 2, None, S["f_id_alt"] if alt else S["f_id"],
             formula=f'IF(Employes!E{emp_r}="Actif",Employes!A{emp_r},"")')
    
    # Col C: Nom
    ws.write(r, 3, None, S["f_txt_alt"] if alt else S["f_txt"],
             formula=f'IF(B{r}<>"",Employes!B{emp_r},"")')
    
    # Col D: Poste
    ws.write(r, 4, None, S["f_ctr_alt"] if alt else S["f_ctr"],
             formula=f'IF(B{r}<>"",Employes!C{emp_r},"")')

# Validation: X ou vide
ws.add_list_validation(f"A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1}", '"X,"', allow_blank=True)

# Conditional formatting
ws.add_cond_cellis(f"A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1}", "equal", '"X"', dxf_present, priority=1)

ws.freeze_panes(6, 0)
ws.setup_page(orientation="portrait", fit_width=1, fit_height=0, paper=9)
ws.set_print_area(f"$A$1:$D${DATA_ROW + MAX_EMP - 1}")


# =============================================================================
# FEUILLE 2: EMPLOYÉS
# =============================================================================
emp = wb.add_sheet("Employes")
emp.tab_color = BLUE
emp.show_gridlines = False

emp.set_col(1, 14)
emp.set_col(2, 30)
emp.set_col(3, 20)
emp.set_col(4, 16)
emp.set_col(5, 12)

# Titre
emp.merge("A1:E1")
emp.cell("A1", "  LISTE DES EMPLOYÉS", S["title"])
emp.set_row(1, 35)

# En-têtes (row 2)
emp.set_row(2, 26)
for col, h in enumerate(["ID Employé", "Nom et Prénom", "Poste", "Équipe", "Statut"], start=1):
    emp.write(2, col, h, S["hdr"])

# Données d'exemple
sample = [
    ("EMP-001", "Ahmed Benali", "Maçon", "Équipe A", "Actif"),
    ("EMP-002", "Youssef El Amrani", "Charpentier", "Équipe A", "Actif"),
    ("EMP-003", "Karim Toumi", "Électricien", "Équipe B", "Actif"),
    ("EMP-004", "Hassan Mansouri", "Plombier", "Équipe B", "Actif"),
    ("EMP-005", "Rachid Bouazza", "Peintre", "Équipe A", "Actif"),
    ("EMP-006", "Omar Zerhouni", "Manœuvre", "Équipe C", "Actif"),
    ("EMP-007", "Mustapha Idrissi", "Ferronnier", "Équipe B", "Actif"),
    ("EMP-008", "Khalid Fassi", "Coffreur", "Équipe A", "Actif"),
    ("EMP-009", "Abdellatif Chraibi", "Grutier", "Équipe C", "Actif"),
    ("EMP-010", "Said Benjelloun", "Chef d'équipe", "Équipe A", "Actif"),
]

for i, (eid, nom, poste, equipe, statut) in enumerate(sample):
    r = EMP_ROW + i
    alt = i % 2 == 1
    emp.write(r, 1, eid, S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 2, nom, S["inp_emp_alt"] if alt else S["inp_emp"])
    emp.write(r, 3, poste, S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 4, equipe, S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 5, statut, S["inp_emp_c_alt"] if alt else S["inp_emp_c"])

# Lignes vides pour futurs employés
for i in range(len(sample), MAX_EMP):
    r = EMP_ROW + i
    alt = i % 2 == 1
    emp.write(r, 1, "", S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 2, "", S["inp_emp_alt"] if alt else S["inp_emp"])
    emp.write(r, 3, "", S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 4, "", S["inp_emp_c_alt"] if alt else S["inp_emp_c"])
    emp.write(r, 5, "", S["inp_emp_c_alt"] if alt else S["inp_emp_c"])

# Validation statut
emp.add_list_validation(f"E{EMP_ROW}:E{EMP_ROW + MAX_EMP - 1}",
                        '"Actif,Inactif"', allow_blank=True)

# Conditional formatting
emp.add_cond_cellis(f"E{EMP_ROW}:E{EMP_ROW + MAX_EMP - 1}", "equal", '"Actif"', dxf_actif, priority=1)
emp.add_cond_cellis(f"E{EMP_ROW}:E{EMP_ROW + MAX_EMP - 1}", "equal", '"Inactif"', dxf_inactif, priority=2)

emp.freeze_panes(2, 0)
emp.setup_page(orientation="landscape", fit_width=1, fit_height=0, paper=9)


# =============================================================================
# FEUILLE 3: LISTE À IMPRIMER
# =============================================================================
prn = wb.add_sheet("Liste a imprimer")
prn.tab_color = GREEN
prn.show_gridlines = False

prn.set_col(1, 6)
prn.set_col(2, 14)
prn.set_col(3, 34)
prn.set_col(4, 20)

# Titre
prn.merge("A1:D1")
prn.cell("A1", "LISTE DE PRÉSENCE", S["pr_title"])
prn.set_row(1, 32)

# Sous-titre (nom entreprise)
prn.merge("A2:D2")
prn.write(2, 1, None, S["pr_sub"], formula="Parametres!B3")
prn.set_row(2, 18)

# Espacement
prn.set_row(3, 4)

# Info
prn.set_row(4, 22)
prn.set_row(5, 22)
prn.write(4, 1, "Date :", S["pr_lbl"])
prn.write(4, 2, None, S["pr_val"], formula="'Presence du Jour'!B3")
prn.merge("C4:D4")
prn.write(5, 1, "Chantier :", S["pr_lbl"])
prn.merge("B5:D5")
prn.write(5, 2, None, S["lbl_val"], formula="'Presence du Jour'!B4")

# Espacement
prn.set_row(6, 4)

# En-têtes (row 7)
prn.set_row(7, 24)
for col, h in enumerate(["N°", "ID", "Nom et Prénom", "Poste"], start=1):
    prn.write(7, col, h, S["pr_hdr"])

# Données automatiques via formules
# Stratégie: utiliser SMALL+IF pour extraire uniquement les présents
# Colonne cachée ou helper: non nécessaire si on utilise une formule basée sur
# la position relative et un compteur.
#
# Approche simplifiée: on liste TOUS les employés présents via formules conditionnelles.
# SMALL(IF(condition, ROW()-ROW_OFFSET), ROWS(ref)) - formule matricielle
#
# En OOXML, les formules matricielles peuvent être écrites avec t="array"
# Mais c'est complexe. Alternative plus simple:
# On numérote les présents dans une colonne cachée de "Presence du Jour"
# puis on utilise INDEX/MATCH ici.
#
# Solution la plus simple et robuste:
# Dans "Presence du Jour", on ajoute une colonne cachée (col E) qui numérote les présents
# Puis ici on fait: INDEX(... , MATCH(row_number, numbering_col, 0))

# Ajoutons une colonne de numérotation dans Presence du Jour (col 5, cachée visuellement)
# En fait, plutôt que cacher, on va faire les formules ici directement.
# 
# Formule pour lister les présents (compatible Excel 365 avec FILTER, mais aussi anciennes versions):
# Version compatible: IFERROR(INDEX(range, SMALL(IF(crit_range="X", ROW(crit_range)-ROW_OFFSET), ROW()-PRINT_ROW+1)), "")
# C'est une formule matricielle (CSE) pour les anciennes versions.
# Pour Excel 365+, FILTER est plus simple mais pas universellement supporté.
# 
# Utilisons l'approche SMALL/IF qui fonctionne partout quand entrée en Ctrl+Shift+Enter
# En OOXML, on peut écrire des formules array en les marquant comme telles.
# Mais xlsxgen ne supporte pas le flag array... 
#
# Solution pragmatique: utilisons des formules classiques avec COUNTIF cumulatif.
# On ajoute une colonne "rang" dans Presence du Jour (col 5) pour numéroter les X.

# Ajoutons col 5 dans Presence du Jour comme helper (rang des présents)
ws.set_col(5, 3)  # Très étroite, quasi invisible

for i in range(MAX_EMP):
    r = DATA_ROW + i
    # Rang = COUNTIF des X de A7 jusqu'à cette ligne, SI cette ligne est X
    formula_rang = f'IF(A{r}="X",COUNTIF(A${DATA_ROW}:A{r},"X"),"")'
    ws.write(r, 5, None, wb.style({"font": {"size": 8, "color": WHITE[2:]}}), formula=formula_rang)

# Maintenant dans "Liste a imprimer", on peut utiliser:
# =IFERROR(INDEX('Presence du Jour'!B$7:B$56, MATCH(ROW()-7, 'Presence du Jour'!E$7:E$56, 0)), "")
# Où ROW()-7 donne 1, 2, 3... pour chaque ligne de la liste imprimable

P = "'Presence du Jour'!"

for i in range(MAX_EMP):
    r = PRINT_ROW + i
    alt = i % 2 == 1
    num = i + 1  # Numéro séquentiel recherché
    
    # N° (affiche le numéro seulement si il y a un résultat)
    formula_check = f'IFERROR(INDEX({P}B${DATA_ROW}:B${DATA_ROW+MAX_EMP-1},MATCH({num},{P}E${DATA_ROW}:E${DATA_ROW+MAX_EMP-1},0)),"")'
    
    # N°
    prn.write(r, 1, None, S["pr_num_alt"] if alt else S["pr_num"],
              formula=f'IF({formula_check}<>"",{num},"")')
    
    # ID
    prn.write(r, 2, None, S["pr_data_c_alt"] if alt else S["pr_data_c"],
              formula=f'IFERROR(INDEX({P}B${DATA_ROW}:B${DATA_ROW+MAX_EMP-1},MATCH({num},{P}E${DATA_ROW}:E${DATA_ROW+MAX_EMP-1},0)),"")')
    
    # Nom
    prn.write(r, 3, None, S["pr_data_alt"] if alt else S["pr_data"],
              formula=f'IFERROR(INDEX({P}C${DATA_ROW}:C${DATA_ROW+MAX_EMP-1},MATCH({num},{P}E${DATA_ROW}:E${DATA_ROW+MAX_EMP-1},0)),"")')
    
    # Poste
    prn.write(r, 4, None, S["pr_data_c_alt"] if alt else S["pr_data_c"],
              formula=f'IFERROR(INDEX({P}D${DATA_ROW}:D${DATA_ROW+MAX_EMP-1},MATCH({num},{P}E${DATA_ROW}:E${DATA_ROW+MAX_EMP-1},0)),"")')

# Total en bas
total_r = PRINT_ROW + MAX_EMP
prn.write(total_r, 1, "", S["pr_lbl"])
prn.write(total_r, 2, "TOTAL :", S["pr_lbl"])
prn.write(total_r, 3, None, S["counter_box"],
          formula=f'COUNTIF({P}A${DATA_ROW}:A${DATA_ROW+MAX_EMP-1},"X")')

prn.setup_page(orientation="portrait", fit_width=1, fit_height=1, paper=9,
               margins=(0.75, 0.75, 0.6, 0.6, 0.2, 0.2))
prn.set_print_area(f"$A$1:$D${total_r}")


# =============================================================================
# FEUILLE 4: HISTORIQUE
# =============================================================================
hist = wb.add_sheet("Historique")
hist.tab_color = GOLD

hist.set_col(1, 14)
hist.set_col(2, 14)
hist.set_col(3, 30)
hist.set_col(4, 20)
hist.set_col(5, 12)

# En-têtes
hist.set_row(1, 26)
for col, h in enumerate(["Date", "ID", "Nom et Prénom", "Poste", "Présent"], start=1):
    hist.write(1, col, h, S["h_hdr"])

# Note: L'historique est rempli MANUELLEMENT par l'utilisateur
# (copier-coller depuis Presence du Jour, ou saisie)
# Comme il n'y a pas de VBA, on prépare des lignes vides formatées
for r in range(HIST_ROW, HIST_ROW + 200):
    for col in range(1, 6):
        hist.write(r, col, None, S["h_data"])

hist.add_list_validation(f"E{HIST_ROW}:E{HIST_ROW + 200}", '"Présent,Absent"', allow_blank=True)
hist.add_cond_cellis(f"E{HIST_ROW}:E{HIST_ROW+200}", "equal", '"Présent"', dxf_present, priority=1)
hist.add_cond_cellis(f"E{HIST_ROW}:E{HIST_ROW+200}", "equal", '"Absent"', dxf_absent, priority=2)

hist.freeze_panes(1, 0)
hist.setup_page(orientation="landscape", fit_width=1, fit_height=0, paper=9)


# =============================================================================
# FEUILLE 5: PARAMÈTRES
# =============================================================================
par = wb.add_sheet("Parametres")
par.tab_color = GRAY_TX
par.show_gridlines = False

par.set_col(1, 28)
par.set_col(2, 38)
par.set_col(3, 32)

# Titre
par.merge("A1:C1")
par.cell("A1", "  PARAMÈTRES", S["title"])
par.set_row(1, 38)
par.merge("A2:C2")
par.cell("A2", "  Configurez les informations de votre entreprise", S["subtitle"])
par.set_row(2, 20)

# Données (B3 = nom entreprise, utilisé par formule dans Liste à imprimer)
params_data = [
    ("Nom de l'entreprise", "Mon Entreprise SARL", "Apparaît sur la liste imprimée"),
    ("Chantier par défaut", "", "Nom du chantier habituel"),
    ("Responsable", "", "Nom du chef de chantier"),
    ("Téléphone", "", "Contact"),
    ("Ville", "", "Localisation"),
]

for i, (label, val, desc) in enumerate(params_data):
    r = 3 + i
    par.set_row(r, 26)
    par.write(r, 1, label, S["param_lbl"])
    par.write(r, 2, val, S["param_val"])
    par.write(r, 3, desc, S["param_desc"])


# =============================================================================
# FEUILLE 6: GUIDE D'UTILISATION
# =============================================================================
guide = wb.add_sheet("Guide")
guide.tab_color = TEAL
guide.show_gridlines = False

guide.set_col(1, 3)
guide.set_col(2, 90)

# Titre
guide.merge("A1:B1")
guide.cell("A1", "  GUIDE D'UTILISATION", S["title"])
guide.set_row(1, 38)
guide.merge("A2:B2")
guide.cell("A2", "  Mode d'emploi — Système de Gestion des Présences", S["subtitle"])
guide.set_row(2, 20)

lines = [
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "1. UTILISATION QUOTIDIENNE (moins de 2 minutes)"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("t", "   1.  Ouvrez le fichier (feuille « Presence du Jour »)"),
    ("t", "   2.  Vérifiez la date en B3 (modifiez-la si besoin)"),
    ("t", "   3.  Tapez X dans la colonne « Présent » pour chaque employé présent"),
    ("t", "   4.  La « Liste à imprimer » se met à jour AUTOMATIQUEMENT"),
    ("t", "   5.  Allez dans la feuille « Liste a imprimer »"),
    ("t", "   6.  Imprimez (Ctrl+P / ⌘+P)"),
    ("", ""),
    ("t", "   ✅ C'est tout ! Aucune macro, aucun bouton nécessaire."),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "2. AJOUTER / MODIFIER DES EMPLOYÉS"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("p", "▶ Ajouter un employé :"),
    ("t", "   - Allez dans la feuille « Employes »"),
    ("t", "   - Remplissez une nouvelle ligne : ID, Nom, Poste, Équipe, Statut"),
    ("t", "   - Mettez le statut à « Actif »"),
    ("t", "   - L'employé apparaît automatiquement dans « Presence du Jour »"),
    ("", ""),
    ("p", "▶ Désactiver un employé :"),
    ("t", "   - Changez son statut de « Actif » à « Inactif »"),
    ("t", "   - Il disparaît de la feuille de présence"),
    ("", ""),
    ("p", "▶ Modifier un nom ou poste :"),
    ("t", "   - Modifiez directement dans « Employes »"),
    ("t", "   - Le changement se propage automatiquement partout"),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "3. COMMENT ÇA MARCHE (formules automatiques)"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("t", "   • La feuille « Presence du Jour » affiche automatiquement"),
    ("t", "     tous les employés Actifs (via formules liées à « Employes »)"),
    ("", ""),
    ("t", "   • La feuille « Liste a imprimer » extrait automatiquement"),
    ("t", "     UNIQUEMENT les employés marqués X (via formules INDEX/MATCH)"),
    ("", ""),
    ("t", "   • Les compteurs (Présents / Total) se calculent en temps réel"),
    ("", ""),
    ("t", "   → Vous n'avez RIEN à copier/coller. Tout est automatique."),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "4. HISTORIQUE (sauvegarde manuelle)"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("t", "   Sans macros, l'historique n'est pas automatique."),
    ("t", "   Pour conserver un historique :"),
    ("", ""),
    ("t", "   Option A : Sauvegardez une copie du fichier chaque jour"),
    ("t", "              (ex: Presence_2026-07-06.xlsx)"),
    ("", ""),
    ("t", "   Option B : Avant de décocher, copiez manuellement les données"),
    ("t", "              dans la feuille « Historique »"),
    ("", ""),
    ("t", "   Option C : Exportez en PDF chaque jour (⌘+P > PDF)"),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "5. IMPRIMER / EXPORTER PDF"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("t", "   1. Allez dans « Liste a imprimer »"),
    ("t", "   2. Ctrl+P (Windows) ou ⌘+P (Mac)"),
    ("t", "   3. Pour un PDF : choisissez « Save as PDF » dans l'impression"),
    ("t", "   4. La mise en page est déjà configurée (A4, centré)"),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "6. PARAMÈTRES"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("t", "   - Allez dans la feuille « Parametres »"),
    ("t", "   - Le nom d'entreprise en B3 apparaît sur la liste imprimée"),
    ("t", "   - Modifiez selon vos besoins"),
    ("", ""),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("s", "7. CONSEILS"),
    ("s", "═══════════════════════════════════════════════════════════"),
    ("", ""),
    ("w", "   ⚠️  Ne supprimez pas les colonnes/lignes des feuilles protégées"),
    ("w", "   ⚠️  Sauvegardez régulièrement (⌘+S)"),
    ("t", "   ✓  Vous pouvez ajouter jusqu'à 50 employés"),
    ("t", "   ✓  Compatible Mac et PC, Excel en anglais ou français"),
    ("t", "   ✓  Pas besoin de macros — tout fonctionne avec des formules"),
]

row = 3
for stype, text in lines:
    row += 1
    if stype == "s":
        guide.write(row, 2, text, S["g_section"])
    elif stype == "p":
        guide.write(row, 2, text, S["g_step"])
    elif stype == "w":
        guide.write(row, 2, text, S["g_warn"])
    elif stype == "t":
        guide.write(row, 2, text, S["g_text"])
    else:
        guide.write(row, 2, "", S["g_text"])


# =============================================================================
# SAUVEGARDE
# =============================================================================
OUT = "Gestion_Presences.xlsx"
wb.save(OUT)
print(f"✅ Fichier créé : {OUT}")
print()
print("  Ce fichier fonctionne SANS macros.")
print("  Ouvrez-le, tapez X pour les présents, et imprimez la liste.")
print("  Compatible Mac + PC, Excel anglais ou français.")
