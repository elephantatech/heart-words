from datetime import date
from io import BytesIO

from docx import Document

from app.docs.worksheet import build_worksheet
from app.lesson.daily import build_lesson
from app.words.load import load_catalog


def test_worksheet_includes_the_lesson_and_a_grown_up_key():
    lesson = build_lesson(load_catalog(), date(2026, 9, 23))
    document = Document(BytesIO(build_worksheet(lesson)))
    text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    assert lesson.letter.cue in text
    assert "Grown-up key" in text
    assert 'w:type="page"' in document.element.xml
    for word in lesson.heart_words + lesson.sight_words:
        assert word.display in text
        assert word.sentence in text
