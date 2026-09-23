from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Kind = Literal["heart", "sight"]
DolchLevel = Literal["pre-primer", "primer", "grade-1"]
Direction = Literal["across", "down"]


class Grapheme(BaseModel):
    letters: str = Field(min_length=1)
    phoneme: str = Field(min_length=1)
    heart: bool


class Word(BaseModel):
    id: str = Field(min_length=1)
    display: str = Field(min_length=1)
    kinds: list[Kind] = Field(min_length=1)
    dolch: DolchLevel | None
    graphemes: list[Grapheme] = Field(min_length=1)
    meaning: str = Field(min_length=1)
    sentence: str = Field(min_length=1)

    @model_validator(mode="after")
    def spelling_matches(self) -> "Word":
        built = "".join(piece.letters for piece in self.graphemes)
        if built != self.display:
            raise ValueError(f"{self.id} graphemes spell {built!r}, display is {self.display!r}")
        if self.id != self.display.lower():
            raise ValueError(f"{self.id} is not the lowercase display spelling")
        if len(set(self.kinds)) != len(self.kinds):
            raise ValueError(f"{self.id} repeats a kind")
        return self


class Letter(BaseModel):
    letter: str
    sound: str = Field(min_length=1)
    cue: str = Field(min_length=1)
    decodable: list[str] = Field(min_length=4, max_length=4)

    @model_validator(mode="after")
    def single_lowercase_letter(self) -> "Letter":
        if len(self.letter) != 1 or self.letter not in "abcdefghijklmnopqrstuvwxyz":
            raise ValueError("letter must be one of a through z")
        return self


class Placement(BaseModel):
    word_id: str
    row: int
    col: int
    direction: Direction


class Hunt(BaseModel):
    rows: list[str]
    placements: list[Placement]


class DailyLesson(BaseModel):
    date: date
    letter: Letter
    number: int
    count: int
    skip_by: int
    skip_shown: list[int]
    mix: int = 0
    heart_words: list[Word]
    sight_words: list[Word]
    hunt: Hunt


class FlashcardRequest(BaseModel):
    ids: list[str] | None = None
    kind: Kind | None = None

    @model_validator(mode="after")
    def one_source(self) -> "FlashcardRequest":
        has_ids = self.ids is not None
        has_kind = self.kind is not None
        if has_ids == has_kind:
            raise ValueError("send ids or kind, not both")
        if self.ids is not None and len(self.ids) == 0:
            raise ValueError("ids is empty")
        return self
