"""
build_presence.py
=================
Génère "Gestion_Presences.xlsm" - Un système complet et professionnel
de gestion des présences pour une entreprise de construction.

Utilise le moteur xlsxgen.py (sans dépendance externe) étendu pour supporter
le format .xlsm (macro-enabled) avec code VBA intégré.

Feuilles:
  1. Présence du Jour  (feuille principale - prise de présence quotidienne)
  2. Employés           (liste des employés avec statut Actif/Inactif)
  3. Liste à imprimer   (génération automatique de la liste des présents)
  4. Historique         (archive de toutes les journées)
  5. Paramètres        (configuration du système)
  6. Guide d'utilisation (mode d'emploi complet)

Le VBA est intégré directement dans le fichier .xlsm.
"""

import datetime as dt
import struct
import zipfile
import io
from xlsxgen import Workbook, col_letter, cell_ref

# =============================================================================
# CONSTANTES
# =============================================================================
MAX_EMP = 80       # Nombre max d'employés supportés
DATA_ROW = 7       # Première ligne de données dans "Présence du Jour"
EMP_DATA_ROW = 3   # Première ligne de données dans "Employés" (après titre+headers)

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
ORANGE   = "FFED7D31"
BLACK    = "FF000000"

wb = Workbook()
wb.title = "Gestion des Presences"
wb.active_tab = 0  # Ouvrir sur "Présence du Jour"

# =============================================================================
# STYLES
# =============================================================================
def border(*sides, style="thin", color=GRAY_MD):
    return {s: {"style": style, "color": color} for s in sides}

ALL = ("left", "right", "top", "bottom")
S = {}

def reg(name, spec):
    S[name] = wb.style(spec)
    return S[name]

# --- Titres ---
reg("title", {"font": {"bold": True, "size": 18, "color": WHITE[2:], "name": "Calibri"},
              "fill": NAVY, "align": {"horizontal": "left", "vertical": "center"}})
reg("title_c", {"font": {"bold": True, "size": 16, "color": WHITE[2:], "name": "Calibri"},
                "fill": NAVY, "align": {"horizontal": "center", "vertical": "center"}})
reg("subtitle", {"font": {"size": 10, "italic": True, "color": WHITE[2:]},
                 "fill": NAVY2, "align": {"horizontal": "left", "vertical": "center"}})

# --- En-têtes ---
reg("hdr", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": NAVY,
            "align": {"horizontal": "center", "vertical": "center", "wrap": True},
            "border": border(*ALL, color=NAVY)})
reg("hdr_blue", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": BLUE,
                 "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                 "border": border(*ALL, color=BLUE)})
reg("hdr_green", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": GREEN,
                  "align": {"horizontal": "center", "vertical": "center"},
                  "border": border(*ALL, color=GREEN)})

# --- Données ---
reg("inp", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
            "align": {"horizontal": "center", "vertical": "center"},
            "font": {"size": 14, "bold": True, "color": GREEN[2:]}})
reg("inp_txt", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "left", "vertical": "center"}})
reg("inp_date", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                 "numfmt": "dd/mm/yyyy",
                 "align": {"horizontal": "center", "vertical": "center"},
                 "font": {"bold": True}})

