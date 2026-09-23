const data = JSON.parse(document.getElementById("hunt-data").textContent);
const grid = document.querySelector("[data-hunt]");
const buttons = [...grid.querySelectorAll("button")];
const columns = 10;
const remaining = new Map(data.words.map((word) => [word.id, word.text]));
const path = [];
let direction = null;

buttons.forEach((button, index) => {
  button.dataset.row = String(Math.floor(index / columns));
  button.dataset.col = String(index % columns);
  button.addEventListener("click", () => tap(button));
});

function cellOf(button) {
  return { button, row: Number(button.dataset.row), col: Number(button.dataset.col), letter: button.textContent };
}

function tap(button) {
  const cell = cellOf(button);
  if (path.length >= 2) {
    const previous = path[path.length - 2];
    if (previous.row === cell.row && previous.col === cell.col) {
      path.pop();
      direction = path.length >= 2 ? stepBetween(path[0], path[1]) : null;
      paint();
      return;
    }
  }
  if (path.length === 0 || !continues(cell)) {
    path.length = 0;
    direction = null;
    path.push(cell);
    paint();
    return;
  }
  if (path.length === 1) direction = stepBetween(path[0], cell);
  path.push(cell);
  const spelled = path.map((item) => item.letter).join("");
  const match = [...remaining.entries()].find(([, text]) => text === spelled);
  if (match) {
    const [id] = match;
    remaining.delete(id);
    path.forEach((item) => item.button.classList.add("found"));
    document.querySelector(`[data-word="${id}"]`)?.classList.add("found");
    path.length = 0;
    direction = null;
    paint();
    if (remaining.size === 0) document.querySelector(".win").hidden = false;
    return;
  }
  const prefix = [...remaining.values()].some((text) => text.startsWith(spelled));
  if (!prefix) {
    path.length = 0;
    direction = null;
    path.push(cell);
  }
  paint();
}

function continues(cell) {
  const last = path[path.length - 1];
  const delta = stepBetween(last, cell);
  if (Math.abs(delta.row) + Math.abs(delta.col) !== 1) return false;
  if (!direction) return true;
  return delta.row === direction.row && delta.col === direction.col;
}

function stepBetween(from, to) {
  return { row: to.row - from.row, col: to.col - from.col };
}

function paint() {
  buttons.forEach((button) => button.classList.remove("picked"));
  path.forEach((item) => item.button.classList.add("picked"));
}
