import type { Hunt, HuntDirection, Placement } from "./types";
import { toOrdinal } from "./hunt";

export const HUNT_ROWS = 12;
export const HUNT_COLS = 12;

const STEPS: Record<HuntDirection, [number, number]> = {
  across: [0, 1],
  down: [1, 0],
  diagonal: [1, 1],
  "diagonal-up": [-1, 1],
  backwards: [0, -1],
  up: [-1, 0],
};

export const CHALLENGE_WORDS = [
  "perimeter",
  "quotient",
  "estimate",
  "evidence",
  "paragraph",
  "conclusion",
  "variable",
  "decimal",
  "parallel",
  "hypothesis",
  "rectangle",
  "symmetry",
];

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
}

function spots(text: string, direction: HuntDirection): Array<[number, number]> {
  const [down, right] = STEPS[direction];
  const found: Array<[number, number]> = [];
  for (let row = 0; row < HUNT_ROWS; row += 1) {
    for (let col = 0; col < HUNT_COLS; col += 1) {
      const endRow = row + down * (text.length - 1);
      const endCol = col + right * (text.length - 1);
      if (endRow >= 0 && endCol >= 0 && endRow < HUNT_ROWS && endCol < HUNT_COLS) found.push([row, col]);
    }
  }
  return found;
}

function tryPlace(seed: number, words: string[]): Hunt | null {
  const random = mulberry32(seed);
  const grid: Array<Array<string | null>> = Array.from({ length: HUNT_ROWS }, () => Array(HUNT_COLS).fill(null));
  const order = words.map((word, index) => ({ word, index })).sort((a, b) => b.word.length - a.word.length);
  const chosen: Array<Placement | null> = words.map(() => null);

  function fits(row: number, col: number, text: string, direction: HuntDirection): boolean {
    const [down, right] = STEPS[direction];
    return [...text].every((char, offset) => {
      const current = grid[row + down * offset][col + right * offset];
      return current === null || current === char;
    });
  }

  function write(row: number, col: number, text: string, direction: HuntDirection): void {
    const [down, right] = STEPS[direction];
    [...text].forEach((char, offset) => {
      grid[row + down * offset][col + right * offset] = char;
    });
  }

  function candidates(text: string): Array<{ direction: HuntDirection; row: number; col: number }> {
    const all: Array<{ direction: HuntDirection; row: number; col: number }> = [];
    (Object.keys(STEPS) as HuntDirection[]).forEach((direction) => {
      spots(text, direction).forEach(([row, col]) => all.push({ direction, row, col }));
    });
    shuffle(all, random);
    return all.slice(0, 40);
  }

  const plans = order.map((item) => candidates(item.word));

  function search(depth: number): boolean {
    if (depth === order.length) return true;
    const item = order[depth];
    for (const spot of plans[depth]) {
      if (!fits(spot.row, spot.col, item.word, spot.direction)) continue;
      const snapshot = grid.map((line) => line.slice());
      write(spot.row, spot.col, item.word, spot.direction);
      chosen[item.index] = { wordId: item.word, row: spot.row, col: spot.col, direction: spot.direction };
      if (search(depth + 1)) return true;
      snapshot.forEach((line, row) => {
        grid[row] = line;
      });
      chosen[item.index] = null;
    }
    return false;
  }

  if (!search(0)) return null;
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return {
    rows: grid.map((line) => line.map((cell) => cell ?? alphabet[Math.floor(random() * 26)]).join("")),
    placements: chosen.filter((place): place is Placement => place !== null),
  };
}

export function buildHardHunt(iso: string, words: string[], mix = 0): Hunt {
  const cleaned = words.map((word) => word.toLowerCase());
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const placed = tryPlace(toOrdinal(iso) + mix * 17 + attempt * 97, cleaned);
    if (placed) return placed;
  }
  throw new Error(`could not place grade 5 hunt for ${iso}`);
}

export function huntContains(hunt: Hunt, word: string, place: Placement): boolean {
  const [down, right] = STEPS[place.direction];
  return [...word.toLowerCase()].every((char, offset) => hunt.rows[place.row + down * offset]?.[place.col + right * offset] === char);
}
