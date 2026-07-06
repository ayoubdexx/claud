"""
vba_sources.py - VBA source code for the attendance-management workbook.

Every module is stored as plain text here and compiled into ``vbaProject.bin``
by :mod:`vbagen`.  The code is organised, commented (in French) and uses the
worksheet *code names* so it keeps working even if the user renames a tab.

Layout constants below MUST stay in sync with ``build_attendance.py``.
"""

# --------------------------------------------------------------------------- #
#  Worksheet code names (must match build_attendance.py)
# --------------------------------------------------------------------------- #
CODE_EMP = "wsEmployes"
CODE_PRES = "wsPresence"
CODE_IMP = "wsImpression"
CODE_HIST = "wsHistorique"
CODE_PARAM = "wsParametres"
CODE_GUIDE = "wsGuide"


# --------------------------------------------------------------------------- #
#  Standard module : all the automation logic
# --------------------------------------------------------------------------- #
MOD_ATTENDANCE = r'''Attribute VB_Name = "modAttendance"
Option Explicit

'==================================================================
'  GESTION DES PRESENCES - Module principal (automatisations)
'  Toutes les macros appelees par les boutons se trouvent ici.
'==================================================================

' --- Disposition de "Presence du Jour" ---
Public Const PRES_DATE As String = "C4"
Public Const PRES_CHANTIER As String = "E4"
Public Const PRES_RECHERCHE As String = "C9"
Public Const PRES_L1 As Long = 15          ' premiere ligne de donnees
Public Const PRES_LN As Long = 314         ' derniere ligne de donnees
Public Const PRES_C_PRESENT As Long = 2    ' colonne B
Public Const PRES_C_ID As Long = 3         ' colonne C
Public Const PRES_C_NOM As Long = 4        ' colonne D
Public Const PRES_C_POSTE As Long = 5      ' colonne E

' --- Disposition de "Historique" ---
Public Const HIST_L1 As Long = 4
Public Const HIST_C_DATE As Long = 2       ' B
Public Const HIST_C_ID As Long = 3         ' C
Public Const HIST_C_NOM As Long = 4        ' D
Public Const HIST_C_POSTE As Long = 5      ' E
Public Const HIST_C_PRESENT As Long = 6    ' F
Public Const HIST_C_CHANTIER As Long = 7   ' G

' --- Disposition de "Liste a imprimer" ---
Public Const IMP_DATE As String = "C3"
Public Const IMP_CHANTIER As String = "E3"
Public Const IMP_L1 As Long = 6
Public Const IMP_C_NUM As Long = 2         ' B
Public Const IMP_C_ID As Long = 3          ' C
Public Const IMP_C_NOM As Long = 4         ' D
Public Const IMP_C_POSTE As Long = 5       ' E
Public Const IMP_C_DATES As Long = 9       ' I : dates distinctes (masquee)
Public Const IMP_ENTETE As Long = 5        ' ligne d'entete du tableau

Public Const MARQUE As String = "X"        ' marque de presence

'------------------------------------------------------------------
'  BOUTON : Nouvelle journee
'------------------------------------------------------------------
Public Sub NouvelleJournee()
    Dim r As Long
    On Error GoTo gestionErreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False

    wsPresence.Range(PRES_DATE).Value = Date
    wsPresence.Range(PRES_DATE).NumberFormat = "dd/mm/yyyy"
    If Trim(CStr(wsPresence.Range(PRES_CHANTIER).Value)) = "" Then
        wsPresence.Range(PRES_CHANTIER).Value = LireParametre("ChantierDefaut", "")
    End If
    For r = PRES_L1 To PRES_LN
        wsPresence.Cells(r, PRES_C_PRESENT).Value = ""
    Next r
    wsPresence.Range(PRES_RECHERCHE).Value = ""
    AfficherToutesLignes

    Application.ScreenUpdating = True
    Application.EnableEvents = True
    wsPresence.Activate
    wsPresence.Range(PRES_DATE).Select
    MsgBox "Nouvelle journee prete pour le " & Format(Date, "dd/mm/yyyy") & "." & vbCrLf & vbCrLf & _
           "1) Cochez les employes presents (double-clic dans la colonne Present)." & vbCrLf & _
           "2) Cliquez sur "" Enregistrer la journee ""." & vbCrLf & _
           "3) Cliquez sur "" Imprimer "".", vbInformation, "Nouvelle journee"
    Exit Sub
gestionErreur:
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    MsgBox "Erreur lors de la preparation de la journee : " & Err.Description, vbExclamation
End Sub

'------------------------------------------------------------------
'  BOUTON : Enregistrer la journee
'------------------------------------------------------------------
Public Sub EnregistrerJournee()
    Dim d As Variant, chantier As String
    Dim r As Long, dest As Long, n As Long, nbPresents As Long

    d = wsPresence.Range(PRES_DATE).Value
    If Not IsDate(d) Then
        MsgBox "Veuillez d'abord saisir une date valide (case Date).", vbExclamation, "Date manquante"
        Exit Sub
    End If
    d = CDate(d)
    chantier = CStr(wsPresence.Range(PRES_CHANTIER).Value)

    For r = PRES_L1 To PRES_LN
        If Trim(CStr(wsPresence.Cells(r, PRES_C_ID).Value)) <> "" Then
            If Trim(CStr(wsPresence.Cells(r, PRES_C_PRESENT).Value)) <> "" Then nbPresents = nbPresents + 1
        End If
    Next r
    If nbPresents = 0 Then
        If MsgBox("Aucun employe n'est coche comme present." & vbCrLf & _
                  "Enregistrer quand meme une journee vide ?", vbQuestion + vbYesNo, _
                  "Aucune presence") = vbNo Then Exit Sub
    End If

    On Error GoTo gestionErreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False

    If JourneeExiste(CDate(d)) Then
        If MsgBox("Une journee est deja enregistree pour le " & Format(d, "dd/mm/yyyy") & "." & vbCrLf & _
                  "Voulez-vous la remplacer ?", vbQuestion + vbYesNo, "Journee existante") = vbNo Then
            Application.ScreenUpdating = True
            Application.EnableEvents = True
            Exit Sub
        End If
        SupprimerJournee CDate(d)
    End If

    dest = wsHistorique.Cells(wsHistorique.Rows.Count, HIST_C_DATE).End(xlUp).Row
    If dest < HIST_L1 - 1 Then dest = HIST_L1 - 1
    dest = dest + 1

    For r = PRES_L1 To PRES_LN
        If Trim(CStr(wsPresence.Cells(r, PRES_C_ID).Value)) <> "" _
           And Trim(CStr(wsPresence.Cells(r, PRES_C_PRESENT).Value)) <> "" Then
            wsHistorique.Cells(dest, HIST_C_DATE).Value = CDate(d)
            wsHistorique.Cells(dest, HIST_C_DATE).NumberFormat = "dd/mm/yyyy"
            wsHistorique.Cells(dest, HIST_C_ID).Value = wsPresence.Cells(r, PRES_C_ID).Value
            wsHistorique.Cells(dest, HIST_C_NOM).Value = wsPresence.Cells(r, PRES_C_NOM).Value
            wsHistorique.Cells(dest, HIST_C_POSTE).Value = wsPresence.Cells(r, PRES_C_POSTE).Value
            wsHistorique.Cells(dest, HIST_C_PRESENT).Value = "Oui"
            wsHistorique.Cells(dest, HIST_C_CHANTIER).Value = chantier
            dest = dest + 1
            n = n + 1
        End If
    Next r

    RafraichirDatesDistinctes
    ConstruireListeImpression CDate(d)
    wsImpression.Range(IMP_DATE).Value = CDate(d)

    Application.ScreenUpdating = True
    Application.EnableEvents = True
    MsgBox n & " presence(s) enregistree(s) pour le " & Format(d, "dd/mm/yyyy") & "." & vbCrLf & _
           "La liste a imprimer est prete.", vbInformation, "Journee enregistree"
    Exit Sub
gestionErreur:
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    MsgBox "Erreur lors de l'enregistrement : " & Err.Description, vbExclamation
End Sub

'------------------------------------------------------------------
'  BOUTON : Imprimer
'------------------------------------------------------------------
Public Sub Imprimer()
    Dim d As Variant
    On Error Resume Next
    d = wsImpression.Range(IMP_DATE).Value
    If Not IsDate(d) Then d = wsPresence.Range(PRES_DATE).Value
    If IsDate(d) Then
        Application.EnableEvents = False
        wsImpression.Range(IMP_DATE).Value = CDate(d)
        ConstruireListeImpression CDate(d)
        Application.EnableEvents = True
    End If
    SauvegardeAuto
    wsImpression.Activate
    wsImpression.PrintOut
End Sub

'------------------------------------------------------------------
'  BOUTON : Exporter en PDF
'------------------------------------------------------------------
Public Sub ExporterPDF()
    Dim d As Variant, chemin As String, fichier As String, nomEnt As String
    d = wsImpression.Range(IMP_DATE).Value
    If Not IsDate(d) Then d = wsPresence.Range(PRES_DATE).Value
    If Not IsDate(d) Then
        MsgBox "Aucune date valide a exporter.", vbExclamation
        Exit Sub
    End If
    Application.EnableEvents = False
    wsImpression.Range(IMP_DATE).Value = CDate(d)
    ConstruireListeImpression CDate(d)
    Application.EnableEvents = True
    SauvegardeAuto

    nomEnt = LireParametre("NomEntreprise", "Entreprise")
    chemin = LireParametre("CheminPDF", "")
    If Trim(chemin) = "" Then chemin = ThisWorkbook.Path
    If chemin = "" Then chemin = Application.DefaultFilePath
    If Right(chemin, 1) <> "\" Then chemin = chemin & "\"
    fichier = "Presence_" & NettoyerNom(nomEnt) & "_" & Format(CDate(d), "yyyy-mm-dd") & ".pdf"

    On Error GoTo gestionErreur
    wsImpression.ExportAsFixedFormat Type:=xlTypePDF, Filename:=chemin & fichier, _
        Quality:=xlQualityStandard, IncludeDocProperties:=True, OpenAfterPublish:=False
    MsgBox "PDF cree avec succes :" & vbCrLf & chemin & fichier, vbInformation, "Export PDF"
    Exit Sub
gestionErreur:
    MsgBox "Impossible de creer le PDF." & vbCrLf & Err.Description, vbExclamation, "Export PDF"
End Sub

'------------------------------------------------------------------
'  BOUTONS : Tout cocher / Tout decocher
'------------------------------------------------------------------
Public Sub ToutCocher()
    MarquerTous MARQUE
End Sub

Public Sub ToutDecocher()
    MarquerTous ""
End Sub

Private Sub MarquerTous(ByVal valeur As String)
    Dim r As Long, prevEv As Boolean
    prevEv = Application.EnableEvents
    Application.EnableEvents = False
    For r = PRES_L1 To PRES_LN
        If Trim(CStr(wsPresence.Cells(r, PRES_C_ID).Value)) <> "" Then
            If Not wsPresence.Rows(r).Hidden Then
                wsPresence.Cells(r, PRES_C_PRESENT).Value = valeur
            End If
        End If
    Next r
    Application.EnableEvents = prevEv
End Sub

'------------------------------------------------------------------
'  Bascule une marque de presence (appele par le double-clic)
'------------------------------------------------------------------
Public Sub BasculerPresence(ByVal cel As Range)
    Dim prevEv As Boolean
    prevEv = Application.EnableEvents
    Application.EnableEvents = False
    If Trim(CStr(cel.Value)) = "" Then
        cel.Value = MARQUE
    Else
        cel.Value = ""
    End If
    Application.EnableEvents = prevEv
End Sub

'------------------------------------------------------------------
'  Recherche : masque les lignes qui ne correspondent pas
'------------------------------------------------------------------
Public Sub RechercheEmployes()
    Dim r As Long, txt As String, ligne As String
    txt = LCase(Trim(CStr(wsPresence.Range(PRES_RECHERCHE).Value)))
    Application.ScreenUpdating = False
    For r = PRES_L1 To PRES_LN
        If Trim(CStr(wsPresence.Cells(r, PRES_C_ID).Value)) = "" Then
            wsPresence.Rows(r).Hidden = (txt <> "")
        Else
            ligne = LCase(CStr(wsPresence.Cells(r, PRES_C_ID).Value) & " " & _
                          CStr(wsPresence.Cells(r, PRES_C_NOM).Value) & " " & _
                          CStr(wsPresence.Cells(r, PRES_C_POSTE).Value))
            wsPresence.Rows(r).Hidden = (txt <> "" And InStr(ligne, txt) = 0)
        End If
    Next r
    Application.ScreenUpdating = True
End Sub

Public Sub AfficherToutesLignes()
    wsPresence.Rows(PRES_L1 & ":" & PRES_LN).Hidden = False
End Sub

'------------------------------------------------------------------
'  Construit la liste imprimable pour une date donnee
'------------------------------------------------------------------
Public Sub ConstruireListeImpression(ByVal dCible As Variant)
    Dim dernH As Long, i As Long, dest As Long, num As Long
    Dim donnees As Variant, chantier As String, trouve As Boolean
    Dim prevEv As Boolean

    prevEv = Application.EnableEvents
    Application.EnableEvents = False
    ' effacer l'ancienne liste
    wsImpression.Range(wsImpression.Cells(IMP_L1, IMP_C_NUM), _
        wsImpression.Cells(IMP_L1 + 6000, IMP_C_POSTE)).ClearContents

    If IsDate(dCible) Then
        dCible = CDate(dCible)
        dernH = wsHistorique.Cells(wsHistorique.Rows.Count, HIST_C_DATE).End(xlUp).Row
        If dernH >= HIST_L1 Then
            donnees = wsHistorique.Range(wsHistorique.Cells(HIST_L1, HIST_C_DATE), _
                        wsHistorique.Cells(dernH, HIST_C_CHANTIER)).Value
            dest = IMP_L1
            For i = 1 To UBound(donnees, 1)
                If IsDate(donnees(i, 1)) Then
                    If CDate(donnees(i, 1)) = dCible Then
                        num = num + 1
                        wsImpression.Cells(dest, IMP_C_NUM).Value = num
                        wsImpression.Cells(dest, IMP_C_ID).Value = donnees(i, 2)
                        wsImpression.Cells(dest, IMP_C_NOM).Value = donnees(i, 3)
                        wsImpression.Cells(dest, IMP_C_POSTE).Value = donnees(i, 4)
                        If Not trouve Then
                            chantier = CStr(donnees(i, 6))
                            trouve = True
                        End If
                        dest = dest + 1
                    End If
                End If
            Next i
        End If
        wsImpression.Range(IMP_CHANTIER).Value = chantier
        MettreEnFormeImpression num
    End If
    Application.EnableEvents = prevEv
End Sub

'------------------------------------------------------------------
'  Bordures + zone d'impression de la liste
'------------------------------------------------------------------
Public Sub MettreEnFormeImpression(ByVal nb As Long)
    Dim derniere As Long, rng As Range
    ' nettoyer les anciennes bordures
    wsImpression.Range(wsImpression.Cells(IMP_L1, IMP_C_NUM), _
        wsImpression.Cells(IMP_L1 + 6000, IMP_C_POSTE)).Borders.LineStyle = xlNone
    derniere = IMP_L1 + nb - 1
    If derniere < IMP_L1 Then derniere = IMP_L1
    Set rng = wsImpression.Range(wsImpression.Cells(IMP_ENTETE, IMP_C_NUM), _
                wsImpression.Cells(derniere, IMP_C_POSTE))
    With rng.Borders
        .LineStyle = xlContinuous
        .Weight = xlThin
        .Color = RGB(160, 160, 160)
    End With
    wsImpression.PageSetup.PrintArea = wsImpression.Range( _
        wsImpression.Cells(1, IMP_C_NUM), wsImpression.Cells(derniere, IMP_C_POSTE)).Address
End Sub

'------------------------------------------------------------------
'  Reconstruit la liste (masquee) des dates distinctes
'------------------------------------------------------------------
Public Sub RafraichirDatesDistinctes()
    Dim dernH As Long, i As Long, dv As Double
    Dim donnees As Variant, dict As Object, cles As Variant
    Dim a As Long, b As Long, tmp As Double
    Dim prevEv As Boolean

    Set dict = CreateObject("Scripting.Dictionary")
    dernH = wsHistorique.Cells(wsHistorique.Rows.Count, HIST_C_DATE).End(xlUp).Row
    If dernH >= HIST_L1 Then
        ' lecture sur 2 colonnes (Date + ID) pour garantir un tableau 2D
        donnees = wsHistorique.Range(wsHistorique.Cells(HIST_L1, HIST_C_DATE), _
                    wsHistorique.Cells(dernH, HIST_C_ID)).Value
        For i = 1 To UBound(donnees, 1)
            If IsDate(donnees(i, 1)) Then
                dv = CDbl(CDate(donnees(i, 1)))
                If Not dict.Exists(dv) Then dict.Add dv, True
            End If
        Next i
    End If

    prevEv = Application.EnableEvents
    Application.EnableEvents = False
    wsImpression.Columns(IMP_C_DATES).ClearContents
    If dict.Count > 0 Then
        cles = dict.Keys
        ' tri decroissant (dates les plus recentes en premier)
        For a = LBound(cles) To UBound(cles) - 1
            For b = a + 1 To UBound(cles)
                If cles(b) > cles(a) Then
                    tmp = cles(a): cles(a) = cles(b): cles(b) = tmp
                End If
            Next b
        Next a
        For i = LBound(cles) To UBound(cles)
            wsImpression.Cells(2 + i - LBound(cles), IMP_C_DATES).Value = CDate(cles(i))
            wsImpression.Cells(2 + i - LBound(cles), IMP_C_DATES).NumberFormat = "dd/mm/yyyy"
        Next i
    End If
    Application.EnableEvents = prevEv
End Sub

'------------------------------------------------------------------
'  Navigation
'------------------------------------------------------------------
Public Sub AllerSaisie()
    wsPresence.Activate
End Sub

Public Sub AllerImpression()
    wsImpression.Activate
End Sub

'==================================================================
'  Fonctions utilitaires
'==================================================================
Private Function JourneeExiste(ByVal d As Date) As Boolean
    Dim dernH As Long, i As Long, donnees As Variant
    dernH = wsHistorique.Cells(wsHistorique.Rows.Count, HIST_C_DATE).End(xlUp).Row
    If dernH < HIST_L1 Then Exit Function
    ' lecture sur 2 colonnes (Date + ID) pour garantir un tableau 2D
    donnees = wsHistorique.Range(wsHistorique.Cells(HIST_L1, HIST_C_DATE), _
                wsHistorique.Cells(dernH, HIST_C_ID)).Value
    For i = 1 To UBound(donnees, 1)
        If IsDate(donnees(i, 1)) Then
            If CDate(donnees(i, 1)) = d Then
                JourneeExiste = True
                Exit Function
            End If
        End If
    Next i
End Function

Private Sub SupprimerJournee(ByVal d As Date)
    Dim dernH As Long, i As Long
    dernH = wsHistorique.Cells(wsHistorique.Rows.Count, HIST_C_DATE).End(xlUp).Row
    For i = dernH To HIST_L1 Step -1
        If IsDate(wsHistorique.Cells(i, HIST_C_DATE).Value) Then
            If CDate(wsHistorique.Cells(i, HIST_C_DATE).Value) = d Then
                wsHistorique.Rows(i).Delete
            End If
        End If
    Next i
End Sub

Public Function LireParametre(ByVal nom As String, ByVal defaut As String) As String
    Dim v As Variant
    On Error GoTo defautSortie
    v = ThisWorkbook.Names(nom).RefersToRange.Value
    If IsEmpty(v) Or IsNull(v) Then GoTo defautSortie
    If Trim(CStr(v)) = "" Then GoTo defautSortie
    LireParametre = CStr(v)
    Exit Function
defautSortie:
    LireParametre = defaut
End Function

Public Function NettoyerNom(ByVal s As String) As String
    Dim i As Long, c As String, r As String
    For i = 1 To Len(s)
        c = Mid(s, i, 1)
        If InStr("\/:*?""<>|", c) = 0 Then r = r & c
    Next i
    r = Trim(r)
    If r = "" Then r = "Entreprise"
    NettoyerNom = r
End Function

Public Sub SauvegardeAuto()
    On Error Resume Next
    Application.DisplayAlerts = False
    ThisWorkbook.Save
    Application.DisplayAlerts = True
End Sub

Public Sub ProtegerFeuilles()
    Dim ws As Worksheet
    On Error Resume Next
    For Each ws In ThisWorkbook.Worksheets
        ws.Unprotect
        ws.Protect Password:="", UserInterfaceOnly:=True, DrawingObjects:=False, _
                   Contents:=True, Scenarios:=True, AllowFiltering:=True
        ws.EnableSelection = xlNoRestrictions
    Next ws
End Sub
'''


