import { describe, expect, it } from "vitest";
import { buildLesson, countFor, letterFor, loadCatalog, numberFor, skipFor } from "./daily";

describe("catalog", () => {
  it("keeps the local heart and sight lists", () => {
    const { words } = loadCatalog();
    expect(words).toHaveLength(135);
    expect(words.filter((word) => word.kinds.includes("heart"))).toHaveLength(35);
  });
});

describe("date rotation", () => {
  it("starts at a and reaches w on 23 September 2026", () => {
    expect(letterFor("2026-09-01")).toBe("a");
    expect(letterFor("2026-09-23")).toBe("w");
    expect(numberFor("2026-09-23")).toBe(1);
    expect(countFor("2026-09-23")).toBe(3);
  });

  it("skip counts by twos, fives, or tens", () => {
    const skip = skipFor("2026-09-23");
    expect([2, 5, 10]).toContain(skip.step);
    expect(skip.shown[1] - skip.shown[0]).toBe(skip.step);
  });

  it("keeps the same sheet for a date and changes it when mix changes", () => {
    const first = buildLesson("2026-09-23");
    expect(buildLesson("2026-09-23")).toEqual(first);
    expect(buildLesson("2026-09-23", 1)).not.toEqual(first);
  });
});

describe("assignment", () => {
  it("uses a pinned letter", () => {
    const lesson = buildLesson("2026-09-23", 0, { letter: "m" });
    expect(lesson.letter.letter).toBe("m");
    expect(lesson.heartWords.every((word) => word.display.toLowerCase().includes("m") || lesson.heartWords.length === 2)).toBe(true);
  });

  it("drops the hunt when word practice is off", () => {
    const lesson = buildLesson("2026-09-23", 0, {
      exercises: ["uppercase", "number", "hunt"],
    });
    expect(lesson.hunt).toBeNull();
    expect(lesson.exercises).not.toContain("hunt");
  });

  it("places every practice word for two months", () => {
    const start = Date.UTC(2026, 8, 1);
    for (let offset = 0; offset < 60; offset += 1) {
      const date = new Date(start + offset * 86400000);
      const iso = date.toISOString().slice(0, 10);
      const lesson = buildLesson(iso);
      const words = [...lesson.heartWords, ...lesson.sightWords];
      expect(new Set(words.map((word) => word.id)).size).toBe(4);
      const fourth = words[3];
      const place = lesson.hunt?.placements.find((item) => item.wordId === fourth.id);
      expect(place?.direction).toBe("down");
      for (const placement of lesson.hunt?.placements ?? []) {
        const word = words.find((item) => item.id === placement.wordId)!;
        [...word.display.toLowerCase()].forEach((char, index) => {
          const row = placement.row + (placement.direction === "down" ? index : 0);
          const col = placement.col + (placement.direction === "across" ? index : 0);
          expect(lesson.hunt?.rows[row][col]).toBe(char);
        });
      }
    }
  });
});
