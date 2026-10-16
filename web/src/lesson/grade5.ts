import bank from "../data/grade5.json";
import { dayIndex } from "./daily";
import { buildHardHunt, CHALLENGE_WORDS } from "./hardHunt";
import type { Exercise, Hunt } from "./types";
import { GRADE5_EXERCISES } from "./types";

export interface VocabularyItem {
  word: string;
  pos: string;
  meaning: string;
  example: string;
}

export interface GrammarItem {
  skill: string;
  prompt: string;
  answer: string;
}

export interface ReadingItem {
  text: string;
  question: string;
  answer: string;
}

export interface PassageItem {
  word: string;
  text: string;
  question: string;
  answer: string;
}

export interface ProblemItem {
  prompt: string;
  answer: string;
}

export interface Grade5Lesson {
  date: string;
  mix: number;
  exercises: Exercise[];
  vocabulary: VocabularyItem | null;
  grammar: GrammarItem | null;
  passage: PassageItem | null;
  hunt: Hunt | null;
  huntWords: string[];
  operations: ProblemItem | null;
  fractions: ProblemItem | null;
  decimals: ProblemItem | null;
  expressions: ProblemItem | null;
  volume: ProblemItem | null;
  rounding: ProblemItem | null;
}

const CLASSIC: Exercise[] = ["vocabulary", "grammar", "passage", "operations", "fractions", "decimals"];
const LANGUAGE = new Set<Exercise>(["vocabulary", "grammar", "passage", "wordhunt"]);
const MATH = new Set<Exercise>(["operations", "fractions", "decimals", "expressions", "volume", "rounding"]);

function at<T>(items: T[], index: number): T {
  const count = items.length;
  return items[((index % count) + count) % count];
}

export function grade5ExercisesFrom(stored: Exercise[]): Exercise[] | undefined {
  if (stored.length === 0) return [];
  const chosen = stored.filter((item) => GRADE5_EXERCISES.includes(item));
  if (!chosen.length) return undefined;
  const previousFullSet = chosen.length === CLASSIC.length && CLASSIC.every((item) => chosen.includes(item));
  return previousFullSet ? [...GRADE5_EXERCISES] : chosen;
}

function huntWordsFor(daily: string, slot: number): string[] {
  const pool = CHALLENGE_WORDS.filter((word) => word !== daily);
  const extras = [0, 1, 2, 3].map((offset) => pool[(slot + offset) % pool.length]);
  return [daily, ...extras];
}

function placeHunt(iso: string, words: string[], mix: number): Hunt | null {
  let list = words;
  while (list.length) {
    try {
      return buildHardHunt(iso, list, mix);
    } catch {
      list = list.length > 1 ? [list[0], ...list.slice(2)] : [];
    }
  }
  return null;
}

export function buildGrade5(iso: string, mix = 0, exercises?: Exercise[]): Grade5Lesson {
  const use = new Set(exercises === undefined ? GRADE5_EXERCISES : exercises.filter((item) => GRADE5_EXERCISES.includes(item)));
  const slot = dayIndex(iso) + mix;
  const data = bank as {
    vocabulary: VocabularyItem[];
    grammar: GrammarItem[];
    readings: ReadingItem[];
    operations: ProblemItem[];
    fractions: ProblemItem[];
    decimals: ProblemItem[];
    expressions: ProblemItem[];
    volume: ProblemItem[];
    rounding: ProblemItem[];
  };
  const daily = at(data.vocabulary, slot);
  const reading = at(data.readings, slot);
  const words = huntWordsFor(daily.word, slot);
  const hunt = use.has("wordhunt") ? placeHunt(iso, words, mix) : null;
  return {
    date: iso,
    mix,
    exercises: GRADE5_EXERCISES.filter((item) => use.has(item) && (item !== "wordhunt" || hunt !== null)),
    vocabulary: use.has("vocabulary") ? daily : null,
    grammar: use.has("grammar") ? at(data.grammar, slot + 3) : null,
    passage: use.has("passage") ? { word: daily.word, ...reading } : null,
    hunt,
    huntWords: hunt ? hunt.placements.map((place) => place.wordId) : [],
    operations: use.has("operations") ? at(data.operations, slot + 1) : null,
    fractions: use.has("fractions") ? at(data.fractions, slot + 4) : null,
    decimals: use.has("decimals") ? at(data.decimals, slot + 7) : null,
    expressions: use.has("expressions") ? at(data.expressions, slot + 2) : null,
    volume: use.has("volume") ? at(data.volume, slot + 6) : null,
    rounding: use.has("rounding") ? at(data.rounding, slot + 8) : null,
  };
}

export function grade5StudentText(lesson: Grade5Lesson): string {
  const lines: string[] = [];
  if (lesson.vocabulary) {
    lines.push(lesson.vocabulary.word, lesson.vocabulary.pos, lesson.vocabulary.meaning, "Write a sentence that uses this word.");
  }
  if (lesson.grammar) lines.push(lesson.grammar.skill, lesson.grammar.prompt, "Write the sentence correctly.");
  if (lesson.passage) lines.push(lesson.passage.word, lesson.passage.text, lesson.passage.question);
  if (lesson.huntWords.length) lines.push(`Find these words: ${lesson.huntWords.join(", ")}`);
  if (lesson.operations) lines.push(lesson.operations.prompt, "Show your work.");
  if (lesson.fractions) lines.push(lesson.fractions.prompt, "Show your work.");
  if (lesson.decimals) lines.push(lesson.decimals.prompt, "Show your work.");
  if (lesson.expressions) lines.push(lesson.expressions.prompt, "Show your work.");
  if (lesson.volume) lines.push(lesson.volume.prompt, "Show your work.");
  if (lesson.rounding) lines.push(lesson.rounding.prompt, "Show your work.");
  return lines.join("\n");
}

export function grade5KeyText(lesson: Grade5Lesson): string {
  const lines: string[] = [];
  if (lesson.vocabulary) lines.push(`${lesson.vocabulary.word}: ${lesson.vocabulary.example}`);
  if (lesson.grammar) lines.push(`${lesson.grammar.skill}: ${lesson.grammar.answer}`);
  if (lesson.passage) lines.push(`${lesson.passage.word}: ${lesson.passage.answer}`);
  if (lesson.hunt) {
    for (const place of lesson.hunt.placements) {
      lines.push(`${place.wordId}: row ${place.row + 1}, column ${place.col + 1}, ${place.direction}`);
    }
  }
  if (lesson.operations) lines.push(`${lesson.operations.prompt} = ${lesson.operations.answer}`);
  if (lesson.fractions) lines.push(`${lesson.fractions.prompt} = ${lesson.fractions.answer}`);
  if (lesson.decimals) lines.push(`${lesson.decimals.prompt} = ${lesson.decimals.answer}`);
  if (lesson.expressions) lines.push(`${lesson.expressions.prompt} = ${lesson.expressions.answer}`);
  if (lesson.volume) lines.push(lesson.volume.answer);
  if (lesson.rounding) lines.push(`${lesson.rounding.prompt} ${lesson.rounding.answer}`);
  return lines.join("\n");
}

export function grade5HasLanguage(lesson: Grade5Lesson): boolean {
  return lesson.exercises.some((item) => LANGUAGE.has(item));
}

export function grade5HasMath(lesson: Grade5Lesson): boolean {
  return lesson.exercises.some((item) => MATH.has(item));
}
