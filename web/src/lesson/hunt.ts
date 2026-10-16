import type { Hunt, Placement, Word } from "./types";

const ROWS = 8;
const COLS = 10;

export function toOrdinal(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

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

export function buildHunt(iso: string, words: Word[], mix = 0): Hunt {
  if (!words.length) throw new Error("hunt needs at least one word");
  const random = mulberry32(toOrdinal(iso) + mix);
  const grid: Array<Array<string | null>> = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const texts = words.map((word) => word.display.toLowerCase());
  const plans = texts.map((text, index) => options(random, text, index, words.length));
  const chosen: Array<Placement | null> = words.map(() => null);
  const sequence = words.length >= 4 ? [3, 0, 1, 2] : words.map((_, index) => index);

  function fits(row: number, col: number, text: string, direction: Placement["direction"]): boolean {
    return [...text].every((char, offset) => {
      const [r, c] = step(row, col, offset, direction);
      const current = grid[r][c];
      return current === null || current === char;
    });
  }

  function write(row: number, col: number, text: string, direction: Placement["direction"]): void {
    [...text].forEach((char, offset) => {
      const [r, c] = step(row, col, offset, direction);
      grid[r][c] = char;
    });
  }

  function search(depth: number): boolean {
    if (depth === sequence.length) return true;
    const index = sequence[depth];
    const text = texts[index];
    for (const [direction, spots] of plans[index]) {
      for (const [row, col] of spots) {
        if (!fits(row, col, text, direction)) continue;
        const snapshot = grid.map((line) => line.slice());
        write(row, col, text, direction);
        chosen[index] = { wordId: words[index].id, row, col, direction };
        if (search(depth + 1)) return true;
        snapshot.forEach((line, r) => {
          grid[r] = line;
        });
        chosen[index] = null;
      }
    }
    return false;
  }

  if (!search(0)) throw new Error(`could not place hunt words for ${iso}`);
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return {
    rows: grid.map((line) => line.map((cell) => cell ?? alphabet[Math.floor(random() * 26)]).join("")),
    placements: chosen.filter((place): place is Placement => place !== null),
  };
}

function options(
  random: () => number,
  text: string,
  index: number,
  total: number,
): Array<[Placement["direction"], Array<[number, number]>]> {
  const directions: Placement["direction"][] = total >= 4 && index === 3 ? ["down", "across"] : ["across"];
  return directions.map((direction) => {
    const spots: Array<[number, number]> = [];
    if (direction === "across") {
      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col <= COLS - text.length; col += 1) spots.push([row, col]);
      }
    } else {
      for (let col = 0; col < COLS; col += 1) {
        for (let row = 0; row <= ROWS - text.length; row += 1) spots.push([row, col]);
      }
    }
    shuffle(spots, random);
    return [direction, spots];
  });
}

function step(row: number, col: number, offset: number, direction: Placement["direction"]): [number, number] {
  return direction === "down" ? [row + offset, col] : [row, col + offset];
}
