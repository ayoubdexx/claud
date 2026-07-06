# -*- coding: utf-8 -*-
"""
Genere l'integralite du code VBA du systeme de presence.

Chaque module est renvoye sous forme (nom, genre, corps) ou genre vaut
'workbook', 'worksheet' ou 'std'. Le corps NE contient PAS l'en-tete
d'attributs : celui-ci est ajoute par make_vba.py en fonction du genre.

IMPORTANT : le fichier source VBA sera encode en Windows-1252 (cp1252).
On peut donc utiliser des accents dans les messages et commentaires, mais
JAMAIS de caracteres hors cp1252 (pas d'emoji, pas de coche). La coche
s'obtient via ChrW(10004).
"""
import sp_config as C


def _rgblong(hx):
    """Convertit une couleur hex RRGGBB en Long VBA (R + G*256 + B*65536)."""
    r = int(hx[0:2], 16)
    g = int(hx[2:4], 16)
    b = int(hx[4:6], 16)
    return r + g * 256 + b * 65536


def _modconfig():
    """Construit le module de constantes a partir de sp_config."""
    P, I, H, Pm = C.Pres, C.Imp, C.Hist, C.Param
    lines = [
        "Option Explicit",
        "'== Constantes de configuration (generees automatiquement) ==",
        "",
        f"Public Const CHK As Long = {C.CHECK_CODE}",
        f'Public Const PW As String = "{C.PROTECT_PW}"',
        "",
        "'--- Feuille Presence du Jour ---",
        f"Public Const P_HDR As Long = {P.HEADER_ROW}",
        f"Public Const P_ROW1 As Long = {P.FIRST_ROW}",
        f"Public Const P_MAXROW As Long = {P.MAX_ROW}",
        f"Public Const P_CCHK As Long = {P.COL_CHK}",
        f"Public Const P_CID As Long = {P.COL_ID}",
        f"Public Const P_CNOM As Long = {P.COL_NOM}",
        f"Public Const P_CPOSTE As Long = {P.COL_POSTE}",
        f'Public Const PRES_DATE As String = "{P.DATE_CELL}"',
        f'Public Const PRES_CHANT As String = "{P.CHANTIER_CELL}"',
        f'Public Const PRES_SEARCH As String = "{P.SEARCH_CELL}"',
        "",
        "'--- Feuille Liste a imprimer ---",
        f"Public Const I_HDR As Long = {I.HEADER_ROW}",
        f"Public Const I_ROW1 As Long = {I.FIRST_ROW}",
        f"Public Const I_CNUM As Long = {I.COL_NUM}",
        f"Public Const I_CID As Long = {I.COL_ID}",
        f"Public Const I_CNOM As Long = {I.COL_NOM}",
        f"Public Const I_CPOSTE As Long = {I.COL_POSTE}",
        f'Public Const IMP_DATE As String = "{I.DATE_CELL}"',
        f'Public Const IMP_CHANT As String = "{I.CHANTIER_CELL}"',
        "",
        "'--- Feuille Historique ---",
        f"Public Const H_HDR As Long = {H.HEADER_ROW}",
        f"Public Const H_ROW1 As Long = {H.FIRST_ROW}",
        f"Public Const H_CDATE As Long = {H.COL_DATE}",
        f"Public Const H_CID As Long = {H.COL_ID}",
        f"Public Const H_CNOM As Long = {H.COL_NOM}",
        f"Public Const H_CPOSTE As Long = {H.COL_POSTE}",
        f"Public Const H_CCHANT As Long = {H.COL_CHANTIER}",
        f"Public Const H_CPRES As Long = {H.COL_PRESENT}",
        "",
        "'--- Noms des tableaux ---",
        f'Public Const TBL_EMP As String = "{C.Emp.TABLE}"',
        f'Public Const TBL_HIST As String = "{H.TABLE}"',
        "",
        "'--- Plages nommees des parametres ---",
        f'Public Const PN_ENT As String = "{Pm.NAME_ENT}"',
        f'Public Const PN_CHANT As String = "{Pm.NAME_CHANTIER}"',
        f'Public Const PN_TITRE As String = "{Pm.NAME_TITRE}"',
        f'Public Const PN_PDF As String = "{Pm.NAME_PDF}"',
        f'Public Const PN_ORIENT As String = "{Pm.NAME_ORIENT}"',
        "",
        "'--- Couleurs des boutons (Long RGB) ---",
        f"Public Const CLR_GREEN As Long = {_rgblong(C.CLR_ACCENT)}",
        f"Public Const CLR_BLUE As Long = {_rgblong(C.CLR_BLUE)}",
        f"Public Const CLR_ORANGE As Long = {_rgblong(C.CLR_ORANGE)}",
        f"Public Const CLR_PRIM As Long = {_rgblong(C.CLR_PRIMARY)}",
        f"Public Const CLR_GREY As Long = {_rgblong(C.CLR_GREY)}",
        f"Public Const CLR_RED As Long = {_rgblong(C.CLR_RED)}",
    ]
    return "\n".join(lines) + "\n"


