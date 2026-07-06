
Private Sub Workbook_Open()
    ' Ouvrir sur la feuille Presence du Jour
    On Error Resume Next
    ThisWorkbook.Sheets("Presence du Jour").Activate
    On Error GoTo 0
End Sub
