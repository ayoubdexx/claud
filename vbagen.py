"""
vbagen.py - A dependency-free generator for Excel VBA projects (vbaProject.bin).

Builds a valid MS-CFB (OLE2 compound) file that Microsoft Excel accepts as an
embedded VBA project, using only the Python standard library. Implements the
pieces of [MS-OVBA] and [MS-CFB] required to author macros from source:

  * MS-OVBA RLE compression (CompressedContainer) + a decompressor for tests
  * The `dir` stream (project information, references, module records)
  * Per-module source streams (compressed, TextOffset = 0, no PerformanceCache)
  * The `_VBA_PROJECT`, `PROJECT` and `PROJECTwm` streams
  * MS-OVBA data-encryption for the PROJECT stream CMG / DPB / GC fields
  * A minimal MS-CFB writer (mini + regular FAT, balanced directory tree)

Excel discards the (empty) PerformanceCache and recompiles every module from
the compressed source on first load, so no compiled p-code is required.
"""

from __future__ import annotations

import struct
import uuid


# =========================================================================== #
#  MS-OVBA compression  (section 2.4.1)
# =========================================================================== #
def _compress_chunk(chunk: bytes) -> bytes:
    """Compress a single (<=4096 byte) decompressed chunk into token bytes."""
    out = bytearray()
    pos = 0
    n = len(chunk)
    while pos < n:
        flag_index = len(out)
        out.append(0)                       # placeholder FlagByte
        flag = 0
        for bit in range(8):
            if pos >= n:
                break
            # CopyToken bit maths depend only on the position in the chunk.
            bit_count = max(4, (pos - 1).bit_length()) if pos > 0 else 4
            length_mask = 0xFFFF >> bit_count
            max_length = length_mask + 3
            max_offset = 1 << bit_count

            best_len, best_off = 0, 0
            start = max(0, pos - max_offset)
            for cand in range(start, pos):
                length = 0
                while (length < max_length and pos + length < n
                       and chunk[cand + length] == chunk[pos + length]):
                    length += 1
                if length > best_len:
                    best_len, best_off = length, pos - cand

            if best_len >= 3:
                token = ((best_off - 1) << (16 - bit_count)) | (best_len - 3)
                out += struct.pack("<H", token)
                flag |= (1 << bit)
                pos += best_len
            else:
                out.append(chunk[pos])
                pos += 1
        out[flag_index] = flag
    return bytes(out)


def compress(data: bytes) -> bytes:
    """MS-OVBA CompressedContainer for `data`."""
    out = bytearray([0x01])                 # SignatureByte
    for i in range(0, len(data), 4096):
        chunk = data[i:i + 4096]
        body = _compress_chunk(chunk)
        if len(chunk) == 4096 and len(body) >= 4096:
            # incompressible full chunk -> store raw
            flag = 0
            body = chunk
        else:
            flag = 1
        assert len(body) <= 4096, "chunk body exceeds 4096 bytes"
        header = (flag << 15) | (0b011 << 12) | (len(body) + 2 - 3)
        out += struct.pack("<H", header) + body
    return bytes(out)


def decompress(comp: bytes) -> bytes:
    """Inverse of `compress`, used only for round-trip self-tests."""
    assert comp[0] == 0x01, "bad signature byte"
    out = bytearray()
    i = 1
    n = len(comp)
    while i < n:
        header = struct.unpack("<H", comp[i:i + 2])[0]
        i += 2
        chunk_bytes = (header & 0x0FFF) + 3
        flag = (header >> 15) & 1
        data_len = chunk_bytes - 2
        end = i + data_len
        if flag == 0:
            out += comp[i:i + 4096]
            i += 4096
            continue
        chunk_start = len(out)
        while i < end:
            fb = comp[i]
            i += 1
            for bit in range(8):
                if i >= end:
                    break
                if (fb >> bit) & 1:
                    token = struct.unpack("<H", comp[i:i + 2])[0]
                    i += 2
                    diff = len(out) - chunk_start
                    bit_count = max(4, (diff - 1).bit_length()) if diff > 0 else 4
                    length_mask = 0xFFFF >> bit_count
                    length = (token & length_mask) + 3
                    offset = (token >> (16 - bit_count)) + 1
                    src = len(out) - offset
                    for k in range(length):
                        out.append(out[src + k])
                else:
                    out.append(comp[i])
                    i += 1
    return bytes(out)


