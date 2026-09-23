from datetime import date
from pathlib import Path

from fastapi import APIRouter, Query, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

from app.lesson.daily import build_lesson, counting_frames

router = APIRouter()
templates = Jinja2Templates(directory=str(Path(__file__).resolve().parent / "templates"))


@router.get("/")
def home() -> RedirectResponse:
    return RedirectResponse(url=f"/daily/{date.today().isoformat()}", status_code=307)


@router.get("/daily/{day}")
def daily_page(day: date, request: Request, mix: int = Query(default=0, ge=0)):
    lesson = build_lesson(request.app.state.catalog, day, mix)
    targets = lesson.heart_words + lesson.sight_words
    return templates.TemplateResponse(
        request,
        "daily.html",
        {
            "lesson": lesson,
            "page": "daily",
            "targets": targets,
            "frames": counting_frames(lesson.count),
            "hunt_payload": {
                "words": [{"id": word.id, "text": word.display.lower()} for word in targets]
            },
        },
    )


@router.get("/cards")
def cards_page(request: Request, kind: str = "heart"):
    if kind not in {"heart", "sight"}:
        kind = "heart"
    return templates.TemplateResponse(
        request,
        "cards.html",
        {
            "words": request.app.state.catalog.of_kind(kind),
            "kind": kind,
            "page": "cards",
        },
    )


@router.get("/words")
def words_page(request: Request):
    return templates.TemplateResponse(
        request,
        "words.html",
        {"words": request.app.state.catalog.words, "page": "words"},
    )
