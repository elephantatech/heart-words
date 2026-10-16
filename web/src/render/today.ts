import { buildLesson, countingFrames } from "../lesson/daily";
import type { Exercise, Lesson, Word } from "../lesson/types";
import { esc, writingRow } from "./html";

function on(lesson: Lesson, exercise: Exercise): boolean {
  return lesson.exercises.includes(exercise);
}

function spell(word: Word): string {
  return `<span class="spell">${word.graphemes
    .map(
      (piece) =>
        `<span class="box${piece.heart ? " heart" : ""}"><span class="letters">${esc(piece.letters)}</span><span class="phoneme">${piece.phoneme === "-" ? "quiet" : esc(piece.phoneme)}</span></span>`,
    )
    .join("")}</span>`;
}

function dateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function todayHtml(lesson: Lesson, studentName: string, gradeLabel = ""): string {
  const targets = [...lesson.heartWords, ...lesson.sightWords];
  const frames = countingFrames(lesson.count);
  const letter = lesson.letter.letter;
  const blocks: string[] = [];
  if (on(lesson, "uppercase")) {
    blocks.push(`<section class="practice" id="uppercase" data-trace><h2>Write the uppercase letter</h2>${writingRow(letter.toUpperCase())}<div class="tools"><button type="button" data-clear>Clear</button><button type="button" data-next="lowercase" disabled>Next</button></div></section>`);
  }
  if (on(lesson, "lowercase")) {
    blocks.push(`<section class="practice" id="lowercase" data-trace><h2>Write the lowercase letter</h2>${writingRow(letter)}<div class="tools"><button type="button" data-clear>Clear</button><button type="button" data-next="sounds" disabled>Next</button></div></section>`);
  }
  if (targets.length) {
    blocks.push(`<section class="practice" id="sounds"><h2>Sound it out</h2>${targets
      .map(
        (word) =>
          `<article class="sound-word"><p class="role">${lesson.heartWords.includes(word) ? "Heart word" : "Sight word"}</p>${spell(word)}<p class="meaning">${esc(word.meaning)}</p><p class="sentence">${esc(word.sentence)}</p></article>`,
      )
      .join("")}</section>`);
  }
  if (lesson.hunt) {
    blocks.push(`<section class="practice" id="hunt"><h2>Word hunt</h2><p class="screen-only">Find the words. Tap one letter, then the next letter across or down.</p><p class="print-only">Circle the words.</p><ul class="bank">${targets
      .map((word) => `<li data-word="${esc(word.id)}">${esc(word.display)}</li>`)
      .join("")}</ul><div class="hunt-scroll"><div class="hunt-grid" data-hunt>${lesson.hunt.rows
      .map((row) => [...row].map((char) => `<button type="button">${esc(char)}</button>`).join(""))
      .join("")}</div></div><p class="win" hidden>You found all the words.</p><script type="application/json" id="hunt-data">${JSON.stringify({
      words: targets.map((word) => ({ id: word.id, text: word.display.toLowerCase() })),
    })}</script></section>`);
  }
  const math: string[] = [];
  if (on(lesson, "number")) math.push(`<h2>Write the number</h2>${writingRow(String(lesson.number))}`);
  if (on(lesson, "count")) {
    math.push(`<h2>Count the dots</h2><p>How many?</p><div class="ten-frames">${frames
      .map(
        (frame) =>
          `<div class="ten-frame">${frame.map((filled) => `<span class="pip${filled ? " filled" : ""}"></span>`).join("")}</div>`,
      )
      .join("")}</div><p>Write how many.</p><div class="practice-row how-many"><div class="blank"><canvas></canvas></div></div>`);
  }
  if (on(lesson, "skip")) {
    math.push(`<h2>Skip count</h2><p>Count by ${lesson.skipBy}s.</p><div class="practice-row skip-count">${lesson.skipShown
      .map((number) => `<p class="practice-letter"><span class="glyph">${number}</span></p>`)
      .join("")}<div class="blank"><canvas></canvas></div><div class="blank"><canvas></canvas></div><div class="blank"><canvas></canvas></div></div>`);
  }
  if (on(lesson, "count_on")) {
    math.push(`<h2>Count on</h2><p>Write the next numbers.</p><div class="practice-row count-on"><p class="practice-letter"><span class="glyph">${lesson.number}</span></p><div class="blank"><canvas></canvas></div><div class="blank"><canvas></canvas></div><div class="blank"><canvas></canvas></div></div>`);
  }
  if (math.length) {
    blocks.push(`<section class="math-sheet practice" id="numbers" data-trace><p class="when">${esc(dateLabel(lesson.date))}</p><h2 class="sheet-title">Math sheet</h2><p class="print-name">Name ____________________</p>${math.join("")}<div class="tools"><button type="button" data-clear>Clear</button></div></section>`);
  }
  if (!blocks.length) blocks.push(`<p>No exercises are turned on for this student. A parent can add some.</p>`);
  const who = [studentName, gradeLabel].filter(Boolean).join(" · ");
  const cue = who ? `${who} · ${lesson.letter.cue}` : lesson.letter.cue;
  return `<p class="when">${esc(dateLabel(lesson.date))}</p><h1 class="cue">${esc(cue)}</h1><p class="print-name">Name ____________________</p><p class="actions"><button type="button" class="download" data-download>Download today's page</button><button type="button" class="download" data-print>Print today's sheet</button><button type="button" class="download" data-new-sheet>New sheet</button></p>${blocks.join("")}`;
}

export function lessonFor(iso: string, mix: number, assignment?: Parameters<typeof buildLesson>[2]): Lesson {
  return buildLesson(iso, mix, assignment);
}
