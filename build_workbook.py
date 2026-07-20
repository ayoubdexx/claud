"""
Génère Payroll_Management_System.xlsx : solution Excel professionnelle de
pointage, heures supplémentaires et paie pour une entreprise marocaine de BTP.
Aucune macro/VBA ; le classeur repose sur des formules, tableaux Excel, plages
nommées, validations, mise en forme conditionnelle et protection de feuilles.
"""

import datetime as dt

from xlsxgen import Chart, Workbook, col_letter

# ---------------------------------------------------------------------------
# Capacités et constantes
# ---------------------------------------------------------------------------
EMPLOYEE_CAPACITY = 300
CATEGORY_CAPACITY = 50
EMP_HEADER = 5
EMP_FIRST = EMP_HEADER + 1
EMP_LAST = EMP_FIRST + EMPLOYEE_CAPACITY - 1
ATT_HEADER_DATE = 5
ATT_HEADER_SUB = 6
ATT_FIRST = 7
ATT_LAST = ATT_FIRST + EMPLOYEE_CAPACITY - 1
PAY_HEADER = 6
PAY_FIRST = 7
PAY_LAST = PAY_FIRST + EMPLOYEE_CAPACITY - 1
CAT_HEADER = 13
CAT_FIRST = 14
CAT_LAST = CAT_FIRST + CATEGORY_CAPACITY - 1

FIRST_DAY_COL = 4                 # D
LAST_DAY_COL = FIRST_DAY_COL + 2 * 31 - 1  # BM
TOTAL_WORKED = LAST_DAY_COL + 1   # BN
TOTAL_ABSENT = LAST_DAY_COL + 2   # BO
TOTAL_LEAVE = LAST_DAY_COL + 3    # BP
TOTAL_SICK = LAST_DAY_COL + 4     # BQ
TOTAL_OT = LAST_DAY_COL + 5       # BR
TOTAL_EST = LAST_DAY_COL + 6      # BS

CL = col_letter

# ---------------------------------------------------------------------------
# Palette, formats et styles
# ---------------------------------------------------------------------------
NAVY = "FF17365D"
NAVY_2 = "FF244A73"
BLUE = "FF2F75B5"
BLUE_2 = "FF5B9BD5"
BLUE_LT = "FFDDEBF7"
TEAL = "FF1F8A8A"
TEAL_LT = "FFDDEFEF"
GREEN = "FF548235"
GREEN_2 = "FF70AD47"
GREEN_LT = "FFE2F0D9"
GOLD = "FFD6A100"
GOLD_LT = "FFFFF2CC"
ORANGE = "FFED7D31"
RED = "FFC00000"
RED_LT = "FFFCE4D6"
PURPLE = "FF7030A0"
GRAY = "FF7F8C8D"
GRAY_MD = "FFD9E1E8"
GRAY_LT = "FFF3F6F8"
GRAY_XL = "FFF8FAFC"
WHITE = "FFFFFFFF"
BLACK = "FF1F2933"

NUM = "#,##0"
DEC = "0.00"
MONEY = "#,##0.00"
DATE = "dd/mm/yyyy"
DAY_FMT = "ddd dd"
PCT = "0.0%"

wb = Workbook()
wb.title = "Gestion de la paie et du pointage"
wb.active_tab = 3


def border(*sides, style="thin", color=GRAY_MD):
    return {side: {"style": style, "color": color} for side in sides}


ALL = ("left", "right", "top", "bottom")
S = {}


def reg(name, spec):
    S[name] = wb.style(spec)
    return S[name]


# Navigation et titres
reg("nav", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": NAVY_2,
            "align": {"horizontal": "center", "vertical": "center", "wrap": True},
            "border": border(*ALL, color=WHITE)})
