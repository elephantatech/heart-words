import { betweenNumbers, LOWERCASE, NUMBER_PAGE, numberSheetFormFrom, numberSheetFromForm, numberSheetHash, UPPERCASE, type NumberSheetResult } from "../lesson/sheets";
import { esc, staff } from "./html";

function actions(label: string): string {
  return `<p class="actions"><button type="button" class="download" data-download>Download this sheet</button><button type="button" class="download" data-print>Print this sheet</button><a class="download" href="#/sheets">All sheets</a></p><p class="print-name">Name ____________________</p><h1 class="cue">${esc(label)}</h1>`;
}

export function sheetsIndexHtml(): string {
  return `<h1>Grade 1 sheets</h1><p>These pages stay separate from today's lesson.</p><ul class="sheet-list"><li><a class="download" href="#/sheets/missing">Missing numbers</a><span>Write the number that comes between.</span></li><li><a class="download" href="#/sheets/numbers">Numbers</a><span>Trace a range of numbers. Add skip counting if you want.</span></li><li><a class="download" href="#/sheets/alphabet">Full alphabet</a><span>Trace every uppercase and lowercase letter.</span></li></ul>`;
}

function numberLineHtml(): string {
  const marks = NUMBER_PAGE.map((number) => `<li>${esc(number)}</li>`).join("");
  return `<div class="number-line"><p>Number line. Find the number you need.</p><ol>${marks}</ol></div>`;
}

export function missingNumbersHtml(): string {
  const rows = betweenNumbers()
    .map(
      (row) =>
        `<div class="between-row">${staff(String(row.left), "ink")}${staff("", "open", true)}${staff(String(row.right), "ink")}</div>`,
    )
    .join("");
  return `${actions("Missing numbers")}<section class="practice" data-trace>${numberLineHtml()}<h2>Write the number that comes between.</h2><div class="between-sheet">${rows}</div><div class="tools"><button type="button" data-clear>Clear</button></div></section>`;
}

function rangeForm(result: NumberSheetResult): string {
  const { form } = result;
  const error = result.ok ? "" : result.error;
  return `<form class="range-form screen-only" data-range><p>Choose how many numbers to trace. Add skip counting when you want a second list, such as twos or fives.</p><div class="range-fields"><label>From<input name="from" type="number" inputmode="numeric" min="0" max="999" required value="${esc(form.from)}"></label><label>To<input name="to" type="number" inputmode="numeric" min="0" max="999" required value="${esc(form.to)}"></label></div><fieldset><legend>Skip counting</legend><label class="include"><input name="skip" type="checkbox" ${form.skip ? "checked" : ""}> Include a skip-counting list</label><div class="range-fields" data-skip-fields ${form.skip ? "" : "hidden"}><label>Count by<input name="by" type="number" inputmode="numeric" min="2" max="120" value="${esc(form.by)}"></label><label>From<input name="skipFrom" type="number" inputmode="numeric" min="0" max="999" value="${esc(form.skipFrom)}"></label><label>To<input name="skipTo" type="number" inputmode="numeric" min="0" max="999" value="${esc(form.skipTo)}"></label></div></fieldset><button class="download" type="submit">Show this range</button><p data-error role="status">${esc(error)}</p></form>`;
}

function traceGrid(values: string[]): string {
  const digits = values.reduce((max, value) => Math.max(max, value.length), 1);
  const items = values.map((number) => `<div class="trace-item">${staff(number, "dotted")}</div>`).join("");
  return `<div class="trace-grid" data-digits="${digits}">${items}</div>`;
}

export function numbersHtml(result: NumberSheetResult): string {
  const form = rangeForm(result);
  if (!result.ok) return form;
  const skip = result.sheet.skip
    ? `<section class="practice" id="skip-numbers" data-trace><h2>${esc(result.sheet.skip.title)}</h2>${traceGrid(result.sheet.skip.values)}<div class="tools"><button type="button" data-clear>Clear</button></div></section>`
    : "";
  return `${form}${actions(result.sheet.title)}<section class="practice" id="numbers" data-trace><h2>Trace each number.</h2>${traceGrid(result.sheet.numbers.values)}<div class="tools"><button type="button" data-clear>Clear</button></div></section>${skip}`;
}

export function bindNumberSheet(root: ParentNode): void {
  const form = root.querySelector<HTMLFormElement>("[data-range]");
  if (!form) return;
  const skipToggle = form.querySelector<HTMLInputElement>('input[name="skip"]');
  const skipFields = form.querySelector<HTMLElement>("[data-skip-fields]");
  const showSkip = (): void => {
    if (skipFields) skipFields.hidden = !skipToggle?.checked;
  };
  skipToggle?.addEventListener("change", showSkip);
  showSkip();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const parsed = numberSheetFromForm(numberSheetFormFrom(new FormData(form)));
    if (!parsed.ok) {
      const error = form.querySelector("[data-error]");
      if (error) error.textContent = parsed.error;
      return;
    }
    const next = numberSheetHash(parsed.sheet);
    if (location.hash !== next) location.hash = next;
  });
}

export function alphabetHtml(): string {
  const upper = UPPERCASE.map((letter) => `<div class="trace-item">${staff(letter, "dotted")}</div>`).join("");
  const lower = LOWERCASE.map((letter) => `<div class="trace-item">${staff(letter, "dotted")}</div>`).join("");
  return `${actions("Full alphabet")}<section class="practice" id="uppercase" data-trace><h2>Uppercase</h2><div class="trace-grid">${upper}</div></section><section class="practice" id="lowercase" data-trace><h2>Lowercase</h2><div class="trace-grid">${lower}</div><div class="tools"><button type="button" data-clear>Clear</button></div></section>`;
}
