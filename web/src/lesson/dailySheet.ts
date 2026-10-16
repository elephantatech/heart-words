import {
  GRADE2_PASSAGES,
  GRADE2_PHONICS,
  GRADE2_SENTENCES,
  GRADE3_AFFIXES,
  GRADE3_JOINS,
  GRADE3_PASSAGES,
  GRADE4_GRAMMAR,
  GRADE4_MEANINGS,
  GRADE4_PASSAGES,
  GRADE6_GRAMMAR,
  GRADE6_PASSAGES,
  GRADE6_WORDS,
  GRADE7_PASSAGES,
  GRADE7_SHIFTS,
  GRADE8_GRAMMAR,
  GRADE8_PASSAGES,
  KINDER_LINES,
  PARENT_NOTE,
  cvcFor,
  pick,
} from "./banks";
import { dayIndex, letterFor } from "./daily";
import { buildHardHunt } from "./hardHunt";
import { buildHunt } from "./hunt";
import {
  grade2Fact,
  grade2Place,
  grade2Rotate,
  grade3Fact,
  grade3Operation,
  grade3Place,
  grade3Rotate,
  grade4Decimal,
  grade4Fact,
  grade4Operation,
  grade4Place,
  grade4Rotate,
  grade6Divisibility,
  grade6Operation,
  grade6Place,
  grade6Rotate,
  grade7Factors,
  grade7Fraction,
  grade7Integer,
  grade7Rotate,
  grade8Notation,
  grade8Proportion,
  grade8Rotate,
  grade8Square,
  kinderCount,
  kinderFact,
  kinderNumber,
  kinderRotate,
  type Problem,
} from "./sheetMath";
import { exercisesFor, gradeById, type Exercise, type GradeId, type Hunt, type Word } from "./types";

export type SheetGrade = Exclude<GradeId, "1" | "5">;

export interface SheetBlock {
  id: Exercise;
  title: string;
  lines: string[];
  answer: string;
  page: "language" | "math";
  space: "letter" | "lines" | "work" | "dots" | "none";
  letter?: string;
  also?: string;
  dots?: number;
  rows?: number;
  cols?: number;
}

export interface DailySheet {
  grade: SheetGrade;
  date: string;
  mix: number;
  label: string;
  size: "early" | "mid" | "upper";
  blocks: SheetBlock[];
  hunt: Hunt | null;
  huntWords: string[];
  hardHunt: boolean;
  note: string;
}

const HUNT_POOL: Record<Exclude<SheetGrade, "K">, string[]> = {
  "2": ["rain", "shop", "leaf", "frog", "milk", "tree", "bird", "stop"],
  "3": ["market", "winter", "pencil", "story", "garden", "school"],
  "4": ["prefix", "decimal", "pattern", "measure", "tally", "value"],
  "6": ["habitat", "climate", "percent", "integer", "factor", "graph"],
  "7": ["cylinder", "dilation", "percent", "factor", "interest", "circle"],
  "8": ["notation", "proportion", "scatter", "compound", "triangle", "percent"],
};

const NOTES = new Set<SheetGrade>(["3", "4", "6", "7", "8"]);

export function isSheetGrade(id: string | undefined): id is SheetGrade {
  return id === "K" || id === "2" || id === "3" || id === "4" || id === "6" || id === "7" || id === "8";
}

export function sheetExercises(grade: SheetGrade, stored?: Exercise[]): Exercise[] {
  const allowed = exercisesFor(grade);
  if (stored === undefined) return [...allowed];
  if (stored.length === 0) return [];
  const matched = stored.filter((item) => allowed.includes(item));
  const fromAnotherGrade = stored.some((item) => !allowed.includes(item));
  if (fromAnotherGrade || matched.length === 0) return [...allowed];
  return matched;
}

export function dailyHasLanguage(sheet: DailySheet): boolean {
  return sheet.blocks.some((block) => block.page === "language") || sheet.hunt !== null;
}