reg("nav_active", {"font": {"bold": True, "size": 9, "color": NAVY}, "fill": GOLD_LT,
                   "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                   "border": border(*ALL, color=GOLD)})
reg("title", {"font": {"bold": True, "size": 20, "color": WHITE}, "fill": NAVY,
              "align": {"horizontal": "left", "vertical": "center"}})
reg("title_center", {"font": {"bold": True, "size": 20, "color": WHITE}, "fill": NAVY,
                     "align": {"horizontal": "center", "vertical": "center"}})
reg("subtitle", {"font": {"size": 10, "italic": True, "color": WHITE}, "fill": NAVY_2,
                 "align": {"horizontal": "left", "vertical": "center"}})
reg("section", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": BLUE,
                "align": {"horizontal": "left", "vertical": "center"},
                "border": border(*ALL, color=WHITE)})
reg("section_teal", {"font": {"bold": True, "size": 11, "color": WHITE}, "fill": TEAL,
                     "align": {"horizontal": "left", "vertical": "center"},
                     "border": border(*ALL, color=WHITE)})
reg("logo", {"font": {"bold": True, "size": 13, "color": GRAY}, "fill": GRAY_LT,
             "align": {"horizontal": "center", "vertical": "center", "wrap": True},
             "border": border(*ALL, style="medium", color=GRAY_MD), "locked": False})

# En-têtes et cellules
reg("hdr", {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": NAVY,
            "align": {"horizontal": "center", "vertical": "center", "wrap": True},
            "border": border(*ALL, color=WHITE)})
reg("hdr_blue", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": BLUE,
                 "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                 "border": border(*ALL, color=WHITE)})
reg("hdr_green", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": GREEN_2,
                  "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                  "border": border(*ALL, color=WHITE)})
reg("hdr_gold", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": GOLD,
                 "align": {"horizontal": "center", "vertical": "center", "wrap": True},
                 "border": border(*ALL, color=WHITE)})
reg("subhdr", {"font": {"bold": True, "size": 8, "color": NAVY}, "fill": GRAY_LT,
               "align": {"horizontal": "center", "vertical": "center", "wrap": True},
               "border": border(*ALL)})
reg("label", {"font": {"bold": True, "size": 10, "color": NAVY}, "fill": GRAY_LT,
              "align": {"horizontal": "left", "vertical": "center"},
              "border": border(*ALL)})
reg("input", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
              "align": {"vertical": "center"}})
reg("input_center", {"fill": GOLD_LT, "locked": False, "border": border(*ALL),
                     "align": {"horizontal": "center", "vertical": "center"}})
reg("input_date", {"fill": GOLD_LT, "locked": False, "border": border(*ALL), "numfmt": DATE,
                   "align": {"horizontal": "center", "vertical": "center"}})
reg("input_money", {"fill": GOLD_LT, "locked": False, "border": border(*ALL), "numfmt": MONEY,
                    "align": {"horizontal": "right", "vertical": "center"}})
reg("formula", {"fill": WHITE, "border": border(*ALL),
                "align": {"vertical": "center"}})
reg("formula_center", {"fill": WHITE, "border": border(*ALL),
                       "align": {"horizontal": "center", "vertical": "center"}})
reg("formula_date", {"fill": WHITE, "border": border(*ALL), "numfmt": DATE,
                     "align": {"horizontal": "center", "vertical": "center"}})
reg("formula_int", {"fill": GREEN_LT, "border": border(*ALL), "numfmt": NUM,
                    "align": {"horizontal": "center", "vertical": "center"}})
reg("formula_dec", {"fill": GREEN_LT, "border": border(*ALL), "numfmt": DEC,
                    "align": {"horizontal": "center", "vertical": "center"}})
reg("formula_money", {"fill": GREEN_LT, "border": border(*ALL), "numfmt": MONEY,
                      "align": {"horizontal": "right", "vertical": "center"}})
reg("formula_total", {"font": {"bold": True, "color": NAVY}, "fill": BLUE_LT,
                      "border": border(*ALL), "numfmt": MONEY,
                      "align": {"horizontal": "right", "vertical": "center"}})
reg("day_status", {"locked": False, "border": border(*ALL),
                   "align": {"horizontal": "center", "vertical": "center"}})
reg("day_ot", {"locked": False, "fill": BLUE_LT, "border": border(*ALL), "numfmt": DEC,
               "align": {"horizontal": "center", "vertical": "center"}})
reg("date_header", {"font": {"bold": True, "size": 9, "color": WHITE}, "fill": BLUE,
                    "numfmt": DAY_FMT,
                    "align": {"horizontal": "center", "vertical": "center"},
                    "border": border(*ALL, color=WHITE)})
reg("helper", {"font": {"size": 8, "color": WHITE}, "fill": WHITE})
reg("note", {"font": {"size": 9, "italic": True, "color": GRAY},
             "align": {"vertical": "center", "wrap": True}})

# Cartes et impression
reg("card_label", {"font": {"bold": True, "size": 10, "color": WHITE}, "fill": BLUE,
                   "align": {"horizontal": "center", "vertical": "center"},
                   "border": border(*ALL, color=WHITE)})
reg("card_value_int", {"font": {"bold": True, "size": 21, "color": NAVY}, "fill": GRAY_XL,
                       "numfmt": NUM, "align": {"horizontal": "center", "vertical": "center"},
                       "border": border(*ALL, color=GRAY_MD)})
reg("card_value_dec", {"font": {"bold": True, "size": 20, "color": NAVY}, "fill": GRAY_XL,
                       "numfmt": DEC, "align": {"horizontal": "center", "vertical": "center"},
                       "border": border(*ALL, color=GRAY_MD)})
reg("card_value_money", {"font": {"bold": True, "size": 17, "color": NAVY}, "fill": GRAY_XL,
                         "numfmt": MONEY, "align": {"horizontal": "center", "vertical": "center"},
                         "border": border(*ALL, color=GRAY_MD)})
reg("search_value", {"font": {"bold": True, "size": 11, "color": BLACK}, "fill": WHITE,
                     "border": border(*ALL), "align": {"vertical": "center"}})
reg("search_money", {"font": {"bold": True, "size": 11, "color": NAVY}, "fill": GREEN_LT,
                     "border": border(*ALL), "numfmt": MONEY,
                     "align": {"horizontal": "right", "vertical": "center"}})
reg("big_total_label", {"font": {"bold": True, "size": 13, "color": WHITE}, "fill": GOLD,
                        "align": {"horizontal": "center", "vertical": "center"},
                        "border": border(*ALL, color=WHITE)})
reg("big_total_value", {"font": {"bold": True, "size": 18, "color": NAVY}, "fill": GOLD_LT,
                        "numfmt": MONEY, "align": {"horizontal": "center", "vertical": "center"},
                        "border": border(*ALL, color=GOLD)})
reg("signature", {"font": {"size": 9, "color": GRAY},
                  "align": {"horizontal": "center", "vertical": "top"},
                  "border": border("top", style="medium", color=NAVY)})

# Formats différentiels
present_dxf = wb.dxf({"fill": "FFC6EFCE", "font": {"color": "FF006100", "bold": True}})
absent_dxf = wb.dxf({"fill": "FFFFC7CE", "font": {"color": "FF9C0006", "bold": True}})
leave_dxf = wb.dxf({"fill": "FFDDEBF7", "font": {"color": NAVY, "bold": True}})
sick_dxf = wb.dxf({"fill": "FFE4DFEC", "font": {"color": PURPLE, "bold": True}})
ot_dxf = wb.dxf({"fill": "FFFFEB9C", "font": {"color": "FF9C6500", "bold": True}})
inactive_dxf = wb.dxf({"fill": RED_LT, "font": {"color": RED}})
active_dxf = wb.dxf({"fill": GREEN_LT, "font": {"color": GREEN}})
invalid_day_dxf = wb.dxf({"fill": "FFE7E6E6", "font": {"color": GRAY}})
weekend_dxf = wb.dxf({"fill": "FF9EADBA", "font": {"color": WHITE, "bold": True}})
negative_dxf = wb.dxf({"fill": "FFFFC7CE", "font": {"color": RED, "bold": True}})
banding_dxf = wb.dxf({"fill": GRAY_XL})

SHEET_NAMES = ["PARAMÈTRES", "EMPLOYÉS", "POINTAGE", "TABLEAU DE BORD", "RECHERCHE",
               "PAIE (15 Jours)", "IMPRESSION"]
NAV_LABELS = ["⚙ PARAMÈTRES", "👥 EMPLOYÉS", "✓ POINTAGE", "▦ TABLEAU DE BORD",
              "⌕ RECHERCHE", "MAD PAIE", "▤ IMPRESSION"]


def navigation(sheet, current):
    """Barre de navigation interne, utilisable sans VBA."""
    sheet.set_row(1, 23)
    for col, (name, label) in enumerate(zip(SHEET_NAMES, NAV_LABELS), start=1):
        display = label if sheet.col_widths.get(col, 14) >= 9 else label.split(" ", 1)[0]
        sheet.write(1, col, display, S["nav_active"] if name == current else S["nav"])
        sheet.add_hyperlink(f"{CL(col)}1", f"'{name}'!A1", display)


def title_block(sheet, title, subtitle, last_col):
    navigation(sheet, sheet.name)
    sheet.merge(f"A2:{CL(last_col)}2")
    sheet.cell("A2", "  " + title, S["title"])
    sheet.set_row(2, 34)
    sheet.merge(f"A3:{CL(last_col)}3")
    sheet.cell("A3", "  " + subtitle, S["subtitle"])
    sheet.set_row(3, 18)
    sheet.show_gridlines = False


def lookup_category(category_ref, result_range, fallback="0"):
    return f'IFERROR(INDEX({result_range},MATCH({category_ref},ListeCategories,0)),{fallback})'


def day_status_col(day):
    return FIRST_DAY_COL + 2 * (day - 1)


def day_ot_col(day):
    return day_status_col(day) + 1


def status_total_formula(row, days, status, sheet_prefix=""):
    terms = []
    prefix = sheet_prefix
    for day in days:
        c = CL(day_status_col(day))
        terms.append(f'IF({prefix}${c}${ATT_HEADER_DATE}<>"",--({prefix}{c}{row}="{status}"),0)')
    return "SUM(" + ",".join(terms) + ")"


def ot_total_formula(row, days, sheet_prefix=""):
    terms = []
    prefix = sheet_prefix
    for day in days:
        sc = CL(day_status_col(day))
        oc = CL(day_ot_col(day))
        terms.append(f'IF({prefix}${sc}${ATT_HEADER_DATE}<>"",IF({prefix}{sc}{row}="Présent",{prefix}{oc}{row},0),0)')
    return "SUM(" + ",".join(terms) + ")"


# ---------------------------------------------------------------------------
# 1. PARAMÈTRES
# ---------------------------------------------------------------------------
settings = wb.add_sheet("PARAMÈTRES")
settings.tab_color = NAVY
for c, w in enumerate([23, 24, 4, 23, 24, 4, 14, 14, 14, 14], start=1):
    settings.set_col(c, w)
title_block(settings, "PARAMÈTRES DE L’ENTREPRISE",
            "Toutes les données jaunes sont modifiables ; les calculs des autres feuilles s’adaptent automatiquement.", 10)

# Informations entreprise
settings.merge("A4:F4"); settings.cell("A4", "  IDENTITÉ ET COORDONNÉES", S["section"])
settings.cell("A5", "Nom de l’entreprise", S["label"]); settings.merge("B5:F5")
settings.cell("B5", "Société BTP Exemple SARL", S["input"])
settings.cell("A6", "Adresse", S["label"]); settings.merge("B6:F6")
settings.cell("B6", "Adresse de l’entreprise, Maroc", S["input"])
settings.cell("A7", "Téléphone", S["label"]); settings.merge("B7:C7"); settings.cell("B7", "05 00 00 00 00", S["input_center"])
settings.cell("D7", "E-mail", S["label"]); settings.merge("E7:F7"); settings.cell("E7", "contact@exemple.ma", S["input"])
settings.merge("H4:J7"); settings.cell("H4", "LOGO\n(à insérer si souhaité)", S["logo"])

# Paramètres de paie
settings.merge("A9:F9"); settings.cell("A9", "  PÉRIODE ET RÈGLES DE PAIE", S["section_teal"])
settings.cell("A10", "Année en cours", S["label"]); settings.cell("B10", 2026, S["input_center"])
settings.cell("D10", "Mois (1 à 12)", S["label"]); settings.cell("E10", 7, S["input_center"])
settings.cell("A11", "Période de paie (jours)", S["label"]); settings.cell("B11", 15, S["formula_center"])
settings.cell("D11", "Devise", S["label"]); settings.cell("E11", "MAD", S["input_center"])
settings.cell("A12", "Heures de travail / jour", S["label"]); settings.cell("B12", 8, S["input_center"])
settings.cell("D12", "Taux HS par défaut", S["label"]); settings.cell("E12", 18.75, S["input_money"])
settings.cell("G10", "Budget de paie mensuel", S["label"]); settings.merge("H10:J10"); settings.cell("H10", 100000, S["input_money"])
settings.cell("G11", "Mois sélectionné", S["label"]); settings.merge("H11:J11")
settings.write(11, 8, None, S["formula_center"],
               formula='CHOOSE(MoisCourant,"Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre")&" "&AnneeCourante')
settings.merge("G12:J12"); settings.cell("G12", "Les taux de catégorie remplacent le taux HS par défaut.", S["note"])
settings.add_number_validation("B10", "between", "2020", "2100")
settings.add_list_validation("E10", '"1,2,3,4,5,6,7,8,9,10,11,12"', allow_blank=False)
settings.add_number_validation("B12", "greaterThan", "0", decimal=True)
settings.add_number_validation("E12", "greaterThanOrEqual", "0", decimal=True)
settings.add_number_validation("H10", "greaterThanOrEqual", "0", decimal=True)

# Tableau catégories
settings.cell(f"A{CAT_HEADER}", "Catégorie", S["hdr"])
settings.cell(f"B{CAT_HEADER}", "Salaire journalier", S["hdr"])
settings.cell(f"C{CAT_HEADER}", "Taux horaire HS", S["hdr"])
settings.merge(f"D{CAT_HEADER}:J{CAT_HEADER}")
settings.cell(f"D{CAT_HEADER}", "Ajoutez ou modifiez les catégories dans les lignes jaunes ; les listes déroulantes se mettent à jour.", S["note"])
settings.merge("D14:J16")
settings.cell("D14", "IMPORTANT — Ce fichier représente un mois de paie. Avant de changer de mois, enregistrez une copie d’archive puis effacez les anciennes saisies de POINTAGE. Sans VBA, Excel ne peut pas effacer automatiquement les données saisies.", S["note"])
category_seed = [
    ("Ouvrier", 150.00, 23.44),
    ("Manœuvre", 120.00, 18.75),
    ("Chef d'équipe", 220.00, 34.38),
    ("Conducteur d'engins", 250.00, 39.06),
    ("Maçon", 180.00, 28.13),
    ("Coffreur", 185.00, 28.91),
    ("Ferrailleur", 190.00, 29.69),
    ("Électricien", 210.00, 32.81),
]
for r in range(CAT_FIRST, CAT_LAST + 1):
    settings.write(r, 1, None, S["input"])
    settings.write(r, 2, None, S["input_money"])
    settings.write(r, 3, None, S["input_money"])
for offset, rec in enumerate(category_seed):
    r = CAT_FIRST + offset
    settings.write(r, 1, rec[0], S["input"])
    settings.write(r, 2, rec[1], S["input_money"])
    settings.write(r, 3, rec[2], S["input_money"])
settings.add_number_validation(f"B{CAT_FIRST}:C{CAT_LAST}", "greaterThanOrEqual", "0", decimal=True)
settings.add_table(f"A{CAT_HEADER}:C{CAT_LAST}", "tblCategories",
                   ["Catégorie", "Salaire journalier", "Taux horaire HS"], "TableStyleMedium2")
settings.freeze_panes(13, 0)
settings.protect = True
settings.setup_page(orientation="portrait", fit_width=1, fit_height=1)
settings.set_print_area(f"$A$1:$J${CAT_FIRST + len(category_seed) + 2}")

# Noms globaux de configuration
wb.define_name("NomSociete", "'PARAMÈTRES'!$B$5")
wb.define_name("AdresseSociete", "'PARAMÈTRES'!$B$6")
wb.define_name("TelephoneSociete", "'PARAMÈTRES'!$B$7")
wb.define_name("EmailSociete", "'PARAMÈTRES'!$E$7")
wb.define_name("AnneeCourante", "'PARAMÈTRES'!$B$10")
wb.define_name("MoisCourant", "'PARAMÈTRES'!$E$10")
wb.define_name("PeriodePaie", "'PARAMÈTRES'!$B$11")
wb.define_name("Devise", "'PARAMÈTRES'!$E$11")
wb.define_name("HeuresJour", "'PARAMÈTRES'!$B$12")
wb.define_name("TauxHSDefaut", "'PARAMÈTRES'!$E$12")
wb.define_name("BudgetPaie", "'PARAMÈTRES'!$H$10")
wb.define_name("MoisLibelle", "'PARAMÈTRES'!$H$11")
wb.define_name("ListeCategories", "tblCategories[Catégorie]")
wb.define_name("Categories_Salaire", "tblCategories[Salaire journalier]")
wb.define_name("Categories_TauxHS", "tblCategories[Taux horaire HS]")

# ---------------------------------------------------------------------------
# 2. EMPLOYÉS
# ---------------------------------------------------------------------------
employees = wb.add_sheet("EMPLOYÉS")
employees.tab_color = BLUE
for c, w in enumerate([16, 28, 24, 16, 13, 17, 38], start=1):
    employees.set_col(c, w)
title_block(employees, "BASE DES EMPLOYÉS",
            "Saisissez le nom : l’identifiant est créé automatiquement. Une ligne correspond à un matricule ; le tri reste désactivé par protection.", 7)
headers_emp = ["ID employé", "Nom complet", "Catégorie", "Date d'embauche", "Statut", "Téléphone", "Notes"]
for c, h in enumerate(headers_emp, start=1):
    employees.write(EMP_HEADER, c, h, S["hdr"])
employees.set_row(EMP_HEADER, 28)
for r in range(EMP_FIRST, EMP_LAST + 1):
    employees.write(r, 1, None, S["formula_center"], formula=f'IF($B{r}="","","EMP-"&TEXT(ROW()-{EMP_HEADER},"0000"))')
    employees.write(r, 2, None, S["input"])
    employees.write(r, 3, None, S["input"])
    employees.write(r, 4, None, S["input_date"])
    employees.write(r, 5, None, S["input_center"])
    employees.write(r, 6, None, S["input_center"])
    employees.write(r, 7, None, S["input"])

# Exemples génériques clairement identifiés
employee_seed = [
    ("Employé Exemple 01", "Ouvrier", dt.date(2025, 1, 15), "Actif", "06 00 00 00 01", "Exemple à remplacer"),
    ("Employé Exemple 02", "Manœuvre", dt.date(2025, 3, 1), "Actif", "06 00 00 00 02", "Exemple à remplacer"),
    ("Employé Exemple 03", "Chef d'équipe", dt.date(2024, 9, 10), "Actif", "06 00 00 00 03", "Exemple à remplacer"),
]
for offset, rec in enumerate(employee_seed):
    r = EMP_FIRST + offset
    for c, value in enumerate(rec, start=2):
        style = [S["input"], S["input"], S["input_date"], S["input_center"], S["input_center"], S["input"]][c - 2]
        employees.write(r, c, value, style)

employees.add_list_validation(f"C{EMP_FIRST}:C{EMP_LAST}", "ListeCategories")
employees.add_list_validation(f"E{EMP_FIRST}:E{EMP_LAST}", '"Actif,Inactif"')
employees.add_cond_expr(f"E{EMP_FIRST}:E{EMP_LAST}", f'$E{EMP_FIRST}="Actif"', active_dxf, 1)
employees.add_cond_expr(f"E{EMP_FIRST}:E{EMP_LAST}", f'$E{EMP_FIRST}="Inactif"', inactive_dxf, 2)
employees.add_table(f"A{EMP_HEADER}:G{EMP_LAST}", "tblEmployes", headers_emp, "TableStyleMedium2")
employees.freeze_panes(EMP_HEADER, 1)
employees.protect = True
employees.setup_page(orientation="landscape", fit_width=1, fit_height=0)
employees.set_print_area(f"$A$1:$G${EMP_LAST}")

wb.define_name("Employes_ID", f"'EMPLOYÉS'!$A${EMP_FIRST}:$A${EMP_LAST}")
wb.define_name("Employes_Nom", f"'EMPLOYÉS'!$B${EMP_FIRST}:$B${EMP_LAST}")
wb.define_name("Employes_Categorie", f"'EMPLOYÉS'!$C${EMP_FIRST}:$C${EMP_LAST}")
wb.define_name("Employes_Embauche", f"'EMPLOYÉS'!$D${EMP_FIRST}:$D${EMP_LAST}")
wb.define_name("Employes_Statut", f"'EMPLOYÉS'!$E${EMP_FIRST}:$E${EMP_LAST}")
wb.define_name("Employes_Telephone", f"'EMPLOYÉS'!$F${EMP_FIRST}:$F${EMP_LAST}")
wb.define_name("Employes_Notes", f"'EMPLOYÉS'!$G${EMP_FIRST}:$G${EMP_LAST}")

# ---------------------------------------------------------------------------
# 3. POINTAGE
# ---------------------------------------------------------------------------
attendance = wb.add_sheet("POINTAGE")
attendance.tab_color = TEAL
attendance.set_col(1, 16); attendance.set_col(2, 27); attendance.set_col(3, 22)
for day in range(1, 32):
    attendance.set_col(day_status_col(day), 9.5)
    attendance.set_col(day_ot_col(day), 6)
for c, w in [(TOTAL_WORKED, 11), (TOTAL_ABSENT, 10), (TOTAL_LEAVE, 9),
             (TOTAL_SICK, 9), (TOTAL_OT, 9), (TOTAL_EST, 16)]:
    attendance.set_col(c, w)
title_block(attendance, "POINTAGE MENSUEL ET HEURES SUPPLÉMENTAIRES",
            "Choisissez Présent, Absent, Congé ou Maladie ; saisissez les heures supplémentaires dans la colonne HS.", TOTAL_EST)

attendance.merge(f"A{ATT_HEADER_DATE}:A{ATT_HEADER_SUB}"); attendance.cell(f"A{ATT_HEADER_DATE}", "ID employé", S["hdr"])
attendance.merge(f"B{ATT_HEADER_DATE}:B{ATT_HEADER_SUB}"); attendance.cell(f"B{ATT_HEADER_DATE}", "Nom complet", S["hdr"])
attendance.merge(f"C{ATT_HEADER_DATE}:C{ATT_HEADER_SUB}"); attendance.cell(f"C{ATT_HEADER_DATE}", "Catégorie", S["hdr"])
for day in range(1, 32):
    sc = day_status_col(day); oc = day_ot_col(day)
    attendance.merge(f"{CL(sc)}{ATT_HEADER_DATE}:{CL(oc)}{ATT_HEADER_DATE}")
    attendance.write(ATT_HEADER_DATE, sc, None, S["date_header"],
                     formula=f'IF({day}<=DAY(EOMONTH(DATE(AnneeCourante,MoisCourant,1),0)),DATE(AnneeCourante,MoisCourant,{day}),"")')
    attendance.write(ATT_HEADER_SUB, sc, "Statut", S["subhdr"])
    attendance.write(ATT_HEADER_SUB, oc, "HS", S["subhdr"])

attendance.merge(f"{CL(TOTAL_WORKED)}{ATT_HEADER_DATE}:{CL(TOTAL_EST)}{ATT_HEADER_DATE}")
attendance.write(ATT_HEADER_DATE, TOTAL_WORKED, "SYNTHÈSE DU MOIS", S["hdr_gold"])
summary_headers = ["Jours travaillés", "Absences", "Congés", "Maladies", "Heures HS", "Salaire estimé"]
for c, text in enumerate(summary_headers, start=TOTAL_WORKED):
    attendance.write(ATT_HEADER_SUB, c, text, S["hdr_gold"])
attendance.set_row(ATT_HEADER_DATE, 23); attendance.set_row(ATT_HEADER_SUB, 28)

for r in range(ATT_FIRST, ATT_LAST + 1):
    n = r - ATT_FIRST + 1
    id_formula = (f'IF(AND(INDEX(Employes_Nom,{n})<>"",INDEX(Employes_Statut,{n})="Actif",'
                  f'OR(INDEX(Employes_Embauche,{n})="",INDEX(Employes_Embauche,{n})<=EOMONTH(DATE(AnneeCourante,MoisCourant,1),0))),'
                  f'INDEX(Employes_ID,{n}),"")')
    attendance.write(r, 1, None, S["formula_center"], formula=id_formula)
    attendance.write(r, 2, None, S["formula"],
                     formula=f'IF($A{r}="","",INDEX(Employes_Nom,MATCH($A{r},Employes_ID,0)))')
    attendance.write(r, 3, None, S["formula_center"],
                     formula=f'IF($A{r}="","",INDEX(Employes_Categorie,MATCH($A{r},Employes_ID,0)))')
    for day in range(1, 32):
        attendance.write(r, day_status_col(day), None, S["day_status"])
        attendance.write(r, day_ot_col(day), None, S["day_ot"])
    attendance.write(r, TOTAL_WORKED, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(r, range(1, 32), "Présent")})')
    attendance.write(r, TOTAL_ABSENT, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(r, range(1, 32), "Absent")})')
    attendance.write(r, TOTAL_LEAVE, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(r, range(1, 32), "Congé")})')
    attendance.write(r, TOTAL_SICK, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(r, range(1, 32), "Maladie")})')
    attendance.write(r, TOTAL_OT, None, S["formula_dec"], formula=f'IF($A{r}="","",{ot_total_formula(r, range(1, 32))})')
    wage = lookup_category(f"$C{r}", "Categories_Salaire")
    rate = f'IF({lookup_category(f"$C{r}", "Categories_TauxHS")}>0,{lookup_category(f"$C{r}", "Categories_TauxHS")},TauxHSDefaut)'
    attendance.write(r, TOTAL_EST, None, S["formula_total"],
                     formula=f'IF($A{r}="","",${CL(TOTAL_WORKED)}{r}*{wage}+${CL(TOTAL_OT)}{r}*{rate})')

