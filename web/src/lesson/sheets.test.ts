import { describe, expect, it } from "vitest";
import { numbersHtml } from "../render/sheets";
import { betweenNumbers, LOWERCASE, NUMBER_PAGE, numberSheetFromForm, numberSheetFromHash, numberSheetHash, UPPERCASE, type NumberSheetForm } from "./sheets";

describe("grade 1 extra sheets", () => {
  it("asks for the number that comes between two neighbors", () => {
    const rows = betweenNumbers();
    expect(rows[0]).toEqual({ left: 1, right: 3, answer: 2 });
    expect(rows.find((row) => row.left === 4 && row.right === 6)?.answer).toBe(5);
    expect(rows[rows.length - 1]).toEqual({ left: 28, right: 30, answer: 29 });
    for (const row of rows) {
      expect(row.answer).toBe(row.left + 1);
      expect(row.right).toBe(row.answer + 1);
    }
  });

  it("lists 1 to 30 and the full alphabet", () => {
    expect(NUMBER_PAGE).toHaveLength(30);
    expect(NUMBER_PAGE[0]).toBe("1");
    expect(NUMBER_PAGE[29]).toBe("30");
    expect(UPPERCASE.join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(LOWERCASE.join("")).toBe("abcdefghijklmnopqrstuvwxyz");
  });

  it("traces a shorter or longer number range", () => {
    const short = numberSheetFromForm(form({ from: "4", to: "6" }));
    expect(short.ok && short.sheet.numbers.values).toEqual(["4", "5", "6"]);
    expect(short.ok && short.sheet.title).toBe("Numbers 4 to 6");
    const long = numberSheetFromForm(form({ from: "1", to: "40" }));
    expect(long.ok && long.sheet.numbers.values).toHaveLength(40);
    expect(long.ok && long.sheet.numbers.values[39]).toBe("40");
  });

  it("orders a reversed range from low to high", () => {
    const result = numberSheetFromForm(form({ from: "8", to: "5" }));
    expect(result.ok && result.sheet.numbers.values).toEqual(["5", "6", "7", "8"]);
  });

  it("adds an optional skip counting range", () => {
    const result = numberSheetFromHash("#/sheets/numbers?from=1&to=10&by=2&skipFrom=10&skipTo=2");
    expect(result.ok && result.sheet.numbers.values).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(result.ok && result.sheet.skip?.values).toEqual(["2", "4", "6", "8", "10"]);
    expect(result.ok && result.sheet.skip?.title).toBe("Count by 2s from 2 to 10");
    if (result.ok) expect(numberSheetHash(result.sheet)).toBe("#/sheets/numbers?from=1&to=10&by=2&skipFrom=2&skipTo=10");
  });

  it("renders the range controls and the optional skip list", () => {
    const plain = numberSheetFromHash("#/sheets/numbers");
    const html = numbersHtml(plain);
    expect(html).toContain('name="from"');
    expect(html).toContain('name="to"');
    expect(html).toContain("Include a skip-counting list");
    expect(html).toContain("data-skip-fields hidden");
    expect(html).toContain(">30<");
    expect(html).not.toContain("Count by 2s");

    const both = numberSheetFromHash("#/sheets/numbers?from=2&to=4&by=5&skipFrom=5&skipTo=15");
    const withSkip = numbersHtml(both);
    expect(withSkip).toContain("Numbers 2 to 4");
    expect(withSkip).toContain("Count by 5s from 5 to 15");
    expect(withSkip).toContain("data-skip-fields >");
    expect(withSkip).toContain(">15<");
  });

  it("keeps the 1 to 30 sheet when no range is chosen", () => {
    const result = numberSheetFromHash("#/sheets/numbers");
    expect(result.ok && result.sheet.skip).toBeNull();
    expect(result.ok && result.sheet.filename).toBe("numbers-1-to-30.docx");
    expect(result.ok && result.sheet.numbers.values).toEqual(NUMBER_PAGE);
  });

  it("rejects a range that is too long or not a whole number", () => {
    expect(numberSheetFromForm(form({ from: "1", to: "120" })).ok).toBe(true);
    expect(numberSheetFromForm(form({ from: "1", to: "121" })).ok).toBe(false);
    expect(numberSheetFromForm(form({ from: "1", to: "121" }))).toMatchObject({ error: "That number range has more than 120 numbers. Shorten it." });
    expect(numberSheetFromForm(form({ from: "1", to: "10", skip: true, by: "2", skipFrom: "0", skipTo: "300" }))).toMatchObject({
      error: "That skip counting range has more than 120 numbers. Shorten it or count by a bigger step.",
    });
    expect(numberSheetFromForm(form({ from: "ten", to: "12" }))).toMatchObject({ error: "Enter a whole number for From." });
    expect(numberSheetFromForm(form({ from: "1", to: "10", skip: true, by: "1", skipFrom: "2", skipTo: "10" }))).toMatchObject({
      error: "Count by should be from 2 to 120.",
    });
  });
});

function form(overrides: Partial<NumberSheetForm>): NumberSheetForm {
  return { from: "1", to: "30", skip: false, by: "2", skipFrom: "2", skipTo: "20", ...overrides };
}
