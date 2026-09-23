from datetime import date

from fastapi.testclient import TestClient

from app.lesson.daily import build_lesson
from app.main import create_app
from app.words.load import load_catalog

client = TestClient(create_app())


def test_health_and_word_lookup():
    assert client.get("/api/health").json() == {"status": "ok"}
    word = client.get("/api/words/I")
    assert word.status_code == 200
    assert word.json()["display"] == "I"
    assert word.json()["sentence"] == "I like to read books."
    assert client.get("/api/words/zzzz").status_code == 404
    assert client.get("/api/letters/w").json()["cue"] == "w as in web"
    assert client.get("/api/letters/9").status_code == 404


def test_daily_and_bad_date():
    lesson = client.get("/api/daily", params={"date": "2026-09-23"})
    assert lesson.status_code == 200
    assert lesson.json()["letter"]["letter"] == "w"
    assert len(lesson.json()["hunt"]["rows"]) == 8
    assert client.get("/api/daily", params={"date": "2026-13-40"}).status_code == 422


def test_downloads_are_docx_files():
    cards = client.post("/api/flashcards.docx", json={"ids": ["said", "I"]})
    assert cards.status_code == 200
    assert cards.content[:2] == b"PK"
    kind = client.post("/api/flashcards.docx", json={"kind": "heart"})
    assert kind.status_code == 200
    assert kind.content[:2] == b"PK"
    assert client.post("/api/flashcards.docx", json={"ids": []}).status_code == 422
    assert client.post("/api/flashcards.docx", json={}).status_code == 422
    assert client.post("/api/flashcards.docx", json={"ids": ["nope"]}).status_code == 422
    daily = client.get("/api/daily/2026-09-23.docx")
    assert daily.status_code == 200
    assert daily.content[:2] == b"PK"


def test_pages_render_the_lesson_and_cards():
    home = client.get("/", follow_redirects=False)
    assert home.status_code == 307
    assert home.headers["location"].startswith("/daily/")
    lesson = build_lesson(load_catalog(), date(2026, 9, 23))
    page = client.get("/daily/2026-09-23")
    assert page.status_code == 200
    assert lesson.letter.letter.upper() in page.text
    assert page.text.count('class="practice-letter"') == 7
    assert page.text.count("dotted-letter") == 6
    assert "Count by" in page.text
    assert "New sheet" in page.text
    fresh = client.get("/daily/2026-09-23", params={"mix": 1})
    assert fresh.status_code == 200
    assert fresh.text != page.text
    assert page.text.index("Sound it out") < page.text.index("Word hunt") < page.text.index("Math sheet")
    assert "Write the number" in page.text
    assert "How many?" in page.text
    assert page.text.count('class="pip filled"') == lesson.count
    assert 'class="start-dot"' not in page.text
    assert page.text.count("<mark") == 6
    assert page.text.count('<mark class="glyph">W</mark>') == 2
    assert page.text.count('<mark class="glyph">w</mark>') == 2
    assert "<mark>W</mark>et" not in page.text
    assert "Print today's sheet" in page.text
    assert 'data-print' in page.text
    for word in lesson.heart_words + lesson.sight_words:
        assert word.display in page.text
    cards = client.get("/cards")
    assert cards.status_code == 200
    assert "said" in cards.text
    assert "flip" in cards.text
    words = client.get("/words")
    assert words.status_code == 200
    assert "the right or best thing to do" in words.text