# =========================================================================== #
#  little-endian helpers
# =========================================================================== #
def _u16(v: int) -> bytes:
    return struct.pack("<H", v)


def _u32(v: int) -> bytes:
    return struct.pack("<I", v)


# =========================================================================== #
#  VBA module & project model
# =========================================================================== #
class VbaModule:
    def __init__(self, name: str, code: str, module_type: str):
        # module_type: "procedural" | "document" | "class"
        self.name = name
        self.code = code
        self.module_type = module_type

    @property
    def is_procedural(self) -> bool:
        return self.module_type == "procedural"


# Standard registered references for an Excel VBA project. Excel resolves each
# type library by its CLSID from the registry, so the version/path portions are
# only hints -- the GUIDs are what matter.
_DEFAULT_REFERENCES = [
    ("stdole",
     "*\\G{00020430-0000-0000-C000-000000000046}#2.0#0#"
     "C:\\Windows\\System32\\stdole2.tlb#OLE Automation"),
    ("Office",
     "*\\G{2DF8D04C-5BFA-101B-BDE5-00AA0044DE52}#2.8#0#"
     "C:\\Program Files\\Common Files\\Microsoft Shared\\OFFICE16\\MSO.DLL#"
     "Microsoft Office 16.0 Object Library"),
]

# The VBA runtime and the Excel host object library. Required so that the
# generated code (MsgBox, Worksheet, Range, xlUp, ...) compiles.
_HOST_REFERENCES = [
    ("VBA",
     "*\\G{000204EF-0000-0000-C000-000000000046}#4.2#9#"
     "C:\\PROGRA~2\\COMMON~1\\MICROS~1\\VBA\\VBA7.1\\VBE7.DLL#"
     "Visual Basic For Applications"),
    ("Excel",
     "*\\G{00020813-0000-0000-C000-000000000046}#1.9#0#"
     "C:\\PROGRA~2\\MICROS~1\\Office16\\EXCEL.EXE#"
     "Microsoft Excel 16.0 Object Library"),
]


