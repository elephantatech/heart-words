import { describe, expect, it } from "vitest";
import { withGrade } from "../profile/store";
import { GRADES, gradeById, readyGrade } from "./types";

describe("grades", () => {
  it("offers kindergarten through grade 8 with a daily sheet for each", () => {
    expect(GRADES.map((grade) => grade.id)).toEqual(["K", "1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(GRADES.filter((grade) => grade.ready).map((grade) => grade.id)).toEqual(["K", "1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(readyGrade("5")).toBe("5");
    expect(readyGrade("8")).toBe("8");
  });

  it("reads a missing grade as grade 1 and keeps a grade that is saved", () => {
    expect(gradeById(undefined).label).toBe("Grade 1");
    expect(readyGrade("2")).toBe("2");
    expect(readyGrade("1")).toBe("1");
    expect(readyGrade("nope")).toBe("1");
    const saved = withGrade({ id: "a", name: "Ava", exercises: [], focus: {} });
    expect(saved.grade).toBe("1");
    expect(withGrade({ ...saved, grade: "6" }).grade).toBe("6");
  });
});
