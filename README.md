# Heart words

Grade 1 practice for heart words and sight words. Each day has a letter to write, words to sound out, and a small word hunt. The same lesson can be downloaded as a Word document for printing. Flashcards can be practiced on screen or printed two-sided.

## Run

```
uv sync
uv run uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000

## Print

Flashcards are two columns by four rows on letter paper. Print double-sided and flip on the short edge so each back lines up with its front. Heart letters are red and underlined.

The daily download has the student page first and a grown-up answer key after it.

`POST /api/flashcards.docx` accepts `{"kind": "heart"}`, `{"kind": "sight"}`, or `{"ids": ["said", "I"]}`. `GET /api/daily/2026-09-23.docx` downloads that day's page.

## Words

Heart words are the set from the original card generator. Sight words are the Dolch pre-primer, primer, and grade 1 lists. Meanings, sentences, and sound marks live in `app/data/words.json` and `app/data/letters.json`. The daily letter starts at A on 2026-09-01 and moves one letter ahead each calendar day.

The reading font is [Andika](https://software.sil.org/andika/), bundled under the SIL Open Font License. See `app/static/fonts/OFL.txt`.