export function dailyHasMath(sheet: DailySheet): boolean {
  return sheet.blocks.some((block) => block.page === "math");
}

export function dailyStudentText(sheet: DailySheet): string {
  const parts = sheet.blocks.flatMap((block) => [block.title, ...block.lines]);
  if (sheet.huntWords.length) parts.push("Word hunt", sheet.huntWords.join(", "));
  return parts.join("\n");
}

export function dailyKeyText(sheet: DailySheet): string {
  return sheet.blocks.map((block) => `${block.title}: ${block.answer}`).join("\n");
}

export function buildDaily(grade: SheetGrade, iso: string, mix = 0, stored?: Exercise[]): DailySheet {
  const selected = sheetExercises(grade, stored);
  const slot = dayIndex(iso) + mix;
  const built = blocksFor(grade, iso, mix, slot, selected);
  const hard = grade !== "K" && grade !== "2";
  const requested = wantsHunt(grade, selected) ? huntList(grade, built.feature, slot) : [];
  const hunt = requested.length ? (grade === "2" ? placeSimple(iso, requested, mix) : placeHard(iso, requested, mix)) : null;
  const placed = new Set(hunt?.placements.map((place) => place.wordId) ?? []);
  return {
    grade,
    date: iso,
    mix,
    label: gradeById(grade).label,
    size: grade === "K" || grade === "2" ? "early" : grade === "3" || grade === "4" ? "mid" : "upper",
    blocks: built.blocks,
    hunt,
    huntWords: requested.filter((word) => placed.has(word.toLowerCase())),
    hardHunt: Boolean(hunt && hard),
    note: NOTES.has(grade) ? PARENT_NOTE : "",
  };
}

function wantsHunt(grade: SheetGrade, selected: Exercise[]): boolean {
  if (grade === "K") return false;
  if (grade === "2" || grade === "3") return selected.includes("words") || selected.includes("passage");
  if (grade === "7" || grade === "8") return selected.includes("passage");
  return selected.includes("vocabulary") || selected.includes("passage");
}

function huntList(grade: SheetGrade, feature: string, slot: number): string[] {
  if (grade === "K") return [];
  const clean = feature.toLowerCase().replace(/[^a-z]/g, "");
  const lead = clean.length >= 3 && clean.length <= 12 ? clean : "";
  const pool = HUNT_POOL[grade].filter((word) => word !== lead);
  const count = grade === "2" ? 3 : 4;
  const extras = Array.from({ length: count }, (_, offset) => pool[(slot + offset) % pool.length]);
  return [...new Set([lead, ...extras].filter(Boolean))].slice(0, grade === "2" ? 4 : 5);
}

function placeSimple(iso: string, words: string[], mix: number): Hunt | null {
  try {
    return buildHunt(iso, words.map(wordStub), mix);
  } catch {
    return null;
  }
}

function placeHard(iso: string, words: string[], mix: number): Hunt | null {
  let list = words;
  while (list.length >= 2) {
    try {
      return buildHardHunt(iso, list, mix);
    } catch {
      list = list.slice(0, -1);
    }
  }
  return null;
}

function wordStub(display: string): Word {
  return { id: display.toLowerCase(), display, kinds: ["sight"], dolch: null, graphemes: [], meaning: "", sentence: "" };
}

function using(selected: Exercise[], id: Exercise): boolean {
  return selected.includes(id);
}

function language(id: Exercise, title: string, lines: string[], answer: string): SheetBlock {
  return { id, title, lines, answer, page: "language", space: "lines" };
}

function math(id: Exercise, title: string, problem: Problem, space: SheetBlock["space"] = "work"): SheetBlock {
  return {
    id,
    title,
    lines: [problem.prompt],
    answer: problem.answer,
    page: "math",
    space,
    dots: problem.dots,
    rows: problem.rows,
    cols: problem.cols,
    letter: space === "letter" ? problem.answer : undefined,
  };
}