# --------------------------------------------------------------------------- #
#  ThisWorkbook document module
# --------------------------------------------------------------------------- #
MOD_THISWORKBOOK = r'''
Private Sub Workbook_Open()
    On Error Resume Next
    ProtegerFeuilles
    RafraichirDatesDistinctes

    Application.EnableEvents = False
    If Not IsDate(wsPresence.Range(PRES_DATE).Value) Then
        wsPresence.Range(PRES_DATE).Value = Date
        wsPresence.Range(PRES_DATE).NumberFormat = "dd/mm/yyyy"
    End If
    If Trim(CStr(wsPresence.Range(PRES_CHANTIER).Value)) = "" Then
        wsPresence.Range(PRES_CHANTIER).Value = LireParametre("ChantierDefaut", "")
    End If
    If Not IsDate(wsImpression.Range(IMP_DATE).Value) Then
        wsImpression.Range(IMP_DATE).Value = wsPresence.Range(PRES_DATE).Value
    End If
    ConstruireListeImpression wsImpression.Range(IMP_DATE).Value
    Application.EnableEvents = True

    wsPresence.Activate
    wsPresence.Range(PRES_DATE).Select
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    ' Rien de force : on laisse Excel gerer la sauvegarde habituelle.
End Sub
'''


# --------------------------------------------------------------------------- #
#  "Presence du Jour" document module (events)
# --------------------------------------------------------------------------- #
MOD_WS_PRESENCE = r'''
Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, ByVal Cancel As Boolean)
    If Target.Column = PRES_C_PRESENT _
       And Target.Row >= PRES_L1 And Target.Row <= PRES_LN Then
        If Trim(CStr(Me.Cells(Target.Row, PRES_C_ID).Value)) <> "" Then
            Cancel = True
            BasculerPresence Me.Cells(Target.Row, PRES_C_PRESENT)
        End If
    End If
End Sub

Private Sub Worksheet_Change(ByVal Target As Range)
    On Error Resume Next
    If Not Intersect(Target, Me.Range(PRES_RECHERCHE)) Is Nothing Then
        Application.EnableEvents = False
        RechercheEmployes
        Application.EnableEvents = True
    End If
End Sub
'''


