export interface Grapheme {
  letters: string;
  phoneme: string;
  heart: boolean;
}

export interface Word {
  id: string;
  display: string;
  kinds: Array<"heart" | "sight">;
  dolch: "pre-primer" | "primer" | "grade-1" | null;
  graphemes: Grapheme[];
  meaning: string;
  sentence: string;
}

export interface Letter {
  letter: string;
  sound: string;
  cue: string;
  decodable: string[];
}

export type HuntDirection = "across" | "down" | "diagonal" | "diagonal-up" | "backwards" | "up";

export interface Placement {
  wordId: string;
  row: number;
  col: number;
  direction: HuntDirection;
}

export interface Hunt {
  rows: string[];
  placements: Placement[];
}

export type GradeId = "K" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export interface GradeOption {
  id: GradeId;
  label: string;
  ready: boolean;
}

export const GRADES: GradeOption[] = [
  { id: "K", label: "Kindergarten", ready: true },
  { id: "1", label: "Grade 1", ready: true },
  { id: "2", label: "Grade 2", ready: true },
  { id: "3", label: "Grade 3", ready: true },
  { id: "4", label: "Grade 4", ready: true },
  { id: "5", label: "Grade 5", ready: true },
  { id: "6", label: "Grade 6", ready: true },
  { id: "7", label: "Grade 7", ready: true },
  { id: "8", label: "Grade 8", ready: true },
];

export const DEFAULT_GRADE: GradeId = "1";

export function gradeById(id: string | undefined): GradeOption {
  return GRADES.find((grade) => grade.id === id) ?? GRADES.find((grade) => grade.id === DEFAULT_GRADE)!;
}

export function readyGrade(id: string | undefined): GradeId {
  const grade = GRADES.find((item) => item.id === id);
  return grade?.ready ? grade.id : DEFAULT_GRADE;
}

export type Exercise =
  | "uppercase"
  | "lowercase"
  | "heart"
  | "sight"
  | "hunt"
  | "number"
  | "count"
  | "count_on"
  | "skip"
  | "vocabulary"
  | "grammar"
  | "passage"
  | "operations"
  | "fractions"
  | "decimals"
  | "wordhunt"
  | "expressions"
  | "volume"
  | "rounding"
  | "blend"
  | "words"
  | "sentence"
  | "place"
  | "facts"
  | "rotate"
  | "divisibility"
  | "factors"
  | "integers"
  | "notation"
  | "squares"
  | "proportion";

export const ALL_EXERCISES: Exercise[] = [
  "uppercase",
  "lowercase",
  "heart",
  "sight",
  "hunt",
  "number",
  "count",
  "count_on",
  "skip",
];

export const GRADE5_EXERCISES: Exercise[] = [
  "vocabulary",
  "grammar",
  "passage",
  "wordhunt",
  "operations",
  "fractions",
  "decimals",
  "expressions",
  "volume",
  "rounding",
];

export const SHEET_EXERCISES: Record<Exclude<GradeId, "1" | "5">, Exercise[]> = {
  K: ["uppercase", "blend", "words", "number", "count", "facts", "rotate"],
  "2": ["words", "sentence", "passage", "facts", "place", "rotate"],
  "3": ["words", "sentence", "passage", "place", "facts", "operations", "rotate"],
  "4": ["vocabulary", "grammar", "passage", "place", "facts", "operations", "decimals", "rotate"],
  "6": ["vocabulary", "grammar", "passage", "place", "divisibility", "operations", "rotate"],
  "7": ["grammar", "passage", "factors", "fractions", "integers", "rotate"],
  "8": ["passage", "grammar", "notation", "squares", "proportion", "rotate"],
};

export function exercisesFor(grade: GradeId): Exercise[] {
  if (grade === "5") return GRADE5_EXERCISES;
  if (grade === "1") return ALL_EXERCISES;
  return SHEET_EXERCISES[grade];
}

export interface Assignment {
  exercises?: Exercise[];
  letter?: string;
  number?: number;
  count?: number;
  skipBy?: 2 | 5 | 10;
}

export interface Lesson {
  date: string;
  letter: Letter;
  number: number;
  count: number;
  skipBy: 2 | 5 | 10;
  skipShown: number[];
  mix: number;
  heartWords: Word[];
  sightWords: Word[];
  hunt: Hunt | null;
  exercises: Exercise[];
}
