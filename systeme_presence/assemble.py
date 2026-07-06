# -*- coding: utf-8 -*-
"""
Assemble le classeur final .xlsm a partir :
  - du .xlsx construit par workbook.py
  - du vbaProject.bin construit par make_vba.py

Post-traitement du conteneur ZIP OOXML :
  1. [Content_Types].xml : type du classeur -> macroEnabled + Override vbaProject
  2. xl/workbook.xml : codeName="ThisWorkbook" sur workbookPr
  3. xl/_rels/workbook.xml.rels : relation vers vbaProject.bin
  4. ajout de xl/vbaProject.bin
"""
import re
import zipfile
import shutil
import os

WORKBOOK_MAIN = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"
MACRO_MAIN = "application/vnd.ms-excel.sheet.macroEnabled.main+xml"
VBA_CT = "application/vnd.ms-office.vbaProject"
VBA_REL_TYPE = "http://schemas.microsoft.com/office/2006/relationships/vbaProject"


def _fix_content_types(xml: str) -> str:
    # 1) le classeur devient macro-enabled
    xml = xml.replace(WORKBOOK_MAIN, MACRO_MAIN)
    # 2) declare le type de vbaProject.bin (si absent)
    if "vbaProject.bin" not in xml:
        override = f'<Override PartName="/xl/vbaProject.bin" ContentType="{VBA_CT}"/>'
        xml = xml.replace("</Types>", override + "</Types>")
    return xml


def _fix_workbook_xml(xml: str) -> str:
    if "codeName=" in xml:
        return xml
    # injecte codeName dans <workbookPr ...> (ou cree le tag si absent)
    if re.search(r"<workbookPr\b", xml):
        xml = re.sub(r"<workbookPr\b([^>]*?)/>",
                     r'<workbookPr\1 codeName="ThisWorkbook"/>', xml, count=1)
        # cas d'un tag non auto-ferme <workbookPr ...>...
        if 'codeName="ThisWorkbook"' not in xml:
            xml = re.sub(r"<workbookPr\b([^>]*?)>",
                         r'<workbookPr\1 codeName="ThisWorkbook">', xml, count=1)
    else:
        # inserer juste apres la balise <workbook ...>
        xml = re.sub(r"(<workbook\b[^>]*>)",
                     r'\1<workbookPr codeName="ThisWorkbook"/>', xml, count=1)
    return xml


def _fix_workbook_rels(xml: str) -> str:
    if VBA_REL_TYPE in xml:
        return xml
    ids = [int(m) for m in re.findall(r'Id="rId(\d+)"', xml)]
    new_id = "rId%d" % (max(ids) + 1 if ids else 1)
    rel = (f'<Relationship Id="{new_id}" Type="{VBA_REL_TYPE}" '
           f'Target="vbaProject.bin"/>')
    return xml.replace("</Relationships>", rel + "</Relationships>")


def assemble(xlsx_path: str, vba_bin_path: str, xlsm_path: str) -> str:
    with open(vba_bin_path, "rb") as f:
        vba_bytes = f.read()

    tmp = xlsm_path + ".tmp"
    with zipfile.ZipFile(xlsx_path, "r") as zin, \
         zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        names = set(zin.namelist())
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "[Content_Types].xml":
                data = _fix_content_types(data.decode("utf-8")).encode("utf-8")
            elif item.filename == "xl/workbook.xml":
                data = _fix_workbook_xml(data.decode("utf-8")).encode("utf-8")
            elif item.filename == "xl/_rels/workbook.xml.rels":
                data = _fix_workbook_rels(data.decode("utf-8")).encode("utf-8")
            zout.writestr(item, data)
        # ajoute le binaire VBA
        zout.writestr("xl/vbaProject.bin", vba_bytes)

    shutil.move(tmp, xlsm_path)
    return xlsm_path


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    assemble(os.path.join(here, "_tmp_build.xlsx"),
             os.path.join(here, "vbaProject.bin"),
             os.path.join(here, "_test.xlsm"))
    print("assemble OK")