status_sqref = " ".join(f"{CL(day_status_col(d))}{ATT_FIRST}:{CL(day_status_col(d))}{ATT_LAST}" for d in range(1, 32))
ot_sqref = " ".join(f"{CL(day_ot_col(d))}{ATT_FIRST}:{CL(day_ot_col(d))}{ATT_LAST}" for d in range(1, 32))
attendance.add_list_validation(status_sqref, '"Présent,Absent,Congé,Maladie"')
attendance.add_number_validation(ot_sqref, "greaterThanOrEqual", "0", decimal=True)
attendance.add_cond_cellis(status_sqref, "equal", '"Présent"', present_dxf, 2)
attendance.add_cond_cellis(status_sqref, "equal", '"Absent"', absent_dxf, 3)
attendance.add_cond_cellis(status_sqref, "equal", '"Congé"', leave_dxf, 4)
attendance.add_cond_cellis(status_sqref, "equal", '"Maladie"', sick_dxf, 5)
attendance.add_cond_cellis(ot_sqref, "greaterThan", "0", ot_dxf, 6)
for day in range(1, 32):
    sc = CL(day_status_col(day)); oc = CL(day_ot_col(day))
    attendance.add_cond_expr(f"{sc}{ATT_FIRST}:{oc}{ATT_LAST}", f'{sc}${ATT_HEADER_DATE}=""', invalid_day_dxf, 1)
    attendance.add_cond_expr(f"{oc}{ATT_FIRST}:{oc}{ATT_LAST}",
                             f'AND({oc}{ATT_FIRST}>0,{sc}{ATT_FIRST}<>"Présent")', absent_dxf, 2)
    attendance.add_cond_expr(f"{sc}{ATT_HEADER_DATE}:{oc}{ATT_HEADER_SUB}",
                             f'AND({sc}${ATT_HEADER_DATE}<>"",WEEKDAY({sc}${ATT_HEADER_DATE},2)>5)', weekend_dxf, 8)
