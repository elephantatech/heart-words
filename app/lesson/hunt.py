import random
from datetime import date

from app.models import Hunt, Placement, Word

ROWS = 8
COLS = 10


def build_hunt(day: date, words: list[Word], mix: int = 0) -> Hunt:
    if not words:
        raise ValueError("hunt needs at least one word")
    rng = random.Random(day.toordinal() + mix)
    grid: list[list[str | None]] = [[None] * COLS for _ in range(ROWS)]
    texts = [word.display.lower() for word in words]
    plans = [_options(rng, text, index, len(words)) for index, text in enumerate(texts)]
    chosen: list[Placement | None] = [None] * len(words)
    sequence = [3, 0, 1, 2] if len(words) >= 4 else list(range(len(words)))

    def fits(row: int, col: int, text: str, direction: str) -> bool:
        for offset, char in enumerate(text):
            r, c = _step(row, col, offset, direction)
            current = grid[r][c]
            if current is not None and current != char:
                return False
        return True

    def write(row: int, col: int, text: str, direction: str) -> None:
        for offset, char in enumerate(text):
            r, c = _step(row, col, offset, direction)
            grid[r][c] = char

    def search(step: int) -> bool:
        if step == len(sequence):
            return True
        index = sequence[step]
        text = texts[index]
        for direction, spots in plans[index]:
            for row, col in spots:
                if not fits(row, col, text, direction):
                    continue
                snapshot = [line[:] for line in grid]
                write(row, col, text, direction)
                chosen[index] = Placement(
                    word_id=words[index].id,
                    row=row,
                    col=col,
                    direction=direction,
                )
                if search(step + 1):
                    return True
                for r in range(ROWS):
                    grid[r][:] = snapshot[r]
                chosen[index] = None
        return False

    if not search(0):
        raise RuntimeError(f"could not place hunt words for {day.isoformat()}")

    alphabet = "abcdefghijklmnopqrstuvwxyz"
    rows = []
    for line in grid:
        rows.append("".join(cell if cell is not None else rng.choice(alphabet) for cell in line))
    placements = [place for place in chosen if place is not None]
    return Hunt(rows=rows, placements=placements)


def _options(rng: random.Random, text: str, index: int, total: int) -> list[tuple[str, list[tuple[int, int]]]]:
    prefer_down = total >= 4 and index == 3
    directions = ["down", "across"] if prefer_down else ["across"]
    plans = []
    for direction in directions:
        if direction == "across":
            spots = [(row, col) for row in range(ROWS) for col in range(COLS - len(text) + 1)]
        else:
            spots = [(row, col) for col in range(COLS) for row in range(ROWS - len(text) + 1)]
        rng.shuffle(spots)
        plans.append((direction, spots))
    return plans


def _step(row: int, col: int, offset: int, direction: str) -> tuple[int, int]:
    if direction == "down":
        return row + offset, col
    return row, col + offset
