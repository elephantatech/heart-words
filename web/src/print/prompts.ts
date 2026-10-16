import type { Lesson } from "../lesson/types";

export interface WorksheetCopy {
  headline: string;
  nameLine: string;
  uppercase: string | null;
  lowercase: string | null;
  soundsTitle: string | null;
  findWords: string | null;
  mathTitle: string | null;
  number: string | null;
  countLines: string[] | null;
  countOn: string | null;
  skip: string | null;
  keyTitle: string | null;
  keyLines: string[];
  empty: string | null;
}

const READING = new Set(["uppercase", "lowercase", "heart", "sight", "hunt"]);
const MATH = new Set(["number", "count", "count_on", "skip"]);

export function worksheetCopy(lesson: Lesson, studentName = ""): WorksheetCopy {
  const words = [...lesson.heartWords, ...lesson.sightWords];
  const reading = lesson.exercises.some((exercise) => READING.has(exercise));
  const math = lesson.exercises.some((exercise) => MATH.has(exercise));
  const who = studentName ? `${studentName} · ` : "";
  return {
    headline: reading ? `${who}${lesson.letter.letter.toUpperCase()}  ${lesson.letter.cue}` : "",
    nameLine: `${lesson.date}    Name ____________________`,
    uppercase: lesson.exercises.includes("uppercase") ? "Write the uppercase letter." : null,
    lowercase: lesson.exercises.includes("lowercase") ? "Write the lowercase letter." : null,
    soundsTitle: words.length ? "Sound it out" : null,
    findWords: lesson.hunt ? `Find these words: ${words.map((word) => word.display).join(", ")}` : null,
    mathTitle: math ? "Math sheet" : null,
    number: lesson.exercises.includes("number") ? "Write the number." : null,
    countLines: lesson.exercises.includes("count") ? ["Count the dots. How many?", "Write how many."] : null,
    countOn: lesson.exercises.includes("count_on") ? "Count on. Write the next numbers." : null,
    skip: lesson.exercises.includes("skip") ? `Skip count by ${lesson.skipBy}s.` : null,
    keyTitle: lesson.hunt ? "Grown-up key" : null,
    keyLines: lesson.hunt
      ? lesson.hunt.placements.map((place) => {
          const word = words.find((item) => item.id === place.wordId);
          return `${word?.display ?? place.wordId}: row ${place.row + 1}, column ${place.col + 1}, ${place.direction}`;
        })
      : [],
    empty: reading || math ? null : "No exercises are turned on.",
  };
}
