from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

INK = RGBColor(0x1A, 0x27, 0x44)
GUIDE = RGBColor(0xE2, 0xB0, 0x07)
HEART = RGBColor(0xC2, 0x3B, 0x4A)
MUTED = RGBColor(0x5C, 0x65, 0x70)
CARD_ROW_TWIPS = 3312


def apply_letter_page(section) -> None:
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)


def set_cell_margins(cell, top: int = 0, bottom: int = 0, left: int = 80, right: int = 80) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = OxmlElement("w:tcMar")
    for edge, value in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")
        margins.append(node)
    tc_pr.append(margins)


def set_row_height(row, twips: int, rule: str = "exact") -> None:
    tr_pr = row._tr.get_or_add_trPr()
    node = tr_pr.find(qn("w:trHeight"))
    if node is None:
        node = OxmlElement("w:trHeight")
        tr_pr.append(node)
    node.set(qn("w:val"), str(twips))
    node.set(qn("w:hRule"), rule)


def style_run(run, size: int, color: RGBColor, bold: bool = False, italic: bool = False, underline: bool = False) -> None:
    run.font.name = "Arial"
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.bold = bold
    run.italic = italic
    run.underline = underline


def center(paragraph) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER


def shade_cell(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear")
    shading.set(qn("w:color"), "auto")
    shading.set(qn("w:fill"), fill)
    tc_pr.append(shading)


def add_bottom_border(paragraph) -> None:
    _paragraph_border(paragraph, bottom=("8", "8FB4D9"))


def add_handwriting_lines(paragraph) -> None:
    """Headline, a thinner midline, and the baseline."""
    _paragraph_border(
        paragraph,
        top=("12", "8EA9C6"),
        bottom=("12", "8EA9C6"),
        between=("4", "B7C9DC"),
    )


def _paragraph_border(paragraph, top=None, bottom=None, between=None) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    for edge, spec in (("top", top), ("between", between), ("bottom", bottom)):
        if spec is None:
            continue
        size, color = spec
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), size)
        node.set(qn("w:space"), "1")
        node.set(qn("w:color"), color)
        borders.append(node)
    p_pr.append(borders)