MOD_UTIL = r'''Option Explicit
'== Fonctions utilitaires partagees ==

' Renvoie le caractere de coche utilise pour marquer une presence.
Public Function CocheChar() As String
    CocheChar = ChrW(CHK)
End Function

' Lit la valeur d'un parametre (plage nommee) avec valeur par defaut.
Public Function GetParam(ByVal nm As String, Optional ByVal dflt As String = "") As String
    Dim s As String
    On Error GoTo fail
    s = CStr(ThisWorkbook.Names(nm).RefersToRange.Value)
    If Len(Trim$(s)) = 0 Then s = dflt
    GetParam = s
    Exit Function
fail:
    GetParam = dflt
End Function

' Active le mode rapide (desactive rafraichissement, evenements, calcul).
Public Sub SpeedOn()
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
End Sub

' Retablit le fonctionnement normal d'Excel.
Public Sub SpeedOff()
    Application.Calculation = xlCalculationAutomatic
    Application.EnableEvents = True
    Application.ScreenUpdating = True
End Sub

' Derniere ligne contenant une donnee dans une colonne (au moins minRow-1).
Public Function LastRowIn(ByVal ws As Worksheet, ByVal col As Long, ByVal minRow As Long) As Long
    Dim r As Long
    r = ws.Cells(ws.Rows.Count, col).End(xlUp).Row
    If r < minRow Then r = minRow - 1
    LastRowIn = r
End Function

' Retire la protection d'une feuille (sans erreur si non protegee).
Public Sub UnprotectWS(ByVal ws As Worksheet)
    On Error Resume Next
    ws.Unprotect PW
    On Error GoTo 0
End Sub

' Protege une feuille en autorisant le pilotage par macro (UserInterfaceOnly).
Public Sub ProtectWS(ByVal ws As Worksheet)
    On Error Resume Next
    ws.Protect Password:=PW, UserInterfaceOnly:=True, DrawingObjects:=True, _
               Contents:=True, Scenarios:=True, AllowFiltering:=True, AllowSorting:=True
    On Error GoTo 0
End Sub

' Protege la feuille Parametres mais laisse l'insertion d'objets (logo) possible.
Public Sub ProtectParam()
    On Error Resume Next
    wsParametres.Protect Password:=PW, UserInterfaceOnly:=True, DrawingObjects:=False, _
                         Contents:=True, Scenarios:=True
    On Error GoTo 0
End Sub

' Nettoie un nom de fichier (retire les caracteres interdits).
Public Function SafeName(ByVal s As String) As String
    Dim invalid As String, i As Long, r As String
    invalid = "\/:*?""<>| "
    r = s
    For i = 1 To Len(invalid)
        r = Replace(r, Mid$(invalid, i, 1), "_")
    Next i
    If Len(r) = 0 Then r = "Chantier"
    SafeName = r
End Function
'''


