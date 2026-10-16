import { Document, Packer, PageBreak, Paragraph, type FileChild } from "docx";
import { dailyHasLanguage, dailyHasMath, dailyKeyText, type DailySheet, type SheetBlock } from "../lesson/dailySheet";
import { saveBlob } from "./docx";
import { INK, text } from "./runs";

const LETTER = {
  page: {
    size: { width: "8.5in" as const, height: "11in" as const },
    margin: { top: "0.5in" as const, bottom: "0.5in" as const, left: "0.5in" as const, right: "0.5in" as const },
  },
};

function para(value: string, size: `${number}pt` = "14pt", bold = false): Paragraph {
  return new Paragraph({ spacing: { after: 80 }, children: [text(value, size, INK, { bold })] });
}

function blank(): Paragraph {
  return para("________________________________");
}

function blockParagraphs(block: SheetBlock): Paragraph[] {
  const children = [para(block.title, "16pt", true), ...block.lines.map((line) => para(line, block.page === "math" ? "18pt" : "14pt", block.page === "math"))];
  if (block.space === "letter" && block.letter) {
    children.push(para(block.letter, "36pt", true), blank());
    if (block.also) children.push(para(block.also, "36pt", true), blank());
  } else if (block.space === "dots" && block.dots) {
    children.push(para("● ".repeat(block.dots).trim(), "18pt"), para("Write how many."), blank());
  } else if (block.rows && block.cols) {
    for (let row = 0; row < block.rows; row += 1) children.push(para("● ".repeat(block.cols).trim()));
    children.push(para("Show your work."), blank(), blank());
  } else if (block.space === "work") {
    children.push(para("Show your work."), blank(), blank(), blank());
  } else {
    children.push(blank(), blank());
  }
  return children;
}

export function buildDailyWorksheet(sheet: DailySheet, studentName = ""): Document {
  const heading = studentName ? `${studentName} · ${sheet.label}` : sheet.label;
  const children: FileChild[] = [para(heading, "28pt", true), para(`${sheet.date}    Name ____________________`, "12pt")];
  const language = sheet.blocks.filter((block) => block.page === "language");
  for (const block of language) children.push(...blockParagraphs(block));
  if (sheet.hunt && sheet.huntWords.length) {
    children.push(para("Word hunt", "16pt", true), para(`Find these words: ${sheet.huntWords.join(", ")}`));
    sheet.hunt.rows.forEach((row) => children.push(para(row.split("").join(" "), "12pt")));
  }
  const math = sheet.blocks.filter((block) => block.page === "math");
  if (math.length) {
    if (dailyHasLanguage(sheet)) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para("Math sheet", "28pt", true), para(`${sheet.date}    Name ____________________`, "12pt"));
    for (const block of math) children.push(...blockParagraphs(block));
  }
  if (!dailyHasLanguage(sheet) && !dailyHasMath(sheet)) children.push(para("No exercises are turned on."));
  const key = dailyKeyText(sheet);
  if (key) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para("Grown-up key", "20pt", true));
    for (const line of key.split("\n")) children.push(para(line));
  }
  return new Document({ sections: [{ properties: LETTER, children }] });
}

export async function downloadDaily(sheet: DailySheet, studentName = ""): Promise<void> {
  const blob = await Packer.toBlob(buildDailyWorksheet(sheet, studentName));
  const name = sheet.grade === "K" ? "kindergarten" : `grade${sheet.grade}`;
  saveBlob(blob, `${name}-${sheet.date}.docx`);
}
