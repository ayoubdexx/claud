# -*- coding: utf-8 -*-
"""
Compression MS-OVBA correcte (RunLengthEncoding / CompressedContainer).

La librairie ms_ovba_compression contient un bug sur les entrees de plus de
4096 octets : elle emet des jetons de copie dont l'offset traverse la frontiere
de chunk (interdit par [MS-OVBA]), ce qui corrompt le flux. On remplace donc son
algorithme de compression par cette implementation, conforme a [MS-OVBA] 2.4.1 :

  - Conteneur = octet de signature 0x01 + suite de CompressedChunk
  - Chaque chunk represente au plus 4096 octets decompresses
  - Le dictionnaire (fenetre) est reinitialise a chaque chunk : les offsets des
    jetons de copie sont relatifs au DEBUT du chunk courant (jamais au-dela)
  - Un chunk incompressible plein (4096 o) est stocke tel quel (RawChunk)

Verifie par aller-retour avec le decompresseur de reference d'oletools.
"""


def _copytoken_help(difference):
    """Renvoie (bit_count, length_mask, max_length) pour la position donnee."""
    if difference < 1:
        bit_count = 4
    else:
        bit_count = max((difference - 1).bit_length(), 4)
    length_mask = 0xFFFF >> bit_count
    max_length = length_mask + 3
    return bit_count, length_mask, max_length


def _longest_match(data, pos, end):
    """Plus longue correspondance de data[pos:] dans data[chunk_start:pos].
    chunk_start est implicite = pos - difference ; ici on cherche dans [0..pos)
    a l'interieur du chunk (data est deja le chunk courant)."""
    difference = pos
    bit_count, length_mask, max_length = _copytoken_help(difference)
    best_len = 0
    best_off = 0
    cand = pos - 1
    while cand >= 0:
        length = 0
        while (pos + length) < end and length < max_length \
                and data[cand + length] == data[pos + length]:
            length += 1
        if length > best_len:
            best_len = length
            best_off = pos - cand
            if best_len >= max_length:
                break
        cand -= 1
    return best_len, best_off


def _pack_copytoken(pos, length, offset):
    bit_count, length_mask, _ = _copytoken_help(pos)
    temp1 = offset - 1
    temp2 = 16 - bit_count
    temp3 = (length - 3) & length_mask
    return ((temp1 << temp2) | temp3) & 0xFFFF


def _compress_tokens(chunk):
    """Compresse un chunk (<=4096 o) en une suite FlagByte + jetons."""
    out = bytearray()
    pos = 0
    n = len(chunk)
    while pos < n:
        flag_index = len(out)
        out.append(0)              # emplacement du FlagByte
        flag = 0
        for bit in range(8):
            if pos >= n:
                break
            best_len, best_off = _longest_match(chunk, pos, n)
            if best_len >= 3:
                token = _pack_copytoken(pos, best_len, best_off)
                out += token.to_bytes(2, "little")
                flag |= (1 << bit)
                pos += best_len
            else:
                out.append(chunk[pos])
                pos += 1
        out[flag_index] = flag
    return bytes(out)


def _compress_chunk(chunk):
    comp = _compress_tokens(chunk)
    full = (len(chunk) == 4096)
    if len(comp) <= 4096 and (len(comp) < len(chunk) or not full):
        header = 0xB000 | (len(comp) - 1)          # flag=1, sig=0b011
        return header.to_bytes(2, "little") + comp
    if full:
        header = 0x3000 | 0x0FFF                    # RawChunk : 4096 o bruts
        return header.to_bytes(2, "little") + chunk
    raise ValueError("chunk partiel incompressible (%d o) : cas non gere"
                     % len(chunk))


def compress(data):
    """Compresse un flux complet en CompressedContainer [MS-OVBA]."""
    if isinstance(data, str):
        data = data.encode("cp1252")
    out = bytearray([0x01])                          # SignatureByte
    for i in range(0, len(data), 4096):
        out += _compress_chunk(data[i:i + 4096])
    return bytes(out)