attendance.add_cond_expr(f"A{ATT_FIRST}:C{ATT_LAST}", "MOD(ROW(),2)=0", banding_dxf, 10)
attendance.freeze_panes(ATT_HEADER_SUB, 3)
attendance.protect = True
attendance.setup_page(orientation="landscape", fit_width=1, fit_height=0)
attendance.set_print_area(f"$A$1:${CL(TOTAL_EST)}${ATT_LAST}")

wb.define_name("Pointage_ID", f"'POINTAGE'!$A${ATT_FIRST}:$A${ATT_LAST}")
wb.define_name("Pointage_Nom", f"'POINTAGE'!$B${ATT_FIRST}:$B${ATT_LAST}")
wb.define_name("Pointage_Categorie", f"'POINTAGE'!$C${ATT_FIRST}:$C${ATT_LAST}")
wb.define_name("Pointage_Travailles", f"'POINTAGE'!${CL(TOTAL_WORKED)}${ATT_FIRST}:${CL(TOTAL_WORKED)}${ATT_LAST}")
wb.define_name("Pointage_Absences", f"'POINTAGE'!${CL(TOTAL_ABSENT)}${ATT_FIRST}:${CL(TOTAL_ABSENT)}${ATT_LAST}")
wb.define_name("Pointage_Conges", f"'POINTAGE'!${CL(TOTAL_LEAVE)}${ATT_FIRST}:${CL(TOTAL_LEAVE)}${ATT_LAST}")
wb.define_name("Pointage_Maladies", f"'POINTAGE'!${CL(TOTAL_SICK)}${ATT_FIRST}:${CL(TOTAL_SICK)}${ATT_LAST}")
wb.define_name("Pointage_HS", f"'POINTAGE'!${CL(TOTAL_OT)}${ATT_FIRST}:${CL(TOTAL_OT)}${ATT_LAST}")
wb.define_name("Pointage_Estime", f"'POINTAGE'!${CL(TOTAL_EST)}${ATT_FIRST}:${CL(TOTAL_EST)}${ATT_LAST}")