MOD_DATA = r'''Option Explicit
'== Lecture des employes, synchronisation de la liste, ecriture historique ==

' Renvoie un tableau 2D (1..n, 1..3) : ID, Nom, Poste des employes ACTIFS.
' Renvoie Empty si aucun employe actif.
Public Function ActiveEmployees() As Variant
    Dim lo As ListObject
    On Error Resume Next
    Set lo = wsEmployes.ListObjects(TBL_EMP)
    On Error GoTo 0
    If lo Is Nothing Then ActiveEmployees = Empty: Exit Function
    If lo.DataBodyRange Is Nothing Then ActiveEmployees = Empty: Exit Function

    Dim src As Variant
    src = lo.DataBodyRange.Value      ' 1=ID 2=Nom 3=Poste 4=Equipe 5=Statut
    Dim nR As Long: nR = UBound(src, 1)
    Dim tmp() As Variant
    ReDim tmp(1 To nR, 1 To 3)
    Dim i As Long, k As Long
    For i = 1 To nR
        If LCase$(Trim$(CStr(src(i, 5)))) = "actif" Then
            If Len(Trim$(CStr(src(i, 1)))) > 0 Then
                k = k + 1
                tmp(k, 1) = src(i, 1)
                tmp(k, 2) = src(i, 2)
                tmp(k, 3) = src(i, 3)
            End If
        End If
    Next i
    If k = 0 Then ActiveEmployees = Empty: Exit Function

    Dim res() As Variant
    ReDim res(1 To k, 1 To 3)
    For i = 1 To k
        res(i, 1) = tmp(i, 1): res(i, 2) = tmp(i, 2): res(i, 3) = tmp(i, 3)
    Next i
    ActiveEmployees = res
End Function

' Dictionnaire ID -> Boolean (coche) de l'etat actuel de la liste de presence.
Public Function RosterMarks() As Object
    Dim d As Object: Set d = CreateObject("Scripting.Dictionary")
    Dim last As Long: last = LastRowIn(wsPresence, P_CID, P_ROW1)
    Dim r As Long, id As String
    For r = P_ROW1 To last
        id = CStr(wsPresence.Cells(r, P_CID).Value)
        If Len(id) > 0 Then d(id) = (CStr(wsPresence.Cells(r, P_CCHK).Value) = ChrW(CHK))
    Next r
    Set RosterMarks = d
End Function

' Reconstruit la liste des presents a partir des employes actifs.
' preserve = True : conserve les coches existantes (par ID).
' preserve = False : nouvelle journee, tout est decoche.
Public Sub SyncRoster(ByVal preserve As Boolean)
    Dim emp As Variant: emp = ActiveEmployees()
    Dim marks As Object
    If preserve Then Set marks = RosterMarks()

    SpeedOn
    UnprotectWS wsPresence
    If wsPresence.AutoFilterMode Then wsPresence.AutoFilterMode = False

    ' effacer l'ancienne liste
    Dim last As Long: last = LastRowIn(wsPresence, P_CID, P_ROW1)
    If last >= P_ROW1 Then
        wsPresence.Range(wsPresence.Cells(P_ROW1, P_CCHK), _
                         wsPresence.Cells(last, P_CPOSTE)).ClearContents
    End If

    If IsEmpty(emp) Then GoTo done

    Dim n As Long: n = UBound(emp, 1)
    Dim vC() As Variant, vI() As Variant, vN() As Variant, vP() As Variant
    ReDim vC(1 To n, 1 To 1): ReDim vI(1 To n, 1 To 1)
    ReDim vN(1 To n, 1 To 1): ReDim vP(1 To n, 1 To 1)
    Dim i As Long, id As String
    For i = 1 To n
        id = CStr(emp(i, 1))
        vI(i, 1) = emp(i, 1): vN(i, 1) = emp(i, 2): vP(i, 1) = emp(i, 3)
        If preserve Then
            If marks.Exists(id) Then
                If marks(id) Then vC(i, 1) = ChrW(CHK) Else vC(i, 1) = ""
            Else
                vC(i, 1) = ""
            End If
        Else
            vC(i, 1) = ""
        End If
    Next i
    wsPresence.Cells(P_ROW1, P_CID).Resize(n, 1).Value = vI
    wsPresence.Cells(P_ROW1, P_CNOM).Resize(n, 1).Value = vN
    wsPresence.Cells(P_ROW1, P_CPOSTE).Resize(n, 1).Value = vP
    wsPresence.Cells(P_ROW1, P_CCHK).Resize(n, 1).Value = vC
done:
    ProtectWS wsPresence
    SpeedOff
End Sub

' Enregistre la journee dans l'historique (remplace si la date existe deja).
Public Sub SaveDay(ByVal dDate As Date, ByVal chantier As String, ByVal silent As Boolean)
    Dim last As Long: last = LastRowIn(wsPresence, P_CID, P_ROW1)
    If last < P_ROW1 Then
        If Not silent Then MsgBox "La liste des employés est vide." & vbCrLf & _
            "Cliquez d'abord sur 'Nouvelle journée'.", vbExclamation, "Enregistrement"
        Exit Sub
    End If

    Dim nRost As Long: nRost = last - P_ROW1 + 1
    ' Lecture du bloc complet B:E (4 colonnes) -> toujours un tableau 2D,
    ' meme s'il n'y a qu'un seul employe. block(i,1)=Coche 2=ID 3=Nom 4=Poste
    Dim block As Variant
    block = wsPresence.Range(wsPresence.Cells(P_ROW1, P_CCHK), _
                             wsPresence.Cells(last, P_CPOSTE)).Value

    Dim lo As ListObject: Set lo = wsHistorique.ListObjects(TBL_HIST)
    Dim existing As Variant, hasRows As Boolean
    hasRows = Not (lo.DataBodyRange Is Nothing)
    Dim keep As Collection: Set keep = New Collection
    Dim dup As Long: dup = 0
    Dim i As Long
    If hasRows Then
        existing = lo.DataBodyRange.Value
        Dim m As Long: m = UBound(existing, 1)
        For i = 1 To m
            If IsDate(existing(i, 1)) Then
                If Int(CDbl(existing(i, 1))) = Int(CDbl(dDate)) Then
                    dup = dup + 1
                Else
                    keep.Add i
                End If
            Else
                keep.Add i
            End If
        Next i
    End If

    If dup > 0 And Not silent Then
        If MsgBox("La journée du " & Format$(dDate, "dd/mm/yyyy") & _
                  " est déjà enregistrée." & vbCrLf & _
                  "Voulez-vous la remplacer par la saisie actuelle ?", _
                  vbQuestion + vbYesNo, "Journée existante") <> vbYes Then Exit Sub
    End If

    Dim total As Long: total = keep.Count + nRost
    Dim outArr() As Variant
    ReDim outArr(1 To total, 1 To 6)
    Dim k As Long: k = 0
    Dim idx As Variant
    If hasRows Then
        For Each idx In keep
            k = k + 1
            outArr(k, 1) = existing(idx, 1): outArr(k, 2) = existing(idx, 2)
            outArr(k, 3) = existing(idx, 3): outArr(k, 4) = existing(idx, 4)
            outArr(k, 5) = existing(idx, 5): outArr(k, 6) = existing(idx, 6)
        Next idx
    End If
    Dim present As Long: present = 0
    For i = 1 To nRost
        k = k + 1
        outArr(k, 1) = CDbl(dDate)
        outArr(k, 2) = block(i, 2)
        outArr(k, 3) = block(i, 3)
        outArr(k, 4) = block(i, 4)
        outArr(k, 5) = chantier
        If CStr(block(i, 1)) = ChrW(CHK) Then
            outArr(k, 6) = "Oui": present = present + 1
        Else
            outArr(k, 6) = "Non"
        End If
    Next i

    Dim prevExpand As Boolean
    prevExpand = Application.AutoCorrect.AutoExpandListRange
    SpeedOn
    Application.AutoCorrect.AutoExpandListRange = False
    UnprotectWS wsHistorique
    If Not (lo.DataBodyRange Is Nothing) Then lo.DataBodyRange.Delete
    wsHistorique.Cells(H_ROW1, H_CDATE).Resize(k, 6).Value = outArr
    lo.Resize wsHistorique.Range(wsHistorique.Cells(H_HDR, H_CDATE), _
                                 wsHistorique.Cells(H_ROW1 + k - 1, H_CPRES))
    wsHistorique.Range(wsHistorique.Cells(H_ROW1, H_CDATE), _
                       wsHistorique.Cells(H_ROW1 + k - 1, H_CDATE)).NumberFormat = "dd/mm/yyyy"
    ProtectWS wsHistorique
    Application.AutoCorrect.AutoExpandListRange = prevExpand
    SpeedOff

    If Not silent Then
        MsgBox "Journée du " & Format$(dDate, "dd/mm/yyyy") & " enregistrée." & vbCrLf & _
               present & " présent(s) sur " & nRost & " employé(s).", _
               vbInformation, "Enregistrement réussi"
    End If
End Sub
'''