function blocksFor(grade: SheetGrade, iso: string, mix: number, slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  if (grade === "K") return kinderBlocks(iso, mix, slot, selected);
  if (grade === "2") return grade2Blocks(slot, selected);
  if (grade === "3") return grade3Blocks(slot, selected);
  if (grade === "4") return grade4Blocks(slot, selected);
  if (grade === "6") return grade6Blocks(slot, selected);
  if (grade === "7") return grade7Blocks(slot, selected);
  return grade8Blocks(slot, selected);
}

function kinderBlocks(iso: string, mix: number, slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const letter = letterFor(iso, mix);
  const blocks: SheetBlock[] = [];
  if (using(selected, "uppercase")) {
    blocks.push({
      id: "uppercase",
      title: "Write the letter",
      lines: ["Write the uppercase letter, then the lowercase letter."],
      answer: `${letter.toUpperCase()}, ${letter}`,
      page: "language",
      space: "letter",
      letter: letter.toUpperCase(),
      also: letter,
    });
  }
  const word = cvcFor(letter, slot);
  if (using(selected, "blend")) {
    blocks.push(language("blend", "Blend and spell", [`Say the sounds in ${word}, then write the word.`], word));
  }
  if (using(selected, "words")) {
    const line = pick(KINDER_LINES, slot);
    blocks.push(language("words", "Read the words", [`Read ${line.words.join(" and ")}.`, line.sentence], line.sentence));
  }
  if (using(selected, "number")) blocks.push(math("number", "Write the number", kinderNumber(slot), "letter"));
  if (using(selected, "count")) blocks.push(math("count", "Count the dots", kinderCount(slot), "dots"));
  if (using(selected, "facts")) blocks.push(math("facts", "Add or subtract", kinderFact(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", kinderRotate(slot)));
  return { blocks, feature: word };
}

function grade2Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const phonics = pick(GRADE2_PHONICS, slot);
  const sentence = pick(GRADE2_SENTENCES, slot);
  const passage = pick(GRADE2_PASSAGES, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "words")) {
    blocks.push(language("words", "Words", [`Read and spell ${phonics.word}. ${phonics.note}.`, `Write the word ${phonics.irregular}.`], `${phonics.word}; ${phonics.irregular}`));
  }
  if (using(selected, "sentence")) {
    blocks.push(language("sentence", "Sentences", [`${sentence.text}`, "Is this sentence telling, asking, commanding, or exclaiming?"], sentence.kind));
  }
  if (using(selected, "passage")) {
    blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  }
  if (using(selected, "facts")) blocks.push(math("facts", "Add or subtract", grade2Fact(slot)));
  if (using(selected, "place")) blocks.push(math("place", "Place value", grade2Place(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade2Rotate(slot)));
  return { blocks, feature: phonics.word };
}

function grade3Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const affix = pick(GRADE3_AFFIXES, slot);
  const join = pick(GRADE3_JOINS, slot);
  const passage = pick(GRADE3_PASSAGES, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "words")) {
    blocks.push(language("words", "Word parts", [`Split ${affix.word} and mark the affix ${affix.affix}.`, `It means ${affix.meaning}.`], affix.split));
  }
  if (using(selected, "sentence")) {
    const task = join.join ? "Join these two sentences with and." : "Leave these as two sentences and copy them.";
    blocks.push(language("sentence", "Sentences", [`${join.left} ${join.right}`, task, "Copy one sentence in your cursive."], join.answer));
  }
  if (using(selected, "passage")) blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  if (using(selected, "place")) blocks.push(math("place", "Place value", grade3Place(slot)));
  if (using(selected, "facts")) blocks.push(math("facts", "Multiplication and division", grade3Fact(slot)));
  if (using(selected, "operations")) blocks.push(math("operations", "Add or subtract", grade3Operation(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade3Rotate(slot)));
  return { blocks, feature: affix.word };
}

function grade4Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const meaning = pick(GRADE4_MEANINGS, slot);
  const grammar = pick(GRADE4_GRAMMAR, slot);
  const passage = pick(GRADE4_PASSAGES, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "vocabulary")) {
    blocks.push(language("vocabulary", "Word parts", [`${meaning.word} is ${meaning.parts}.`, "Write what the word means."], meaning.meaning));
  }
  if (using(selected, "grammar")) {
    blocks.push(language("grammar", "Grammar", [grammar.sentence, "Name the noun, the verb, and the adjective."], grammar.answer));
  }
  if (using(selected, "passage")) blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  if (using(selected, "place")) blocks.push(math("place", "Place value", grade4Place(slot)));
  if (using(selected, "facts")) blocks.push(math("facts", "Fact family", grade4Fact(slot)));
  if (using(selected, "operations")) blocks.push(math("operations", "Multiply or divide", grade4Operation(slot)));
  if (using(selected, "decimals")) blocks.push(math("decimals", "Tenths", grade4Decimal(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade4Rotate(slot)));
  return { blocks, feature: meaning.word };
}

