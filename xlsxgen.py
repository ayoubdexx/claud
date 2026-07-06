"""
xlsxgen.py - A compact, dependency-free OOXML (.xlsx) writer.

Built with the Python standard library only (zipfile + xml text assembly).
Supports the subset of the SpreadsheetML spec needed to produce a polished,
automated workbook:

  * Numbers, inline strings and formulas
  * Rich cell styles (fonts, fills, borders, number formats, alignment)
  * Cell locking / sheet protection
  * Merged cells
  * Column widths & row heights
  * Frozen panes & gridline visibility
  * Data validation (dropdown lists, whole / decimal constraints)
  * Conditional formatting (expression + colour-scale + cell-is rules)
  * Named ranges (workbook + sheet scoped) and print areas
  * Page setup (A4, margins, fit-to-page, orientation)
  * Bar & pie charts via drawings

The generated file writes formulas without cached results and sets
fullCalcOnLoad so Excel recalculates everything the moment it is opened.
"""

from __future__ import annotations

import datetime as _dt
import zipfile
from xml.sax.saxutils import escape as _xml_escape


# --------------------------------------------------------------------------- #
#  Cell reference helpers
# --------------------------------------------------------------------------- #
def col_letter(idx: int) -> str:
    """1-based column index -> letters (1->A, 27->AA)."""
    letters = ""
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


def col_index(letters: str) -> int:
    """Letters -> 1-based column index."""
    idx = 0
    for ch in letters.upper():
        idx = idx * 26 + (ord(ch) - 64)
    return idx


def cell_ref(row: int, col: int) -> str:
    return f"{col_letter(col)}{row}"


def _esc(text: str) -> str:
    return _xml_escape(str(text))


def _escattr(text: str) -> str:
    """Escape for use inside an XML attribute value (quotes included)."""
    return _xml_escape(str(text), {'"': "&quot;", "'": "&apos;"})


