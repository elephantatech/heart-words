export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const named: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return named[char];
  });
}

export function staff(char: string, kind: "ink" | "mark" | "dotted" | "open", wide = false): string {
  const numeral = wide || char.length > 1 ? " numeral" : "";
  if (kind === "open") return `<div class="blank${numeral}"><canvas></canvas></div>`;
  if (kind === "ink") return `<p class="practice-letter${numeral}"><span class="glyph">${esc(char)}</span></p>`;
  if (kind === "mark") return `<p class="sample${numeral}"><mark class="glyph">${esc(char)}</mark></p>`;
  return `<div class="blank${numeral}"><span class="dotted-letter glyph" aria-hidden="true">${esc(char)}</span><canvas></canvas></div>`;
}

export function writingRow(char: string): string {
  return `<div class="practice-row">${staff(char, "ink")}${staff(char, "mark")}${staff(char, "mark")}${staff(char, "dotted")}${staff(char, "dotted")}</div>`;
}
