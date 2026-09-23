from datetime import date, timedelta

from app.lesson.daily import build_lesson, count_for, counting_frames, letter_for, number_for, skip_for
from app.words.load import load_catalog


def test_grade_one_number_and_count_follow_the_day():
    assert number_for(date(2026, 9, 1)) == 0
    assert number_for(date(2026, 9, 23)) == 1
    assert count_for(date(2026, 9, 23)) == 3
    assert counting_frames(0) == [[False] * 10]
    assert sum(counting_frames(3)[0]) == 3
    assert len(counting_frames(14)) == 2
    assert sum(counting_frames(14)[0]) == 10
    assert sum(counting_frames(14)[1]) == 4


def test_epoch_and_sample_dates_pick_letters():
    assert letter_for(date(2026, 9, 1)) == "a"
    assert letter_for(date(2026, 9, 23)) == "w"
    assert letter_for(date(2026, 9, 24)) == "x"


def test_skip_counting_uses_twos_fives_or_tens():
    step, shown = skip_for(date(2026, 9, 23))
    assert step in (2, 5, 10)
    assert len(shown) == 3
    assert shown[1] - shown[0] == step
    assert shown[2] - shown[1] == step


def test_new_mix_builds_a_different_sheet():
    catalog = load_catalog()
    day = date(2026, 9, 23)
    first = build_lesson(catalog, day)
    other = build_lesson(catalog, day, mix=1)
    assert first.model_dump() == build_lesson(catalog, day, mix=0).model_dump()
    assert first.model_dump() != other.model_dump()


def test_same_date_is_stable_and_the_next_day_changes():
    catalog = load_catalog()
    first = build_lesson(catalog, date(2026, 9, 23))
    again = build_lesson(catalog, date(2026, 9, 23))
    nxt = build_lesson(catalog, date(2026, 9, 24))
    assert first.model_dump() == again.model_dump()
    assert first.model_dump() != nxt.model_dump()
    assert len({word.id for word in first.heart_words + first.sight_words}) == 4


def test_every_day_places_its_four_words():
    catalog = load_catalog()
    start = date(2026, 9, 1)
    for offset in range(60):
        lesson = build_lesson(catalog, start + timedelta(days=offset))
        words = {word.id: word for word in lesson.heart_words + lesson.sight_words}
        assert len(words) == 4
        fourth = (lesson.heart_words + lesson.sight_words)[3]
        fourth_place = next(item for item in lesson.hunt.placements if item.word_id == fourth.id)
        assert fourth_place.direction == "down"
        for place in lesson.hunt.placements:
            text = words[place.word_id].display.lower()
            for index, char in enumerate(text):
                row = place.row + (index if place.direction == "down" else 0)
                col = place.col + (index if place.direction == "across" else 0)
                assert lesson.hunt.rows[row][col] == char