# ---------------------------------------------------------------------------
# 4. TABLEAU DE BORD
# ---------------------------------------------------------------------------
dashboard = wb.add_sheet("TABLEAU DE BORD")
dashboard.tab_color = NAVY
for c in range(1, 14):
    dashboard.set_col(c, 13)
title_block(dashboard, "TABLEAU DE BORD RH & PAIE",
            "Indicateurs en temps réel pour la période sélectionnée dans PARAMÈTRES.", 13)

kpis = [
    ("TOTAL EMPLOYÉS ACTIFS", 'COUNTIF(Employes_Statut,"Actif")', "card_value_int", BLUE),
    ("PRÉSENTS AUJOURD’HUI", 'IF(AND(AnneeCourante=YEAR(TODAY()),MoisCourant=MONTH(TODAY())),SUMPRODUCT(--(INDEX(\'POINTAGE\'!$D$7:$BM$306,0,2*DAY(TODAY())-1)="Présent")),0)', "card_value_int", GREEN_2),
    ("ABSENTS AUJOURD’HUI", 'IF(AND(AnneeCourante=YEAR(TODAY()),MoisCourant=MONTH(TODAY())),SUMPRODUCT(--(INDEX(\'POINTAGE\'!$D$7:$BM$306,0,2*DAY(TODAY())-1)="Absent")),0)', "card_value_int", RED),
    ("TOTAL HEURES HS", "SUM(Pointage_HS)", "card_value_dec", ORANGE),
    ("PAIE ESTIMÉE", "SUM(Paie_NetMensuel)", "card_value_money", TEAL),
    ("PAIE RESTANTE", "BudgetPaie-SUM(Paie_NetMensuel)", "card_value_money", GOLD),
]
positions = [(2, 4), (5, 7), (8, 10), (2, 4), (5, 7), (8, 10)]
for i, (label_text, formula, value_style, color) in enumerate(kpis):
    base_row = 5 if i < 3 else 9
    c1, c2 = positions[i]
    label_style = wb.style({"font": {"bold": True, "size": 10, "color": WHITE}, "fill": color,
                            "align": {"horizontal": "center", "vertical": "center"},
                            "border": border(*ALL, color=WHITE)})
    dashboard.merge(f"{CL(c1)}{base_row}:{CL(c2)}{base_row}")
    dashboard.write(base_row, c1, label_text, label_style); dashboard.set_row(base_row, 21)
    dashboard.merge(f"{CL(c1)}{base_row + 1}:{CL(c2)}{base_row + 2}")
    dashboard.write(base_row + 1, c1, None, S[value_style], formula=formula)
    dashboard.set_row(base_row + 1, 24); dashboard.set_row(base_row + 2, 24)
dashboard.add_cond_cellis("H10:J11", "lessThan", "0", negative_dxf, 1)

# Tables auxiliaires hors zone d'impression
helper_hdr = wb.style({"font": {"bold": True, "color": NAVY}, "fill": GRAY_LT,
                       "border": border(*ALL), "align": {"horizontal": "center"}})
helper_num = wb.style({"numfmt": NUM, "border": border(*ALL)})
helper_money = wb.style({"numfmt": MONEY, "border": border(*ALL)})

# Répartition des statuts
for c, value in [(16, "Statut"), (17, "Nombre")]: dashboard.write(1, c, value, helper_hdr)
status_helpers = [("Présent", "SUM(Pointage_Travailles)"), ("Absent", "SUM(Pointage_Absences)"),
                  ("Congé", "SUM(Pointage_Conges)"), ("Maladie", "SUM(Pointage_Maladies)")]
for i, (label_text, formula) in enumerate(status_helpers, start=2):
    dashboard.write(i, 16, label_text, S["formula"]); dashboard.write(i, 17, None, helper_num, formula=formula)

# Employés par catégorie
for c, value in [(19, "Catégorie"), (20, "Employés")]: dashboard.write(1, c, value, helper_hdr)
for i in range(CATEGORY_CAPACITY):
    r = 2 + i
    dashboard.write(r, 19, None, S["formula"], formula=f'IFERROR(INDEX(ListeCategories,{i + 1}),"")')
    dashboard.write(r, 20, None, helper_num,
                    formula=f'IF(S{r}="",0,COUNTIFS(Employes_Categorie,S{r},Employes_Statut,"Actif"))')

# HS par catégorie
for c, value in [(16, "Catégorie"), (17, "Heures HS")]: dashboard.write(9, c, value, helper_hdr)
for i in range(CATEGORY_CAPACITY):
    r = 10 + i
    dashboard.write(r, 16, None, S["formula"], formula=f'IFERROR(INDEX(ListeCategories,{i + 1}),"")')
    dashboard.write(r, 17, None, helper_num,
                    formula=f'IF(P{r}="",0,SUMIF(Pointage_Categorie,P{r},Pointage_HS))')

# Évolution cumulative de la paie brute sur le mois (colonnes auxiliaires V:W)
dashboard.write(1, 22, "Jour", helper_hdr); dashboard.write(1, 23, "Paie brute cumulée", helper_hdr)
for day in range(1, 32):
    r = 1 + day
    dashboard.write(r, 22, day, helper_num)
    sc = CL(day_status_col(day)); oc = CL(day_ot_col(day))
    daily = (f'SUMPRODUCT(--(\'POINTAGE\'!${sc}${ATT_FIRST}:${sc}${ATT_LAST}="Présent"),'
             f'\'PAIE (15 Jours)\'!$D${PAY_FIRST}:$D${PAY_LAST})+'
             f'SUMPRODUCT(--(\'POINTAGE\'!${sc}${ATT_FIRST}:${sc}${ATT_LAST}="Présent"),'
             f'\'POINTAGE\'!${oc}${ATT_FIRST}:${oc}${ATT_LAST},'
             f'\'PAIE (15 Jours)\'!$E${PAY_FIRST}:$E${PAY_LAST})')
    cumulative = daily if day == 1 else f"W{r - 1}+{daily}"
    dashboard.write(r, 23, None, helper_money,
                    formula=f'IF(V{r}>DAY(EOMONTH(DATE(AnneeCourante,MoisCourant,1),0)),"",{cumulative})')

