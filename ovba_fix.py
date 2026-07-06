"""
ovba_fix.py - A correct MS-OVBA (2.4.1) compression / decompression pair.

The third-party ``ms_ovba_compression`` package ships a compressor whose
``maxLength`` is computed with the wrong operator precedence
(``0xFFFF << bit_count + 3``), which emits invalid CopyTokens whenever the
source contains a run longer than the current length mask allows (very common:
runs of spaces in indented code, or runs of 0x00 bytes in the *dir* stream).
Excel then reports the project as unreadable.

This module re-implements the algorithm faithfully so the produced
``vbaProject.bin`` decompresses correctly in Excel.  ``install()`` monkey-patches
the class used by the vbaProject toolchain so every stream is compressed
correctly.
"""

from __future__ import annotations

import struct


def _ceil_log2(value: int) -> int:
    """Smallest bit count (>= 4) able to address *value* positions."""
    bits = 4
    while (1 << bits) < value:
        bits += 1
    return bits


def _copytoken_help(decompressed_current: int):
    bit_count = _ceil_log2(decompressed_current)
    length_mask = 0xFFFF >> bit_count
    offset_mask = (~length_mask) & 0xFFFF
    max_length = length_mask + 3            # <-- the corrected value
    return bit_count, length_mask, offset_mask, max_length


# --------------------------------------------------------------------------- #
#  Compression
# --------------------------------------------------------------------------- #
def compress(data: bytes) -> bytes:
    out = bytearray(b"\x01")                # CompressedContainer signature
    for start in range(0, len(data), 4096):
        block = data[start:start + 4096]
        out += _compress_chunk(block)
    return bytes(out)


def _compress_chunk(block: bytes) -> bytes:
    compressed = _compress_tokens(block)
    if len(compressed) >= 4096:
        # Storing raw is only valid for a full 4096-byte chunk.
        if len(block) == 4096:
            header = 0x3000 | 0x0FFF        # flag=0, sig=011, size=4095
            return struct.pack("<H", header) + block
        # Fallback (should not happen for text): pad to 4096 raw.
        padded = block.ljust(4096, b"\x00")
        header = 0x3000 | 0x0FFF
        return struct.pack("<H", header) + padded
    size = len(compressed) - 1              # CompressedChunkSize = dataLen - 1
    header = 0xB000 | (size & 0x0FFF)        # flag=1, sig=011
    return struct.pack("<H", header) + compressed


def _compress_tokens(block: bytes) -> bytes:
    out = bytearray()
    pos = 0
    n = len(block)
    while pos < n:
        flag_byte = 0
        seq = bytearray()
        for bit in range(8):
            if pos >= n:
                break
            offset, length = _longest_match(block, pos)
            if offset > 0:
                bit_count, length_mask, offset_mask, max_len = _copytoken_help(pos)
                length = min(length, max_len)
                temp1 = offset - 1
                temp2 = 16 - bit_count
                temp3 = length - 3
                token = ((temp1 << temp2) | temp3) & 0xFFFF
                seq += struct.pack("<H", token)
                flag_byte |= (1 << bit)
                pos += length
            else:
                seq.append(block[pos])
                pos += 1
        out.append(flag_byte)
        out += seq
    return bytes(out)


def _longest_match(block: bytes, pos: int):
    """Return (offset, length) of the best back-reference ending before *pos*."""
    bit_count, length_mask, offset_mask, max_len = _copytoken_help(pos)
    best_len = 0
    best_off = 0
    max_offset = 1 << (16 - (16 - bit_count))  # == 1 << bit_count
    # candidate positions from pos-1 back to (pos - max_offset)
    start = max(0, pos - (1 << bit_count))
    cand = pos - 1
    n = len(block)
    while cand >= start:
        length = 0
        a = cand
        b = pos
        while b < n and length < max_len and block[a] == block[b]:
            a += 1
            b += 1
            length += 1
        if length > best_len:
            best_len = length
            best_off = pos - cand
        cand -= 1
    if best_len >= 3:
        return best_off, best_len
    return 0, 0


# --------------------------------------------------------------------------- #
#  Decompression (spec-faithful, used for validation)
# --------------------------------------------------------------------------- #
def decompress(container: bytes) -> bytes:
    if not container or container[0] != 0x01:
        raise ValueError("bad CompressedContainer signature")
    out = bytearray()
    i = 1
    n = len(container)
    while i < n:
        header = struct.unpack_from("<H", container, i)[0]
        i += 2
        size = header & 0x0FFF
        sig = (header >> 12) & 0x07
        flag = (header >> 15) & 0x01
        if sig != 0b011:
            raise ValueError("bad chunk signature")
        data_len = size + 1
        chunk = container[i:i + data_len]
        i += data_len
        if flag == 0:
            if data_len != 4096:
                raise ValueError("raw chunk must be 4096 bytes")
            out += chunk
        else:
            out += _decompress_tokens(chunk)
    return bytes(out)


def _decompress_tokens(chunk: bytes) -> bytes:
    out = bytearray()
    i = 0
    n = len(chunk)
    while i < n:
        flag_byte = chunk[i]
        i += 1
        for bit in range(8):
            if i >= n:
                break
            if not (flag_byte & (1 << bit)):
                out.append(chunk[i])
                i += 1
            else:
                token = struct.unpack_from("<H", chunk, i)[0]
                i += 2
                bit_count, length_mask, offset_mask, max_len = _copytoken_help(len(out))
                length = (token & length_mask) + 3
                temp = (token & offset_mask) >> (16 - bit_count)
                offset = temp + 1
                base = len(out) - offset
                for k in range(length):
                    out.append(out[base + k])
    return bytes(out)


# --------------------------------------------------------------------------- #
#  Install
# --------------------------------------------------------------------------- #
def install():
    """Patch the toolchain's MsOvba.compress with the correct implementation."""
    from ms_ovba_compression import ms_ovba as _m

    def _patched_compress(self, data):
        return compress(data)

    _m.MsOvba.compress = _patched_compress