# --------------------------------------------------------------------------- #
#  Style registry
# --------------------------------------------------------------------------- #
class StyleRegistry:
    """De-duplicates fonts / fills / borders / number-formats and builds xfs."""

    def __init__(self):
        self.numfmts: dict[str, int] = {}
        self.fonts: dict[str, int] = {}
        self.fills: dict[str, int] = {}
        self.borders: dict[str, int] = {}
        self.xfs: dict[str, int] = {}
        self.dxfs: dict[str, int] = {}

        self._font_xml: list[str] = []
        self._fill_xml: list[str] = []
        self._border_xml: list[str] = []
        self._xf_xml: list[str] = []
        self._dxf_xml: list[str] = []

        # Mandatory defaults ------------------------------------------------
        # Font 0 (default)
        self._add_font({})
        # Fills 0 and 1 are reserved by the spec.
        self.fills["__none__"] = 0
        self._fill_xml.append('<fill><patternFill patternType="none"/></fill>')
        self.fills["__gray125__"] = 1
        self._fill_xml.append('<fill><patternFill patternType="gray125"/></fill>')
        # Border 0 (default / empty)
        self.borders["__default__"] = 0
        self._border_xml.append(
            "<border><left/><right/><top/><bottom/><diagonal/></border>"
        )
        # xf 0 (default)
        self.xfs["__default__"] = 0
        self._xf_xml.append(
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        )

    # -- fonts ------------------------------------------------------------- #
    def _add_font(self, f: dict) -> int:
        key = repr(sorted(f.items()))
        if key in self.fonts:
            return self.fonts[key]
        parts = []
        if f.get("bold"):
            parts.append("<b/>")
        if f.get("italic"):
            parts.append("<i/>")
        if f.get("underline"):
            parts.append("<u/>")
        parts.append(f'<sz val="{f.get("size", 11)}"/>')
        color = f.get("color", "FF000000")
        parts.append(f'<color rgb="{color}"/>')
        parts.append(f'<name val="{f.get("name", "Calibri")}"/>')
        xml = "<font>" + "".join(parts) + "</font>"
        idx = len(self._font_xml)
        self.fonts[key] = idx
        self._font_xml.append(xml)
        return idx

    # -- fills ------------------------------------------------------------- #
    def _add_fill(self, color: str | None) -> int:
        if not color:
            return 0
        key = f"solid:{color}"
        if key in self.fills:
            return self.fills[key]
        xml = (
            f'<fill><patternFill patternType="solid">'
            f'<fgColor rgb="{color}"/><bgColor rgb="{color}"/>'
            f"</patternFill></fill>"
        )
        idx = len(self._fill_xml)
        self.fills[key] = idx
        self._fill_xml.append(xml)
        return idx

    # -- borders ----------------------------------------------------------- #
    def _add_border(self, b: dict | None) -> int:
        if not b:
            return 0
        key = repr(sorted((k, tuple(sorted(v.items())) if isinstance(v, dict) else v)
                          for k, v in b.items()))
        if key in self.borders:
            return self.borders[key]

        def side(name):
            spec = b.get(name)
            if not spec:
                return f"<{name}/>"
            if isinstance(spec, str):
                spec = {"style": spec, "color": "FF808080"}
            style = spec.get("style", "thin")
            color = spec.get("color", "FF808080")
            return f'<{name} style="{style}"><color rgb="{color}"/></{name}>'

        xml = ("<border>"
               + side("left") + side("right") + side("top")
               + side("bottom") + "<diagonal/></border>")
        idx = len(self._border_xml)
        self.borders[key] = idx
        self._border_xml.append(xml)
        return idx

    # -- number formats ---------------------------------------------------- #
    _BUILTIN = {
        "general": 0, "0": 1, "0.00": 2, "#,##0": 3, "#,##0.00": 4,
        "0%": 9, "0.00%": 10, "@": 49,
    }

    def _add_numfmt(self, code: str | None) -> int:
        if not code:
            return 0
        low = code.lower()
        if low in self._BUILTIN:
            return self._BUILTIN[low]
        if code in self.numfmts:
            return self.numfmts[code]
        idx = 164 + len(self.numfmts)
        self.numfmts[code] = idx
        return idx

    # -- public: register a full style ------------------------------------ #
    def style(self, spec: dict) -> int:
        """spec keys: font(dict), fill(color str), border(dict), numfmt(str),
        align(dict: horizontal/vertical/wrap), locked(bool, default True)."""
        font_id = self._add_font(spec.get("font", {}))
        fill_id = self._add_fill(spec.get("fill"))
        border_id = self._add_border(spec.get("border"))
        numfmt_id = self._add_numfmt(spec.get("numfmt"))

        align = spec.get("align")
        locked = spec.get("locked", True)

        align_xml = ""
        if align:
            attrs = []
            if align.get("horizontal"):
                attrs.append(f'horizontal="{align["horizontal"]}"')
            if align.get("vertical"):
                attrs.append(f'vertical="{align["vertical"]}"')
            if align.get("wrap"):
                attrs.append('wrapText="1"')
            if align.get("rotation") is not None:
                attrs.append(f'textRotation="{align["rotation"]}"')
            align_xml = f'<alignment {" ".join(attrs)}/>'

        prot_xml = "" if locked else '<protection locked="0"/>'

        key = (f"{numfmt_id}|{font_id}|{fill_id}|{border_id}|{align_xml}|{prot_xml}")
        if key in self.xfs:
            return self.xfs[key]

        apply = []
        if numfmt_id:
            apply.append('applyNumberFormat="1"')
        if font_id:
            apply.append('applyFont="1"')
        if fill_id:
            apply.append('applyFill="1"')
        if border_id:
            apply.append('applyBorder="1"')
        if align_xml:
            apply.append('applyAlignment="1"')
        if prot_xml:
            apply.append('applyProtection="1"')

        inner = align_xml + prot_xml
        xf = (f'<xf numFmtId="{numfmt_id}" fontId="{font_id}" fillId="{fill_id}" '
              f'borderId="{border_id}" xfId="0" {" ".join(apply)}>'
              f"{inner}</xf>") if inner else (
              f'<xf numFmtId="{numfmt_id}" fontId="{font_id}" fillId="{fill_id}" '
              f'borderId="{border_id}" xfId="0" {" ".join(apply)}/>')
        idx = len(self._xf_xml)
        self.xfs[key] = idx
        self._xf_xml.append(xf)
        return idx

    # -- differential format for conditional formatting ------------------- #
    def dxf(self, spec: dict) -> int:
        """spec keys: font(dict with color/bold), fill(color str)."""
        parts = []
        f = spec.get("font")
        if f:
            fp = []
            if f.get("bold"):
                fp.append("<b/>")
            if f.get("italic"):
                fp.append("<i/>")
            if f.get("color"):
                fp.append(f'<color rgb="{f["color"]}"/>')
            parts.append("<font>" + "".join(fp) + "</font>")
        fill = spec.get("fill")
        if fill:
            parts.append(
                f'<fill><patternFill><bgColor rgb="{fill}"/></patternFill></fill>'
            )
        xml = "<dxf>" + "".join(parts) + "</dxf>"
        if xml in self.dxfs:
            return self.dxfs[xml]
        idx = len(self._dxf_xml)
        self.dxfs[xml] = idx
        self._dxf_xml.append(xml)
        return idx

    # -- render styles.xml ------------------------------------------------- #
    def render(self) -> str:
        numfmts = ""
        if self.numfmts:
            items = "".join(
                f'<numFmt numFmtId="{i}" formatCode="{_escattr(code)}"/>'
                for code, i in sorted(self.numfmts.items(), key=lambda kv: kv[1])
            )
            numfmts = f'<numFmts count="{len(self.numfmts)}">{items}</numFmts>'

        dxfs = ""
        if self._dxf_xml:
            dxfs = (f'<dxfs count="{len(self._dxf_xml)}">'
                    + "".join(self._dxf_xml) + "</dxfs>")

        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            + numfmts
            + f'<fonts count="{len(self._font_xml)}">' + "".join(self._font_xml) + "</fonts>"
            + f'<fills count="{len(self._fill_xml)}">' + "".join(self._fill_xml) + "</fills>"
            + f'<borders count="{len(self._border_xml)}">' + "".join(self._border_xml) + "</borders>"
            + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            + f'<cellXfs count="{len(self._xf_xml)}">' + "".join(self._xf_xml) + "</cellXfs>"
            + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            + dxfs
            + "</styleSheet>"
        )


