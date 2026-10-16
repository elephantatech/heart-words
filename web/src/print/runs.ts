import { BorderStyle, TextRun, UnderlineType } from "docx";

export const INK = "1A2744";
export const GUIDE = "E2B007";
export const HEART = "C23B4A";
export const MUTED = "5C6570";

export function text(
  value: string,
  size: `${number}pt`,
  color: string,
  options: { bold?: boolean; italic?: boolean; underline?: boolean } = {},
): TextRun {
  return new TextRun({
    text: value,
    font: "Arial",
    size,
    color,
    bold: options.bold,
    italics: options.italic,
    underline: options.underline ? { type: UnderlineType.SINGLE, color } : undefined,
  });
}

export const staffBorder = {
  top: { style: BorderStyle.SINGLE, size: 12, color: "8EA9C6", space: 1 },
  between: { style: BorderStyle.SINGLE, size: 4, color: "B7C9DC", space: 1 },
  bottom: { style: BorderStyle.SINGLE, size: 12, color: "8EA9C6", space: 1 },
};
