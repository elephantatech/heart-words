# Heart words

[![Unit tests](https://github.com/elephantatech/heart-words/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/elephantatech/heart-words/actions/workflows/unit-tests.yml)
[![Build](https://github.com/elephantatech/heart-words/actions/workflows/build.yml/badge.svg)](https://github.com/elephantatech/heart-words/actions/workflows/build.yml)

Grade 1 practice for heart words, sight words, and a daily math sheet. Grade 5 has a daily language page and a math page. Kindergarten and grades 2 through 4 are listed for later. It runs in the browser and can be installed on a tablet. Parent and student profiles stay on that device.

## Run

```
npm install
npm run dev
```

Open the address Vite prints. `npm test` checks the daily lesson. `npm run build` writes the installable site to `web/dist`, and `npm run preview` serves that build.

## Deploy

`vercel.json` installs and builds `web/`, then publishes `web/dist` as a static site. From the repo root, sign in with `npx vercel login` and publish with `npx vercel --prod`.

## On a tablet

The first visit offers Login or Continue without login. Login saves a parent name, a 4-digit PIN, and a student. The PIN only unlocks settings on this browser or installed app. It is not an online account. Clearing the site data deletes the profiles.

Grade 1 also has three sheets that stay off the daily page: missing numbers, numbers 1 to 30, and the full alphabet. Open them from Sheets. A parent chooses the student’s grade. Grade 1 and grade 5 are ready. Kindergarten and grades 2 through 4 stay on the form, greyed out, until those sheets exist. Grade 5 practice is a daily word with a reading that uses it, grammar, a challenge word hunt, whole-number operations, fractions, decimals, order of operations, volume, and rounding. The parent also chooses which exercises that student sees: uppercase and lowercase writing, heart words, sight words, the word hunt, number writing, counting, count-on, and skip counting. A letter, a number from 0 to 20, or skip counting by 2, 5, or 10 can be pinned. More than one student can be saved, and Today shows the chosen student. Login is in the top right corner.

To install on an iPad, open the page in Safari, tap Share, then Add to Home Screen. In Chrome or Edge, use Install when the browser offers it. The installed copy works from the saved page after the first load.

## Print

Print today’s sheet from the page. It is letter size. The math sheet starts on the next page. Download today’s page for a Word file with the same exercises, handwriting lines, and a grown-up word-hunt key after the student pages. On Cards, download the heart-word or sight-word deck. Print those double-sided and flip on the short edge.

## Words

Heart words are the set from the original card generator. Sight words are the Dolch pre-primer, primer, and grade 1 lists. Meanings, sentences, and sound marks live in `web/src/data/words.json` and `web/src/data/letters.json`. The daily letter starts at A on 2026-09-01 and moves one letter ahead each calendar day. New sheet makes another mix for that same day.

The reading font is [Andika](https://software.sil.org/andika/), bundled under the SIL Open Font License. See `web/public/fonts/OFL.txt`.

## License

The code and the lesson text are copyright (c) 2026 Elephantatech and released under the MIT license. See `LICENSE`.

Andika is not covered by that license. It remains under the SIL Open Font License, and the name Andika is a reserved font name. See `web/public/fonts/OFL.txt`.

Sight words are the Dolch pre-primer, primer, and grade 1 lists.

To contribute, read `CONTRIBUTING.md`. Reports of private information belong in `SECURITY.md`. Community rules are in `CODE_OF_CONDUCT.md`.