# --------------------------------------------------------------------------- #
#  "Liste a imprimer" document module (events)
# --------------------------------------------------------------------------- #
MOD_WS_IMPRESSION = r'''
Private Sub Worksheet_Change(ByVal Target As Range)
    On Error Resume Next
    If Not Intersect(Target, Me.Range(IMP_DATE)) Is Nothing Then
        Application.EnableEvents = False
        ConstruireListeImpression Me.Range(IMP_DATE).Value
        Application.EnableEvents = True
    End If
End Sub
'''


# Empty document modules (still required so the code names resolve as globals).
MOD_EMPTY = "\n"


def module_specs():
    """Return the ordered list of (name, code, kind, guid) for vbagen."""
    return [
        ("ThisWorkbook", MOD_THISWORKBOOK, "document", "workbook"),
        (CODE_EMP, MOD_EMPTY, "document", "worksheet"),
        (CODE_PRES, MOD_WS_PRESENCE, "document", "worksheet"),
        (CODE_IMP, MOD_WS_IMPRESSION, "document", "worksheet"),
        (CODE_HIST, MOD_EMPTY, "document", "worksheet"),
        (CODE_PARAM, MOD_EMPTY, "document", "worksheet"),
        (CODE_GUIDE, MOD_EMPTY, "document", "worksheet"),
        ("modAttendance", MOD_ATTENDANCE, "standard", None),
    ]
