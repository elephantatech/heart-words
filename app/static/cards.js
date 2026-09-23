document.querySelectorAll(".flip").forEach((button) => {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", open ? "false" : "true");
  });
});

const status = document.querySelector("[data-download-status]");

async function downloadCards(body, filename) {
  const response = await fetch("/api/flashcards.docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    status.textContent = "Those cards could not be built.";
    return;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = "Download started.";
}

document.querySelector("[data-download-selected]").addEventListener("click", () => {
  const ids = [...document.querySelectorAll(".pick:checked")].map((box) => box.value);
  if (!ids.length) {
    status.textContent = "Choose at least one card.";
    return;
  }
  status.textContent = "";
  downloadCards({ ids }, "flashcards.docx");
});

document.querySelector("[data-download-kind]").addEventListener("click", (event) => {
  const kind = event.currentTarget.dataset.downloadKind;
  status.textContent = "";
  downloadCards({ kind }, `${kind}-words.docx`);
});
