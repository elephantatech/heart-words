from datetime import date

from app.lesson.hunt import build_hunt
from app.models import DailyLesson, Word
from app.words.load import Catalog

EPOCH = date(2026, 9, 1)
ALPHABET = "abcdefghijklmnopqrstuvwxyz"


def day_index(day: date) -> int:
    return (day - EPOCH).days


def _slot(day: date, mix: int = 0) -> int:
    return day_index(day) + mix


def letter_for(day: date, mix: int = 0) -> str:
    return ALPHABET[_slot(day, mix) % 26]


def number_for(day: date, mix: int = 0) -> int:
    """Grade 1 writing number, cycling 0 through 20."""
    return _slot(day, mix) % 21


def count_for(day: date, mix: int = 0) -> int:
    """How many dots to count, from 1 through 10."""
    return (_slot(day, mix) % 10) + 1


def skip_for(day: date, mix: int = 0) -> tuple[int, list[int]]:
    """Skip counting by 2s, 5s, or 10s, with the first three numbers shown."""
    step = (2, 5, 10)[_slot(day, mix) % 3]
    start = 1 + ((_slot(day, mix) // 3) % 4)
    shown = [step * (start + index) for index in range(3)]
    return step, shown


def counting_frames(count: int) -> list[list[bool]]:
    if count <= 0:
        return [[False] * 10]
    frames: list[list[bool]] = []
    left = count
    while left > 0:
        take = min(10, left)
        frames.append([index < take for index in range(10)])
        left -= take
    return frames


def _pool(catalog: Catalog, letter: str, kind: str) -> list[Word]:
    containing = [
        word for word in catalog.words if kind in word.kinds and letter in word.display.lower()
    ]
    if len(containing) >= 2:
        return containing
    chosen = {word.id for word in containing}
    rest = [word for word in catalog.words if kind in word.kinds and word.id not in chosen]
    return containing + rest


def pick_words(catalog: Catalog, day: date, kind: str, count: int, exclude: set[str], mix: int = 0) -> list[Word]:
    pool = [word for word in _pool(catalog, letter_for(day, mix), kind) if word.id not in exclude]
    if len(pool) < count:
        raise ValueError(f"not enough {kind} words for {day.isoformat()}")
    start = _slot(day, mix) % len(pool)
    rotated = pool[start:] + pool[:start]
    return rotated[:count]


def build_lesson(catalog: Catalog, day: date, mix: int = 0) -> DailyLesson:
    heart_words = pick_words(catalog, day, "heart", 2, set(), mix)
    sight_words = pick_words(catalog, day, "sight", 2, {word.id for word in heart_words}, mix)
    targets = heart_words + sight_words
    skip_by, skip_shown = skip_for(day, mix)
    return DailyLesson(
        date=day,
        letter=catalog.letters[letter_for(day, mix)],
        number=number_for(day, mix),
        count=count_for(day, mix),
        skip_by=skip_by,
        skip_shown=skip_shown,
        mix=mix,
        heart_words=heart_words,
        sight_words=sight_words,
        hunt=build_hunt(day, targets, mix),
    )
