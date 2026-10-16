import { countingFrames } from "../lesson/daily";
import { dailyHasLanguage, dailyHasMath, type DailySheet, type SheetBlock } from "../lesson/dailySheet";
import { esc, writingRow } from "./html";

function dateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function lines(count: number): string {
  return Array.from({ length: count }, () => `<div class="answer-lines"></div>`).join("");
}

function arrayDots(rows: number, cols: number): string {
  const cells = Array.from({ length: rows * cols }, () => "<span></span>").join("");
  return `<div class="array-dots" style="grid-template-columns: repeat(${cols}, 0.7rem)">${cells}</div>`;
}

function dotFrames(count: number): string {
  return `<div class="ten-frames">${countingFrames(count)
    .map((frame) => `<div class="ten-frame">${frame.map((filled) => `<span class="pip${filled ? " filled" : ""}"></span>`).join("")}</div>`)
    .join("")}</div>`;
}

function blockHtml(block: SheetBlock): string {
  const body = block.lines.map((line) => `<p${block.page === "math" && block.space !== "letter" ? ` class="sheet-problem"` : ""}>${esc(line)}</p>`).join("");
  if (block.space === "letter" && block.letter) {
    const second = block.also ? writingRow(block.also) : "";
    return `<section class="practice" data-trace><h2>${esc(block.title)}</h2>${body}${writingRow(block.letter)}${second}<div class="tools"><button type="button" data-clear>Clear</button></div></section>`;
  }
  if (block.space === "dots" && block.dots) {
    return `<section class="practice" data-trace><h2>${esc(block.title)}</h2>${body}${dotFrames(block.dots)}<p>Write how many.</p><div class="practice-row how-many"><div class="blank"><canvas></canvas></div></div><div class="tools"><button type="button" data-clear>Clear</button></div></section>`;
  }
  const picture = block.rows && block.cols ? arrayDots(block.rows, block.cols) : "";
  if (block.space === "work") {
    return `<section class="practice"><h2>${esc(block.title)}</h2>${picture}${body}<p>Show your work.</p><div class="work-space"></div></section>`;
  }
  const room = block.id === "passage" ? 3 : 2;
  return `<section class="practice"><h2>${esc(block.title)}</h2>${body}${lines(room)}</section>`;
}

function huntHtml(sheet: DailySheet): string {
  if (!sheet.hunt || !sheet.huntWords.length) return "";
  const hard = sheet.hardHunt;
  const hint = hard ? "They may go across, down, diagonally, or backwards." : "They go across or down.";
  const gridClass = hard ? "hunt-grid hard" : "hunt-grid";
  const flags = hard ? ` data-cols="12" data-diagonal="true"` : "";
  return `<section class="practice" id="hunt"><h2>Word hunt</h2><p class="screen-only">Find the words. ${hint}</p><p class="print-only">Circle the words. ${hint}</p><ul class="bank">${sheet.huntWords
    .map((word) => `<li data-word="${esc(word.toLowerCase())}">${esc(word)}</li>`)
    .join("")}</ul><div class="hunt-scroll"><div class="${gridClass}" data-hunt${flags}>${sheet.hunt.rows
    .map((row) => [...row].map((char) => `<button type="button">${esc(char)}</button>`).join(""))
    .join("")}</div></div><p class="win" hidden>You found all the words.</p><script type="application/json" id="hunt-data">${JSON.stringify({
    words: sheet.huntWords.map((word) => ({ id: word.toLowerCase(), text: word.toLowerCase() })),
  })}</script></section>`;
}

export function dailyHtml(sheet: DailySheet, studentName: string): string {
  const language = sheet.blocks.filter((block) => block.page === "language").map(blockHtml);
  const math = sheet.blocks.filter((block) => block.page === "math").map(blockHtml);
  const note = sheet.note ? `<p class="screen-only parent-note">${esc(sheet.note)}</p>` : "";
  const parts = [...language];
  if (sheet.hunt) parts.push(huntHtml(sheet));
  if (math.length) {
    parts.push(`<section class="math-sheet practice"><p class="when">${esc(dateLabel(sheet.date))}</p><h2 class="sheet-title">Math sheet</h2><p class="print-name">Name ____________________</p>${math.join("")}</section>`);
  }
  if (!dailyHasLanguage(sheet) && !dailyHasMath(sheet)) parts.push(`<p>No exercises are turned on for this student. A parent can add some.</p>`);
  const who = studentName ? `${studentName} · ${sheet.label}` : sheet.label;
  const size = sheet.size === "early" ? "daily-early" : sheet.size === "mid" ? "daily-mid" : "daily-upper";
  return `<div class="daily-sheet ${size}">${note}<p class="when">${esc(dateLabel(sheet.date))}</p><h1 class="cue">${esc(`${who} · Language and math`)}</h1><p class="print-name">Name ____________________</p><p class="actions"><button type="button" class="download" data-download>Download today's page</button><button type="button" class="download" data-print>Print today's sheet</button><button type="button" class="download" data-new-sheet>New sheet</button></p>${parts.join("")}</div>`;
}
