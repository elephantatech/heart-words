interface Cell {
  button: HTMLButtonElement;
  row: number;
  col: number;
  letter: string;
}

export function bindHunt(root: ParentNode = document): void {
  const grid = root.querySelector<HTMLElement>("[data-hunt]");
  const data = root.querySelector<HTMLElement>("#hunt-data");
  if (!grid || !data?.textContent) return;
  const words = JSON.parse(data.textContent) as { words: Array<{ id: string; text: string }> };
  const columns = Number(grid.dataset.cols) || 10;
  const allowDiagonal = grid.dataset.diagonal === "true";
  const buttons = [...grid.querySelectorAll("button")];
  const remaining = new Map(words.words.map((word) => [word.id, word.text]));
  const path: Cell[] = [];
  let direction: { row: number; col: number } | null = null;
  buttons.forEach((button, index) => {
    button.dataset.row = String(Math.floor(index / columns));
    button.dataset.col = String(index % columns);
    button.addEventListener("click", () => tap(button));
  });

  function cellOf(button: HTMLButtonElement): Cell {
    return {
      button,
      row: Number(button.dataset.row),
      col: Number(button.dataset.col),
      letter: button.textContent ?? "",
    };
  }

  function tap(button: HTMLButtonElement): void {
    const cell = cellOf(button);
    if (path.length >= 2) {
      const previous = path[path.length - 2];
      if (previous.row === cell.row && previous.col === cell.col) {
        path.pop();
        direction = path.length >= 2 ? delta(path[0], path[1]) : null;
        paint();
        return;
      }
    }
    if (!path.length || !continues(cell)) {
      path.length = 0;
      direction = null;
      path.push(cell);
      paint();
      return;
    }
    if (path.length === 1) direction = delta(path[0], cell);
    path.push(cell);
    const spelled = path.map((item) => item.letter).join("");
    const match = [...remaining.entries()].find(([, text]) => text === spelled);
    if (match) {
      remaining.delete(match[0]);
      path.forEach((item) => item.button.classList.add("found"));
      root.querySelector(`[data-word="${match[0]}"]`)?.classList.add("found");
      path.length = 0;
      direction = null;
      paint();
      if (!remaining.size) {
        const win = root.querySelector<HTMLElement>(".win");
        if (win) win.hidden = false;
      }
      return;
    }
    if (![...remaining.values()].some((text) => text.startsWith(spelled))) {
      path.length = 0;
      direction = null;
      path.push(cell);
    }
    paint();
  }

  function continues(cell: Cell): boolean {
    const last = path[path.length - 1];
    const step = delta(last, cell);
    const straight = Math.abs(step.row) + Math.abs(step.col) === 1;
    const diagonal = Math.abs(step.row) === 1 && Math.abs(step.col) === 1;
    if (!(straight || (allowDiagonal && diagonal))) return false;
    if (!direction) return true;
    return step.row === direction.row && step.col === direction.col;
  }

  function delta(from: Cell, to: Cell): { row: number; col: number } {
    return { row: to.row - from.row, col: to.col - from.col };
  }

  function paint(): void {
    buttons.forEach((button) => button.classList.remove("picked"));
    path.forEach((item) => item.button.classList.add("picked"));
  }
}
