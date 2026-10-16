import { grade5HasLanguage, grade5HasMath, type Grade5Lesson } from "../lesson/grade5";
import { esc } from "./html";

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

export function grade5Html(lesson: Grade5Lesson, studentName: string): string {
  const blocks: string[] = [];
  if (lesson.vocabulary || lesson.passage) {
    const word = lesson.vocabulary?.word ?? lesson.passage?.word ?? "";
    const meaning = lesson.vocabulary ? `<p class="role">${esc(lesson.vocabulary.pos)}</p><p>${esc(lesson.vocabulary.meaning)}</p>` : "";
    const reading = lesson.passage ? `<p class="passage">${esc(lesson.passage.text)}</p><p>${esc(lesson.passage.question)}</p>${lines(3)}` : "";
    const sentence = lesson.vocabulary ? `<p>Write a sentence that uses this word.</p>${lines(2)}` : "";
    blocks.push(`<section class="practice" id="reading"><h2>Reading</h2><p class="grade5-word">${esc(word)}</p>${meaning}${reading}${sentence}</section>`);
  }
  if (lesson.hunt) {
    blocks.push(`<section class="practice" id="hunt"><h2>Word hunt</h2><p class="screen-only">Find the words. They may go across, down, diagonally, or backwards.</p><p class="print-only">Circle the words. They may go across, down, diagonally, or backwards.</p><ul class="bank">${lesson.huntWords
      .map((word) => `<li data-word="${esc(word)}">${esc(word)}</li>`)
      .join("")}</ul><div class="hunt-scroll"><div class="hunt-grid hard" data-hunt data-cols="12" data-diagonal="true">${lesson.hunt.rows
      .map((row) => [...row].map((char) => `<button type="button">${esc(char)}</button>`).join(""))
      .join("")}</div></div><p class="win" hidden>You found all the words.</p><script type="application/json" id="hunt-data">${JSON.stringify({
      words: lesson.huntWords.map((word) => ({ id: word, text: word })),
    })}</script></section>`);
  }
  if (lesson.grammar) {
    blocks.push(`<section class="practice"><h2>Grammar</h2><p class="role">${esc(lesson.grammar.skill)}</p><p>${esc(lesson.grammar.prompt)}</p><p>Write the sentence correctly.</p>${lines(2)}</section>`);
  }
  const math: string[] = [];
  if (lesson.operations) math.push(`<h2>Whole numbers</h2><p class="grade5-problem">${esc(lesson.operations.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (lesson.fractions) math.push(`<h2>Fractions</h2><p class="grade5-problem">${esc(lesson.fractions.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (lesson.decimals) math.push(`<h2>Decimals</h2><p class="grade5-problem">${esc(lesson.decimals.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (lesson.expressions) math.push(`<h2>Order of operations</h2><p class="grade5-problem">${esc(lesson.expressions.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (lesson.volume) math.push(`<h2>Volume</h2><p class="grade5-problem">${esc(lesson.volume.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (lesson.rounding) math.push(`<h2>Rounding</h2><p class="grade5-problem">${esc(lesson.rounding.prompt)}</p><p>Show your work.</p><div class="work-space"></div>`);
  if (math.length && grade5HasMath(lesson)) {
    blocks.push(`<section class="math-sheet practice"><p class="when">${esc(dateLabel(lesson.date))}</p><h2 class="sheet-title">Math sheet</h2><p class="print-name">Name ____________________</p>${math.join("")}</section>`);
  }
  if (!blocks.length || (!grade5HasLanguage(lesson) && !grade5HasMath(lesson))) {
    blocks.push(`<p>No exercises are turned on for this student. A parent can add some.</p>`);
  }
  const cue = studentName ? `${studentName} · Grade 5 · Language and math` : "Grade 5 · Language and math";
  return `<p class="when">${esc(dateLabel(lesson.date))}</p><h1 class="cue">${esc(cue)}</h1><p class="print-name">Name ____________________</p><p class="actions"><button type="button" class="download" data-download>Download today's page</button><button type="button" class="download" data-print>Print today's sheet</button><button type="button" class="download" data-new-sheet>New sheet</button></p>${blocks.join("")}`;
}
