# -*- coding: utf-8 -*-
"""
Construit xl/vbaProject.bin a partir des modules definis dans vba.py.

Strategie (validee) : on hand-ecrit chaque fichier <module>.new avec l'en-tete
d'attributs dans le BON ordre (attributs AVANT le code), encode en Windows-1252,
puis on laisse la librairie ms_ovba compresser et assembler le conteneur OLE.
On contourne ainsi DocModule.normalize_file qui place les attributs apres le code.
"""
import os
import shutil
import uuid

import sp_config as C
import vba
import ovba_compress

# --- Correctif : remplace le compresseur MS-OVBA bogue de la librairie -------
# ms_ovba_compression corrompt les flux > 4096 octets (offsets de copie hors
# chunk). On force notre implementation conforme pour TOUS les flux compresses
# (modules ET flux 'dir').
from ms_ovba_compression.ms_ovba import MsOvba as _MsOvba
def _correct_compress(self, data):
    return ovba_compress.compress(data)
_MsOvba.compress = _correct_compress
# -----------------------------------------------------------------------------

from ms_ovba.vbaProject import VbaProject
from ms_ovba.Models.Entities.doc_module import DocModule
from ms_ovba.Models.Entities.std_module import StdModule
from ms_ovba.Views.project_ole_file import ProjectOleFile
from ms_ovba.Models.Entities.reference import Reference
from ms_ovba.Models.Entities.reference_registered import ReferenceRegistered
from ms_ovba.Models.Fields.libid_reference import LibidReference

# Identifiant de projet stable (deterministe entre deux builds)
PROJECT_ID = "{7A1C4E60-3B2D-4F51-9C88-2E7A9D6B10F4}"


def _doc_header(name, guid):
    return (
        "VERSION 1.0 CLASS\n"
        "BEGIN\n"
        "  MultiUse = -1  'True\n"
        "END\n"
        f'Attribute VB_Name = "{name}"\n'
        f'Attribute VB_Base = "0{guid}"\n'
        "Attribute VB_GlobalNameSpace = False\n"
        "Attribute VB_Creatable = False\n"
        "Attribute VB_PredeclaredId = True\n"
        "Attribute VB_Exposed = True\n"
        "Attribute VB_TemplateDerived = False\n"
        "Attribute VB_Customizable = True\n"
    )


def _std_header(name):
    return f'Attribute VB_Name = "{name}"\n'


def _write_new(base, text):
    """Ecrit <base>.new en CRLF + Windows-1252."""
    data = text.replace("\r\n", "\n").replace("\n", "\r\n")
    with open(base + ".new", "wb") as f:
        f.write(data.encode("cp1252"))


def build_vba_bin(dest_path):
    """Construit vbaProject.bin et le copie vers dest_path. Renvoie dest_path."""
    work = os.path.join(os.path.dirname(os.path.abspath(dest_path)), "_vba_work")
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work, exist_ok=True)
    prev_cwd = os.getcwd()
    os.chdir(work)
    try:
        project = VbaProject()
        project.project_id = PROJECT_ID

        for name, kind, body in vba.get_modules():
            base = os.path.join(work, name)
            if kind == "workbook":
                _write_new(base, _doc_header(name, C.GUID_WORKBOOK) + body)
                m = DocModule(name)
                m.add_file(base)
                project.add_module(m)
            elif kind == "worksheet":
                _write_new(base, _doc_header(name, C.GUID_WORKSHEET) + body)
                m = DocModule(name)
                m.add_file(base)
                project.add_module(m)
            else:  # std
                _write_new(base, _std_header(name) + body)
                m = StdModule(name)
                m.add_file(base)
                project.add_module(m)

        # References standard (resolues par GUID cote Excel)
        ole = ReferenceRegistered(LibidReference(
            uuid.UUID("0002043000000000C000000000000046"), "2.0", "0",
            "C:\\Windows\\System32\\stdole2.tlb", "OLE Automation"))
        office = ReferenceRegistered(LibidReference(
            uuid.UUID("2DF8D04C5BFA101BBDE500AA0044DE52"), "2.0", "0",
            "C:\\Program Files\\Common Files\\Microsoft Shared\\OFFICE16\\MSO.DLL",
            "Microsoft Office 16.0 Object Library"))
        project.add_reference(Reference(ole, "stdole"))
        project.add_reference(Reference(office, "Office"))

        ProjectOleFile.write_file(project)  # ecrit ./vbaProject.bin
        produced = os.path.join(work, "vbaProject.bin")
        shutil.copyfile(produced, dest_path)
    finally:
        os.chdir(prev_cwd)
    return dest_path


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vbaProject.bin")
    build_vba_bin(out)
    print("vbaProject.bin ->", out, os.path.getsize(out), "octets")
