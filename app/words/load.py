import json
from dataclasses import dataclass
from pathlib import Path

from app.models import Letter, Word

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@dataclass(frozen=True)
class Catalog:
    words: tuple[Word, ...]
    by_id: dict[str, Word]
    letters: dict[str, Letter]

    def get(self, key: str) -> Word | None:
        return self.by_id.get(key.strip().lower())

    def of_kind(self, kind: str) -> list[Word]:
        return [word for word in self.words if kind in word.kinds]


def load_catalog(data_dir: Path | None = None) -> Catalog:
    root = data_dir or DATA_DIR
    raw_words = json.loads((root / "words.json").read_text(encoding="utf-8"))
    raw_letters = json.loads((root / "letters.json").read_text(encoding="utf-8"))
    words = [Word.model_validate(item) for item in raw_words]
    ids = [word.id for word in words]
    if len(ids) != len(set(ids)):
        raise ValueError("duplicate word id")
    letters = [Letter.model_validate(item) for item in raw_letters]
    keys = [item.letter for item in letters]
    if len(keys) != len(set(keys)) or set(keys) != set("abcdefghijklmnopqrstuvwxyz"):
        raise ValueError("letters must be a through z exactly once")
    ordered = tuple(sorted(words, key=lambda word: word.id))
    return Catalog(
        words=ordered,
        by_id={word.id: word for word in ordered},
        letters={item.letter: item for item in letters},
    )