# --------------------------------------------------------------------------- #
#  Worksheet
# --------------------------------------------------------------------------- #
class Sheet:
    def __init__(self, name: str, registry: StyleRegistry):
        self.name = name
        self.reg = registry
        self.cells: dict[tuple[int, int], dict] = {}
        self.merges: list[str] = []
        self.col_widths: dict[int, float] = {}
        self.col_styles: dict[int, int] = {}
        self.row_heights: dict[int, float] = {}
        self.freeze: tuple[int, int] | None = None  # (rows, cols)
        self.validations: list[str] = []
        self.cond_formats: list[tuple[str, str]] = []  # (sqref, rule_xml)
        self.show_gridlines = True
        self.print_area: str | None = None
        self.page_setup: dict | None = None
        self.hidden = False
        self.protect = False
        self.default_row_height: float | None = None
        self.drawing_rid: str | None = None
        self.tab_color: str | None = None
        self.code_name: str | None = None   # VBA document-module code name

    # -- writing cells ----------------------------------------------------- #
    def write(self, row: int, col: int, value=None, style: int = 0, formula: str | None = None):
        self.cells[(row, col)] = {"v": value, "s": style, "f": formula}

    def cell(self, ref: str, value=None, style: int = 0, formula: str | None = None):
        c = "".join(ch for ch in ref if ch.isalpha())
        r = int("".join(ch for ch in ref if ch.isdigit()))
        self.write(r, col_index(c), value, style, formula)

    def merge(self, ref: str):
        self.merges.append(ref)

    def set_col(self, col: int, width: float | None = None, style: int | None = None):
        if width is not None:
            self.col_widths[col] = width
        if style is not None:
            self.col_styles[col] = style

    def set_row(self, row: int, height: float):
        self.row_heights[row] = height

    def freeze_panes(self, rows: int = 0, cols: int = 0):
        self.freeze = (rows, cols)

    def add_list_validation(self, sqref: str, formula1: str, allow_blank: bool = True):
        blank = "1" if allow_blank else "0"
        self.validations.append(
            f'<dataValidation type="list" allowBlank="{blank}" showInputMessage="1" '
            f'showErrorMessage="1" sqref="{sqref}"><formula1>{_esc(formula1)}</formula1>'
            f"</dataValidation>"
        )

    def add_number_validation(self, sqref: str, operator: str, f1: str,
                              f2: str | None = None, decimal: bool = False):
        vtype = "decimal" if decimal else "whole"
        f2xml = f"<formula2>{_esc(f2)}</formula2>" if f2 is not None else ""
        self.validations.append(
            f'<dataValidation type="{vtype}" operator="{operator}" allowBlank="1" '
            f'showInputMessage="1" showErrorMessage="1" sqref="{sqref}">'
            f"<formula1>{_esc(f1)}</formula1>{f2xml}</dataValidation>"
        )

    def add_cond_expr(self, sqref: str, expr: str, dxf_id: int, priority: int = 1):
        rule = (f'<cfRule type="expression" dxfId="{dxf_id}" priority="{priority}">'
                f"<formula>{_esc(expr)}</formula></cfRule>")
        self.cond_formats.append((sqref, rule))

    def add_cond_cellis(self, sqref: str, operator: str, formula: str, dxf_id: int,
                        priority: int = 1, formula2: str | None = None):
        f2 = f"<formula>{_esc(formula2)}</formula>" if formula2 is not None else ""
        rule = (f'<cfRule type="cellIs" dxfId="{dxf_id}" priority="{priority}" '
                f'operator="{operator}"><formula>{_esc(formula)}</formula>{f2}</cfRule>')
        self.cond_formats.append((sqref, rule))

    def add_cond_colorscale(self, sqref: str, priority: int = 1,
                            colors=("FFF8696B", "FFFFEB84", "FF63BE7B")):
        cfvo = ('<cfvo type="min"/><cfvo type="percentile" val="50"/><cfvo type="max"/>')
        cols = "".join(f'<color rgb="{c}"/>' for c in colors)
        rule = (f'<cfRule type="colorScale" priority="{priority}">'
                f"<colorScale>{cfvo}{cols}</colorScale></cfRule>")
        self.cond_formats.append((sqref, rule))

    def set_print_area(self, ref: str):
        self.print_area = ref

    def setup_page(self, orientation="portrait", fit_width=1, fit_height=0,
                   margins=None, paper=9):
        self.page_setup = {
            "orientation": orientation, "fit_width": fit_width,
            "fit_height": fit_height, "paper": paper,
            "margins": margins or (0.4, 0.4, 0.5, 0.5, 0.2, 0.2),
        }

    # -- render ------------------------------------------------------------ #
    def render(self) -> str:
        # sheetPr (code name for VBA + tab colour); fitToPage injected later
        pr_attr = f' codeName="{_escattr(self.code_name)}"' if self.code_name else ""
        pr_children = ""
        if self.tab_color:
            pr_children += f'<tabColor rgb="{self.tab_color}"/>'
        sheet_pr = ""
        if pr_attr or pr_children:
            sheet_pr = f"<sheetPr{pr_attr}>{pr_children}</sheetPr>"

        # dimension
        if self.cells:
            rows = [r for r, _ in self.cells]
            cols = [c for _, c in self.cells]
            dim = f"{cell_ref(min(rows), min(cols))}:{cell_ref(max(rows), max(cols))}"
        else:
            dim = "A1"
        dimension = f'<dimension ref="{dim}"/>'

        # sheetViews
        gl = "" if self.show_gridlines else ' showGridLines="0"'
        pane = ""
        sel = ""
        if self.freeze and (self.freeze[0] or self.freeze[1]):
            fr, fc = self.freeze
            top_left = cell_ref(fr + 1, fc + 1)
            xsplit = f' xSplit="{fc}"' if fc else ""
            ysplit = f' ySplit="{fr}"' if fr else ""
            pane = (f'<pane{xsplit}{ysplit} topLeftCell="{top_left}" '
                    f'activePane="bottomRight" state="frozen"/>')
            sel = f'<selection pane="bottomRight" activeCell="{top_left}" sqref="{top_left}"/>'
        sheet_views = (f'<sheetViews><sheetView{gl} workbookViewId="0">'
                       f"{pane}{sel}</sheetView></sheetViews>")

        # sheetFormatPr
        drh = self.default_row_height or 15
        sheet_format = f'<sheetFormatPr defaultRowHeight="{drh}"/>'

        # cols
        cols_xml = ""
        colset = set(self.col_widths) | set(self.col_styles)
        if colset:
            entries = []
            for c in sorted(colset):
                w = self.col_widths.get(c)
                attrs = f'min="{c}" max="{c}"'
                if w is not None:
                    attrs += f' width="{w}" customWidth="1"'
                else:
                    attrs += ' width="8.43"'
                if c in self.col_styles:
                    attrs += f' style="{self.col_styles[c]}"'
                entries.append(f"<col {attrs}/>")
            cols_xml = "<cols>" + "".join(entries) + "</cols>"

        # sheetData
        rows_xml = []
        by_row: dict[int, list[tuple[int, dict]]] = {}
        for (r, c), data in self.cells.items():
            by_row.setdefault(r, []).append((c, data))
        for r in sorted(by_row):
            cells_sorted = sorted(by_row[r], key=lambda x: x[0])
            cell_xml = []
            for c, data in cells_sorted:
                cell_xml.append(self._render_cell(r, c, data))
            hattr = ""
            if r in self.row_heights:
                hattr = f' ht="{self.row_heights[r]}" customHeight="1"'
            rows_xml.append(f'<row r="{r}"{hattr}>' + "".join(cell_xml) + "</row>")
        sheet_data = "<sheetData>" + "".join(rows_xml) + "</sheetData>"

        # sheetProtection
        protection = ""
        if self.protect:
            protection = ('<sheetProtection sheet="1" objects="1" scenarios="1" '
                          'formatCells="0" formatColumns="0" formatRows="0" '
                          'selectLockedCells="1" selectUnlockedCells="1"/>')

        # mergeCells
        merge_xml = ""
        if self.merges:
            items = "".join(f'<mergeCell ref="{m}"/>' for m in self.merges)
            merge_xml = f'<mergeCells count="{len(self.merges)}">{items}</mergeCells>'

        # conditionalFormatting
        cond_xml = ""
        for sqref, rule in self.cond_formats:
            cond_xml += f'<conditionalFormatting sqref="{sqref}">{rule}</conditionalFormatting>'

        # dataValidations
        dv_xml = ""
        if self.validations:
            dv_xml = (f'<dataValidations count="{len(self.validations)}">'
                      + "".join(self.validations) + "</dataValidations>")

        # print / page
        page_margins = '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>'
        page_setup = ""
        sheet_pr_page = ""
        if self.page_setup:
            ps = self.page_setup
            l, r, t, b, h, f = ps["margins"]
            page_margins = (f'<pageMargins left="{l}" right="{r}" top="{t}" '
                            f'bottom="{b}" header="{h}" footer="{f}"/>')
            page_setup = (f'<pageSetup paperSize="{ps["paper"]}" '
                          f'orientation="{ps["orientation"]}" '
                          f'fitToWidth="{ps["fit_width"]}" fitToHeight="{ps["fit_height"]}"/>')
            sheet_pr_page = '<pageSetUpPr fitToPage="1"/>'

        # inject fitToPage into sheetPr
        if sheet_pr_page:
            if sheet_pr:
                sheet_pr = sheet_pr[:-len("</sheetPr>")] + sheet_pr_page + "</sheetPr>"
            else:
                sheet_pr = f"<sheetPr>{sheet_pr_page}</sheetPr>"

        drawing_xml = ""
        if self.drawing_rid:
            drawing_xml = f'<drawing r:id="{self.drawing_rid}"/>'

        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            + sheet_pr + dimension + sheet_views + sheet_format + cols_xml
            + sheet_data + protection + merge_xml + cond_xml + dv_xml
            + '<printOptions horizontalCentered="1"/>'
            + page_margins + page_setup + drawing_xml
            + "</worksheet>"
        )

    def _render_cell(self, r: int, c: int, data: dict) -> str:
        ref = cell_ref(r, c)
        s = data["s"]
        f = data["f"]
        v = data["v"]
        sattr = f' s="{s}"' if s else ""
        if f is not None:
            fx = _esc(f)
            # formula, no cached value (fullCalcOnLoad recomputes)
            return f'<c r="{ref}"{sattr}><f>{fx}</f></c>'
        if v is None:
            return f'<c r="{ref}"{sattr}/>'
        if isinstance(v, bool):
            return f'<c r="{ref}"{sattr} t="b"><v>{1 if v else 0}</v></c>'
        if isinstance(v, (int, float)):
            return f'<c r="{ref}"{sattr}><v>{v}</v></c>'
        if isinstance(v, _dt.date):
            serial = _to_excel_serial(v)
            return f'<c r="{ref}"{sattr}><v>{serial}</v></c>'
        # string -> inline
        return (f'<c r="{ref}"{sattr} t="inlineStr"><is>'
                f'<t xml:space="preserve">{_esc(v)}</t></is></c>')