# Graphiques
wb.add_chart(dashboard, Chart("pie", "Taux de présence", "'TABLEAU DE BORD'!$P$2:$P$5",
                             "'TABLEAU DE BORD'!$Q$2:$Q$5", "'TABLEAU DE BORD'!$P$1",
                             colors=[GREEN_2, RED, BLUE_2, PURPLE], n_points=4), (1, 12, 6, 27))
wb.add_chart(dashboard, Chart("bar", "Employés par catégorie", "'TABLEAU DE BORD'!$S$2:$S$51",
                             "'TABLEAU DE BORD'!$T$2:$T$51", "'TABLEAU DE BORD'!$T$1",
                             colors=[BLUE], n_points=CATEGORY_CAPACITY), (6, 12, 12, 27))
wb.add_chart(dashboard, Chart("bar", "Heures supplémentaires par catégorie", "'TABLEAU DE BORD'!$P$10:$P$59",
                             "'TABLEAU DE BORD'!$Q$10:$Q$59", "'TABLEAU DE BORD'!$Q$9",
                             colors=[ORANGE], n_points=CATEGORY_CAPACITY), (1, 28, 6, 43))
wb.add_chart(dashboard, Chart("line", "Évolution de la paie brute mensuelle", "'TABLEAU DE BORD'!$V$2:$V$32",
                             "'TABLEAU DE BORD'!$W$2:$W$32", "'TABLEAU DE BORD'!$W$1",
                             colors=[TEAL], n_points=31), (6, 28, 12, 43))
dashboard.protect = True
dashboard.setup_page(orientation="landscape", fit_width=1, fit_height=1)
dashboard.set_print_area("$A$1:$M$44")

# ---------------------------------------------------------------------------
# 5. RECHERCHE
# ---------------------------------------------------------------------------
search = wb.add_sheet("RECHERCHE")
search.tab_color = GREEN
for c, w in enumerate([3, 21, 21, 21, 21, 21, 8], start=1): search.set_col(c, w)
title_block(search, "RECHERCHE D’UN EMPLOYÉ",
            "Saisissez exactement un nom ou un ID employé ; la fiche se complète instantanément.", 7)
search.cell("B5", "Nom ou ID", S["label"]); search.merge("C5:F5"); search.cell("C5", None, S["input"])
search.merge("B6:F6"); search.cell("B6", "Astuce : les ID suivent le format EMP-0001.", S["note"])
search.cell("J1", None, S["helper"],
            formula='IF($C$5="",0,IFERROR(MATCH($C$5,Employes_ID,0),IFERROR(MATCH($C$5,Employes_Nom,0),0)))')
search.cell("J2", None, S["helper"], formula='IF($J$1=0,"",INDEX(Employes_ID,$J$1))')
search.cell("J3", None, S["helper"], formula='IFERROR(MATCH($J$2,Pointage_ID,0),0)')
wb.define_name("RechercheEmployePos", "'RECHERCHE'!$J$1")
wb.define_name("RechercheID", "'RECHERCHE'!$J$2")
wb.define_name("RecherchePointagePos", "'RECHERCHE'!$J$3")

search.merge("B8:F8"); search.cell("B8", "  INFORMATIONS EMPLOYÉ", S["section"])

def emp_value(named_range):
    return f'IF(RechercheEmployePos=0,"-",INDEX({named_range},RechercheEmployePos))'


def point_value(named_range):
    return f'IF(RecherchePointagePos=0,"-",INDEX({named_range},RecherchePointagePos))'

info_rows = [
    (9, "Nom complet", emp_value("Employes_Nom"), "ID employé", emp_value("Employes_ID")),
    (10, "Catégorie", emp_value("Employes_Categorie"), "Statut", emp_value("Employes_Statut")),
    (11, "Date d'embauche", emp_value("Employes_Embauche"), "Téléphone", emp_value("Employes_Telephone")),
    (12, "Notes", emp_value("Employes_Notes"), "", '""'),
]
for r, l1, f1, l2, f2 in info_rows:
    search.cell(f"B{r}", l1, S["label"]); search.merge(f"C{r}:D{r}")
    style = S["formula_date"] if r == 11 else S["search_value"]
    search.write(r, 3, None, style, formula=f1)
    if l2:
        search.cell(f"E{r}", l2, S["label"]); search.cell(f"F{r}", None, S["search_value"], formula=f2)

search.merge("B14:F14"); search.cell("B14", "  POINTAGE ET PAIE", S["section_teal"])
search_rows = [
    (15, "Jours travaillés", point_value("Pointage_Travailles"), "Jours absents", point_value("Pointage_Absences"), "formula_center"),
    (16, "Heures supplémentaires", point_value("Pointage_HS"), "Salaire journalier", 'IF(RecherchePointagePos=0,"-",INDEX(Paie_SalaireJour,RecherchePointagePos))', "search_money"),
    (17, "Salaire des HS", 'IF(RecherchePointagePos=0,"-",INDEX(Paie_MontantHS,RecherchePointagePos))', "Salaire brut", 'IF(RecherchePointagePos=0,"-",INDEX(Paie_BrutMensuel,RecherchePointagePos))', "search_money"),
    (18, "Retenues", 'IF(RecherchePointagePos=0,"-",INDEX(Paie_Retenues,RecherchePointagePos))', "Salaire net", 'IF(RecherchePointagePos=0,"-",INDEX(Paie_NetMensuel,RecherchePointagePos))', "search_money"),
]
for r, l1, f1, l2, f2, val_style in search_rows:
    search.cell(f"B{r}", l1, S["label"]); search.cell(f"C{r}", None, S[val_style], formula=f1)
    search.cell(f"D{r}", l2, S["label"]); search.merge(f"E{r}:F{r}"); search.write(r, 5, None, S[val_style], formula=f2)
search.merge("B20:C20"); search.cell("B20", "NET À PAYER", S["big_total_label"])
search.merge("D20:F20"); search.write(20, 4, None, S["big_total_value"],
                                      formula='IF(RecherchePointagePos=0,0,INDEX(Paie_NetMensuel,RecherchePointagePos))')
search.set_row(20, 36)
search.protect = True
search.setup_page(orientation="portrait", fit_width=1, fit_height=1)
search.set_print_area("$B$1:$F$20")

# ---------------------------------------------------------------------------
# 6. PAIE (15 Jours)
# ---------------------------------------------------------------------------
payroll = wb.add_sheet("PAIE (15 Jours)")
payroll.tab_color = GOLD
pay_widths = [15, 25, 21, 12, 11, 9, 9, 9, 13, 12, 13, 12, 13,
              9, 9, 9, 13, 12, 13, 12, 13, 14, 14, 14]
for c, w in enumerate(pay_widths, start=1): payroll.set_col(c, w)
payroll.set_col(25, 2)
title_block(payroll, "PAIE PAR QUINZAINE ET TOTAL MENSUEL",
            "Les retenues sont les seules cellules jaunes à saisir ; tous les autres montants proviennent du pointage et des paramètres.", 24)
payroll.merge("A5:E5"); payroll.cell("A5", "EMPLOYÉ ET TARIFS", S["hdr"])
payroll.merge("F5:M5"); payroll.cell("F5", "1ÈRE QUINZAINE — JOURS 1 À 15", S["hdr_green"])
payroll.merge("N5:U5"); payroll.cell("N5", "2ÈME QUINZAINE — JOURS 16 À FIN DU MOIS", S["hdr_blue"])
payroll.merge("V5:X5"); payroll.cell("V5", "TOTAL MENSUEL", S["hdr_gold"])
pay_headers = ["ID employé", "Nom complet", "Catégorie", "Salaire / jour", "Taux horaire HS",
               "Jours Q1", "Abs. Q1", "HS Q1", "Salaire base Q1", "Montant HS Q1", "Brut Q1", "Retenues Q1", "Net Q1",
               "Jours Q2", "Abs. Q2", "HS Q2", "Salaire base Q2", "Montant HS Q2", "Brut Q2", "Retenues Q2", "Net Q2",
               "Brut mensuel", "Retenues mensuelles", "Net mensuel"]