MOD_ACTIONS = r'''Option Explicit
'== Actions des boutons ==

' Prepare une nouvelle journee : date du jour, liste reconstruite, tout decoche.
Public Sub NouvelleJournee()
    UnprotectWS wsPresence
    wsPresence.Range(PRES_DATE).Value = Date
    wsPresence.Range(PRES_DATE).NumberFormat = "dd/mm/yyyy"
    If Len(Trim$(CStr(wsPresence.Range(PRES_CHANT).Value))) = 0 Then
        wsPresence.Range(PRES_CHANT).Value = GetParam(PN_CHANT, "")
    End If
    wsPresence.Range(PRES_SEARCH).ClearContents
    ProtectWS wsPresence
    SyncRoster False
    wsPresence.Activate
    MsgBox "Nouvelle journée prête (" & Format$(Date, "dd/mm/yyyy") & ")." & vbCrLf & vbCrLf & _
           "Double-cliquez sur une ligne pour marquer un présent," & vbCrLf & _
           "puis cliquez sur 'Enregistrer la journée'.", vbInformation, "Nouvelle journée"
End Sub

' Enregistre la journee affichee dans l'historique.
Public Sub EnregistrerJournee()
    If Not IsDate(wsPresence.Range(PRES_DATE).Value) Then wsPresence.Range(PRES_DATE).Value = Date
    SaveDay CDate(wsPresence.Range(PRES_DATE).Value), CStr(wsPresence.Range(PRES_CHANT).Value), False
End Sub

' Coche tous les employes.
Public Sub ToutCocher()
    ToggleAll True
End Sub

' Decoche tous les employes.
Public Sub ToutDecocher()
    ToggleAll False
End Sub

Private Sub ToggleAll(ByVal mark As Boolean)
    Dim last As Long: last = LastRowIn(wsPresence, P_CID, P_ROW1)
    If last < P_ROW1 Then Exit Sub
    SpeedOn
    UnprotectWS wsPresence
    Dim arr() As Variant, i As Long, n As Long
    n = last - P_ROW1 + 1
    ReDim arr(1 To n, 1 To 1)
    For i = 1 To n
        If mark Then arr(i, 1) = ChrW(CHK) Else arr(i, 1) = ""
    Next i
    wsPresence.Cells(P_ROW1, P_CCHK).Resize(n, 1).Value = arr
    ProtectWS wsPresence
    SpeedOff
End Sub

' Applique le filtre de recherche par nom sur la liste.
Public Sub ApplySearch(ByVal txt As String)
    Dim last As Long: last = LastRowIn(wsPresence, P_CID, P_ROW1)
    UnprotectWS wsPresence
    If wsPresence.AutoFilterMode Then wsPresence.AutoFilterMode = False
    If last >= P_ROW1 And Len(Trim$(txt)) > 0 Then
        wsPresence.Range(wsPresence.Cells(P_HDR, P_CCHK), _
                         wsPresence.Cells(last, P_CPOSTE)).AutoFilter _
                         Field:=(P_CNOM - P_CCHK + 1), Criteria1:="*" & txt & "*"
    End If
    ProtectWS wsPresence
End Sub

' Construit la liste a imprimer pour une date donnee (a partir de l'historique).
Public Sub BuildPrintList(ByVal dDate As Date)
    Dim lo As ListObject: Set lo = wsHistorique.ListObjects(TBL_HIST)
    Dim ids() As String, noms() As String, poss() As String
    Dim chantier As String: chantier = ""
    Dim cnt As Long: cnt = 0
    Dim i As Long

    If Not (lo.DataBodyRange Is Nothing) Then
        Dim data As Variant: data = lo.DataBodyRange.Value
        Dim nR As Long: nR = UBound(data, 1)
        ReDim ids(1 To nR): ReDim noms(1 To nR): ReDim poss(1 To nR)
        For i = 1 To nR
            If IsDate(data(i, 1)) Then
                If Int(CDbl(data(i, 1))) = Int(CDbl(dDate)) And CStr(data(i, 6)) = "Oui" Then
                    cnt = cnt + 1
                    ids(cnt) = CStr(data(i, 2))
                    noms(cnt) = CStr(data(i, 3))
                    poss(cnt) = CStr(data(i, 4))
                    If Len(chantier) = 0 Then chantier = CStr(data(i, 5))
                End If
            End If
        Next i
    End If

    ' tri par nom
    Dim a As Long, b As Long, ts As String
    For a = 1 To cnt - 1
        For b = a + 1 To cnt
            If StrComp(noms(a), noms(b), vbTextCompare) > 0 Then
                ts = noms(a): noms(a) = noms(b): noms(b) = ts
                ts = ids(a): ids(a) = ids(b): ids(b) = ts
                ts = poss(a): poss(a) = poss(b): poss(b) = ts
            End If
        Next b
    Next a

    SpeedOn
    UnprotectWS wsImpression
    Dim lastOld As Long: lastOld = LastRowIn(wsImpression, I_CID, I_ROW1)
    Dim clearTo As Long: clearTo = Application.Max(lastOld + 3, I_ROW1 + 60)
    With wsImpression.Range(wsImpression.Cells(I_ROW1, I_CNUM), wsImpression.Cells(clearTo, I_CPOSTE))
        .ClearContents
        .Borders.LineStyle = xlNone
        .Interior.Pattern = xlNone
        .Font.Bold = False
    End With

    If cnt > 0 Then
        Dim outArr() As Variant
        ReDim outArr(1 To cnt, 1 To 4)
        For i = 1 To cnt
            outArr(i, 1) = i: outArr(i, 2) = ids(i)
            outArr(i, 3) = noms(i): outArr(i, 4) = poss(i)
        Next i
        Dim tgt As Range
        Set tgt = wsImpression.Cells(I_ROW1, I_CNUM).Resize(cnt, 4)
        tgt.Value = outArr
        tgt.Font.Name = "Calibri"
        tgt.Font.Size = 11
        tgt.RowHeight = 19
        With tgt.Borders
            .LineStyle = xlContinuous
            .Color = RGB(150, 160, 168)
            .Weight = xlThin
        End With
        wsImpression.Cells(I_ROW1, I_CNUM).Resize(cnt, 1).HorizontalAlignment = xlCenter
        wsImpression.Cells(I_ROW1, I_CID).Resize(cnt, 1).HorizontalAlignment = xlCenter
        For i = 1 To cnt
            If i Mod 2 = 0 Then
                wsImpression.Cells(I_ROW1 + i - 1, I_CNUM).Resize(1, 4).Interior.Color = RGB(234, 241, 244)
            End If
        Next i
    End If

    wsImpression.Range(IMP_DATE).Value = dDate
    wsImpression.Range(IMP_DATE).NumberFormat = "dd/mm/yyyy"
    If Len(chantier) = 0 Then chantier = GetParam(PN_CHANT, "")
    wsImpression.Range(IMP_CHANT).Value = chantier

    Dim totRow As Long: totRow = I_ROW1 + Application.Max(cnt, 1)
    wsImpression.Cells(totRow, I_CID).Value = "Total présents :"
    wsImpression.Cells(totRow, I_CID).Font.Bold = True
    wsImpression.Cells(totRow, I_CPOSTE).Value = cnt
    wsImpression.Cells(totRow, I_CPOSTE).Font.Bold = True
    wsImpression.Cells(totRow, I_CPOSTE).HorizontalAlignment = xlCenter

    wsImpression.PageSetup.PrintArea = wsImpression.Range( _
        wsImpression.Cells(1, I_CNUM), wsImpression.Cells(totRow + 1, I_CPOSTE)).Address
    ProtectWS wsImpression
    SpeedOff
End Sub

' Impression de la journee courante (avec sauvegarde automatique).
Public Sub Imprimer()
    If Not IsDate(wsPresence.Range(PRES_DATE).Value) Then wsPresence.Range(PRES_DATE).Value = Date
    Dim d As Date: d = CDate(wsPresence.Range(PRES_DATE).Value)
    SaveDay d, CStr(wsPresence.Range(PRES_CHANT).Value), True
    On Error Resume Next
    ThisWorkbook.Save
    On Error GoTo 0
    BuildPrintList d
    wsImpression.Activate
    On Error GoTo printErr
    wsImpression.PrintOut
    Exit Sub
printErr:
    MsgBox "Impression impossible (imprimante indisponible ?)." & vbCrLf & _
           "La feuille 'Liste à imprimer' est prête : utilisez Fichier > Imprimer.", _
           vbExclamation, "Impression"
End Sub

' Impression de la liste actuellement affichee (n'importe quelle date).
Public Sub ImprimerFeuille()
    If IsDate(wsImpression.Range(IMP_DATE).Value) Then BuildPrintList CDate(wsImpression.Range(IMP_DATE).Value)
    wsImpression.Activate
    On Error GoTo printErr
    wsImpression.PrintOut
    Exit Sub
printErr:
    MsgBox "Impression impossible (imprimante indisponible ?)." & vbCrLf & _
           "Utilisez Fichier > Imprimer.", vbExclamation, "Impression"
End Sub

' Export PDF de la journee courante (avec sauvegarde automatique).
Public Sub ExporterPDF()
    If Not IsDate(wsPresence.Range(PRES_DATE).Value) Then wsPresence.Range(PRES_DATE).Value = Date
    Dim d As Date: d = CDate(wsPresence.Range(PRES_DATE).Value)
    SaveDay d, CStr(wsPresence.Range(PRES_CHANT).Value), True
    On Error Resume Next
    ThisWorkbook.Save
    On Error GoTo 0
    DoExportPDF d
End Sub

' Export PDF de la liste actuellement affichee.
Public Sub ExporterPDFFeuille()
    If IsDate(wsImpression.Range(IMP_DATE).Value) Then DoExportPDF CDate(wsImpression.Range(IMP_DATE).Value)
End Sub

Private Sub DoExportPDF(ByVal dDate As Date)
    BuildPrintList dDate
    Dim folder As String, fname As String, full As String
    folder = GetParam(PN_PDF, "")
    If Len(Trim$(folder)) = 0 Then folder = ThisWorkbook.Path
    If Right$(folder, 1) <> Application.PathSeparator Then folder = folder & Application.PathSeparator
    fname = "Presence_" & SafeName(CStr(wsImpression.Range(IMP_CHANT).Value)) & _
            "_" & Format$(dDate, "yyyy-mm-dd") & ".pdf"
    full = folder & fname
    On Error GoTo pdfErr
    wsImpression.ExportAsFixedFormat Type:=xlTypePDF, Filename:=full, _
        Quality:=xlQualityStandard, IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, OpenAfterPublish:=False
    MsgBox "PDF créé avec succès :" & vbCrLf & full, vbInformation, "Export PDF"
    Exit Sub
pdfErr:
    MsgBox "Impossible de créer le PDF ici :" & vbCrLf & full & vbCrLf & vbCrLf & _
           "Vérifiez le 'Dossier d'export PDF' dans la feuille Paramètres.", _
           vbExclamation, "Export PDF"
End Sub
'''



