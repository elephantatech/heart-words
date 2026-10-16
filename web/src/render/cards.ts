import { loadCatalog } from "../lesson/daily";
import type { Word } from "../lesson/types";
import { downloadCards } from "../print/cardsDocx";
import { esc } from "./html";

function card(word: Word): string {
  const front = word.graphemes.map((piece) => `<span class="${piece.heart ? "heart" : ""}">${esc(piece.letters)}</span>`).join("");
  return `<li><button class="flip" type="button" aria-pressed="false"><span class="face front">${front}</span><span class="face back"><span class="meaning">${esc(word.meaning)}</span><span class="sentence">${esc(word.sentence)}</span></span></button></li>`;
}

export function cardsHtml(kind: "heart" | "sight" = "heart"): string {
  const words = loadCatalog().words.filter((word) => word.kinds.includes(kind));
  return `<h1>${kind === "heart" ? "Heart words" : "Sight words"}</h1><p class="filters"><a href="#/cards" data-kind="heart" ${kind === "heart" ? 'aria-current="page"' : ""}>Heart words</a><a href="#/cards?kind=sight" data-kind="sight" ${kind === "sight" ? 'aria-current="page"' : ""}>Sight words</a></p><p>Tap a card to turn it over. Heart letters are the part to learn by heart.</p><p class="actions"><button type="button" class="download" data-cards-download>Download cards</button></p><ul class="deck">${words.map(card).join("")}</ul>`;
}

export function bindCards(root: ParentNode, kind: "heart" | "sight"): void {
  root.querySelectorAll<HTMLButtonElement>(".flip").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", open ? "false" : "true");
    });
  });
  root.querySelector<HTMLButtonElement>("[data-cards-download]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    button.disabled = true;
    button.textContent = "Preparing the Word file…";
    try {
      await downloadCards(kind);
    } finally {
      button.disabled = false;
      button.textContent = "Download cards";
    }
  });
}
