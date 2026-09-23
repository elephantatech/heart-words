from io import BytesIO

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx.shared import Inches, Pt

from app.docs.common import (
    CARD_ROW_TWIPS,
    HEART,
    INK,
    MUTED,
    apply_letter_page,
    center,
    set_cell_margins,
    set_row_height,
    style_run,
)
from app.models import Word

CARDS_PER_PAGE = 8


def build_flashcards(words: list[Word]) -> bytes:
    document = Document()
    apply_letter_page(document.sections[0])
    pages = (len(words) + CARDS_PER_PAGE - 1) // CARDS_PER_PAGE
    for page in range(pages):
        chunk = words[page * CARDS_PER_PAGE : (page + 1) * CARDS_PER_PAGE]
        _fill_front(_add_grid(document), chunk)
        document.add_page_break()
        # Short-edge duplex flips left and right, so the back uses the opposite column.
        _fill_back(_add_grid(document), chunk)
        if page < pages - 1:
            document.add_page_break()
    buffer = BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _add_grid(document: Document):
    table = document.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    _set_dashed_borders(table)
    for row in table.rows:
        set_row_height(row, CARD_ROW_TWIPS, "exact")
        for cell in row.cells:
            cell.width = Inches(3.75)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=0, bottom=0, left=80, right=80)
    return table


def _set_dashed_borders(table) -> None:
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f'  <w:left w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f'  <w:bottom w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f'  <w:right w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f'  <w:insideH w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f'  <w:insideV w:val="dashed" w:sz="6" w:space="0" w:color="C5CCD6"/>'
        f"</w:tblBorders>"
    )
    table._tbl.tblPr.append(borders)


def _fill_front(table, words: list[Word]) -> None:
    for index, word in enumerate(words):
        cell = table.rows[index // 2].cells[index % 2]
        paragraph = cell.paragraphs[0]
        center(paragraph)
        _write_graphemes(paragraph, word, size=40)


def _fill_back(table, words: list[Word]) -> None:
    for index, word in enumerate(words):
        cell = table.rows[index // 2].cells[1 - (index % 2)]
        label = cell.paragraphs[0]
        center(label)
        label.paragraph_format.space_after = Pt(2)
        style_run(label.add_run(word.display), size=11, color=MUTED, bold=True)

        meaning = cell.add_paragraph()
        center(meaning)
        meaning.paragraph_format.space_after = Pt(2)
        style_run(meaning.add_run(word.meaning), size=13, color=INK, bold=True)

        sentence = cell.add_paragraph()
        center(sentence)
        sentence.paragraph_format.space_after = Pt(6)
        style_run(sentence.add_run(word.sentence), size=12, color=INK, italic=True)

        boxes = cell.add_paragraph()
        center(boxes)
        _write_graphemes(boxes, word, size=14, gap=True)


def _write_graphemes(paragraph, word: Word, size: int, gap: bool = False) -> None:
    for index, piece in enumerate(word.graphemes):
        if gap and index:
            style_run(paragraph.add_run("  "), size=size, color=INK)
        style_run(
            paragraph.add_run(piece.letters),
            size=size,
            color=HEART if piece.heart else INK,
            bold=True,
            underline=piece.heart,
        )
