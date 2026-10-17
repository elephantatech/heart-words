# Contributing

Heart words is a browser practice page for grade 1 and grade 5. Kindergarten and grades 2 through 4 are listed and not built yet.

## Setup

```
npm install
npm test
npm run dev
```

`npm test` checks the daily lesson. `npm run build` writes the site to `web/dist`.

## Changes that help

- A grade that is still missing, or a fix to a sheet that already exists.
- Clearer directions on a page a child uses.
- A failing test that shows a wrong lesson, then the fix.

Keep parent names, student names, and PINs in the browser. Do not add an account server, analytics, or a required login.

Lesson text in `web/src/data` is part of this project. Do not paste passages from a textbook or another site.

## Pull requests

Describe what a student or parent can do after the change. Run `npm test` before you open the request.

Leave `social/` out of the commit. Those posts stay on your machine.

## License

The code and the lesson text are under the MIT license. Copyright (c) 2026 Elephantatech. See `LICENSE`.

Andika, in `web/public/fonts`, stays under the SIL Open Font License. See `web/public/fonts/OFL.txt`. A change to the app does not relicense that font.