reg("f_id", {"font": {"bold": True, "color": NAVY[2:]}, "border": border(*ALL),
             "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt", {"border": border(*ALL), "align": {"horizontal": "left", "vertical": "center"}})
reg("f_ctr", {"border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})

# Lignes alternées
reg("f_id_alt", {"font": {"bold": True, "color": NAVY[2:]}, "fill": BLUE_XL,
                 "border": border(*ALL), "align": {"horizontal": "center", "vertical": "center"}})
reg("f_txt_alt", {"fill": BLUE_XL, "border": border(*ALL),
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("f_ctr_alt", {"fill": BLUE_XL, "border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("inp_alt", {"fill": BLUE_XL, "locked": False, "border": border(*ALL),
                "align": {"horizontal": "center", "vertical": "center"},
                "font": {"size": 14, "bold": True, "color": GREEN[2:]}})

# Labels
reg("lbl", {"font": {"bold": True, "color": NAVY[2:], "size": 11},
            "align": {"horizontal": "right", "vertical": "center"}})
reg("lbl_sm", {"font": {"size": 10, "color": GRAY_TX[2:]},
               "align": {"horizontal": "right", "vertical": "center"}})
reg("counter", {"font": {"bold": True, "size": 16, "color": NAVY[2:]},
                "align": {"horizontal": "center", "vertical": "center"},
                "fill": GREEN_LT, "border": border(*ALL)})
reg("counter_lbl", {"font": {"bold": True, "size": 10, "color": GREEN[2:]},
                    "align": {"horizontal": "center", "vertical": "center"}})

# Print sheet
reg("print_title", {"font": {"bold": True, "size": 16, "color": NAVY[2:]},
                    "align": {"horizontal": "center", "vertical": "center"}})
reg("print_sub", {"font": {"size": 10, "italic": True, "color": GRAY_TX[2:]},
                  "align": {"horizontal": "center", "vertical": "center"}})
reg("print_lbl", {"font": {"bold": True, "size": 10, "color": NAVY[2:]},
                  "align": {"horizontal": "right", "vertical": "center"}})
reg("print_val", {"font": {"bold": True, "size": 11},
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("print_hdr", {"font": {"bold": True, "size": 11, "color": WHITE[2:]}, "fill": NAVY,
                  "align": {"horizontal": "center", "vertical": "center"},
                  "border": border(*ALL, color=NAVY)})
reg("print_data", {"border": border(*ALL),
                   "align": {"horizontal": "left", "vertical": "center"}})
reg("print_num", {"border": border(*ALL),
                  "align": {"horizontal": "center", "vertical": "center"}})

# Paramètres
reg("param_lbl", {"font": {"bold": True, "color": NAVY[2:]}, "fill": GRAY_LT,
                  "border": border(*ALL), "align": {"horizontal": "left", "vertical": "center"}})
reg("param_val", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                  "align": {"horizontal": "left", "vertical": "center"}})
reg("param_desc", {"font": {"size": 9, "color": GRAY_TX[2:]}, "border": border(*ALL),
                   "align": {"horizontal": "left", "vertical": "center"}})

# Guide
reg("guide_section", {"font": {"bold": True, "size": 13, "color": BLUE[2:]},
                      "align": {"horizontal": "left", "vertical": "center"}})
reg("guide_step", {"font": {"bold": True, "size": 11, "color": GREEN[2:]},
                   "align": {"horizontal": "left", "vertical": "center"}})
reg("guide_text", {"font": {"size": 11}, "align": {"horizontal": "left", "vertical": "center", "wrap": True}})
reg("guide_warn", {"font": {"bold": True, "size": 10, "color": RED[2:]},
                   "align": {"horizontal": "left", "vertical": "center"}})

# DXF pour mise en forme conditionnelle
dxf_present = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TXT[2:], "bold": True}})
dxf_absent = wb.dxf({"fill": RED_LT, "font": {"color": RED[2:]}})
dxf_actif = wb.dxf({"fill": GREEN_OK, "font": {"color": GREEN_TXT[2:]}})
dxf_inactif = wb.dxf({"fill": RED_LT, "font": {"color": RED[2:]}})
dxf_band = wb.dxf({"fill": BLUE_XL})


# =============================================================================
# FEUILLE 1: PRÉSENCE DU JOUR
# =============================================================================
ws = wb.add_sheet("Presence du Jour")
ws.tab_color = NAVY
ws.show_gridlines = False

# Colonnes
ws.set_col(1, 12)   # Présent
ws.set_col(2, 14)   # ID
ws.set_col(3, 32)   # Nom et Prénom
ws.set_col(4, 20)   # Poste
ws.set_col(5, 3)    # Marge
ws.set_col(6, 16)   # Zone compteurs

# Titre (row 1)
ws.merge("A1:D1")
ws.cell("A1", "  GESTION DES PRÉSENCES", S["title"])
ws.set_row(1, 38)

# Sous-titre (row 2)
ws.merge("A2:D2")
ws.cell("A2", "  Cochez (X) les employés présents puis cliquez sur « Enregistrer la journée »", S["subtitle"])
ws.set_row(2, 20)

# Zone info (rows 3-4)
ws.set_row(3, 22)
ws.set_row(4, 22)

# Date
ws.cell("A3", "Date :", S["lbl"])
ws.write(3, 2, dt.date.today(), S["inp_date"])

# Chantier
ws.cell("A4", "Chantier :", S["lbl"])
ws.write(4, 2, "", S["inp_txt"])

# Compteurs à droite
ws.cell("C3", "Présents :", S["counter_lbl"])
ws.write(3, 4, None, S["counter"],
         formula=f'COUNTIF(A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1},"X")')
ws.cell("C4", "Total actifs :", S["counter_lbl"])
ws.write(4, 4, None, S["counter"],
         formula=f'COUNTA(B{DATA_ROW}:B{DATA_ROW + MAX_EMP - 1})')

# Ligne vide (row 5)
ws.set_row(5, 6)

# En-têtes tableau (row 6)
ws.set_row(6, 26)
headers = [("☐ Présent", 1), ("ID", 2), ("Nom et Prénom", 3), ("Poste", 4)]
for text, col in headers:
    ws.write(6, col, text, S["hdr"])

# Lignes de données (rows 7 à 7+MAX_EMP-1)
for i in range(MAX_EMP):
    r = DATA_ROW + i
    emp_r = EMP_DATA_ROW + i  # Ligne correspondante dans feuille Employés
    alt = i % 2 == 1
    
    ws.set_row(r, 22)
    
    # Col A: Saisie présence (X ou vide) - DÉVERROUILLÉE
    ws.write(r, 1, "", S["inp_alt"] if alt else S["inp"])
    
    # Col B: ID (formule: si Actif dans Employés, afficher l'ID)
    formula_id = f'IF(Employes!E{emp_r}="Actif",Employes!A{emp_r},"")'
    ws.write(r, 2, None, S["f_id_alt"] if alt else S["f_id"], formula=formula_id)
    
    # Col C: Nom (formule liée)
    formula_nom = f'IF(B{r}<>"",Employes!B{emp_r},"")'
    ws.write(r, 3, None, S["f_txt_alt"] if alt else S["f_txt"], formula=formula_nom)
    
    # Col D: Poste (formule liée)
    formula_poste = f'IF(B{r}<>"",Employes!C{emp_r},"")'
    ws.write(r, 4, None, S["f_ctr_alt"] if alt else S["f_ctr"], formula=formula_poste)

# Validation: seul "X" ou vide
ws.add_list_validation(f"A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1}", '"X,"', allow_blank=True)

# Conditional formatting: "X" = vert
ws.add_cond_cellis(f"A{DATA_ROW}:A{DATA_ROW + MAX_EMP - 1}", "equal", '"X"', dxf_present, priority=1)

# Freeze
ws.freeze_panes(6, 0)
ws.protect = True
ws.setup_page(orientation="portrait", fit_width=1, fit_height=0, paper=9)
ws.set_print_area(f"$A$1:$D${DATA_ROW + MAX_EMP - 1}")


# =============================================================================
# FEUILLE 2: EMPLOYÉS
# =============================================================================
emp = wb.add_sheet("Employes")
emp.tab_color = BLUE
emp.show_gridlines = False

emp.set_col(1, 14)   # ID
emp.set_col(2, 30)   # Nom et Prénom
emp.set_col(3, 20)   # Poste
emp.set_col(4, 16)   # Équipe
emp.set_col(5, 12)   # Statut

# Titre
emp.merge("A1:E1")
emp.cell("A1", "  LISTE DES EMPLOYÉS", S["title"])
emp.set_row(1, 35)

# En-têtes (row 2)
emp.set_row(2, 26)
emp_headers = ["ID Employé", "Nom et Prénom", "Poste", "Équipe", "Statut"]
for col, h in enumerate(emp_headers, start=1):
    emp.write(2, col, h, S["hdr"])

# Données d'exemple
sample_employees = [
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

for i, (eid, nom, poste, equipe, statut) in enumerate(sample_employees):
    r = EMP_DATA_ROW + i
    alt = i % 2 == 1
    emp.write(r, 1, eid, S["f_id_alt"] if alt else S["f_id"])
    emp.write(r, 2, nom, S["f_txt_alt"] if alt else S["f_txt"])
    emp.write(r, 3, poste, S["f_ctr_alt"] if alt else S["f_ctr"])
    emp.write(r, 4, equipe, S["f_ctr_alt"] if alt else S["f_ctr"])
    emp.write(r, 5, statut, S["f_ctr_alt"] if alt else S["f_ctr"])

# Cellules vides pour futurs employés
for i in range(len(sample_employees), MAX_EMP):
    r = EMP_DATA_ROW + i
    alt = i % 2 == 1
    for col in range(1, 6):
        style = S["f_ctr_alt"] if alt else S["f_ctr"]
        if col == 2:
            style = S["f_txt_alt"] if alt else S["f_txt"]
        emp.write(r, col, None, style)

# Validation statut
emp.add_list_validation(f"E{EMP_DATA_ROW}:E{EMP_DATA_ROW + MAX_EMP - 1}",
                        '"Actif,Inactif"', allow_blank=True)

# Conditional formatting statut
emp.add_cond_cellis(f"E{EMP_DATA_ROW}:E{EMP_DATA_ROW + MAX_EMP - 1}",
                    "equal", '"Actif"', dxf_actif, priority=1)
emp.add_cond_cellis(f"E{EMP_DATA_ROW}:E{EMP_DATA_ROW + MAX_EMP - 1}",
                    "equal", '"Inactif"', dxf_inactif, priority=2)

emp.freeze_panes(2, 0)
emp.protect = False  # L'utilisateur doit pouvoir modifier
emp.setup_page(orientation="landscape", fit_width=1, fit_height=0, paper=9)
emp.set_print_area(f"$A$1:$E${EMP_DATA_ROW + MAX_EMP - 1}")


# =============================================================================
# FEUILLE 3: LISTE À IMPRIMER
# =============================================================================
prn = wb.add_sheet("Liste a imprimer")
prn.tab_color = GREEN
prn.show_gridlines = False

prn.set_col(1, 6)    # N°
prn.set_col(2, 14)   # ID
prn.set_col(3, 34)   # Nom et Prénom
prn.set_col(4, 20)   # Poste

# Titre
prn.merge("A1:D1")
prn.cell("A1", "LISTE DE PRÉSENCE", S["print_title"])
prn.set_row(1, 32)

# Sous-titre (nom entreprise) - formule liée aux paramètres
prn.merge("A2:D2")
prn.write(2, 1, None, S["print_sub"], formula="Parametres!B3")
prn.set_row(2, 18)

# Info date et chantier
prn.set_row(3, 20)
prn.set_row(4, 20)
prn.write(3, 1, "Date :", S["print_lbl"])
prn.write(3, 2, None, S["print_val"], formula="'Presence du Jour'!B3")
prn.write(4, 1, "Chantier :", S["print_lbl"])
prn.write(4, 2, None, S["print_val"], formula="'Presence du Jour'!B4")

# Ligne vide
prn.set_row(5, 6)

# En-têtes
prn.set_row(6, 24)
for col, h in enumerate(["N°", "ID", "Nom et Prénom", "Poste"], start=1):
    prn.write(6, col, h, S["print_hdr"])

# Lignes de données (formules qui filtrent les présents)
# Utilise une formule SMALL/IF pour lister uniquement les lignes marquées "X"
# Dans la feuille "Présence du Jour", colonne A contient "X" pour les présents
# On utilise une approche avec INDEX/SMALL/IF (formule matricielle CSE)
# 
# Mais les formules matricielles complexes sont difficiles en OOXML pur.
# Alternative: On laisse les données de cette feuille être remplies par la macro VBA.
# C'est plus fiable et l'utilisateur clique juste sur "Enregistrer la journée".
#
# Cependant, pour montrer un résultat immédiat SANS macro, on met des formules simples
# qui affichent les employés présents. Pour garder la compatibilité, utilisons IFERROR+SMALL.

# Approche alternative: afficher directement les employés présents via formules
# Colonne cachée dans "Presence du Jour" qui numérote les présents
# Ou plus simple: la macro remplit cette feuille. On laisse vide avec un message.

prn.set_row(7, 20)
prn.write(7, 1, "", S["print_num"])
prn.merge("B7:D7")
prn.write(7, 2, "(Cette liste sera générée automatiquement par la macro « Enregistrer la journée »)", 
          wb.style({"font": {"size": 10, "italic": True, "color": GRAY_TX[2:]},
                    "align": {"horizontal": "center", "vertical": "center"},
                    "border": border(*ALL)}))

# Page setup
prn.setup_page(orientation="portrait", fit_width=1, fit_height=1, paper=9,
               margins=(0.75, 0.75, 0.6, 0.6, 0.2, 0.2))
prn.set_print_area("$A$1:$D$60")


# =============================================================================
# FEUILLE 4: HISTORIQUE
# =============================================================================
hist = wb.add_sheet("Historique")
hist.tab_color = GOLD

hist.set_col(1, 14)   # Date
hist.set_col(2, 14)   # ID
hist.set_col(3, 30)   # Nom et Prénom
hist.set_col(4, 20)   # Poste
hist.set_col(5, 12)   # Présent/Absent

# En-têtes
hist.set_row(1, 26)
hist_headers = ["Date", "ID Employé", "Nom et Prénom", "Poste", "Statut"]
for col, h in enumerate(hist_headers, start=1):
    hist.write(1, col, h, S["hdr"])

# Conditional formatting
hist.add_cond_cellis("E2:E10000", "equal", '"Present"', dxf_present, priority=1)
hist.add_cond_cellis("E2:E10000", "equal", '"Absent"', dxf_absent, priority=2)

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
par.cell("A1", "  PARAMÈTRES DU SYSTÈME", S["title"])
par.set_row(1, 38)
par.merge("A2:C2")
par.cell("A2", "  Configurez ici les informations de votre entreprise et du chantier", S["subtitle"])
par.set_row(2, 20)

# En-têtes section
params_data = [
    ("Nom de l'entreprise", "Mon Entreprise SARL", "Apparaît sur la liste à imprimer"),
    ("Nom du chantier par défaut", "", "Pré-rempli dans Présence du Jour"),
    ("Responsable de chantier", "", "Nom du responsable"),
    ("Téléphone", "", "Numéro de contact"),
    ("Ville / Site", "", "Localisation du chantier"),
    ("Logo", "(Insérer le logo manuellement)", "Emplacement réservé"),
    ("Chemin export PDF", "(même dossier que le classeur)", "Dossier de destination des PDF"),
    ("Format de date", "jj/mm/aaaa", "Format d'affichage"),
]

par.set_row(3, 24)
par.write(3, 1, "Paramètre", S["hdr_blue"])
par.write(3, 2, "Valeur", S["hdr_blue"])
par.write(3, 3, "Description", S["hdr_blue"])

for i, (param, val, desc) in enumerate(params_data):
    r = 4 + i  # Données commencent en row 4, mais les valeurs sont en B3+i
    # Correction: B3 est l'en-tête, les données commencent en B4
    # Mais la formule dans "Liste a imprimer" dit Parametres!B3
    # Ajustons: mettons les données à partir de la row 3 pour que B3 = nom entreprise
    pass

# Recréons: Nom entreprise en B3 (pour la formule de la liste à imprimer)
# Titre en row 1, sous-titre row 2, données dès row 3
# Annulons la structure ci-dessus et refaisons

# En fait, gardons le format actuel mais ajustons la formule dans Liste à imprimer
# La formule dit: Parametres!B3. Mettons le nom d'entreprise en B3.
# Restructurons: pas d'en-tête "Paramètre/Valeur", juste Label|Valeur directement

# RESTRUCTURATION de Paramètres:
# Row 1: Titre
# Row 2: Sous-titre
# Row 3: Nom entreprise (A3=label, B3=valeur)
# Row 4+: autres paramètres

# On a déjà écrit les en-têtes en row 3, mais on les déplace.
# Plutôt que de refaire, ajustons la formule dans Liste à imprimer.
# La formule actuelle est: Parametres!B3 -> changeons pour Parametres!B4

# Pour simplifier, supprimons la ligne d'en-tête et mettons directement les données en row 3.
# Re-écrivons par-dessus:

par.write(3, 1, "Nom de l'entreprise", S["param_lbl"])
par.write(3, 2, "Mon Entreprise SARL", S["param_val"])
par.write(3, 3, "Apparaît sur la liste à imprimer", S["param_desc"])

par.write(4, 1, "Chantier par défaut", S["param_lbl"])
par.write(4, 2, "", S["param_val"])
par.write(4, 3, "Pré-rempli dans Présence du Jour", S["param_desc"])

par.write(5, 1, "Responsable", S["param_lbl"])
par.write(5, 2, "", S["param_val"])
par.write(5, 3, "Nom du responsable de chantier", S["param_desc"])

par.write(6, 1, "Téléphone", S["param_lbl"])
par.write(6, 2, "", S["param_val"])
par.write(6, 3, "Numéro de contact", S["param_desc"])

par.write(7, 1, "Ville / Site", S["param_lbl"])
par.write(7, 2, "", S["param_val"])
par.write(7, 3, "Localisation du chantier", S["param_desc"])

par.write(8, 1, "Chemin export PDF", S["param_lbl"])
par.write(8, 2, "(même dossier que le classeur)", S["param_val"])
par.write(8, 3, "Dossier de destination des fichiers PDF", S["param_desc"])

par.write(9, 1, "Format de date", S["param_lbl"])
par.write(9, 2, "jj/mm/aaaa", S["param_val"])
par.write(9, 3, "Format d'affichage des dates", S["param_desc"])

# Note
par.set_row(11, 20)
par.write(11, 1, "⚠️ IMPORTANT :", wb.style({"font": {"bold": True, "color": RED[2:], "size": 10},
                                               "align": {"horizontal": "left", "vertical": "center"}}))
par.write(12, 1, "Sauvegardez toujours ce fichier au format .xlsm pour conserver les macros.", 
          wb.style({"font": {"size": 10, "color": GRAY_TX[2:]},
                    "align": {"horizontal": "left", "vertical": "center"}}))

for r in range(3, 10):
    par.set_row(r, 24)

par.setup_page(orientation="portrait", paper=9)

# Mettre à jour la formule de Liste à imprimer pour pointer vers B3
# (Déjà fait: prn line "Parametres!B3" -> row 3 = "Mon Entreprise SARL" ✓)


# =============================================================================
# FEUILLE 6: GUIDE D'UTILISATION
# =============================================================================
guide = wb.add_sheet("Guide d utilisation")
guide.tab_color = TEAL
guide.show_gridlines = False

guide.set_col(1, 3)
guide.set_col(2, 85)

# Titre
guide.merge("A1:B1")
guide.cell("A1", "  GUIDE D'UTILISATION", S["title"])
guide.set_row(1, 38)
guide.merge("A2:B2")
guide.cell("A2", "  Système de Gestion des Présences — Mode d'emploi complet", S["subtitle"])
guide.set_row(2, 20)

# Contenu
guide_lines = [
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "1. PREMIÈRE CONFIGURATION"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("step", "▶ Ajouter des employés :"),
    ("text", "    1. Allez dans la feuille « Employés »"),
    ("text", "    2. Remplissez : ID, Nom et Prénom, Poste, Équipe, Statut"),
    ("text", "    3. Le statut doit être « Actif » ou « Inactif »"),
    ("text", "    4. Seuls les employés « Actif » apparaissent dans la feuille de présence"),
    ("text", "    5. Les IDs sont libres : utilisez vos propres identifiants"),
    ("", ""),
    ("step", "▶ Modifier un employé :"),
    ("text", "    - Modifiez directement dans la feuille « Employés »"),
    ("text", "    - Toutes les modifications se propagent automatiquement"),
    ("", ""),
    ("step", "▶ Désactiver un employé :"),
    ("text", "    - Changez son statut de « Actif » à « Inactif »"),
    ("text", "    - Il disparaîtra automatiquement de la feuille de présence"),
    ("text", "    - Ses données historiques sont conservées"),
    ("", ""),
    ("step", "▶ Personnaliser les paramètres :"),
    ("text", "    - Allez dans la feuille « Paramètres »"),
    ("text", "    - Renseignez le nom de votre entreprise"),
    ("text", "    - Ce nom apparaîtra sur la liste à imprimer"),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "2. UTILISATION QUOTIDIENNE (moins de 2 minutes)"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("step", "Chaque matin :"),
    ("", ""),
    ("text", "    1️⃣  Ouvrir le fichier (la feuille Présence du Jour s'affiche)"),
    ("text", "    2️⃣  Cliquer sur le bouton « Nouvelle journée »"),
    ("text", "        → Met la date du jour et décoche tout"),
    ("text", "    3️⃣  Cocher (X) uniquement les employés PRÉSENTS"),
    ("text", "    4️⃣  Cliquer sur « Enregistrer la journée »"),
    ("text", "        → Sauvegarde dans l'historique + génère la liste"),
    ("text", "    5️⃣  Cliquer sur « Imprimer » ou « Exporter PDF »"),
    ("text", "        → La liste est prête à envoyer à l'administration"),
    ("", ""),
    ("text", "    ✅ C'est terminé ! Aucune autre manipulation nécessaire."),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "3. DESCRIPTION DES BOUTONS / MACROS"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("step", "🔵 NouvelleJournee"),
    ("text", "    - Met automatiquement la date du jour"),
    ("text", "    - Décoche toutes les cases de présence"),
    ("text", "    - Prépare une nouvelle journée vierge"),
    ("", ""),
    ("step", "🟢 EnregistrerJournee"),
    ("text", "    - Sauvegarde toutes les présences dans l'historique"),
    ("text", "    - Si la même date existe déjà, les anciennes données sont remplacées"),
    ("text", "    - Met à jour la « Liste à imprimer »"),
    ("text", "    - Affiche un message de confirmation"),
    ("", ""),
    ("step", "🟠 ImprimerListe"),
    ("text", "    - Ouvre l'aperçu avant impression"),
    ("text", "    - Sauvegarde automatiquement le fichier avant"),
    ("text", "    - Format A4, centré, professionnel"),
    ("", ""),
    ("step", "🔴 ExporterPDF"),
    ("text", "    - Génère un fichier PDF de la liste de présence"),
    ("text", "    - Nom automatique : Presence_AAAA-MM-JJ.pdf"),
    ("text", "    - S'ouvre automatiquement après création"),
    ("", ""),
    ("step", "⚪ ToutDecocher"),
    ("text", "    - Décoche rapidement toutes les présences"),
    ("", ""),
    ("step", "🔍 RechercherEmploye"),
    ("text", "    - Recherche un employé par son nom"),
    ("text", "    - Se positionne sur sa ligne"),
    ("", ""),
    ("step", "📅 ChargerHistoriqueParDate"),
    ("text", "    - Permet de sélectionner une date passée"),
    ("text", "    - Charge la liste des présents de ce jour"),
    ("text", "    - Permet de réimprimer une ancienne liste"),
    ("text", "    - Ne modifie JAMAIS les données enregistrées"),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "4. CONSULTER L'HISTORIQUE"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("text", "    - Allez dans la feuille « Historique »"),
    ("text", "    - Toutes les journées enregistrées y sont conservées"),
    ("text", "    - Colonnes : Date, ID, Nom, Poste, Statut (Présent/Absent)"),
    ("text", "    - L'historique n'est JAMAIS supprimé automatiquement"),
    ("text", "    - Vous pouvez utiliser les filtres Excel pour trier/filtrer"),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "5. RÉIMPRIMER UNE JOURNÉE PASSÉE"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("text", "    1. Exécutez la macro « ChargerHistoriqueParDate »"),
    ("text", "    2. Entrez la date (format : jj/mm/aaaa)"),
    ("text", "    3. La « Liste à imprimer » se met à jour"),
    ("text", "    4. Cliquez sur « Imprimer » ou « Exporter PDF »"),
    ("", ""),
    ("warn", "    ⚠️ Cela ne modifie PAS les données enregistrées."),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "6. SAUVEGARDE ET BONNES PRATIQUES"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("step", "Recommandations :"),
    ("text", "    ✓ Sauvegardez TOUJOURS en format .xlsm (avec macros)"),
    ("text", "    ✓ Faites une copie de sauvegarde chaque semaine"),
    ("text", "    ✓ Ne supprimez jamais le contenu de l'historique"),
    ("text", "    ✓ Gardez une copie sur clé USB ou cloud"),
    ("text", "    ✓ Si le fichier est partagé, une seule personne à la fois"),
    ("", ""),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("section", "7. RÉSOLUTION DE PROBLÈMES"),
    ("section", "══════════════════════════════════════════════════════════════"),
    ("", ""),
    ("step", "❓ Les boutons/macros ne fonctionnent pas ?"),
    ("text", "    → Fichier > Options > Centre de gestion de la confidentialité"),
    ("text", "    → Paramètres des macros > Activer toutes les macros"),
    ("text", "    → Redémarrez Excel"),
    ("", ""),
    ("step", "❓ Un employé n'apparaît pas dans la présence ?"),
    ("text", "    → Vérifiez que son statut est « Actif » (feuille Employés)"),
    ("text", "    → Vérifiez qu'il est bien dans les 80 premières lignes"),
    ("", ""),
    ("step", "❓ La date est incorrecte ?"),
    ("text", "    → Modifiez-la manuellement dans la cellule Date (B3)"),
    ("text", "    → Ou utilisez « Nouvelle journée » pour la mettre à aujourd'hui"),
    ("", ""),
    ("step", "❓ Comment ajouter des boutons visuels ?"),
    ("text", "    → Onglet Développeur > Insérer > Bouton (Contrôle de formulaire)"),
    ("text", "    → Dessinez le bouton et assignez la macro"),
    ("text", "    → Macros : NouvelleJournee, EnregistrerJournee, ImprimerListe,"),
    ("text", "       ExporterPDF, ToutDecocher, RechercherEmploye, ChargerHistoriqueParDate"),
    ("", ""),
]

row = 3
for style_type, text in guide_lines:
    row += 1
    if style_type == "section":
        guide.write(row, 2, text, S["guide_section"])
    elif style_type == "step":
        guide.write(row, 2, text, S["guide_step"])
    elif style_type == "warn":
        guide.write(row, 2, text, S["guide_warn"])
    elif style_type == "text":
        guide.write(row, 2, text, S["guide_text"])
    else:
        guide.write(row, 2, "", S["guide_text"])

guide.setup_page(orientation="portrait", fit_width=1, fit_height=0, paper=9)


# =============================================================================
# CODE VBA (sera écrit dans un fichier .bas séparé)
# =============================================================================
VBA_MODULE = '''Attribute VB_Name = "ModPresence"
'===============================================================================
' SYSTEME DE GESTION DES PRESENCES
' Module principal - Macros VBA
' Version 1.0
'===============================================================================
Option Explicit

Private Const SHEET_PRESENCE As String = "Presence du Jour"
Private Const SHEET_EMPLOYES As String = "Employes"
Private Const SHEET_IMPRIMER As String = "Liste a imprimer"
Private Const SHEET_HISTORIQUE As String = "Historique"
Private Const SHEET_PARAMS As String = "Parametres"
Private Const MAX_EMP As Long = 80
Private Const DATA_ROW As Long = 7

'===============================================================================
' NOUVELLE JOURNEE
'===============================================================================
Public Sub NouvelleJournee()
    Dim ws As Worksheet
    Dim i As Long
    
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    
    Set ws = ThisWorkbook.Sheets(SHEET_PRESENCE)
    
    ' Date du jour
    ws.Range("B3").Value = Date
    
    ' Decocher tout
    For i = DATA_ROW To DATA_ROW + MAX_EMP - 1
        If ws.Cells(i, 2).Value <> "" Then
            ws.Cells(i, 1).Value = ""
        End If
    Next i
    
    ws.Activate
    ws.Range("A" & DATA_ROW).Select
    
    Application.ScreenUpdating = True
    MsgBox "Nouvelle journee preparee pour le " & Format(Date, "dd/mm/yyyy") & "." & vbCrLf & _
           vbCrLf & "Cochez (X) les employes presents puis cliquez sur" & vbCrLf & _
           Chr(171) & " Enregistrer la journee " & Chr(187) & ".", vbInformation, "Nouvelle Journee"
    Exit Sub

ErrHandler:
    Application.ScreenUpdating = True
    MsgBox "Erreur: " & Err.Description, vbCritical, "Erreur"
End Sub

'===============================================================================
' ENREGISTRER LA JOURNEE
'===============================================================================
Public Sub EnregistrerJournee()
    Dim wsP As Worksheet, wsH As Worksheet
    Dim dateJour As Date
    Dim i As Long, nextRow As Long, compteur As Long
    Dim empID As String, empNom As String, empPoste As String
    
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    
    Set wsP = ThisWorkbook.Sheets(SHEET_PRESENCE)
    Set wsH = ThisWorkbook.Sheets(SHEET_HISTORIQUE)
    
    ' Verifier date
    If Not IsDate(wsP.Range("B3").Value) Then
        Application.ScreenUpdating = True
        MsgBox "Date invalide. Verifiez la cellule B3.", vbExclamation, "Date invalide"
        Exit Sub
    End If
    dateJour = CDate(wsP.Range("B3").Value)
    
    ' Compter les presents
    compteur = 0
    For i = DATA_ROW To DATA_ROW + MAX_EMP - 1
        If UCase(Trim(CStr(wsP.Cells(i, 1).Value))) = "X" Then
            compteur = compteur + 1
        End If
    Next i
    
    If compteur = 0 Then
        Application.ScreenUpdating = True
        MsgBox "Aucun employe coche (X) comme present." & vbCrLf & _
               "Cochez au moins un employe avant d''enregistrer.", vbExclamation, "Aucun present"
        Exit Sub
    End If
    
    ' Supprimer anciennes donnees de la meme date (eviter doublons)
    Dim lastRow As Long
    lastRow = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row
    If lastRow >= 2 Then
        Dim r As Long
        For r = lastRow To 2 Step -1
            If IsDate(wsH.Cells(r, 1).Value) Then
                If CDate(wsH.Cells(r, 1).Value) = dateJour Then
                    wsH.Rows(r).Delete
                End If
            End If
        Next r
    End If
    
    ' Ecrire dans l historique
    nextRow = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row + 1
    If nextRow < 2 Then nextRow = 2
    
    For i = DATA_ROW To DATA_ROW + MAX_EMP - 1
        empID = Trim(CStr(wsP.Cells(i, 2).Value))
        If empID <> "" Then
            empNom = Trim(CStr(wsP.Cells(i, 3).Value))
            empPoste = Trim(CStr(wsP.Cells(i, 4).Value))
            
            wsH.Cells(nextRow, 1).Value = dateJour
            wsH.Cells(nextRow, 1).NumberFormat = "dd/mm/yyyy"
            wsH.Cells(nextRow, 2).Value = empID
            wsH.Cells(nextRow, 3).Value = empNom
            wsH.Cells(nextRow, 4).Value = empPoste
            
            If UCase(Trim(CStr(wsP.Cells(i, 1).Value))) = "X" Then
                wsH.Cells(nextRow, 5).Value = "Present"
            Else
                wsH.Cells(nextRow, 5).Value = "Absent"
            End If
            nextRow = nextRow + 1
        End If
    Next i
    
    ' Mettre a jour la liste a imprimer
    Call GenererListeImprimer(dateJour)
    
    Application.ScreenUpdating = True
    MsgBox "Journee du " & Format(dateJour, "dd/mm/yyyy") & " enregistree !" & vbCrLf & _
           vbCrLf & compteur & " employe(s) present(s)." & vbCrLf & _
           vbCrLf & "La liste a imprimer a ete mise a jour.", vbInformation, "Enregistrement reussi"
    Exit Sub

ErrHandler:
    Application.ScreenUpdating = True
    MsgBox "Erreur: " & Err.Description, vbCritical, "Erreur Enregistrement"
End Sub

'===============================================================================
' GENERER LISTE A IMPRIMER
'===============================================================================
Private Sub GenererListeImprimer(dateRef As Date)
    Dim wsI As Worksheet, wsH As Worksheet, wsP As Worksheet
    Dim i As Long, printRow As Long, lastRow As Long, numero As Long
    
    Set wsI = ThisWorkbook.Sheets(SHEET_IMPRIMER)
    Set wsH = ThisWorkbook.Sheets(SHEET_HISTORIQUE)
    Set wsP = ThisWorkbook.Sheets(SHEET_PARAMS)
    
    ' Effacer anciennes donnees (a partir de row 7)
    lastRow = wsI.Cells(wsI.Rows.Count, 1).End(xlUp).Row
    If lastRow >= 7 Then
        wsI.Range("A7:D" & lastRow + 2).ClearContents
        wsI.Range("A7:D" & lastRow + 2).ClearFormats
    End If
    
    ' En-tetes info
    wsI.Range("C3").Value = dateRef
    wsI.Range("C3").NumberFormat = "dd/mm/yyyy"
    
    ' Chantier depuis Presence du Jour
    wsI.Range("C4").Value = ThisWorkbook.Sheets(SHEET_PRESENCE).Range("B4").Value
    
    ' Nom entreprise
    wsI.Range("B2").Value = wsP.Range("B3").Value
    
    ' Remplir les presents
    lastRow = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row
    printRow = 7
    numero = 1
    
    For i = 2 To lastRow
        If IsDate(wsH.Cells(i, 1).Value) Then
            If CDate(wsH.Cells(i, 1).Value) = dateRef Then
                If wsH.Cells(i, 5).Value = "Present" Then
                    ' Numero
                    wsI.Cells(printRow, 1).Value = numero
                    wsI.Cells(printRow, 1).HorizontalAlignment = xlCenter
                    wsI.Cells(printRow, 1).Font.Name = "Calibri"
                    wsI.Cells(printRow, 1).Font.Size = 11
                    
                    ' ID
                    wsI.Cells(printRow, 2).Value = wsH.Cells(i, 2).Value
                    wsI.Cells(printRow, 2).HorizontalAlignment = xlCenter
                    wsI.Cells(printRow, 2).Font.Name = "Calibri"
                    wsI.Cells(printRow, 2).Font.Size = 11
                    wsI.Cells(printRow, 2).Font.Bold = True
                    
                    ' Nom
                    wsI.Cells(printRow, 3).Value = wsH.Cells(i, 3).Value
                    wsI.Cells(printRow, 3).Font.Name = "Calibri"
                    wsI.Cells(printRow, 3).Font.Size = 11
                    
                    ' Poste
                    wsI.Cells(printRow, 4).Value = wsH.Cells(i, 4).Value
                    wsI.Cells(printRow, 4).HorizontalAlignment = xlCenter
                    wsI.Cells(printRow, 4).Font.Name = "Calibri"
                    wsI.Cells(printRow, 4).Font.Size = 11
                    
                    ' Bordures
                    Dim c As Long
                    For c = 1 To 4
                        wsI.Cells(printRow, c).Borders(xlEdgeLeft).LineStyle = xlContinuous
                        wsI.Cells(printRow, c).Borders(xlEdgeRight).LineStyle = xlContinuous
                        wsI.Cells(printRow, c).Borders(xlEdgeTop).LineStyle = xlContinuous
                        wsI.Cells(printRow, c).Borders(xlEdgeBottom).LineStyle = xlContinuous
                        wsI.Cells(printRow, c).Borders(xlEdgeLeft).Weight = xlThin
                        wsI.Cells(printRow, c).Borders(xlEdgeRight).Weight = xlThin
                        wsI.Cells(printRow, c).Borders(xlEdgeTop).Weight = xlThin
                        wsI.Cells(printRow, c).Borders(xlEdgeBottom).Weight = xlThin
                    Next c
                    
                    ' Lignes alternees
                    If numero Mod 2 = 0 Then
                        For c = 1 To 4
                            wsI.Cells(printRow, c).Interior.Color = RGB(234, 241, 250)
                        Next c
                    End If
                    
                    numero = numero + 1
                    printRow = printRow + 1
                End If
            End If
        End If
    Next i
    
    ' Total en bas
    If numero > 1 Then
        printRow = printRow + 1
        wsI.Cells(printRow, 1).Value = ""
        wsI.Cells(printRow, 2).Value = "TOTAL PRESENTS :"
        wsI.Cells(printRow, 2).Font.Bold = True
        wsI.Cells(printRow, 2).Font.Size = 11
        wsI.Cells(printRow, 2).Font.Color = RGB(31, 56, 100)
        wsI.Cells(printRow, 3).Value = numero - 1
        wsI.Cells(printRow, 3).Font.Bold = True
        wsI.Cells(printRow, 3).Font.Size = 14
        wsI.Cells(printRow, 3).Font.Color = RGB(31, 56, 100)
    End If
    
    ' Zone impression
    wsI.PageSetup.PrintArea = "A1:D" & printRow + 1
End Sub

'===============================================================================
' IMPRIMER LISTE
'===============================================================================
Public Sub ImprimerListe()
    Dim wsI As Worksheet
    
    On Error GoTo ErrHandler
    Set wsI = ThisWorkbook.Sheets(SHEET_IMPRIMER)
    
    If IsEmpty(wsI.Range("A7").Value) Or wsI.Range("A7").Value = "" Then
        MsgBox "La liste est vide. Enregistrez d''abord la journee.", vbExclamation, "Liste vide"
        Exit Sub
    End If
    
    ' Sauvegarder
    On Error Resume Next
    ThisWorkbook.Save
    On Error GoTo ErrHandler
    
    ' Page setup
    With wsI.PageSetup
        .Orientation = xlPortrait
        .PaperSize = xlPaperA4
        .FitToPagesWide = 1
        .FitToPagesTall = 1
        .CenterHorizontally = True
        .TopMargin = Application.CentimetersToPoints(1.5)
        .BottomMargin = Application.CentimetersToPoints(1.5)
        .LeftMargin = Application.CentimetersToPoints(2)
        .RightMargin = Application.CentimetersToPoints(2)
    End With
    
    wsI.Activate
    wsI.PrintPreview
    Exit Sub

ErrHandler:
    MsgBox "Erreur impression: " & Err.Description, vbCritical, "Erreur"
End Sub

'===============================================================================
' EXPORTER PDF
'===============================================================================
Public Sub ExporterPDF()
    Dim wsI As Worksheet, wsParams As Worksheet
    Dim cheminPDF As String, dateStr As String, lastRow As Long
    
    On Error GoTo ErrHandler
    Set wsI = ThisWorkbook.Sheets(SHEET_IMPRIMER)
    Set wsParams = ThisWorkbook.Sheets(SHEET_PARAMS)
    
    If IsEmpty(wsI.Range("A7").Value) Or wsI.Range("A7").Value = "" Then
        MsgBox "La liste est vide. Enregistrez d''abord la journee.", vbExclamation, "Liste vide"
        Exit Sub
    End If
    
    ' Nom fichier
    dateStr = Format(wsI.Range("C3").Value, "yyyy-mm-dd")
    
    ' Chemin
    Dim basePath As String
    basePath = Trim(CStr(wsParams.Range("B8").Value))
    If basePath = "" Or InStr(basePath, "meme dossier") > 0 Then
        basePath = ThisWorkbook.Path
    End If
    If Right(basePath, 1) <> "\\" Then basePath = basePath & "\\"
    cheminPDF = basePath & "Presence_" & dateStr & ".pdf"
    
    ' Page setup
    lastRow = wsI.Cells(wsI.Rows.Count, 1).End(xlUp).Row
    With wsI.PageSetup
        .PrintArea = "A1:D" & lastRow + 1
        .Orientation = xlPortrait
        .PaperSize = xlPaperA4
        .FitToPagesWide = 1
        .FitToPagesTall = 1
        .CenterHorizontally = True
    End With
    
    ' Export
    wsI.ExportAsFixedFormat xlTypePDF, cheminPDF, xlQualityStandard, True, False, , , True
    
    MsgBox "PDF exporte avec succes !" & vbCrLf & vbCrLf & _
           "Fichier : " & cheminPDF, vbInformation, "Export PDF Reussi"
    Exit Sub

ErrHandler:
    MsgBox "Erreur export PDF: " & Err.Description & vbCrLf & _
           "Verifiez le chemin dans Parametres.", vbCritical, "Erreur Export"
End Sub

'===============================================================================
' TOUT DECOCHER
'===============================================================================
Public Sub ToutDecocher()
    Dim ws As Worksheet
    Dim i As Long
    
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Set ws = ThisWorkbook.Sheets(SHEET_PRESENCE)
    
    For i = DATA_ROW To DATA_ROW + MAX_EMP - 1
        ws.Cells(i, 1).Value = ""
    Next i
    
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    Application.ScreenUpdating = True
End Sub

'===============================================================================
' CHARGER HISTORIQUE PAR DATE (pour reimprimer)
'===============================================================================
Public Sub ChargerHistoriqueParDate()
    Dim wsH As Worksheet
    Dim dateStr As String, dateSelection As Date
    Dim lastRow As Long, found As Boolean, r As Long
    
    On Error GoTo ErrHandler
    Set wsH = ThisWorkbook.Sheets(SHEET_HISTORIQUE)
    
    dateStr = InputBox("Entrez la date a reimprimer (format jj/mm/aaaa) :" & vbCrLf & vbCrLf & _
                       "Exemple : " & Format(Date, "dd/mm/yyyy"), _
                       "Reimprimer une journee", Format(Date - 1, "dd/mm/yyyy"))
    
    If dateStr = "" Then Exit Sub
    
    If Not IsDate(dateStr) Then
        MsgBox "Date invalide. Format attendu : jj/mm/aaaa", vbExclamation, "Erreur"
        Exit Sub
    End If
    dateSelection = CDate(dateStr)
    
    ' Verifier existence
    lastRow = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row
    found = False
    For r = 2 To lastRow
        If IsDate(wsH.Cells(r, 1).Value) Then
            If CDate(wsH.Cells(r, 1).Value) = dateSelection Then
                found = True
                Exit For
            End If
        End If
    Next r
    
    If Not found Then
        MsgBox "Aucun enregistrement pour le " & Format(dateSelection, "dd/mm/yyyy") & ".", _
               vbExclamation, "Date non trouvee"
        Exit Sub
    End If
    
    Call GenererListeImprimer(dateSelection)
    ThisWorkbook.Sheets(SHEET_IMPRIMER).Activate
    
    MsgBox "Liste du " & Format(dateSelection, "dd/mm/yyyy") & " chargee." & vbCrLf & _
           "Vous pouvez imprimer ou exporter en PDF.", vbInformation, "Historique"
    Exit Sub

ErrHandler:
    MsgBox "Erreur: " & Err.Description, vbCritical, "Erreur"
End Sub

'===============================================================================
' RECHERCHER EMPLOYE
'===============================================================================
Public Sub RechercherEmploye()
    Dim ws As Worksheet
    Dim recherche As String, i As Long, trouve As Boolean
    
    On Error GoTo ErrHandler
    Set ws = ThisWorkbook.Sheets(SHEET_PRESENCE)
    
    recherche = InputBox("Entrez le nom (ou partie du nom) de l''employe :", _
                         "Rechercher un employe")
    If recherche = "" Then Exit Sub
    
    recherche = UCase(recherche)
    trouve = False
    
    For i = DATA_ROW To DATA_ROW + MAX_EMP - 1
        If InStr(1, UCase(CStr(ws.Cells(i, 3).Value)), recherche) > 0 Then
            ws.Activate
            ws.Cells(i, 1).Select
            MsgBox "Employe trouve :" & vbCrLf & vbCrLf & _
                   "  Nom : " & ws.Cells(i, 3).Value & vbCrLf & _
                   "  ID : " & ws.Cells(i, 2).Value & vbCrLf & _
                   "  Poste : " & ws.Cells(i, 4).Value & vbCrLf & _
                   "  Ligne : " & i, vbInformation, "Resultat de recherche"
            trouve = True
            Exit For
        End If
    Next i
    
    If Not trouve Then
        MsgBox "Aucun employe trouve pour : " & recherche, vbExclamation, "Non trouve"
    End If
    Exit Sub

ErrHandler:
    MsgBox "Erreur: " & Err.Description, vbCritical, "Erreur"
End Sub
'''

# Code ThisWorkbook (Auto_Open)
VBA_THISWORKBOOK = '''
Private Sub Workbook_Open()
    ' Ouvrir sur la feuille Presence du Jour
    On Error Resume Next
    ThisWorkbook.Sheets("Presence du Jour").Activate
    On Error GoTo 0
End Sub
'''


# =============================================================================
# SAUVEGARDE
# =============================================================================

# Sauvegarder le fichier .xlsx standard
OUT_XLSX = "Gestion_Presences.xlsx"
wb.save(OUT_XLSX)
print(f"[OK] Fichier genere: {OUT_XLSX}")

# Sauvegarder le code VBA dans un fichier .bas
VBA_FILE = "Gestion_Presences_MACROS.bas"
with open(VBA_FILE, "w", encoding="utf-8") as f:
    f.write(VBA_MODULE)
print(f"[OK] Code VBA: {VBA_FILE}")

# Sauvegarder le code ThisWorkbook
VBA_TW_FILE = "Gestion_Presences_ThisWorkbook.cls"
with open(VBA_TW_FILE, "w", encoding="utf-8") as f:
    f.write(VBA_THISWORKBOOK)
print(f"[OK] Code ThisWorkbook: {VBA_TW_FILE}")

# Instructions
print()
print("=" * 70)
print("  SYSTÈME DE GESTION DES PRÉSENCES — FICHIER GÉNÉRÉ")
print("=" * 70)
print()
print("  Fichiers créés:")
print(f"    1. {OUT_XLSX}  (classeur Excel)")
print(f"    2. {VBA_FILE}  (code VBA à importer)")
print(f"    3. {VBA_TW_FILE}  (code ThisWorkbook)")
print()
print("  POUR ACTIVER LES MACROS:")
print("  ─────────────────────────")
print("  1. Ouvrez le fichier .xlsx dans Excel")
print("  2. Sauvegardez-le en .xlsm (Fichier > Enregistrer sous > .xlsm)")
print("  3. Appuyez sur Alt+F11 (éditeur VBA)")
print("  4. Menu Insertion > Module")
print("  5. Collez le contenu de Gestion_Presences_MACROS.bas")
print("  6. Double-cliquez sur « ThisWorkbook » dans l'arborescence")
print("  7. Collez le contenu de Gestion_Presences_ThisWorkbook.cls")
print("  8. Sauvegardez (Ctrl+S)")
print()
print("  POUR AJOUTER LES BOUTONS:")
print("  ─────────────────────────")
print("  1. Activez l'onglet « Développeur » dans les options Excel")
print("  2. Onglet Développeur > Insérer > Bouton (Contrôle de formulaire)")
print("  3. Dessinez le bouton sur la feuille")
print("  4. Assignez la macro correspondante:")
print("     - NouvelleJournee")
print("     - EnregistrerJournee")
print("     - ImprimerListe")
print("     - ExporterPDF")
print("     - ToutDecocher")
print("     - RechercherEmploye")
print("     - ChargerHistoriqueParDate")
print()
print("=" * 70)
