# -*- coding: utf-8 -*-
"""
Configuration partagee du systeme de gestion des presences.

Ce module est l'unique source de verite pour la disposition du classeur :
noms d'onglets, noms de code (codeName VBA), positions des cellules,
colonnes des tableaux, plages nommees, couleurs, etc.

Il est importe a la fois par le generateur VBA (vba.py) et par le
constructeur du classeur openpyxl (workbook.py) afin de garantir que le
code et la mise en page restent parfaitement coherents.
"""

# --------------------------------------------------------------------------
# Onglets (noms visibles en francais) et codeName VBA (identifiants ASCII)
# --------------------------------------------------------------------------
TAB_ACCUEIL = "Accueil"
TAB_EMP = "Employés"
TAB_PRES = "Présence du Jour"
TAB_IMP = "Liste à imprimer"
TAB_HIST = "Historique"
TAB_PARAM = "Paramètres"
TAB_GUIDE = "Guide d'utilisation"

CN_ACCUEIL = "wsAccueil"
CN_EMP = "wsEmployes"
CN_PRES = "wsPresence"
CN_IMP = "wsImpression"
CN_HIST = "wsHistorique"
CN_PARAM = "wsParametres"
CN_GUIDE = "wsGuide"

# Ordre des feuilles dans le classeur (tab, codeName)
SHEETS = [
    (TAB_ACCUEIL, CN_ACCUEIL),
    (TAB_EMP, CN_EMP),
    (TAB_PRES, CN_PRES),
    (TAB_IMP, CN_IMP),
    (TAB_HIST, CN_HIST),
    (TAB_PARAM, CN_PARAM),
    (TAB_GUIDE, CN_GUIDE),
]

# --------------------------------------------------------------------------
# Symbole de pointage (coche). U+2714 = coche epaisse.
# VBA utilisera ChrW(10004). COUNTIF et le code doivent utiliser le meme.
# --------------------------------------------------------------------------
CHECK = "\u2714"          # ✔
CHECK_CODE = 10004        # ChrW(10004)

# Mot de passe de protection des feuilles (simple, connu du code VBA)
PROTECT_PW = "presence"

# --------------------------------------------------------------------------
# Palette de couleurs (design sobre et moderne)
# --------------------------------------------------------------------------
CLR_PRIMARY = "1F4E5F"      # bleu-vert fonce (bandeaux titres)
CLR_PRIMARY_LIGHT = "2E6E85"
CLR_ACCENT = "2E7D32"       # vert (present / valider)
CLR_ACCENT_DK = "1B5E20"
CLR_BLUE = "1565C0"         # bleu (actions secondaires)
CLR_GREY = "546E7A"         # gris (navigation)
CLR_ORANGE = "EF6C00"       # orange (imprimer / pdf)
CLR_RED = "C62828"          # rouge (tout decocher)
CLR_HEADER_BG = "1F4E5F"    # entete de tableau
CLR_HEADER_FG = "FFFFFF"
CLR_BAND = "EAF1F4"         # lignes alternees claires
CLR_PRESENT_BG = "D6EAD3"   # surlignage present (vert clair)
CLR_CARD_BG = "F4F7F9"
CLR_BORDER = "B7C4CC"
CLR_TITLE_FG = "FFFFFF"
CLR_TEXT = "20323C"
CLR_MUTED = "6B7A82"

FONT_NAME = "Calibri"

# ==========================================================================
#  Feuille EMPLOYÉS
# ==========================================================================
class Emp:
    TITLE_ROW = 2
    HEADER_ROW = 4
    FIRST_ROW = 5
    COL_ID = 2      # B
    COL_NOM = 3     # C
    COL_POSTE = 4   # D
    COL_EQUIPE = 5  # E
    COL_STATUT = 6  # F
    TABLE = "tblEmployes"
    HEADERS = ["ID Employé", "Nom et Prénom", "Poste", "Équipe", "Statut"]