for c, h in enumerate(pay_headers, start=1):
    style = S["hdr_green"] if 6 <= c <= 13 else S["hdr_blue"] if 14 <= c <= 21 else S["hdr_gold"] if c >= 22 else S["hdr"]
    payroll.write(PAY_HEADER, c, h, style)
payroll.set_row(PAY_HEADER, 34)

point_prefix = "'POINTAGE'!"
for r in range(PAY_FIRST, PAY_LAST + 1):
    ar = ATT_FIRST + (r - PAY_FIRST)
    payroll.write(r, 1, None, S["formula_center"], formula=f'IF({point_prefix}A{ar}="","",{point_prefix}A{ar})')
    payroll.write(r, 2, None, S["formula"], formula=f'IF($A{r}="","",{point_prefix}B{ar})')
    payroll.write(r, 3, None, S["formula_center"], formula=f'IF($A{r}="","",{point_prefix}C{ar})')
    wage = lookup_category(f"$C{r}", "Categories_Salaire")
    rate_lookup = lookup_category(f"$C{r}", "Categories_TauxHS")
    rate = f'IF({rate_lookup}>0,{rate_lookup},TauxHSDefaut)'
    payroll.write(r, 4, None, S["formula_money"], formula=f'IF($A{r}="","",{wage})')
    payroll.write(r, 5, None, S["formula_money"], formula=f'IF($A{r}="","",{rate})')
    # Première quinzaine
    payroll.write(r, 6, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(ar, range(1, 16), "Présent", point_prefix)})')
    payroll.write(r, 7, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(ar, range(1, 16), "Absent", point_prefix)})')
    payroll.write(r, 8, None, S["formula_dec"], formula=f'IF($A{r}="","",{ot_total_formula(ar, range(1, 16), point_prefix)})')
    payroll.write(r, 9, None, S["formula_money"], formula=f'IF($A{r}="","",$F{r}*$D{r})')
    payroll.write(r, 10, None, S["formula_money"], formula=f'IF($A{r}="","",$H{r}*$E{r})')
    payroll.write(r, 11, None, S["formula_total"], formula=f'IF($A{r}="","",$I{r}+$J{r})')
    payroll.write(r, 12, None, S["input_money"])
    payroll.write(r, 13, None, S["formula_total"], formula=f'IF($A{r}="","",MAX(0,$K{r}-$L{r}))')
    # Deuxième quinzaine
    payroll.write(r, 14, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(ar, range(16, 32), "Présent", point_prefix)})')
    payroll.write(r, 15, None, S["formula_int"], formula=f'IF($A{r}="","",{status_total_formula(ar, range(16, 32), "Absent", point_prefix)})')
    payroll.write(r, 16, None, S["formula_dec"], formula=f'IF($A{r}="","",{ot_total_formula(ar, range(16, 32), point_prefix)})')
    payroll.write(r, 17, None, S["formula_money"], formula=f'IF($A{r}="","",$N{r}*$D{r})')
    payroll.write(r, 18, None, S["formula_money"], formula=f'IF($A{r}="","",$P{r}*$E{r})')
    payroll.write(r, 19, None, S["formula_total"], formula=f'IF($A{r}="","",$Q{r}+$R{r})')
    payroll.write(r, 20, None, S["input_money"])
    payroll.write(r, 21, None, S["formula_total"], formula=f'IF($A{r}="","",MAX(0,$S{r}-$T{r}))')
    payroll.write(r, 22, None, S["formula_total"], formula=f'IF($A{r}="","",$K{r}+$S{r})')
    payroll.write(r, 23, None, S["formula_money"], formula=f'IF($A{r}="","",$L{r}+$T{r})')
    payroll.write(r, 24, None, S["formula_total"], formula=f'IF($A{r}="","",$M{r}+$U{r})')
    payroll.write(r, 25, None, S["helper"], formula=f'IF($A{r}="","",$J{r}+$R{r})')

payroll.add_number_validation(f"L{PAY_FIRST}:L{PAY_LAST} T{PAY_FIRST}:T{PAY_LAST}", "greaterThanOrEqual", "0", decimal=True)
payroll.add_cond_expr(f"A{PAY_FIRST}:X{PAY_LAST}", "MOD(ROW(),2)=0", banding_dxf, 8)
payroll.add_table(f"A{PAY_HEADER}:X{PAY_LAST}", "tblPaie", pay_headers, "TableStyleMedium4")
payroll.freeze_panes(PAY_HEADER, 3)
payroll.protect = True
payroll.setup_page(orientation="landscape", fit_width=1, fit_height=0)
payroll.set_print_area(f"$A$1:$X${PAY_LAST}")

wb.define_name("Paie_SalaireJour", f"'PAIE (15 Jours)'!$D${PAY_FIRST}:$D${PAY_LAST}")
wb.define_name("Paie_TauxHS", f"'PAIE (15 Jours)'!$E${PAY_FIRST}:$E${PAY_LAST}")
wb.define_name("Paie_Jours1", f"'PAIE (15 Jours)'!$F${PAY_FIRST}:$F${PAY_LAST}")
wb.define_name("Paie_HS1", f"'PAIE (15 Jours)'!$H${PAY_FIRST}:$H${PAY_LAST}")
wb.define_name("Paie_MontantHS1", f"'PAIE (15 Jours)'!$J${PAY_FIRST}:$J${PAY_LAST}")
wb.define_name("Paie_Brut1", f"'PAIE (15 Jours)'!$K${PAY_FIRST}:$K${PAY_LAST}")
wb.define_name("Paie_Retenues1", f"'PAIE (15 Jours)'!$L${PAY_FIRST}:$L${PAY_LAST}")
wb.define_name("Paie_Net1", f"'PAIE (15 Jours)'!$M${PAY_FIRST}:$M${PAY_LAST}")
wb.define_name("Paie_Jours2", f"'PAIE (15 Jours)'!$N${PAY_FIRST}:$N${PAY_LAST}")
wb.define_name("Paie_HS2", f"'PAIE (15 Jours)'!$P${PAY_FIRST}:$P${PAY_LAST}")
wb.define_name("Paie_MontantHS2", f"'PAIE (15 Jours)'!$R${PAY_FIRST}:$R${PAY_LAST}")
wb.define_name("Paie_Brut2", f"'PAIE (15 Jours)'!$S${PAY_FIRST}:$S${PAY_LAST}")
wb.define_name("Paie_Retenues2", f"'PAIE (15 Jours)'!$T${PAY_FIRST}:$T${PAY_LAST}")
wb.define_name("Paie_Net2", f"'PAIE (15 Jours)'!$U${PAY_FIRST}:$U${PAY_LAST}")
wb.define_name("Paie_MontantHS", f"'PAIE (15 Jours)'!$Y${PAY_FIRST}:$Y${PAY_LAST}")
wb.define_name("Paie_BrutMensuel", f"'PAIE (15 Jours)'!$V${PAY_FIRST}:$V${PAY_LAST}")
wb.define_name("Paie_Retenues", f"'PAIE (15 Jours)'!$W${PAY_FIRST}:$W${PAY_LAST}")
wb.define_name("Paie_NetMensuel", f"'PAIE (15 Jours)'!$X${PAY_FIRST}:$X${PAY_LAST}")

# ---------------------------------------------------------------------------
# 7. IMPRESSION
# ---------------------------------------------------------------------------
printing = wb.add_sheet("IMPRESSION")
printing.tab_color = GRAY
for c, w in enumerate([16, 25, 18, 14, 14, 14, 14, 14, 14, 14], start=1): printing.set_col(c, w)
navigation(printing, printing.name)
printing.merge("A2:H2"); printing.write(2, 1, None, S["title_center"], formula="NomSociete")
printing.merge("A3:H3"); printing.write(3, 1, None, S["subtitle"],
                                       formula='"  RAPPORT DE PAIE — "&MoisLibelle&"     |     "&AdresseSociete&"     |     "&TelephoneSociete')
