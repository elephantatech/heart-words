import lettersJson from "../data/letters.json";
import wordsJson from "../data/words.json";
import { buildHunt } from "./hunt";
import type { Assignment, Exercise, Letter, Lesson, Word } from "./types";
import { ALL_EXERCISES } from "./types";

const EPOCH = Date.UTC(2026, 8, 1);
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export function loadCatalog(): { words: Word[]; letters: Map<string, Letter> } {
  const words = [...(wordsJson as Word[])].sort((a, b) => a.id.localeCompare(b.id));
  const letters = new Map((lettersJson as Letter[]).map((letter) => [letter.letter, letter]));
  return { words, letters };
}

export function dayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.round((Date.UTC(year, month - 1, day) - EPOCH) / 86400000);
}

function slot(iso: string, mix: number): number {
  return dayIndex(iso) + mix;
}

export function letterFor(iso: string, mix = 0): string {
  return ALPHABET[((slot(iso, mix) % 26) + 26) % 26];
}

export function numberFor(iso: string, mix = 0): number {
  return ((slot(iso, mix) % 21) + 21) % 21;
}

export function countFor(iso: string, mix = 0): number {
  return (((slot(iso, mix) % 10) + 10) % 10) + 1;
}

export function skipFor(iso: string, mix = 0): { step: 2 | 5 | 10; shown: number[] } {
  const step = ([2, 5, 10] as const)[((slot(iso, mix) % 3) + 3) % 3];
  const start = 1 + ((Math.floor(slot(iso, mix) / 3) % 4) + 4) % 4;
  return { step, shown: [0, 1, 2].map((index) => step * (start + index)) };
}

export function countingFrames(count: number): boolean[][] {
  if (count <= 0) return [Array(10).fill(false)];
  const frames: boolean[][] = [];
  let left = count;
  while (left > 0) {
    const take = Math.min(10, left);
    frames.push(Array.from({ length: 10 }, (_, index) => index < take));
    left -= take;
  }
  return frames;
}

function pool(words: Word[], letter: string, kind: "heart" | "sight"): Word[] {
  const containing = words.filter((word) => word.kinds.includes(kind) && word.display.toLowerCase().includes(letter));
  if (containing.length >= 2) return containing;
  const chosen = new Set(containing.map((word) => word.id));
  const rest = words.filter((word) => word.kinds.includes(kind) && !chosen.has(word.id));
  return [...containing, ...rest];
}

function pickWords(words: Word[], iso: string, kind: "heart" | "sight", count: number, exclude: Set<string>, mix: number, letter: string): Word[] {
  const choices = pool(words, letter, kind).filter((word) => !exclude.has(word.id));
  if (choices.length < count) throw new Error(`not enough ${kind} words for ${iso}`);
  const start = ((slot(iso, mix) % choices.length) + choices.length) % choices.length;
  return [...choices.slice(start), ...choices.slice(0, start)].slice(0, count);
}

export function buildLesson(iso: string, mix = 0, assignment: Assignment = {}): Lesson {
  const { words, letters } = loadCatalog();
  const enabled = new Set<Exercise>(assignment.exercises ?? ALL_EXERCISES);
  const letterName = assignment.letter || letterFor(iso, mix);
  const letter = letters.get(letterName);
  if (!letter) throw new Error(`unknown letter ${letterName}`);
  const wantHeart = enabled.has("heart");
  const wantSight = enabled.has("sight");
  const heartWords = wantHeart ? pickWords(words, iso, "heart", 2, new Set(), mix, letterName) : [];
  const sightWords = wantSight ? pickWords(words, iso, "sight", 2, new Set(heartWords.map((word) => word.id)), mix, letterName) : [];
  const targets = [...heartWords, ...sightWords];
  const wantHunt = enabled.has("hunt") && targets.length > 0;
  const skip = assignment.skipBy
    ? { step: assignment.skipBy, shown: [1, 2, 3].map((index) => assignment.skipBy! * index) }
    : skipFor(iso, mix);
  return {
    date: iso,
    letter,
    number: assignment.number ?? numberFor(iso, mix),
    count: assignment.count ?? countFor(iso, mix),
    skipBy: skip.step,
    skipShown: skip.shown,
    mix,
    heartWords,
    sightWords,
    hunt: wantHunt ? buildHunt(iso, targets, mix) : null,
    exercises: ALL_EXERCISES.filter((exercise) => enabled.has(exercise) && (exercise !== "hunt" || wantHunt)),
  };
}