# ==========================================================================
#  Feuille PRÉSENCE DU JOUR
#  Rangee 3 = bandeau de boutons (dessines par VBA, zone figee).
# ==========================================================================
class Pres:
    TITLE_ROW = 2
    BTN_ROW = 3            # bandeau de boutons (VBA)
    DATE_LBL = "B5"
    DATE_CELL = "C5"
    CHANTIER_LBL = "D5"
    CHANTIER_CELL = "E5"
    SEARCH_LBL = "B6"
    SEARCH_CELL = "C6"
    # Cartes indicateurs (libelle rangee 8, valeur rangee 9)
    KPI_LBL_ROW = 8
    KPI_VAL_ROW = 9
    KPI_ACTIF_LBL = "B8"
    KPI_ACTIF_VAL = "B9"
    KPI_PRES_LBL = "C8"
    KPI_PRES_VAL = "C9"
    KPI_ABS_LBL = "D8"
    KPI_ABS_VAL = "D9"
    # Zone liste (roster)
    HEADER_ROW = 11
    FIRST_ROW = 12
    MAX_ROW = 5011          # borne pour COUNTIF / mise en forme conditionnelle
    FREEZE = "A12"          # fige tout ce qui est au-dessus (titre, boutons, kpi, entete)
    COL_CHK = 2     # B  Présent
    COL_ID = 3      # C  ID
    COL_NOM = 4     # D  Nom et Prénom
    COL_POSTE = 5   # E  Poste
    HEADERS = ["Présent", "ID", "Nom et Prénom", "Poste"]

# ==========================================================================
#  Feuille LISTE À IMPRIMER  (A4 portrait)
#  Boutons dessines par VBA dans la colonne G (hors zone d'impression B:E).
# ==========================================================================
class Imp:
    ENT_ROW = 1        # nom entreprise
    TITLE_ROW = 2      # titre document
    DATE_LBL = "B4"
    DATE_CELL = "C4"   # selecteur de date
    CHANTIER_LBL = "D4"
    CHANTIER_CELL = "E4"
    HEADER_ROW = 6
    FIRST_ROW = 7
    MAX_ROW = 2000
    COL_NUM = 2     # B  N°
    COL_ID = 3      # C  ID
    COL_NOM = 4     # D  Nom et Prénom
    COL_POSTE = 5   # E  Poste
    HEADERS = ["N°", "ID", "Nom et Prénom", "Poste"]
    HELPER_COL = 10     # J : dates uniques (masquee) pour la liste deroulante

# ==========================================================================
#  Feuille HISTORIQUE
# ==========================================================================
class Hist:
    TITLE_ROW = 2
    HEADER_ROW = 4
    FIRST_ROW = 5
    COL_DATE = 2     # B
    COL_ID = 3       # C
    COL_NOM = 4      # D
    COL_POSTE = 5    # E
    COL_CHANTIER = 6 # F
    COL_PRESENT = 7  # G
    TABLE = "tblHistorique"
    HEADERS = ["Date", "ID", "Nom et Prénom", "Poste", "Chantier", "Présent"]

# ==========================================================================
#  Feuille PARAMÈTRES
# ==========================================================================
class Param:
    TITLE_ROW = 2
    LBL_COL = 2   # B
    VAL_COL = 3   # C (fusionnee C:E)
    # lignes (label, defined name, valeur par defaut)
    ROW_ENT = 4
    ROW_CHANTIER = 5
    ROW_TITRE = 6
    ROW_PDF = 7
    ROW_ORIENT = 8
    ROW_POINTAGE = 9
    LOGO_ROW = 11    # zone logo
    NAME_ENT = "param_Entreprise"
    NAME_CHANTIER = "param_Chantier"
    NAME_TITRE = "param_TitreImpression"
    NAME_PDF = "param_CheminPDF"
    NAME_ORIENT = "param_Orientation"
    DEF_ENT = "SOCIÉTÉ DE CONSTRUCTION"
    DEF_CHANTIER = "Chantier principal"
    DEF_TITRE = "FICHE DE PRÉSENCE JOURNALIÈRE"
    DEF_PDF = ""
    DEF_ORIENT = "Portrait"

# --------------------------------------------------------------------------
# Plages nommees (portee classeur) utilisees par formules ET par le VBA
# --------------------------------------------------------------------------
NAME_DATE_PRES = "rngDatePresence"
NAME_CHANTIER_PRES = "rngChantierPresence"
NAME_SEARCH_PRES = "rngRecherche"
NAME_DATE_IMP = "rngDateImpression"

# GUID des modules document
GUID_WORKBOOK = "{00020819-0000-0000-C000-000000000046}"
GUID_WORKSHEET = "{00020820-0000-0000-C000-000000000046}"

# Nom du fichier livre
OUTPUT_XLSM = "Gestion_Presence_Chantier.xlsm"


def col_letter(idx):
    """Convertit un index de colonne (1=A) en lettre."""
    s = ""
    while idx > 0:
        idx, r = divmod(idx - 1, 26)
        s = chr(65 + r) + s
    return s