MOD_UI = r'''Option Explicit
'== Construction de l'interface (boutons) et navigation ==

' Cree ou remplace un bouton (forme arrondie) lie a une macro.
Private Sub AddBtn(ByVal ws As Worksheet, ByVal nm As String, ByVal cap As String, _
                   ByVal L As Single, ByVal T As Single, ByVal W As Single, ByVal H As Single, _
                   ByVal macro As String, ByVal clr As Long, Optional ByVal fs As Single = 11)
    Dim shp As Shape
    On Error Resume Next
    ws.Shapes("kb_" & nm).Delete
    On Error GoTo 0
    Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, L, T, W, H)
    shp.Name = "kb_" & nm
    shp.Fill.ForeColor.RGB = clr
    shp.Fill.Solid
    shp.Line.Visible = msoFalse
    With shp.TextFrame2
        .TextRange.Text = cap
        .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
        .TextRange.Font.Size = fs
        .TextRange.Font.Bold = msoTrue
        .TextRange.Font.Name = "Calibri"
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        .WordWrap = msoTrue
        .AutoSize = msoAutoSizeNone
        .MarginLeft = 2: .MarginRight = 2: .MarginTop = 1: .MarginBottom = 1
    End With
    shp.OnAction = macro
    shp.Placement = xlMove
End Sub

' Supprime tous les boutons generes (prefixe kb_) d'une feuille.
Private Sub ClearButtons(ByVal ws As Worksheet)
    Dim i As Long
    For i = ws.Shapes.Count To 1 Step -1
        If Left$(ws.Shapes(i).Name, 3) = "kb_" Then ws.Shapes(i).Delete
    Next i
End Sub

' (Re)construit tous les boutons du classeur.
Public Sub EnsureButtons()
    BuildPresenceButtons
    BuildImpressionButtons
    BuildAccueilButtons
End Sub

Private Sub BuildPresenceButtons()
    UnprotectWS wsPresence
    ClearButtons wsPresence
    Dim L As Single, T As Single, W As Single, H As Single, g As Single
    L = wsPresence.Range("B3").Left
    T = wsPresence.Range("B3").Top + 2
    W = 132: H = 34: g = 6
    AddBtn wsPresence, "nouv", "Nouvelle journée", L, T, W, H, "NouvelleJournee", CLR_GREEN
    L = L + W + g
    AddBtn wsPresence, "enr", "Enregistrer la journée", L, T, W, H, "EnregistrerJournee", CLR_BLUE
    L = L + W + g
    AddBtn wsPresence, "imp", "Imprimer", L, T, W, H, "Imprimer", CLR_ORANGE
    L = L + W + g
    AddBtn wsPresence, "pdf", "Exporter en PDF", L, T, W, H, "ExporterPDF", CLR_PRIM
    L = L + W + g
    AddBtn wsPresence, "cocher", "Tout cocher", L, T, W, H, "ToutCocher", CLR_GREY
    L = L + W + g
    AddBtn wsPresence, "decocher", "Tout décocher", L, T, W, H, "ToutDecocher", CLR_RED
    ProtectWS wsPresence
End Sub

Private Sub BuildImpressionButtons()
    UnprotectWS wsImpression
    ClearButtons wsImpression
    Dim L As Single, T As Single, W As Single, H As Single, g As Single
    L = wsImpression.Range("G2").Left
    T = wsImpression.Range("G2").Top
    W = 150: H = 36: g = 8
    AddBtn wsImpression, "imp", "Imprimer cette liste", L, T, W, H, "ImprimerFeuille", CLR_ORANGE
    T = T + H + g
    AddBtn wsImpression, "pdf", "Exporter en PDF", L, T, W, H, "ExporterPDFFeuille", CLR_PRIM
    T = T + H + g
    AddBtn wsImpression, "acc", "Retour à l'accueil", L, T, W, H, "AllerAccueil", CLR_GREY
    ProtectWS wsImpression
End Sub

Private Sub BuildAccueilButtons()
    UnprotectWS wsAccueil
    ClearButtons wsAccueil
    Dim xa As Single, xn As Single, y0 As Single, W As Single, H As Single, g As Single
    xa = wsAccueil.Range("B6").Left
    xn = wsAccueil.Range("F6").Left
    y0 = wsAccueil.Range("B6").Top
    W = 250: H = 42: g = 10
    ' Actions rapides
    AddBtn wsAccueil, "a1", "1.  Nouvelle journée", xa, y0, W, H, "NouvelleJournee", CLR_GREEN, 12
    AddBtn wsAccueil, "a2", "2.  Saisir les présences", xa, y0 + (H + g), W, H, "AllerPresence", CLR_BLUE, 12
    AddBtn wsAccueil, "a3", "3.  Enregistrer la journée", xa, y0 + 2 * (H + g), W, H, "EnregistrerJournee", CLR_PRIM, 12
    AddBtn wsAccueil, "a4", "4.  Imprimer la liste", xa, y0 + 3 * (H + g), W, H, "Imprimer", CLR_ORANGE, 12
    ' Navigation
    Dim wn As Single, hn As Single
    wn = 210: hn = 32
    AddBtn wsAccueil, "n1", "Employés", xn, y0, wn, hn, "AllerEmployes", CLR_GREY
    AddBtn wsAccueil, "n2", "Historique", xn, y0 + (hn + g), wn, hn, "AllerHistorique", CLR_GREY
    AddBtn wsAccueil, "n3", "Liste à imprimer", xn, y0 + 2 * (hn + g), wn, hn, "AllerImpression", CLR_GREY
    AddBtn wsAccueil, "n4", "Paramètres", xn, y0 + 3 * (hn + g), wn, hn, "AllerParametres", CLR_GREY
    AddBtn wsAccueil, "n5", "Guide d'utilisation", xn, y0 + 4 * (hn + g), wn, hn, "AllerGuide", CLR_GREY
    ProtectWS wsAccueil
End Sub

' ---- Navigation ----
Public Sub AllerAccueil()
    wsAccueil.Activate
End Sub
Public Sub AllerEmployes()
    wsEmployes.Activate
End Sub
Public Sub AllerPresence()
    wsPresence.Activate
End Sub
Public Sub AllerImpression()
    wsImpression.Activate
End Sub
Public Sub AllerHistorique()
    wsHistorique.Activate
End Sub
Public Sub AllerParametres()
    wsParametres.Activate
End Sub
Public Sub AllerGuide()
    wsGuide.Activate
End Sub

' Initialise/repare l'interface a chaque ouverture du classeur.
Public Sub EnsureUI()
    On Error Resume Next
    EnsureButtons
    wsPresence.Range(PRES_DATE).Value = Date
    wsPresence.Range(PRES_DATE).NumberFormat = "dd/mm/yyyy"
    If Len(Trim$(CStr(wsPresence.Range(PRES_CHANT).Value))) = 0 Then
        wsPresence.Range(PRES_CHANT).Value = GetParam(PN_CHANT, "")
    End If
    SyncRoster True
    If Not IsDate(wsImpression.Range(IMP_DATE).Value) Then wsImpression.Range(IMP_DATE).Value = Date
    BuildPrintList CDate(wsImpression.Range(IMP_DATE).Value)
    ProtectWS wsPresence
    ProtectWS wsImpression
    ProtectWS wsHistorique
    ProtectParam
    ProtectWS wsGuide
    ProtectWS wsAccueil
    On Error GoTo 0
End Sub
'''


