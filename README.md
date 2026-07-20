# Gestion de la paie et du pointage — Excel

Classeur Microsoft Excel professionnel en français pour une entreprise marocaine de construction. Il gère les employés, le pointage quotidien, les heures supplémentaires, la paie par quinzaine, la recherche, le tableau de bord et les états imprimables, sans macro ni VBA.

## Livrable

- `Payroll_Management_System.xlsx` — classeur final prêt à utiliser dans Microsoft Excel.
- `build_workbook.py` — génération complète des feuilles, formules, tableaux, validations, styles, protections et graphiques.
- `xlsxgen.py` — moteur OOXML autonome, sans dépendance Python externe.

Pour reconstruire le classeur :

```bash
python3 build_workbook.py
```

## Feuilles

1. **PARAMÈTRES** — société, coordonnées, année, mois, période de 15 jours, devise, heures/jour, taux HS par défaut, budget mensuel et tableau extensible des catégories/tarifs.
2. **EMPLOYÉS** — base de 300 employés avec ID automatique, catégorie, date d’embauche, statut, téléphone et notes.
3. **POINTAGE** — 31 jours adaptatifs au mois sélectionné, avec statut (`Présent`, `Absent`, `Congé`, `Maladie`) et saisie des heures supplémentaires.
4. **TABLEAU DE BORD** — six indicateurs et quatre graphiques : présence, catégories, HS par catégorie et évolution cumulative de la paie.
5. **RECHERCHE** — recherche instantanée par nom ou ID avec données RH, pointage et paie.
6. **PAIE (15 Jours)** — première quinzaine, deuxième quinzaine et total mensuel ; seules les retenues sont saisies manuellement.
7. **IMPRESSION** — bulletin individuel ou état collectif, avec choix de la période et zone d’impression dynamique A4.

## Utilisation

Les cellules jaunes sont modifiables. Les cellules blanches, vertes ou bleues contiennent des formules protégées. Commencez par remplacer les exemples dans **PARAMÈTRES** et **EMPLOYÉS**, puis saisissez le pointage. Seuls les employés `Actif` dont la date d’embauche est compatible avec le mois sélectionné alimentent le pointage et la paie. Tous les calculs se recalculent à l’ouverture du fichier.

Le classeur représente un mois de paie : avant de changer de mois, enregistrez une copie d’archive puis effacez les anciennes saisies de **POINTAGE**. Cette précaution est nécessaire dans une solution sans VBA, car une formule Excel ne peut pas effacer une valeur saisie manuellement.

Le classeur utilise des tableaux Excel (`tblCategories`, `tblEmployes`, `tblPaie`), des plages nommées, des listes déroulantes, de la mise en forme conditionnelle, des liens de navigation internes et des feuilles protégées sans mot de passe.
