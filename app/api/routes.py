from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response

from app.docs.flashcards import build_flashcards
from app.docs.worksheet import build_worksheet
from app.lesson.daily import build_lesson
from app.models import FlashcardRequest, Word
from app.words.load import Catalog

router = APIRouter()

DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _catalog(request: Request) -> Catalog:
    return request.app.state.catalog


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/words")
def list_words(request: Request, kind: Annotated[str | None, Query()] = None) -> list[Word]:
    catalog = _catalog(request)
    if kind is None:
        return list(catalog.words)
    if kind not in {"heart", "sight"}:
        raise HTTPException(status_code=422, detail="kind must be heart or sight")
    return catalog.of_kind(kind)


@router.get("/words/{word_id}")
def get_word(word_id: str, request: Request) -> Word:
    word = _catalog(request).get(word_id)
    if word is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return word


@router.get("/letters")
def list_letters(request: Request):
    catalog = _catalog(request)
    return [catalog.letters[letter] for letter in "abcdefghijklmnopqrstuvwxyz"]


@router.get("/letters/{letter}")
def get_letter(letter: str, request: Request):
    found = _catalog(request).letters.get(letter.lower())
    if found is None:
        raise HTTPException(status_code=404, detail="Letter not found")
    return found


@router.get("/daily")
def daily(
    request: Request,
    day: Annotated[date | None, Query(alias="date")] = None,
    mix: int = Query(default=0, ge=0),
):
    return build_lesson(_catalog(request), day or date.today(), mix)


@router.post("/flashcards.docx")
def flashcards(body: FlashcardRequest, request: Request) -> Response:
    catalog = _catalog(request)
    if body.kind is not None:
        words = catalog.of_kind(body.kind)
        filename = f"{body.kind}-words.docx"
    else:
        words = _words_by_id(catalog, body.ids or [])
        filename = "flashcards.docx"
    return _docx(build_flashcards(words), filename)


@router.get("/daily/{day}.docx")
def daily_docx(day: date, request: Request, mix: int = Query(default=0, ge=0)) -> Response:
    lesson = build_lesson(_catalog(request), day, mix)
    return _docx(build_worksheet(lesson), f"daily-{day.isoformat()}.docx")


def _words_by_id(catalog: Catalog, ids: list[str]) -> list[Word]:
    words: list[Word] = []
    seen: set[str] = set()
    for raw in ids:
        word = catalog.get(raw)
        if word is None:
            raise HTTPException(status_code=422, detail=f"Unknown word: {raw}")
        if word.id not in seen:
            words.append(word)
            seen.add(word.id)
    return words


def _docx(payload: bytes, filename: str) -> Response:
    return Response(
        content=payload,
        media_type=DOCX_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