# --------------------------------------------------------------------------
# Modules DOCUMENT (evenements). Attributs generes par make_vba ; ici le corps.
# --------------------------------------------------------------------------
DOC_THISWORKBOOK = r'''Option Explicit
'== Classeur : demarrage automatique ==

Private Sub Workbook_Open()
    On Error Resume Next
    EnsureUI
    wsAccueil.Activate
End Sub
'''

DOC_WSPRESENCE = r'''Option Explicit
'== Feuille Presence : synchronisation, pointage, recherche ==

' A l'activation : la liste se met a jour avec les employes actifs (coches conservees).
Private Sub Worksheet_Activate()
    On Error Resume Next
    SyncRoster True
End Sub

' Double-clic sur une ligne = marquer / retirer une presence.
Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    If Target.Cells.Count <> 1 Then Exit Sub
    If Target.Row < P_ROW1 Then Exit Sub
    If Target.Column < P_CCHK Or Target.Column > P_CPOSTE Then Exit Sub
    If Len(CStr(Me.Cells(Target.Row, P_CID).Value)) = 0 Then Exit Sub
    Application.EnableEvents = False
    UnprotectWS Me
    If Me.Cells(Target.Row, P_CCHK).Value = ChrW(CHK) Then
        Me.Cells(Target.Row, P_CCHK).Value = ""
    Else
        Me.Cells(Target.Row, P_CCHK).Value = ChrW(CHK)
    End If
    ProtectWS Me
    Application.EnableEvents = True
    Cancel = True
End Sub

' Recherche : filtre la liste par nom quand on tape dans la case de recherche.
Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range(PRES_SEARCH)) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    On Error Resume Next
    ApplySearch CStr(Me.Range(PRES_SEARCH).Value)
    Application.EnableEvents = True
End Sub
'''