class VbaProject:
    """Assembles an Excel-compatible vbaProject.bin from VBA source modules."""

    def __init__(self, project_name: str = "VBAProject"):
        self.project_name = project_name
        self.modules: list[VbaModule] = []
        self.references = list(_HOST_REFERENCES) + list(_DEFAULT_REFERENCES)
        # ID GUID used both in the PROJECT stream and for the ProjKey checksum.
        self.guid = "{" + str(uuid.uuid4()).upper() + "}"

    # -- authoring API ----------------------------------------------------- #
    def add_procedural_module(self, name: str, code: str):
        self.modules.append(VbaModule(name, code, "procedural"))

    def add_document_module(self, name: str, code: str):
        self.modules.append(VbaModule(name, code, "document"))

    def add_class_module(self, name: str, code: str):
        self.modules.append(VbaModule(name, code, "class"))

    # -- dir stream (section 2.3.4.2) ------------------------------------- #
    def _build_dir(self) -> bytes:
        b = bytearray()
        # --- PROJECTINFORMATION ---
        b += _u16(0x0001) + _u32(4) + _u32(0x00000001)          # SYSKIND (Win32)
        b += _u16(0x0002) + _u32(4) + _u32(0x00000409)          # LCID
        b += _u16(0x0014) + _u32(4) + _u32(0x00000409)          # LCIDINVOKE
        b += _u16(0x0003) + _u32(2) + _u16(1252)                # CODEPAGE
        pname = self.project_name.encode("cp1252")
        b += _u16(0x0004) + _u32(len(pname)) + pname            # NAME
        b += _u16(0x0005) + _u32(0) + _u16(0x0040) + _u32(0)    # DOCSTRING
        b += _u16(0x0006) + _u32(0) + _u16(0x003D) + _u32(0)    # HELPFILEPATH
        b += _u16(0x0007) + _u32(4) + _u32(0)                   # HELPCONTEXT
        b += _u16(0x0008) + _u32(4) + _u32(0)                   # LIBFLAGS
        b += _u16(0x0009) + _u32(4) + _u32(1) + _u16(0)         # VERSION maj/min
        b += _u16(0x000C) + _u32(0) + _u16(0x003C) + _u32(0)    # CONSTANTS

        # --- PROJECTREFERENCES ---
        for name, libid in self.references:
            name_mb = name.encode("cp1252")
            name_u = name.encode("utf-16-le")
            b += _u16(0x0016) + _u32(len(name_mb)) + name_mb            # REFERENCENAME
            b += _u16(0x003E) + _u32(len(name_u)) + name_u
            libid_mb = libid.encode("cp1252")
            size = 4 + len(libid_mb) + 4 + 2
            b += _u16(0x000D) + _u32(size)                             # REFERENCEREGISTERED
            b += _u32(len(libid_mb)) + libid_mb + _u32(0) + _u16(0)

        # --- PROJECTMODULES ---
        b += _u16(0x000F) + _u32(2) + _u16(len(self.modules))          # MODULES count
        b += _u16(0x0013) + _u32(2) + _u16(0xFFFF)                     # PROJECTCOOKIE
        for m in self.modules:
            name_mb = m.name.encode("cp1252")
            name_u = m.name.encode("utf-16-le")
            b += _u16(0x0019) + _u32(len(name_mb)) + name_mb           # MODULENAME
            b += _u16(0x0047) + _u32(len(name_u)) + name_u             # MODULENAMEUNICODE
            b += _u16(0x001A) + _u32(len(name_mb)) + name_mb           # MODULESTREAMNAME
            b += _u16(0x0032) + _u32(len(name_u)) + name_u
            b += _u16(0x001C) + _u32(0) + _u16(0x0048) + _u32(0)       # MODULEDOCSTRING
            b += _u16(0x0031) + _u32(4) + _u32(0)                      # MODULEOFFSET = 0
            b += _u16(0x001E) + _u32(4) + _u32(0)                      # MODULEHELPCONTEXT
            b += _u16(0x002C) + _u32(2) + _u16(0xFFFF)                 # MODULECOOKIE
            type_id = 0x0021 if m.is_procedural else 0x0022            # MODULETYPE
            b += _u16(type_id) + _u32(0)
            b += _u16(0x002B) + _u32(0)                                # module Terminator
        b += _u16(0x0010) + _u32(0)                                    # dir Terminator
        return bytes(b)

    # -- PROJECTwm stream -------------------------------------------------- #
    def _build_projectwm(self) -> bytes:
        b = bytearray()
        for m in self.modules:
            b += m.name.encode("cp1252") + b"\x00"
            b += m.name.encode("utf-16-le") + b"\x00\x00"
        b += b"\x00\x00"
        return bytes(b)

    # -- MS-OVBA data encryption (section 2.4.3.2) ------------------------ #
    def _proj_key(self) -> int:
        return sum(self.guid.encode("cp1252")) & 0xFF

    def _encrypt(self, data: bytes, seed: int = 0) -> bytes:
        version = 2
        projkey = self._proj_key()
        version_enc = seed ^ version
        projkey_enc = seed ^ projkey
        enc = bytearray([seed & 0xFF, version_enc & 0xFF, projkey_enc & 0xFF])
        unenc1 = projkey
        encb1 = projkey_enc
        encb2 = version_enc
        ignored_len = (seed & 6) // 2
        stream = bytes([0] * ignored_len) + struct.pack("<I", len(data)) + data
        for byteval in stream:
            byte_enc = (byteval ^ ((encb2 + unenc1) & 0xFF)) & 0xFF
            enc.append(byte_enc)
            encb2 = encb1
            encb1 = byte_enc
            unenc1 = byteval
        return bytes(enc)

    def _hex(self, data: bytes) -> str:
        return "".join("%02X" % b for b in data)

    # -- PROJECT stream ---------------------------------------------------- #
    def _build_project(self) -> str:
        cmg = self._hex(self._encrypt(b"\x00\x00\x00\x00"))     # protection state
        dpb = self._hex(self._encrypt(b"\x00"))                 # no password
        gc = self._hex(self._encrypt(b"\xff"))                  # visible
        lines = ['ID="%s"' % self.guid]
        for m in self.modules:
            if not m.is_procedural:
                lines.append("Document=%s/&H00000000" % m.name)
            else:
                lines.append("Module=%s" % m.name)
        lines += [
            'Name="%s"' % self.project_name,
            'HelpContextID="0"',
            'VersionCompatible32="393222000"',
            'CMG="%s"' % cmg,
            'DPB="%s"' % dpb,
            'GC="%s"' % gc,
            "",
            "[Host Extender Info]",
            "&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000",
            "",
            "[Workspace]",
        ]
        for m in self.modules:
            lines.append("%s=0, 0, 0, 0, C" % m.name)
        return "\r\n".join(lines) + "\r\n"

    # -- assemble the compound file --------------------------------------- #
    def build(self) -> bytes:
        cf = CompoundFile()
        root = cf.root
        root.add_stream("PROJECT", self._build_project().encode("cp1252"))
        root.add_stream("PROJECTwm", self._build_projectwm())
        vba = root.add_storage("VBA")
        vba.add_stream("_VBA_PROJECT", b"\xcc\x61\xff\xff\x00\x00\x00")
        vba.add_stream("dir", compress(self._build_dir()))
        for m in self.modules:
            vba.add_stream(m.name, compress(m.code.encode("cp1252")))
        return cf.render()


