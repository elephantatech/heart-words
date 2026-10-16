export interface BetweenRow {
  left: number;
  right: number;
  answer: number;
}

export function betweenNumbers(): BetweenRow[] {
  const rows: BetweenRow[] = [];
  for (let answer = 2; answer <= 29; answer += 1) {
    rows.push({ left: answer - 1, right: answer + 1, answer });
  }
  return rows;
}

export const NUMBER_PAGE = Array.from({ length: 30 }, (_, index) => String(index + 1));

const NUMBER_MAX = 999;
const SPAN_MAX = 120;

export interface NumberList {
  from: number;
  to: number;
  step: number;
  values: string[];
  title: string;
}

export interface NumberSheet {
  numbers: NumberList;
  skip: NumberList | null;
  title: string;
  filename: string;
}

export interface NumberSheetForm {
  from: string;
  to: string;
  skip: boolean;
  by: string;
  skipFrom: string;
  skipTo: string;
}

export type NumberSheetResult =
  | { ok: true; sheet: NumberSheet; form: NumberSheetForm }
  | { ok: false; error: string; form: NumberSheetForm };

export function numberSheetFromHash(hash: string): NumberSheetResult {
  const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
  const params = new URLSearchParams(query);
  const skip = params.has("by") || params.has("skipFrom") || params.has("skipTo");
  return numberSheetFromForm({
    from: params.get("from") ?? "1",
    to: params.get("to") ?? "30",
    skip,
    by: params.get("by") ?? "2",
    skipFrom: params.get("skipFrom") ?? "2",
    skipTo: params.get("skipTo") ?? "20",
  });
}

export function numberSheetFormFrom(data: FormData): NumberSheetForm {
  return {
    from: String(data.get("from") ?? ""),
    to: String(data.get("to") ?? ""),
    skip: data.get("skip") === "on",
    by: String(data.get("by") ?? ""),
    skipFrom: String(data.get("skipFrom") ?? ""),
    skipTo: String(data.get("skipTo") ?? ""),
  };
}

export function numberSheetHash(sheet: NumberSheet): string {
  const params = new URLSearchParams({
    from: String(sheet.numbers.from),
    to: String(sheet.numbers.to),
  });
  if (sheet.skip) {
    params.set("by", String(sheet.skip.step));
    params.set("skipFrom", String(sheet.skip.from));
    params.set("skipTo", String(sheet.skip.to));
  }
  return `#/sheets/numbers?${params.toString()}`;
}

function wholeNumber(text: string, name: string, max: number): number | string {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return `Enter a whole number for ${name}.`;
  const value = Number(trimmed);
  if (value > max) return `${name} can be at most ${max}.`;
  return value;
}

function numberList(from: number, to: number, step: number, name: string): NumberList | string {
  if (step < 1) return `Enter a whole number for ${name}.`;
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const values: string[] = [];
  for (let value = start; value <= end; value += step) {
    values.push(String(value));
    if (values.length > SPAN_MAX) {
      return step === 1
        ? `That number range has more than ${SPAN_MAX} numbers. Shorten it.`
        : `That skip counting range has more than ${SPAN_MAX} numbers. Shorten it or count by a bigger step.`;
    }
  }
  const title = step === 1 ? `Numbers ${start} to ${end}` : `Count by ${step}s from ${start} to ${end}`;
  return { from: start, to: end, step, values, title };
}

function filePart(list: NumberList): string {
  return list.step === 1 ? `${list.from}-to-${list.to}` : `by-${list.step}s-${list.from}-to-${list.to}`;
}

export function numberSheetFromForm(form: NumberSheetForm): NumberSheetResult {
  const from = wholeNumber(form.from, "From", NUMBER_MAX);
  if (typeof from === "string") return { ok: false, error: from, form };
  const to = wholeNumber(form.to, "To", NUMBER_MAX);
  if (typeof to === "string") return { ok: false, error: to, form };
  const numbers = numberList(from, to, 1, "From");
  if (typeof numbers === "string") return { ok: false, error: numbers, form };

  let skip: NumberList | null = null;
  if (form.skip) {
    const step = wholeNumber(form.by, "Count by", SPAN_MAX);
    if (typeof step === "string") return { ok: false, error: step, form };
    if (step < 2) return { ok: false, error: "Count by should be from 2 to 120.", form };
    const skipFrom = wholeNumber(form.skipFrom, "Skip from", NUMBER_MAX);
    if (typeof skipFrom === "string") return { ok: false, error: skipFrom, form };
    const skipTo = wholeNumber(form.skipTo, "Skip to", NUMBER_MAX);
    if (typeof skipTo === "string") return { ok: false, error: skipTo, form };
    const counted = numberList(skipFrom, skipTo, step, "Count by");
    if (typeof counted === "string") return { ok: false, error: counted, form };
    skip = counted;
  }

  const sheet: NumberSheet = {
    numbers,
    skip,
    title: numbers.title,
    filename: `numbers-${filePart(numbers)}${skip ? `-${filePart(skip)}` : ""}.docx`,
  };
  return {
    ok: true,
    sheet,
    form: {
      from: String(numbers.from),
      to: String(numbers.to),
      skip: skip !== null,
      by: skip ? String(skip.step) : form.by,
      skipFrom: skip ? String(skip.from) : form.skipFrom,
      skipTo: skip ? String(skip.to) : form.skipTo,
    },
  };
}

export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");
