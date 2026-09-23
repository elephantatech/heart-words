import pytest
from pydantic import ValidationError

from app.models import Word
from app.words.load import load_catalog

ORIGINAL_HEART_WORDS = [
    "the", "a", "i", "to", "do", "of", "see", "he", "is", "as", "has", "was", "his", "you",
    "said", "for", "they", "have", "are", "from", "one", "what", "who", "where", "there",
    "here", "come", "some", "would", "could", "should", "give", "live", "my", "by",
]


def test_original_heart_words_remain():
    catalog = load_catalog()
    for word_id in ORIGINAL_HEART_WORDS:
        word = catalog.get(word_id)
        assert word is not None
        assert "heart" in word.kinds


def test_i_keeps_display_and_curated_sentence():
    word = load_catalog().get("I")
    assert word is not None
    assert word.display == "I"
    assert word.meaning == "the person talking about themselves"
    assert word.sentence == "I like to read books."


def test_said_keeps_both_quotation_marks():
    word = load_catalog().get("said")
    assert word is not None
    assert word.sentence == 'Dad said, "Time for bed."'


def test_dolch_bands_and_letters():
    catalog = load_catalog()
    assert sum(word.dolch == "pre-primer" for word in catalog.words) == 40
    assert sum(word.dolch == "primer" for word in catalog.words) == 52
    assert sum(word.dolch == "grade-1" for word in catalog.words) == 41
    assert set(catalog.letters) == set("abcdefghijklmnopqrstuvwxyz")
    assert all(len(letter.decodable) == 4 for letter in catalog.letters.values())


def test_word_rejects_spelling_mismatch():
    with pytest.raises(ValidationError):
        Word.model_validate(
            {
                "id": "cat",
                "display": "cat",
                "kinds": ["sight"],
                "dolch": None,
                "graphemes": [{"letters": "c", "phoneme": "k", "heart": False}],
                "meaning": "an animal",
                "sentence": "I see a cat.",
            }
        )
