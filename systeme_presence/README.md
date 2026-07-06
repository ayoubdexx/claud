# Système de gestion des présences — chantier (générateur)

Ce dossier contient le **code source** qui génère le classeur Excel
**`Gestion_Presence_Chantier.xlsm`** (à la racine du dépôt), un véritable
petit logiciel de gestion des présences pour une entreprise de construction,
entièrement en français, avec macros VBA et boutons opérationnels.

> Le fichier livré est le `.xlsm` à la racine. Ce dossier sert uniquement à
> **régénérer** ce fichier.

## Le classeur en bref

Feuilles (toutes synchronisées automatiquement) :

| Feuille | Rôle |
|---|---|
| **Accueil** | Menu avec gros boutons (actions rapides + navigation) |
| **Employés** | Fiche des employés (ID, Nom, Poste, Équipe, Statut) — tableau modifiable |
| **Présence du Jour** | Écran principal : cocher les présents par **double-clic**, compteurs en direct, recherche |
| **Liste à imprimer** | Fiche A4 propre, générée automatiquement ; sélecteur de date pour réimprimer une journée passée |
| **Historique** | Journal de toutes les journées enregistrées (jamais effacé) |
| **Paramètres** | Entreprise, chantier par défaut, titre imprimé, dossier PDF, logo |
| **Guide d'utilisation** | Mode d'emploi complet pas à pas |

Boutons (créés automatiquement à l'ouverture) : **Nouvelle journée**,
**Enregistrer la journée** (sans doublon), **Imprimer**, **Exporter en PDF**,
**Tout cocher**, **Tout décocher**, navigation.

Workflow quotidien (< 2 min) : ouvrir → *Nouvelle journée* → double-cliquer les
présents → *Enregistrer la journée* → *Imprimer*.

## Régénérer le fichier

Prérequis : **Python 3.12+** (les librairies VBA utilisent une syntaxe 3.10+).

```bash
pip install openpyxl ms-cfb ms-ovba ms-ovba-compression ms-dtyp oletools
cd systeme_presence
python build.py            # produit ../Gestion_Presence_Chantier.xlsm + validations
```

## Organisation du code

| Fichier | Rôle |
|---|---|
| `sp_config.py` | **Source unique de vérité** de la disposition (onglets, cellules, colonnes, couleurs, plages nommées) |
| `vba.py` | Génère tout le code VBA (13 modules) — modules document (événements) + modules standard (logique) |
| `ovba_compress.py` | Compression **MS-OVBA correcte** (remplace le compresseur bogué de `ms_ovba_compression` sur les flux > 4096 octets) |
| `make_vba.py` | Assemble `xl/vbaProject.bin` (conteneur OLE) à partir des modules |
| `workbook.py` | Construit le classeur (feuilles, styles, tableaux, formules, validations, MFC, mise en page, protection) via openpyxl |
| `assemble.py` | Emballe le `.xlsm` final : injection du `vbaProject.bin`, types de contenu, relations, `codeName` |
| `build.py` | Orchestrateur + validation (structure ZIP, relecture openpyxl, extraction des macros via olevba) |

## Notes techniques

- Les boutons sont dessinés par VBA à l'ouverture (`Workbook_Open`), car openpyxl
  ne sait pas créer de boutons liés à des macros. L'interface est donc
  auto-réparante.
- Les feuilles importantes sont protégées avec `UserInterfaceOnly` : les macros
  écrivent librement, l'utilisateur ne peut pas casser les formules.
- Le code VBA est encodé en Windows-1252 (accents pris en charge).
- **Important** : pour que les boutons et l'automatisation fonctionnent,
  l'utilisateur doit **activer les macros** à la première ouverture et conserver
  le fichier au format `.xlsm`.
