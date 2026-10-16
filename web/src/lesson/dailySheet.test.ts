import { describe, expect, it } from "vitest";
import { dailyHtml } from "../render/dailySheet";
import { buildDaily, dailyKeyText, dailyStudentText, isSheetGrade, sheetExercises, type SheetGrade } from "./dailySheet";
import { huntContains } from "./hardHunt";
import {
  grade2Fact,
  grade2Rotate,
  grade3Fact,
  grade4Fact,
  grade4Operation,
  grade6Place,
  grade6Rotate,
  grade7Factors,
  grade7Rotate,
  grade8Pythagoras,
  grade8Square,
  kinderFact,
  kinderNumber,
  kinderRotate,
} from "./sheetMath";
import { exercisesFor } from "./types";

const DATE = "2026-10-13";
const GRADES: SheetGrade[] = ["K", "2", "3", "4", "6", "7", "8"];

describe("daily sheets", () => {
  it("builds the same sheet twice and changes it when the mix changes", () => {
    for (const grade of GRADES) {
      const first = buildDaily(grade, DATE, 0);
      const again = buildDaily(grade, DATE, 0);
      expect(dailyStudentText(again)).toBe(dailyStudentText(first));
      expect(dailyKeyText(again)).toBe(dailyKeyText(first));
      expect(first.blocks.map((block) => block.id)).toEqual(exercisesFor(grade));
      expect(dailyStudentText(buildDaily(grade, DATE, 1))).not.toBe(dailyStudentText(first));
    }
  });

  it("keeps answers off the student page and in the grown-up key", () => {
    for (const grade of GRADES) {
      const sheet = buildDaily(grade, DATE, 0);
      const html = dailyHtml(sheet, "Ava");
      const student = dailyStudentText(sheet);
      expect(html).not.toContain("Grown-up key");
      expect(html).toContain(sheet.label);
      for (const block of sheet.blocks) {
        expect(dailyKeyText(sheet)).toContain(block.answer);
        if (block.id === "passage") expect(student).not.toContain(block.answer);
      }
      if (grade === "3" || grade === "4" || grade === "6" || grade === "7" || grade === "8") {
        expect(html).toContain("First Nations");
        expect(sheet.note).toContain("First Nations");
      } else {
        expect(sheet.note).toBe("");
      }
    }
  });

  it("drops a turned-off block and treats another grade's list as the full sheet", () => {
    const only = buildDaily("4", DATE, 0, ["decimals"]);
    expect(only.blocks.map((block) => block.id)).toEqual(["decimals"]);
    expect(dailyHtml(only, "Ava")).not.toContain("Word parts");
    expect(buildDaily("6", DATE, 0, []).blocks).toEqual([]);
    const wrongGrade = buildDaily("2", DATE, 0, ["uppercase", "heart", "words"]);
    expect(wrongGrade.blocks.map((block) => block.id)).toEqual(exercisesFor("2"));
    expect(buildDaily("2", DATE, 0, ["words"]).blocks.map((block) => block.id)).toEqual(["words"]);
    expect(sheetExercises("K", undefined)).toEqual(exercisesFor("K"));
    expect(isSheetGrade("5")).toBe(false);
    expect(isSheetGrade("8")).toBe(true);
  });

  it("places a word hunt for grades that use one", () => {
    for (const grade of ["2", "3", "4", "6", "7", "8"] as SheetGrade[]) {
      const sheet = buildDaily(grade, DATE, 0);
      expect(sheet.hunt).not.toBeNull();
      expect(sheet.huntWords.length).toBeGreaterThan(1);
      for (const place of sheet.hunt?.placements ?? []) {
        expect(huntContains(sheet.hunt!, place.wordId, place)).toBe(true);
      }
      if (grade === "2") expect(sheet.hardHunt).toBe(false);
      else expect(sheet.hardHunt).toBe(true);
    }
    expect(buildDaily("K", DATE, 0).hunt).toBeNull();
  });

  it("stays inside the curriculum ceilings", () => {
    for (let slot = 0; slot < 240; slot += 1) {
      const kinder = kinderFact(slot);
      const kinderNumbers = kinder.prompt.match(/\d+/g)?.map(Number) ?? [];
      expect(Math.max(...kinderNumbers)).toBeLessThanOrEqual(5);
      expect(Number(kinder.answer)).toBeGreaterThanOrEqual(0);
      expect(kinderNumber(slot).prompt).toMatch(/Write the number (\d+)\./);
      expect(Number(kinderNumber(slot).answer)).toBeLessThanOrEqual(20);

      const sum = grade2Fact(slot);
      if (sum.prompt.includes("+")) {
        const [left, right] = sum.prompt.split(" + ").map(Number);
        expect(left + right).toBeLessThanOrEqual(50);
        expect(sum.answer).toBe(String(left + right));
      } else {
        expect(Number(sum.prompt.split(" − ")[0])).toBeLessThanOrEqual(50);
      }

      const fact = grade3Fact(slot);
      expect([2, 5, 10]).toContain(fact.rows);

      const family = grade4Fact(slot);
      const factors = family.prompt.match(/\d+/g)?.map(Number) ?? [];
      expect(factors[0]).toBeLessThanOrEqual(10);
      expect(factors[1]).toBeLessThanOrEqual(10);

      if (slot % 2 === 0) {
        const digits = grade6Place(slot).prompt.replace(/,/g, "").match(/\d+/)?.[0] ?? "";
        expect(Number(digits)).toBeLessThanOrEqual(1_000_000);
      }
      expect(Number(grade7Factors(slot).prompt.match(/\d+/)?.[0])).toBeLessThanOrEqual(100);

      const square = grade8Square(slot);
      expect(Number(square.answer.split(",")[0])).toBeLessThanOrEqual(144);
      expect(grade8Pythagoras(slot).answer).toMatch(/^\d+$/);
    }

    for (let slot = 0; slot < 200; slot += 6) {
      const compared = kinderRotate(slot);
      const pair = compared.prompt.match(/\d+/g)?.map(Number) ?? [];
      expect(pair[0]).not.toBe(pair[1]);
      expect(Math.max(...pair)).toBeLessThanOrEqual(20);
    }
    for (let slot = 2; slot < 400; slot += 6) {
      const shared = grade2Rotate(slot);
      if (!shared.prompt.startsWith("Share")) continue;
      expect(Number(shared.prompt.match(/Share (\d+)/)?.[1])).toBeLessThanOrEqual(10);
    }
    let remainders = 0;
    for (let slot = 0; slot < 40; slot += 1) {
      if (grade4Operation(slot).answer.includes("remainder")) remainders += 1;
    }
    expect(remainders).toBeGreaterThan(0);
    for (let slot = 4; slot < 50; slot += 6) {
      expect(grade6Rotate(slot).answer).toMatch(/%/);
    }
    for (let slot = 3; slot < 40; slot += 5) {
      const parts = [...grade7Rotate(slot).prompt.matchAll(/(\d+)%/g)].map((match) => Number(match[1]));
      expect(parts.reduce((total, part) => total + part, 0)).toBe(100);
    }
  });
});
