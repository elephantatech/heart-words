import { Packer } from "docx";
import { describe, expect, it } from "vitest";
import { buildLesson, loadCatalog } from "../lesson/daily";
import { buildWorksheet } from "./docx";
import { buildCards } from "./cardsDocx";
import { worksheetCopy } from "./prompts";

describe("worksheet copy", () => {
  it("asks the student to count without printing how many dots are filled", () => {
    const lesson = buildLesson("2026-09-23");
    const copy = worksheetCopy(lesson);
    expect(copy.countLines).toEqual(["Count the dots. How many?", "Write how many."]);
    expect(copy.countLines?.join(" ")).not.toContain(String(lesson.count));
    expect(JSON.stringify(copy)).not.toContain("dots are filled");
    expect(copy.uppercase).toBe("Write the uppercase letter.");
    expect(copy.skip).toContain(`by ${lesson.skipBy}`);
    expect(copy.keyLines.length).toBe(lesson.hunt?.placements.length);
  });

  it("keeps a math-only assignment off the reading page", () => {
    const lesson = buildLesson("2026-09-23", 0, { exercises: ["number", "count"] });
    const copy = worksheetCopy(lesson, "Ava");
    expect(copy.headline).toBe("");
    expect(copy.uppercase).toBeNull();
    expect(copy.findWords).toBeNull();
    expect(copy.number).toBe("Write the number.");
    expect(copy.skip).toBeNull();
  });

  it("builds a letter-size worksheet and a card deck", async () => {
    const lesson = buildLesson("2026-09-23");
    const worksheet = await Packer.toBuffer(buildWorksheet(lesson, new Map()));
    expect(worksheet.byteLength).toBeGreaterThan(2000);
    const cards = await Packer.toBuffer(buildCards(loadCatalog().words.filter((word) => word.kinds.includes("heart"))));
    expect(cards.byteLength).toBeGreaterThan(2000);
  });
});