# =========================================================================== #
#  Minimal MS-CFB (OLE2 compound file) writer
# =========================================================================== #
FREESECT = 0xFFFFFFFF
ENDOFCHAIN = 0xFFFFFFFE
FATSECT = 0xFFFFFFFD
NOSTREAM = 0xFFFFFFFF

MINI_CUTOFF = 4096
SECTOR = 512
MINI_SECTOR = 64


class _Entry:
    def __init__(self, name: str, obj_type: int):
        self.name = name
        self.obj_type = obj_type            # 1 storage, 2 stream, 5 root
        self.data: bytes = b""
        self.children: list["_Entry"] = []
        self.id = 0
        self.left = NOSTREAM
        self.right = NOSTREAM
        self.child = NOSTREAM
        self.start = 0
        self.size = 0

    def add_stream(self, name: str, data: bytes) -> "_Entry":
        e = _Entry(name, 2)
        e.data = data
        self.children.append(e)
        return e

    def add_storage(self, name: str) -> "_Entry":
        e = _Entry(name, 1)
        self.children.append(e)
        return e


def _cfb_sort_key(name: str):
    # MS-CFB directory ordering: by UTF-16 length, then upper-cased code points.
    return (len(name), name.upper())


class CompoundFile:
    def __init__(self):
        self.root = _Entry("Root Entry", 5)

    def _collect(self) -> list[_Entry]:
        ordered = [self.root]

        def walk(entry: _Entry):
            for child in entry.children:
                ordered.append(child)
            for child in entry.children:
                if child.obj_type == 1:
                    walk(child)
        walk(self.root)
        for idx, e in enumerate(ordered):
            e.id = idx
        return ordered

    def _build_tree(self, siblings: list[_Entry]) -> int:
        if not siblings:
            return NOSTREAM
        nodes = sorted(siblings, key=lambda e: _cfb_sort_key(e.name))

        def build(lo: int, hi: int) -> int:
            if lo > hi:
                return NOSTREAM
            mid = (lo + hi) // 2
            node = nodes[mid]
            node.left = build(lo, mid - 1)
            node.right = build(mid + 1, hi)
            return node.id

        return build(0, len(nodes) - 1)

    def render(self) -> bytes:
        entries = self._collect()

        # Build sibling trees; parents point at the median child.
        for e in entries:
            if e.obj_type in (1, 5) and e.children:
                e.child = self._build_tree(e.children)

        sectors: list[bytes] = []
        fat: list[int] = []

        def alloc_chain(data: bytes) -> int:
            if not data:
                return ENDOFCHAIN
            first = len(sectors)
            chunks = [data[i:i + SECTOR] for i in range(0, len(data), SECTOR)]
            for j, chunk in enumerate(chunks):
                sectors.append(chunk.ljust(SECTOR, b"\x00"))
                fat.append(len(sectors) if j < len(chunks) - 1 else ENDOFCHAIN)
            return first

        # --- mini stream: every stream smaller than the cutoff ------------ #
        mini_stream = bytearray()
        mini_fat: list[int] = []

        def alloc_mini(data: bytes) -> int:
            first = len(mini_fat)
            chunks = [data[i:i + MINI_SECTOR]
                      for i in range(0, len(data), MINI_SECTOR)]
            for j, chunk in enumerate(chunks):
                mini_stream.extend(chunk.ljust(MINI_SECTOR, b"\x00"))
                mini_fat.append(len(mini_fat) + 1 if j < len(chunks) - 1
                                else ENDOFCHAIN)
            return first

        # Assign storage for every stream (root's data lives in the mini FAT
        # container, allocated afterwards).
        for e in entries:
            if e.obj_type == 2:
                e.size = len(e.data)
                if len(e.data) == 0:
                    e.start = ENDOFCHAIN
                elif len(e.data) < MINI_CUTOFF:
                    e.start = alloc_mini(e.data)
                else:
                    e.start = alloc_chain(e.data)

        # Root entry owns the mini-stream container (stored in the regular FAT).
        self.root.size = len(mini_stream)
        self.root.start = alloc_chain(bytes(mini_stream)) if mini_stream else ENDOFCHAIN

        # Mini FAT sectors.
        if mini_fat:
            mf = b"".join(_u32(x) for x in mini_fat)
            pad = (-len(mf)) % SECTOR
            mf += b"\xff\xff\xff\xff" * (pad // 4)
            minifat_start = len(sectors)
            minifat_count = len(mf) // SECTOR
            alloc_chain(mf)
        else:
            minifat_start = ENDOFCHAIN
            minifat_count = 0

        # Directory sectors (4 entries per 512-byte sector).
        dir_bytes = bytearray(self._dir_entry(e) for e in entries) if False else bytearray()
        for e in entries:
            dir_bytes += self._dir_entry(e)
        while len(dir_bytes) % SECTOR != 0:
            dir_bytes += self._empty_dir_entry()
        dir_start = len(sectors)
        alloc_chain(bytes(dir_bytes))

        # FAT sectors: iterate until the count is stable.
        data_sectors = len(sectors)
        entries_per_fat = SECTOR // 4
        nfat = 1
        while True:
            total = data_sectors + nfat
            need = -(-total // entries_per_fat)      # ceil
            if need == nfat:
                break
            nfat = need

        fat_first = len(sectors)
        for _ in range(nfat):
            sectors.append(b"")                       # placeholder
            fat.append(FATSECT)

        fat_bytes = b"".join(_u32(x) for x in fat)
        pad = (nfat * SECTOR) - len(fat_bytes)
        fat_bytes += b"\xff\xff\xff\xff" * (pad // 4)
        for k in range(nfat):
            sectors[fat_first + k] = fat_bytes[k * SECTOR:(k + 1) * SECTOR]

        # DIFAT (fits in the header for <= 109 FAT sectors).
        difat = [FREESECT] * 109
        for k in range(nfat):
            difat[k] = fat_first + k

        header = self._header(nfat, dir_start, minifat_start, minifat_count, difat)
        return header + b"".join(sectors)

    # -- directory entry (128 bytes) -------------------------------------- #
    def _dir_entry(self, e: _Entry) -> bytes:
        name_u = e.name.encode("utf-16-le")
        name_field = name_u.ljust(64, b"\x00")[:64]
        name_len = len(name_u) + 2                    # includes null terminator
        color = 1                                     # black
        b = bytearray()
        b += name_field
        b += _u16(name_len)
        b += bytes([e.obj_type, color])
        b += _u32(e.left) + _u32(e.right) + _u32(e.child)
        b += b"\x00" * 16                             # CLSID
        b += _u32(0)                                  # state bits
        b += b"\x00" * 8                              # creation time
        b += b"\x00" * 8                              # modified time
        b += _u32(e.start)
        b += struct.pack("<Q", e.size)                # 8-byte size
        return bytes(b)

    def _empty_dir_entry(self) -> bytes:
        b = bytearray(128)
        b[66] = 0x00                                  # object type: unallocated
        b[68:72] = _u32(NOSTREAM)                     # left
        b[72:76] = _u32(NOSTREAM)                     # right
        b[76:80] = _u32(NOSTREAM)                     # child
        return bytes(b)

    # -- header (512 bytes) ----------------------------------------------- #
    def _header(self, nfat, dir_start, minifat_start, minifat_count, difat) -> bytes:
        h = bytearray()
        h += b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"      # signature
        h += b"\x00" * 16                             # CLSID
        h += _u16(0x003E)                             # minor version
        h += _u16(0x0003)                             # major version (512-byte)
        h += _u16(0xFFFE)                             # byte order
        h += _u16(0x0009)                             # sector shift (2^9 = 512)
        h += _u16(0x0006)                             # mini sector shift (2^6)
        h += b"\x00" * 6                              # reserved
        h += _u32(0)                                  # num dir sectors (0 for v3)
        h += _u32(nfat)                               # num FAT sectors
        h += _u32(dir_start)                          # first dir sector
        h += _u32(0)                                  # transaction signature
        h += _u32(MINI_CUTOFF)                        # mini stream cutoff
        h += _u32(minifat_start)                      # first mini FAT sector
        h += _u32(minifat_count)                      # num mini FAT sectors
        h += _u32(ENDOFCHAIN)                         # first DIFAT sector
        h += _u32(0)                                  # num DIFAT sectors
        for v in difat:
            h += _u32(v)
        assert len(h) == 512, len(h)
        return bytes(h)


# =========================================================================== #
#  self-test
# =========================================================================== #
if __name__ == "__main__":
    # round-trip the compressor on a range of payloads
    import os
    for payload in (b"", b"A", b"abcabcabc" * 500, os.urandom(9000),
                    b"Attribute VB_Name = \"m\"\r\n" * 400):
        assert decompress(compress(payload)) == payload, "compression mismatch"
    print("compression round-trip OK")

    proj = VbaProject("VBAProject")
    proj.add_document_module("ThisWorkbook",
                             'Attribute VB_Name = "ThisWorkbook"\r\n'
                             'Private Sub Workbook_Open()\r\n'
                             '    MsgBox "hi"\r\n'
                             'End Sub\r\n')
    proj.add_procedural_module("modTest",
                               'Attribute VB_Name = "modTest"\r\n'
                               'Sub Demo()\r\nEnd Sub\r\n')
    data = proj.build()
    with open("_vba_test.bin", "wb") as fh:
        fh.write(data)
    print("vbaProject.bin bytes:", len(data))
