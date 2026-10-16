import { loadCatalog } from "../lesson/daily";
import { esc } from "./html";

export function wordsHtml(): string {
  const words = loadCatalog().words;
  const rows = words
    .map((word) => {
      const spelling = word.graphemes.map((piece) => `<span class="${piece.heart ? "heart" : ""}">${esc(piece.letters)}</span>`).join("");
      const kinds = [word.kinds.includes("heart") ? "Heart word" : "", word.kinds.includes("sight") ? "Sight word" : "", word.dolch ?? ""]
        .filter(Boolean)
        .map((label) => `<span>${esc(label)}</span>`)
        .join("");
      return `<li><span class="catalog-word">${spelling}</span><span class="catalog-meta">${kinds}</span><span class="meaning">${esc(word.meaning)}</span></li>`;
    })
    .join("");
  return `<h1>Word list</h1><p>${words.length} words. Heart letters are underlined.</p><ul class="catalog">${rows}</ul>`;
}
