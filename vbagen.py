"""
vbagen.py - Generate a fully-functional ``vbaProject.bin`` from VBA source.

This is a thin, self-documenting wrapper around the (MIT-licensed) Beakerboy
MS-OVBA / MS-CFB toolchain, which is vendored/available under ``_vbatools``.

It produces a *source-only* VBA project (no compiled p-code / performance
cache).  When Excel opens the workbook it detects the missing cache and
recompiles every module from the stored source, so the macros are live.

Public API
----------
    make_module(name, code, kind="standard", guid=None)
    build_vba_project(out_path, modules, project_name=..., project_id=...)

``kind`` is one of:
    "standard"  -> a normal code module (.bas)
    "document"  -> a ThisWorkbook / worksheet code-behind module
For document modules ``guid`` selects the base class:
    GUID_WORKBOOK   for ThisWorkbook
    GUID_WORKSHEET  for a worksheet code module
"""

from __future__ import annotations

import os
import sys
import uuid
import shutil
import tempfile

# Make the vendored toolchain importable regardless of the caller's CWD.
_HERE = os.path.dirname(os.path.abspath(__file__))
_TOOLS = os.path.join(_HERE, "_vbatools")
if _TOOLS not in sys.path:
    sys.path.insert(0, _TOOLS)
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

# Replace the third-party compressor with a correct implementation.
import ovba_fix                                              # noqa: E402
ovba_fix.install()

from ms_ovba.vbaProject import VbaProject                       # noqa: E402
from ms_ovba.Models.Entities.doc_module import DocModule        # noqa: E402
from ms_ovba.Models.Entities.std_module import StdModule        # noqa: E402
from ms_ovba.Views.project_ole_file import ProjectOleFile       # noqa: E402
from ms_ovba.Models.Entities.reference import Reference         # noqa: E402
from ms_ovba.Models.Entities.reference_registered import (      # noqa: E402
    ReferenceRegistered,
)
from ms_ovba.Models.Fields.libid_reference import LibidReference  # noqa: E402

# Standard base-class GUIDs for document code modules.
GUID_WORKBOOK = "0002081900000000C000000000000046"
GUID_WORKSHEET = "0002082000000000C000000000000046"

# Default library references (resolved by GUID on the user's machine).
_DEFAULT_REFERENCES = [
    ("000204EF-0000-0000-C000-000000000046", "4.2", "9",
     r"C:\PROGRA~1\COMMON~1\MICROS~1\VBA\VBA7.1\VBE7.DLL",
     "Visual Basic For Applications", "VBA"),
    ("00020813-0000-0000-C000-000000000046", "1.9", "0",
     r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE",
     "Microsoft Excel 16.0 Object Library", "Excel"),
    ("00020430-0000-0000-C000-000000000046", "2.0", "0",
     r"C:\Windows\System32\stdole2.tlb", "OLE Automation", "stdole"),
    ("2DF8D04C-5BFA-101B-BDE5-00AA0044DE52", "2.8", "0",
     r"C:\Program Files\Common Files\Microsoft Shared\OFFICE16\MSO.DLL",
     "Microsoft Office 16.0 Object Library", "Office"),
]

# Attribute block that must precede all code inside a document code module.
_DOC_ATTRS = [
    'Attribute VB_Name = "{name}"',
    'Attribute VB_Base = "0{{{guid}}}"',
    'Attribute VB_GlobalNameSpace = False',
    'Attribute VB_Creatable = False',
    'Attribute VB_PredeclaredId = True',
    'Attribute VB_Exposed = True',
    'Attribute VB_TemplateDerived = False',
    'Attribute VB_Customizable = True',
]


class _Module:
    def __init__(self, name, code, kind="standard", guid=None):
        self.name = name
        self.code = code
        self.kind = kind
        self.guid = guid


def make_module(name, code, kind="standard", guid=None):
    """Describe a VBA module to include in the project."""
    if kind not in ("standard", "document"):
        raise ValueError("kind must be 'standard' or 'document'")
    if kind == "document" and guid is None:
        raise ValueError("document modules require a base-class guid")
    return _Module(name, code, kind, guid)


def _normalise(code: str) -> str:
    """Ensure CRLF line endings and a trailing newline."""
    text = code.replace("\r\n", "\n").replace("\r", "\n")
    if not text.endswith("\n"):
        text += "\n"
    return text.replace("\n", "\r\n")


def _doc_source(name: str, guid: str, code: str) -> str:
    """Full stored source for a document module: attributes first, then code."""
    guid_fmt = str(uuid.UUID(guid)).upper()
    header = "\r\n".join(a.format(name=name, guid=guid_fmt) for a in _DOC_ATTRS)
    return header + "\r\n" + _normalise(code)


def _std_source(name: str, code: str) -> str:
    """Full stored source for a standard module."""
    if code.lstrip().startswith("Attribute VB_Name"):
        return _normalise(code)
    return 'Attribute VB_Name = "%s"\r\n' % name + _normalise(code)


def build_vba_project(out_path, modules,
                      project_name="GestionPresence",
                      project_id="{9E394C0B-697E-4AEE-9FA6-446F51FB30DC}"):
    """Assemble a vbaProject.bin at *out_path* from a list of :func:`make_module`."""
    out_path = os.path.abspath(out_path)
    scratch = tempfile.mkdtemp(prefix="vba_", dir=_HERE)
    prev_cwd = os.getcwd()
    try:
        os.chdir(scratch)

        project = VbaProject()
        project.project_id = project_id
        project.include_projectwm()
        project.include_compat()

        for m in modules:
            path = os.path.join(scratch, m.name)
            # We build the exact stored source ourselves and write it directly
            # to the ".new" file that the toolchain compresses, bypassing the
            # library's normalize_file (which would misplace attributes).
            if m.kind == "document":
                source = _doc_source(m.name, m.guid, m.code)
                mod = DocModule(m.name)
                mod.add_guid(uuid.UUID(m.guid))
            else:
                source = _std_source(m.name, m.code)
                mod = StdModule(m.name)
            with open(path + ".new", "wb") as fh:
                fh.write(source.encode("cp1252"))
            mod.add_file(path)
            project.add_module(mod)

        for guid, ver, lcid, lib_path, desc, name in _DEFAULT_REFERENCES:
            ref = ReferenceRegistered(
                LibidReference(uuid.UUID(guid), ver, lcid, lib_path, desc))
            project.add_reference(Reference(ref, name))

        project.add_attribute("VersionCompatible32", "393222000")

        ProjectOleFile.write_file(project)  # writes ./vbaProject.bin
        produced = os.path.join(scratch, "vbaProject.bin")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        shutil.copyfile(produced, out_path)
    finally:
        os.chdir(prev_cwd)
        shutil.rmtree(scratch, ignore_errors=True)
    return out_path
