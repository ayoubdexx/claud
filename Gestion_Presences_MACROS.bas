Attribute VB_Name = "ModPresence"
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
    If Right(basePath, 1) <> "\" Then basePath = basePath & "\"
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
