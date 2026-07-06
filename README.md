# Gestion des Présences — Chantier (Excel / VBA)

Un véritable **logiciel de gestion des présences** pour une entreprise de
construction, livré sous forme d'un **classeur Excel macro (`.xlsm`)** entièrement
en français, prêt à l'emploi.

> **Fichier à ouvrir : [`Gestion_Presences.xlsm`](Gestion_Presences.xlsm)**

Chaque matin, le travail se résume à :

1. Ouvrir le fichier.
2. Cocher les employés présents (double-clic dans la colonne **Présent**).
3. Cliquer sur **Enregistrer la journée**.
4. Cliquer sur **Imprimer** (ou **Exporter en PDF**).

Tout le reste — synchronisation, historique, génération de la liste imprimable,
réimpression des journées passées — est automatique.

---

## Les feuilles du classeur

| Feuille | Rôle |
|---|---|
| **Employés** | Informations fixes : ID, Nom et Prénom, Poste, Équipe, Statut (Actif/Inactif). Vos ID existants sont saisis tels quels. |
| **Présence du Jour** | Feuille principale. Affiche automatiquement les employés **actifs**. On coche uniquement les présents. Compteurs (actifs / présents / absents / taux), barre de recherche et gros boutons. |
| **Liste à imprimer** | Générée automatiquement : uniquement les présents, mise en page A4, titre centré, bordures, numérotation. Sélecteur de date pour **réimprimer une journée passée**. |
| **Historique** | Archive de toutes les journées enregistrées (Date, ID, Nom, Poste, Présent, Chantier). Jamais supprimée automatiquement. |
| **Paramètres** | Nom de l'entreprise, chantier par défaut, emplacement du logo, dossier d'export PDF, options. |
| **Guide d'utilisation** | Mode d'emploi complet, étape par étape, directement dans le classeur. |

## Boutons (macros VBA)

- **Nouvelle journée** — remet la date du jour et décoche tout.
- **Enregistrer la journée** — sauvegarde les présents dans l'historique (sans
  doublon : re-enregistrer une même date propose de la remplacer) et prépare la
  liste à imprimer.
- **Imprimer** — sauvegarde puis imprime la liste affichée.
- **Exporter en PDF** — crée un PDF de la liste.
- **Tout cocher / Tout décocher** — cases de présence.

## Synchronisation automatique

Les feuilles sont reliées par des formules et des macros :

- Ajouter un employé ou modifier un nom se répercute **partout** immédiatement.
- Passer un employé en *Inactif* le retire de la saisie sans perdre son historique.
- L'enregistrement d'une journée alimente l'historique, qui alimente la liste
  imprimable et le sélecteur de dates.

## Première utilisation

1. Ouvrir `Gestion_Presences.xlsm`.
2. Cliquer sur **« Activer les macros »** (bandeau jaune de sécurité Excel).
3. Renseigner **Paramètres** (nom de l'entreprise, chantier par défaut).
4. Saisir la liste du personnel dans **Employés**.
5. Utiliser **Présence du Jour** chaque matin.

> Conserver le fichier au format **`.xlsm`** (classeur prenant en charge les
> macros). Voir la feuille *Guide d'utilisation* pour tous les détails.

---

## Pour les développeurs — régénérer le classeur

Le classeur est produit **programmatiquement en Python**, sans Excel ni
`openpyxl`, à l'aide de deux petits moteurs maison plus une chaîne VBA vendorée.

| Fichier | Rôle |
|---|---|
| `build_attendance.py` | Construit toutes les feuilles, formules, styles, validations, protections et boutons. |
| `xlsxgen.py` | Moteur `.xlsx`/`.xlsm` minimal (styles, formules, validation, mises en forme conditionnelles, plages nommées, protection, formes/boutons, projet VBA). |
| `vba_sources.py` | Le code source VBA de tous les modules. |
| `vbagen.py` | Compile le code VBA en `vbaProject.bin` (MS-OVBA / MS-CFB). |
| `ovba_fix.py` | Implémentation correcte de la compression MS-OVBA (corrige un bug de la bibliothèque tierce). |

### Environnement

- **Python ≥ 3.10** (la chaîne VBA utilise la syntaxe `str | None`).
- Dépendances : `pip install -r requirements-build.txt`.
- La chaîne VBA vendorée doit être présente sous `_vbatools/` :
  - `_vbatools/ms_ovba/` : le paquet `ms_ovba` de
    [Beakerboy/vbaProject-Compiler](https://github.com/Beakerboy/vbaProject-Compiler)
    (dossier `src/ms_ovba`).
  - `_vbatools/ms_dtyp/filetime.py` : une classe `Filetime` minimale
    (constructeur standard + `from_msfiletime`, `to_msfiletime`,
    `fromtimestamp`, `fromisoformat`).

### Génération

```bash
pip install -r requirements-build.txt
python build_attendance.py     # -> Gestion_Presences.xlsm
```

### Note sur la conformité Excel

Le projet VBA est stocké **sans cache de compilation (p-code)** : Excel
recompile chaque module à l'ouverture à partir du code source. La compression
MS-OVBA est ré-implémentée dans `ovba_fix.py` car le compresseur de la
bibliothèque tierce produit des jetons de copie invalides sur les données
répétitives (ce qui rendait le projet illisible par Excel).

Le contenu généré a été validé : XML bien formé pour toutes les parties,
types de contenu « macroEnabled », relation `vbaProject`, noms de code des
feuilles, décompression correcte de tous les flux VBA (`dir`, modules), et
ouverture sans erreur par `openpyxl`.

*Attribution : la chaîne de compilation VBA s'appuie sur les projets MIT
`ms_ovba`, `ms_cfb`, `ms_ovba_compression` et `ms_ovba_crypto` de Beakerboy.*