def _to_excel_serial(d: _dt.date) -> float:
    epoch = _dt.date(1899, 12, 30)
    if isinstance(d, _dt.datetime):
        delta = d - _dt.datetime(1899, 12, 30)
        return delta.days + delta.seconds / 86400.0
    return (d - epoch).days


# --------------------------------------------------------------------------- #
#  Chart (bar / pie) via drawing
# --------------------------------------------------------------------------- #
class Chart:
    def __init__(self, kind: str, title: str, cat_ref: str, val_ref: str,
                 series_name: str = "", colors=None, n_points: int = 2):
        self.kind = kind          # "bar" or "pie"
        self.title = title
        self.cat_ref = cat_ref    # e.g. "'Dashboard'!$B$5:$B$6"
        self.val_ref = val_ref
        self.series_name = series_name
        self.n_points = n_points
        self.colors = colors or ["FF1F3864", "FF2E75B6", "FFBF9000", "FF548235",
                                 "FFC00000", "FF2A9D8F"]
        self.anchor = None        # (from_col, from_row, to_col, to_row) 0-based

    def render(self) -> str:
        title_xml = (f"<c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r>"
                     f'<a:rPr lang="en-US" b="1" sz="1200"/>'
                     f"<a:t>{_esc(self.title)}</a:t></a:r></a:p></c:rich></c:tx>"
                     f"<c:overlay val=\"0\"/></c:title>")

        if self.kind == "pie":
            pts = "".join(
                f'<c:dPt><c:idx val="{i}"/><c:bubble3D val="0"/>'
                f'<c:spPr><a:solidFill><a:srgbClr val="{self.colors[i % len(self.colors)][2:]}"/>'
                f"</a:solidFill></c:spPr></c:dPt>"
                for i in range(self.n_points)
            )
            plot = (
                "<c:pieChart><c:varyColors val=\"1\"/>"
                "<c:ser><c:idx val=\"0\"/><c:order val=\"0\"/>"
                f'<c:tx><c:strRef><c:f>{_esc(self.series_name)}</c:f></c:strRef></c:tx>'
                + pts
                + f'<c:cat><c:strRef><c:f>{_esc(self.cat_ref)}</c:f></c:strRef></c:cat>'
                + f'<c:val><c:numRef><c:f>{_esc(self.val_ref)}</c:f></c:numRef></c:val>'
                + "</c:ser><c:firstSliceAng val=\"0\"/></c:pieChart>"
            )
        else:
            fill = self.colors[0][2:]
            plot = (
                '<c:barChart><c:barDir val="col"/><c:grouping val="clustered"/>'
                '<c:varyColors val="0"/>'
                '<c:ser><c:idx val="0"/><c:order val="0"/>'
                f'<c:tx><c:strRef><c:f>{_esc(self.series_name)}</c:f></c:strRef></c:tx>'
                f'<c:spPr><a:solidFill><a:srgbClr val="{fill}"/></a:solidFill></c:spPr>'
                f'<c:cat><c:strRef><c:f>{_esc(self.cat_ref)}</c:f></c:strRef></c:cat>'
                f'<c:val><c:numRef><c:f>{_esc(self.val_ref)}</c:f></c:numRef></c:val>'
                '</c:ser><c:axId val="111111111"/><c:axId val="222222222"/></c:barChart>'
                '<c:catAx><c:axId val="111111111"/><c:scaling><c:orientation val="minMax"/></c:scaling>'
                '<c:delete val="0"/><c:axPos val="b"/><c:crossAx val="222222222"/></c:catAx>'
                '<c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/></c:scaling>'
                '<c:delete val="0"/><c:axPos val="l"/><c:crossAx val="111111111"/></c:valAx>'
            )

        legend = '<c:legend><c:legendPos val="b"/><c:overlay val="0"/></c:legend>' \
            if self.kind == "pie" else '<c:legend><c:legendPos val="b"/><c:overlay val="0"/></c:legend>'

        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
            'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<c:chart>' + title_xml + '<c:autoTitleDeleted val="0"/>'
            '<c:plotArea><c:layout/>' + plot + '</c:plotArea>'
            + legend +
            '<c:plotVisOnly val="1"/></c:chart></c:chartSpace>'
        )