printing.merge("I2:J3"); printing.cell("I2", "LOGO", S["logo"])
printing.cell("A5", "Mode d'impression", S["label"]); printing.merge("B5:C5"); printing.cell("B5", "Un employé", S["input_center"])
printing.cell("D5", "ID employé", S["label"]); printing.merge("E5:F5"); printing.cell("E5", "EMP-0001", S["input_center"])
printing.cell("G5", "Période", S["label"]); printing.merge("H5:J5"); printing.cell("H5", "Mois complet", S["input_center"])
printing.add_list_validation("B5", '"Un employé,Tous les employés"', allow_blank=False)
printing.add_list_validation("E5", "Pointage_ID")
printing.add_list_validation("H5", '"1ère quinzaine,2ème quinzaine,Mois complet"', allow_blank=False)
printing.merge("A6:J6"); printing.write(6, 1, None, S["note"],
                                       formula='"Période de paie configurée : "&PeriodePaie&" jours     |     Devise : "&Devise')
printing.cell("L1", None, S["helper"], formula='IFERROR(MATCH($E$5,Pointage_ID,0),0)')
wb.define_name("ImpressionPos", "'IMPRESSION'!$L$1")


def period_value(first_range, second_range, month_range):
    return (f'IF(ImpressionPos=0,"-",IF($H$5="1ère quinzaine",INDEX({first_range},ImpressionPos),'
            f'IF($H$5="2ème quinzaine",INDEX({second_range},ImpressionPos),INDEX({month_range},ImpressionPos))))')


def only_one(formula):
    return f'IF($B$5<>"Un employé","",{formula})'

# Bulletin individuel
printing.merge("A8:J8"); printing.cell("A8", None, S["section"], formula='IF($B$5="Un employé","  BULLETIN DE PAIE INDIVIDUEL","")')
individual_fields = [
    (9, "ID employé", 'IF(ImpressionPos=0,"-",INDEX(Pointage_ID,ImpressionPos))', "Nom complet", 'IF(ImpressionPos=0,"-",INDEX(Pointage_Nom,ImpressionPos))'),
    (10, "Catégorie", 'IF(ImpressionPos=0,"-",INDEX(Pointage_Categorie,ImpressionPos))', "Période", '$H$5'),
    (11, "Jours travaillés", period_value("Paie_Jours1", "Paie_Jours2", "Pointage_Travailles"), "Heures HS", period_value("Paie_HS1", "Paie_HS2", "Pointage_HS")),
    (12, "Salaire journalier", 'IF(ImpressionPos=0,"-",INDEX(Paie_SalaireJour,ImpressionPos))', "Salaire HS", period_value("Paie_MontantHS1", "Paie_MontantHS2", "Paie_MontantHS")),
    (13, "Salaire brut", period_value("Paie_Brut1", "Paie_Brut2", "Paie_BrutMensuel"), "Retenues", period_value("Paie_Retenues1", "Paie_Retenues2", "Paie_Retenues")),
]
for r, l1, f1, l2, f2 in individual_fields:
    printing.cell(f"A{r}", None, S["label"], formula=f'IF($B$5="Un employé","{l1}","")')
    printing.merge(f"B{r}:E{r}"); printing.write(r, 2, None, S["search_value"], formula=only_one(f1))
    printing.cell(f"F{r}", None, S["label"], formula=f'IF($B$5="Un employé","{l2}","")')
    printing.merge(f"G{r}:J{r}")
    money_row = r in (12, 13)
    printing.write(r, 7, None, S["search_money"] if money_row else S["search_value"], formula=only_one(f2))
printing.merge("A15:D15"); printing.cell("A15", None, S["big_total_label"], formula='IF($B$5="Un employé","NET À PAYER","")')
printing.merge("E15:J15"); printing.write(15, 5, None, S["big_total_value"],
                                         formula=only_one(period_value("Paie_Net1", "Paie_Net2", "Paie_NetMensuel")))
printing.set_row(15, 36)
printing.merge("A20:D20"); printing.cell("A20", None, S["signature"], formula='IF($B$5="Un employé","Signature de l’employé","")')
printing.merge("G20:J20"); printing.cell("G20", None, S["signature"], formula='IF($B$5="Un employé","Visa et cachet de l’entreprise","")')
printing.merge("A23:J23"); printing.write(23, 1, None, S["note"],
                                         formula='IF($B$5="Un employé","Édité le "&TEXT(TODAY(),"dd/mm/yyyy"),"")')

# État collectif
PRINT_HDR = 27
print_headers = ["ID", "Nom complet", "Catégorie", "Jours", "HS", "Salaire / jour", "Salaire HS", "Brut", "Retenues", "Net"]
for c, h in enumerate(print_headers, start=1):
    printing.write(PRINT_HDR, c, None, S["hdr"], formula=f'IF($B$5="Tous les employés","{h}","")')
for i in range(EMPLOYEE_CAPACITY):
    r = PRINT_HDR + 1 + i
    pos = i + 1
    id_formula = f'IFERROR(INDEX(Pointage_ID,{pos}),"")'
    visible = f'AND($B$5="Tous les employés",{id_formula}<>"")'
    printing.write(r, 1, None, S["formula_center"], formula=f'IF({visible},{id_formula},"")')
    printing.write(r, 2, None, S["formula"], formula=f'IF({visible},INDEX(Pointage_Nom,{pos}),"")')
    printing.write(r, 3, None, S["formula_center"], formula=f'IF({visible},INDEX(Pointage_Categorie,{pos}),"")')
    printing.write(r, 4, None, S["formula_int"], formula=f'IF({visible},{period_value("Paie_Jours1", "Paie_Jours2", "Pointage_Travailles").replace("ImpressionPos", str(pos))},"")')
    printing.write(r, 5, None, S["formula_dec"], formula=f'IF({visible},{period_value("Paie_HS1", "Paie_HS2", "Pointage_HS").replace("ImpressionPos", str(pos))},"")')
    printing.write(r, 6, None, S["formula_money"], formula=f'IF({visible},INDEX(Paie_SalaireJour,{pos}),"")')
    printing.write(r, 7, None, S["formula_money"], formula=f'IF({visible},{period_value("Paie_MontantHS1", "Paie_MontantHS2", "Paie_MontantHS").replace("ImpressionPos", str(pos))},"")')
    printing.write(r, 8, None, S["formula_money"], formula=f'IF({visible},{period_value("Paie_Brut1", "Paie_Brut2", "Paie_BrutMensuel").replace("ImpressionPos", str(pos))},"")')
    printing.write(r, 9, None, S["formula_money"], formula=f'IF({visible},{period_value("Paie_Retenues1", "Paie_Retenues2", "Paie_Retenues").replace("ImpressionPos", str(pos))},"")')
    printing.write(r, 10, None, S["formula_total"], formula=f'IF({visible},{period_value("Paie_Net1", "Paie_Net2", "Paie_NetMensuel").replace("ImpressionPos", str(pos))},"")')

printing.add_cond_expr(f"A{PRINT_HDR + 1}:J{PRINT_HDR + EMPLOYEE_CAPACITY}", "MOD(ROW(),2)=0", banding_dxf, 8)
printing.freeze_panes(6, 0)
printing.protect = True
printing.setup_page(orientation="landscape", fit_width=1, fit_height=0)
# Zone d'impression dynamique selon le mode et le dernier matricule actif.
last_collective_row = (f"{PRINT_HDR}+IFERROR(LOOKUP(2,1/(Pointage_ID<>\"\"),"
                       f"ROW(Pointage_ID)-MIN(ROW(Pointage_ID))+1),1)")
wb.define_name("_xlnm.Print_Area",
               f"OFFSET('IMPRESSION'!$A$1,0,0,IF('IMPRESSION'!$B$5=\"Un employé\",23,{last_collective_row}),10)",
               printing)

# ---------------------------------------------------------------------------
# Enregistrement
# ---------------------------------------------------------------------------
OUT = "Payroll_Management_System.xlsx"
wb.save(OUT)
print("Classeur généré :", OUT)