function grade6Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const word = pick(GRADE6_WORDS, slot);
  const grammar = pick(GRADE6_GRAMMAR, slot);
  const passage = pick(GRADE6_PASSAGES, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "vocabulary")) {
    blocks.push(language("vocabulary", "Vocabulary", [`${word.word}: ${word.meaning}.`, `Finish the sentence: ${word.stem}`], word.ending));
  }
  if (using(selected, "grammar")) {
    blocks.push(language("grammar", "Grammar", [grammar.text, "Is this sentence simple or compound?"], grammar.kind));
  }
  if (using(selected, "passage")) blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  if (using(selected, "place")) blocks.push(math("place", "Whole numbers and integers", grade6Place(slot)));
  if (using(selected, "divisibility")) blocks.push(math("divisibility", "Divisibility", grade6Divisibility(slot)));
  if (using(selected, "operations")) blocks.push(math("operations", "Decimals and fractions", grade6Operation(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade6Rotate(slot)));
  return { blocks, feature: word.word };
}

function grade7Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const shift = pick(GRADE7_SHIFTS, slot);
  const passage = pick(GRADE7_PASSAGES, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "grammar")) {
    blocks.push(language("grammar", "Grammar", [`${shift.before}`, `Now: ${shift.after}`, "Name the new word, its part of speech, and what it does in the sentence."], shift.answer));
  }
  if (using(selected, "passage")) blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  if (using(selected, "factors")) blocks.push(math("factors", "Factors", grade7Factors(slot)));
  if (using(selected, "fractions")) blocks.push(math("fractions", "Fractions", grade7Fraction(slot)));
  if (using(selected, "integers")) blocks.push(math("integers", "Integers", grade7Integer(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade7Rotate(slot)));
  return { blocks, feature: "factor" };
}

function grade8Blocks(slot: number, selected: Exercise[]): { blocks: SheetBlock[]; feature: string } {
  const passage = pick(GRADE8_PASSAGES, slot);
  const grammar = pick(GRADE8_GRAMMAR, slot);
  const blocks: SheetBlock[] = [];
  if (using(selected, "passage")) blocks.push(language("passage", "Reading", [passage.text, passage.question], passage.answer));
  if (using(selected, "grammar")) {
    blocks.push(language("grammar", "Grammar", [grammar.sentence, "Name the part of speech that carries the meaning, and say what it tells."], grammar.answer));
  }
  if (using(selected, "notation")) blocks.push(math("notation", "Scientific notation", grade8Notation(slot)));
  if (using(selected, "squares")) blocks.push(math("squares", "Squares and roots", grade8Square(slot)));
  if (using(selected, "proportion")) blocks.push(math("proportion", "Percent", grade8Proportion(slot)));
  if (using(selected, "rotate")) blocks.push(math("rotate", "Try this", grade8Rotate(slot)));
  return { blocks, feature: "proportion" };
}