# --------------------------------------------------------------------------- #
#  Workbook
# --------------------------------------------------------------------------- #
class Workbook:
    def __init__(self):
        self.reg = StyleRegistry()
        self.sheets: list[Sheet] = []
        # defined names: list of (name, refers_to, local_sheet_index_or_None)
        self.defined_names: list[tuple[str, str, int | None]] = []
        self._charts: list[tuple[Sheet, Chart]] = []
        self.title = "Payroll Management System"
        self.active_tab = 0
        self.vba_project: bytes | None = None   # embedded vbaProject.bin
        self.code_name: str | None = None       # ThisWorkbook code name

    def set_vba_project(self, data: bytes, code_name: str = "ThisWorkbook"):
        """Embed a vbaProject.bin so the workbook is saved as a macro-enabled .xlsm."""
        self.vba_project = data
        self.code_name = code_name

    def add_sheet(self, name: str) -> Sheet:
        s = Sheet(name, self.reg)
        self.sheets.append(s)
        return s

    def style(self, spec: dict) -> int:
        return self.reg.style(spec)

    def dxf(self, spec: dict) -> int:
        return self.reg.dxf(spec)

    def define_name(self, name: str, refers_to: str, sheet: Sheet | None = None):
        local = self.sheets.index(sheet) if sheet is not None else None
        self.defined_names.append((name, refers_to, local))

    def add_chart(self, sheet: Sheet, chart: Chart, anchor):
        chart.anchor = anchor
        self._charts.append((sheet, chart))

    # -- assemble the package --------------------------------------------- #
    def save(self, path: str):
        # attach print areas as defined names
        for i, s in enumerate(self.sheets):
            if s.print_area:
                ref = f"'{s.name}'!{s.print_area}"
                self.defined_names.append(("_xlnm.Print_Area", ref, i))

        # assign drawing rels for sheets that own charts
        sheet_charts: dict[int, list[Chart]] = {}
        for s, ch in self._charts:
            si = self.sheets.index(s)
            sheet_charts.setdefault(si, []).append(ch)
        for si, charts in sheet_charts.items():
            self.sheets[si].drawing_rid = "rId1"

        parts: dict[str, str] = {}

        # [Content_Types].xml
        parts["[Content_Types].xml"] = self._content_types(sheet_charts)
        # _rels/.rels
        parts["_rels/.rels"] = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            "</Relationships>"
        )
        # docProps
        parts["docProps/core.xml"] = self._core_props()
        parts["docProps/app.xml"] = self._app_props()

        # workbook.xml + rels
        parts["xl/workbook.xml"] = self._workbook_xml()
        parts["xl/_rels/workbook.xml.rels"] = self._workbook_rels()
        parts["xl/styles.xml"] = self.reg.render()

        # embedded VBA project (macro-enabled workbook)
        if self.vba_project is not None:
            parts["xl/vbaProject.bin"] = self.vba_project

        # worksheets
        for i, s in enumerate(self.sheets, start=1):
            parts[f"xl/worksheets/sheet{i}.xml"] = s.render()

        # drawings + charts
        chart_counter = 0
        for si, charts in sheet_charts.items():
            sheet_no = si + 1
            drawing_no = si + 1
            # sheet rels -> drawing
            parts[f"xl/worksheets/_rels/sheet{sheet_no}.xml.rels"] = (
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                f'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing{drawing_no}.xml"/>'
                "</Relationships>"
            )
            # drawing xml + rels
            anchors = []
            drawing_rels = []
            for j, ch in enumerate(charts, start=1):
                chart_counter += 1
                cid = chart_counter
                rid = f"rId{j}"
                anchors.append(self._anchor_xml(ch, rid, j))
                drawing_rels.append(
                    f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart{cid}.xml"/>'
                )
                parts[f"xl/charts/chart{cid}.xml"] = ch.render()
            parts[f"xl/drawings/drawing{drawing_no}.xml"] = (
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" '
                'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
                + "".join(anchors) + "</xdr:wsDr>"
            )
            parts[f"xl/drawings/_rels/drawing{drawing_no}.xml.rels"] = (
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                + "".join(drawing_rels) + "</Relationships>"
            )

        # write the zip
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            for name, content in parts.items():
                z.writestr(name, content)

    # -- anchor for a chart ----------------------------------------------- #
    def _anchor_xml(self, ch: Chart, rid: str, obj_id: int) -> str:
        fc, fr, tc, tr = ch.anchor
        return (
            '<xdr:twoCellAnchor editAs="oneCell">'
            f'<xdr:from><xdr:col>{fc}</xdr:col><xdr:colOff>0</xdr:colOff>'
            f'<xdr:row>{fr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>'
            f'<xdr:to><xdr:col>{tc}</xdr:col><xdr:colOff>0</xdr:colOff>'
            f'<xdr:row>{tr}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'
            '<xdr:graphicFrame macro="">'
            f'<xdr:nvGraphicFramePr><xdr:cNvPr id="{obj_id + 1}" name="Chart {obj_id}"/>'
            '<xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>'
            '<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="5486400" cy="3200400"/></xdr:xfrm>'
            '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">'
            f'<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
            f'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{rid}"/>'
            '</a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>'
        )

    # -- content types ---------------------------------------------------- #
    def _content_types(self, sheet_charts) -> str:
        wb_type = ("application/vnd.ms-excel.sheet.macroEnabled.main+xml"
                   if self.vba_project is not None
                   else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml")
        overrides = [
            f'<Override PartName="/xl/workbook.xml" ContentType="{wb_type}"/>',
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
        ]
        for i in range(1, len(self.sheets) + 1):
            overrides.append(
                f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
                'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            )
        chart_counter = 0
        for si, charts in sheet_charts.items():
            drawing_no = si + 1
            overrides.append(
                f'<Override PartName="/xl/drawings/drawing{drawing_no}.xml" '
                'ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
            )
            for _ in charts:
                chart_counter += 1
                overrides.append(
                    f'<Override PartName="/xl/charts/chart{chart_counter}.xml" '
                    'ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>'
                )
        if self.vba_project is not None:
            overrides.append(
                '<Override PartName="/xl/vbaProject.bin" '
                'ContentType="application/vnd.ms-office.vbaProject"/>'
            )
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            + "".join(overrides) + "</Types>"
        )

    def _workbook_xml(self) -> str:
        sheets_xml = ""
        for i, s in enumerate(self.sheets, start=1):
            state = ' state="hidden"' if s.hidden else ""
            sheets_xml += (f'<sheet name="{_esc(s.name)}" sheetId="{i}"{state} '
                           f'r:id="rId{i}"/>')
        names_xml = ""
        if self.defined_names:
            items = []
            for name, ref, local in self.defined_names:
                if local is not None:
                    items.append(f'<definedName name="{_esc(name)}" '
                                 f'localSheetId="{local}">{_esc(ref)}</definedName>')
                else:
                    items.append(f'<definedName name="{_esc(name)}">{_esc(ref)}</definedName>')
            names_xml = "<definedNames>" + "".join(items) + "</definedNames>"
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<fileVersion appName="xl" lastEdited="7" lowestEdited="7" rupBuild="10000"/>'
            + ('<workbookPr codeName="%s" defaultThemeVersion="166925"/>'
               % _escattr(self.code_name) if self.code_name
               else '<workbookPr defaultThemeVersion="166925"/>')
            + f'<bookViews><workbookView activeTab="{self.active_tab}"/></bookViews>'
            "<sheets>" + sheets_xml + "</sheets>"
            + names_xml
            + '<calcPr calcId="0" fullCalcOnLoad="1"/>'
            "</workbook>"
        )

    def _workbook_rels(self) -> str:
        rels = []
        for i in range(1, len(self.sheets) + 1):
            rels.append(f'<Relationship Id="rId{i}" '
                        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
                        f'Target="worksheets/sheet{i}.xml"/>')
        style_rid = len(self.sheets) + 1
        rels.append(f'<Relationship Id="rId{style_rid}" '
                    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
                    'Target="styles.xml"/>')
        if self.vba_project is not None:
            vba_rid = len(self.sheets) + 2
            rels.append(f'<Relationship Id="rId{vba_rid}" '
                        'Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" '
                        'Target="vbaProject.bin"/>')
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            + "".join(rels) + "</Relationships>"
        )

    def _core_props(self) -> str:
        now = _dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
            'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            f'<dc:title>{_esc(self.title)}</dc:title>'
            '<dc:creator>Kiro</dc:creator>'
            f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
            f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
            "</cp:coreProperties>"
        )

    def _app_props(self) -> str:
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">'
            '<Application>Kiro xlsxgen</Application><Company></Company></Properties>'
        )