DOC_WSIMPRESSION = r'''Option Explicit
'== Feuille Liste a imprimer : mise a jour selon la date choisie ==

Private Sub Worksheet_Activate()
    On Error Resume Next
    If IsDate(Me.Range(IMP_DATE).Value) Then BuildPrintList CDate(Me.Range(IMP_DATE).Value)
End Sub

Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range(IMP_DATE)) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    On Error Resume Next
    If IsDate(Me.Range(IMP_DATE).Value) Then BuildPrintList CDate(Me.Range(IMP_DATE).Value)
    Application.EnableEvents = True
End Sub
'''

DOC_EMPTY = "Option Explicit\n"


def get_modules():
    """
    Renvoie la liste ordonnee des modules VBA :
        (nom_du_module, genre, corps_source)
    genre : 'workbook' | 'worksheet' | 'std'
    """
    return [
        # Modules document (evenements)
        ("ThisWorkbook", "workbook", DOC_THISWORKBOOK),
        (C.CN_ACCUEIL, "worksheet", DOC_EMPTY),
        (C.CN_EMP, "worksheet", DOC_EMPTY),
        (C.CN_PRES, "worksheet", DOC_WSPRESENCE),
        (C.CN_IMP, "worksheet", DOC_WSIMPRESSION),
        (C.CN_HIST, "worksheet", DOC_EMPTY),
        (C.CN_PARAM, "worksheet", DOC_EMPTY),
        (C.CN_GUIDE, "worksheet", DOC_EMPTY),
        # Modules standard (logique)
        ("modConfig", "std", _modconfig()),
        ("modUtil", "std", MOD_UTIL),
        ("modData", "std", MOD_DATA),
        ("modActions", "std", MOD_ACTIONS),
        ("modUI", "std", MOD_UI),
    ]
