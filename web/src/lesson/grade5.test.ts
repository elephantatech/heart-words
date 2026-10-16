import { describe, expect, it } from "vitest";
import { buildGrade5, grade5ExercisesFrom, grade5KeyText, grade5StudentText } from "./grade5";
import { huntContains } from "./hardHunt";
import { GRADE5_EXERCISES } from "./types";

describe("grade 5 lesson", () => {
  it("rotates language and math without printing the answers on the student lines", () => {
    const lesson = buildGrade5("2026-09-25");
    expect(lesson.exercises).toEqual(GRADE5_EXERCISES);
    const student = grade5StudentText(lesson);
    const key = grade5KeyText(lesson);
    expect(student).toContain(lesson.vocabulary?.word);
    expect(student).toContain(lesson.passage?.text);
    expect(lesson.passage?.text.toLowerCase()).toContain(lesson.vocabulary?.word);
    expect(student).toContain(lesson.passage?.question);
    expect(lesson.huntWords).toContain(lesson.vocabulary?.word);
    expect(lesson.hunt?.rows).toHaveLength(12);
    expect(lesson.hunt?.rows[0]).toHaveLength(12);
    const hard = lesson.hunt?.placements.some((place) => place.direction !== "across" && place.direction !== "down");
    expect(hard || lesson.huntWords.length > 3).toBe(true);
    expect(student).toContain(lesson.operations?.prompt);
    expect(student).not.toContain(lesson.vocabulary?.example);
    expect(student).not.toContain(lesson.passage?.answer);
    expect(student).not.toContain(lesson.operations?.answer);
    expect(student).not.toContain(lesson.fractions?.answer);
    expect(student).not.toContain(lesson.decimals?.answer);
    expect(key).toContain(lesson.operations?.answer);
    expect(key).toContain(lesson.passage?.answer);
    expect(buildGrade5("2026-09-25", 1).vocabulary?.word).not.toBe(lesson.vocabulary?.word);
    expect(grade5ExercisesFrom(["vocabulary", "grammar", "passage", "operations", "fractions", "decimals"])).toEqual(GRADE5_EXERCISES);
  });

  it("places every hunt word, including diagonals or backwards, for a month", () => {
    let tricky = 0;
    for (let mix = 0; mix < 24; mix += 1) {
      const lesson = buildGrade5("2026-09-01", mix, ["wordhunt", "vocabulary"]);
      expect(lesson.hunt).not.toBeNull();
      for (const place of lesson.hunt?.placements ?? []) {
        expect(huntContains(lesson.hunt!, place.wordId, place)).toBe(true);
        if (place.direction !== "across" && place.direction !== "down") tricky += 1;
      }
      expect(lesson.huntWords).toContain(lesson.vocabulary?.word);
    }
    expect(tricky).toBeGreaterThan(0);
  });

  it("keeps only the exercises the parent left on", () => {
    const lesson = buildGrade5("2026-09-25", 0, ["vocabulary", "decimals"]);
    expect(lesson.grammar).toBeNull();
    expect(lesson.passage).toBeNull();
    expect(lesson.operations).toBeNull();
    expect(lesson.fractions).toBeNull();
    expect(lesson.vocabulary?.word).toBeTruthy();
    expect(lesson.decimals?.prompt).toMatch(/\d/);
  });
});
