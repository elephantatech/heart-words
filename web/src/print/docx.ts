import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  VerticalAlignTable,
  WidthType,
  type FileChild,
  type ParagraphChild,
} from "docx";
import { countingFrames } from "../lesson/daily";
import type { Hunt, Lesson, Word } from "../lesson/types";
import { dottedGlyph, type GlyphImage } from "./dotted";
import { worksheetCopy } from "./prompts";
import { GUIDE, INK, HEART, MUTED, staffBorder, text } from "./runs";

const LETTER = {
  page: {
    size: { width: "8.5in" as const, height: "11in" as const },
    margin: { top: "0.5in" as const, bottom: "0.5in" as const, left: "0.5in" as const, right: "0.5in" as const },
  },
};

function para(children: ParagraphChild[]): Paragraph {
  return new Paragraph({ spacing: { after: 80 }, children });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function staffCell(width: number, child: ParagraphChild): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlignTable.BOTTOM,
    children: [new Paragraph({ border: staffBorder, spacing: { before: 40, after: 40 }, children: [child] })],
  });
}

function dottedPicture(glyph: string, image: GlyphImage): ImageRun {
  return new ImageRun({
    type: "png",
    data: image.data,
    transformation: { width: 58, height: Math.max(24, Math.round((58 * image.height) / image.width)) },
    altText: { name: glyph, description: `Dotted ${glyph}` },
  });
}

function writingTable(glyph: string, color: string, image?: GlyphImage): Table {
  const widths = [1944, 1944, 1944, 2484, 2484];
  const blank = image ? dottedPicture(glyph, image) : text(" ", "28pt", INK);
  const blankAgain = image ? dottedPicture(glyph, image) : text(" ", "28pt", INK);
  return new Table({
    width: { size: 10800, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          staffCell(widths[0], text(glyph, "40pt", INK, { bold: true })),
          staffCell(widths[1], text(glyph, "40pt", color, { bold: true })),
          staffCell(widths[2], text(glyph, "40pt", color, { bold: true })),
          staffCell(widths[3], blank),
          staffCell(widths[4], blankAgain),
        ],
      }),
    ],
  });
}

function writingBlock(prompt: string, glyph: string, image?: GlyphImage): FileChild[] {
  return [
    new Paragraph({ spacing: { before: 160, after: 60 }, children: [text(prompt, "14pt", INK, { bold: true })] }),
    writingTable(glyph, GUIDE, image),
  ];
}

function soundBlocks(words: Word[]): Paragraph[] {
  const blocks: Paragraph[] = [new Paragraph({ spacing: { before: 200 }, children: [text("Sound it out", "16pt", INK, { bold: true })] })];
  for (const word of words) {
    const children: ParagraphChild[] = [];
    word.graphemes.forEach((piece, index) => {
      if (index) children.push(text("  ", "16pt", INK));
      const label = piece.phoneme === "-" ? piece.letters : `${piece.letters} ${piece.phoneme}`;
      children.push(text(label, "16pt", piece.heart ? HEART : INK, { bold: true, underline: piece.heart }));
    });
    blocks.push(new Paragraph({ children }));
    blocks.push(new Paragraph({ spacing: { after: 120 }, children: [text(word.sentence, "12pt", MUTED, { italic: true })] }));
  }
  return blocks;
}

function covered(hunt: Hunt, words: Word[]): Set<string> {
  const byId = new Map(words.map((word) => [word.id, word.display.toLowerCase()]));
  const cells = new Set<string>();
  for (const place of hunt.placements) {
    const letters = byId.get(place.wordId) ?? "";
    [...letters].forEach((_, index) => {
      const row = place.row + (place.direction === "down" ? index : 0);
      const col = place.col + (place.direction === "across" ? index : 0);
      cells.add(`${row},${col}`);
    });
  }
  return cells;
}

function huntTable(hunt: Hunt, words: Word[], shaded: boolean): Table {
  const marks = shaded ? covered(hunt, words) : new Set<string>();
  const width = 620;
  return new Table({
    width: { size: width * 10, type: WidthType.DXA },
    columnWidths: Array.from({ length: 10 }, () => width),
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: hunt.rows.map(
      (row, rowIndex) =>
        new TableRow({
          children: [...row].map((char, colIndex) => {
            const mark = marks.has(`${rowIndex},${colIndex}`);
            return new TableCell({
              width: { size: width, type: WidthType.DXA },
              shading: mark ? { fill: "F6E7A8" } : undefined,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [text(char, "14pt", INK)],
                }),
              ],
            });
          }),
        }),
    ),
  });
}

function tenFrame(frame: boolean[]): Table {
  const cell = (filled: boolean) =>
    new TableCell({
      width: { size: 500, type: WidthType.DXA },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(filled ? "●" : "○", "16pt", INK)] })],
    });
  return new Table({
    width: { size: 2500, type: WidthType.DXA },
    columnWidths: [500, 500, 500, 500, 500],
    rows: [new TableRow({ children: frame.slice(0, 5).map(cell) }), new TableRow({ children: frame.slice(5).map(cell) })],
  });
}

function guideRow(filled: string[], blanks: number): Table {
  const width = 1200;
  const cells = [
    ...filled.map((value) => staffCell(width, text(value, "28pt", INK, { bold: true }))),
    ...Array.from({ length: blanks }, () => staffCell(width, text(" ", "28pt", INK))),
  ];
  return new Table({
    width: { size: width * cells.length, type: WidthType.DXA },
    columnWidths: cells.map(() => width),
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: cells })],
  });
}

export function buildWorksheet(lesson: Lesson, images: Map<string, GlyphImage>, studentName = ""): Document {
  const copy = worksheetCopy(lesson, studentName);
  const words = [...lesson.heartWords, ...lesson.sightWords];
  const children: FileChild[] = [];
  if (copy.headline) {
    children.push(para([text(copy.headline, "28pt", INK, { bold: true })]));
    children.push(para([text(copy.nameLine, "12pt", INK)]));
  }
  if (copy.uppercase) children.push(...writingBlock(copy.uppercase, lesson.letter.letter.toUpperCase(), images.get(lesson.letter.letter.toUpperCase())));
  if (copy.lowercase) children.push(...writingBlock(copy.lowercase, lesson.letter.letter, images.get(lesson.letter.letter)));
  if (copy.soundsTitle) children.push(...soundBlocks(words));
  if (copy.findWords && lesson.hunt) {
    children.push(new Paragraph({ spacing: { before: 160 }, children: [text(copy.findWords, "14pt", INK, { bold: true })] }));
    children.push(huntTable(lesson.hunt, words, false));
  }
  if (copy.mathTitle) {
    if (copy.headline || copy.findWords) children.push(pageBreak());
    children.push(para([text(copy.mathTitle, "28pt", INK, { bold: true })]));
    children.push(para([text(copy.nameLine, "12pt", INK)]));
    if (copy.number) children.push(...writingBlock(copy.number, String(lesson.number), images.get(String(lesson.number))));
    if (copy.countLines) {
      children.push(new Paragraph({ spacing: { before: 160 }, children: [text(copy.countLines[0], "14pt", INK, { bold: true })] }));
      for (const frame of countingFrames(lesson.count)) children.push(tenFrame(frame));
      children.push(new Paragraph({ spacing: { before: 80 }, children: [text(copy.countLines[1], "14pt", INK, { bold: true })] }));
      children.push(guideRow([], 1));
    }
    if (copy.countOn) {
      children.push(new Paragraph({ spacing: { before: 160 }, children: [text(copy.countOn, "14pt", INK, { bold: true })] }));
      children.push(guideRow([String(lesson.number)], 3));
    }
    if (copy.skip) {
      children.push(new Paragraph({ spacing: { before: 160 }, children: [text(copy.skip, "14pt", INK, { bold: true })] }));
      children.push(guideRow(lesson.skipShown.map(String), 3));
    }
  }
  if (copy.keyTitle && lesson.hunt) {
    children.push(pageBreak());
    children.push(para([text(copy.keyTitle, "20pt", INK, { bold: true })]));
    children.push(huntTable(lesson.hunt, words, true));
    for (const line of copy.keyLines) children.push(para([text(line, "14pt", INK)]));
  }
  if (copy.empty) children.push(para([text(copy.empty, "16pt", INK)]));
  return new Document({ sections: [{ properties: LETTER, children }] });
}

async function imagesFor(lesson: Lesson): Promise<Map<string, GlyphImage>> {
  const glyphs = new Set<string>();
  if (lesson.exercises.includes("uppercase")) glyphs.add(lesson.letter.letter.toUpperCase());
  if (lesson.exercises.includes("lowercase")) glyphs.add(lesson.letter.letter);
  if (lesson.exercises.includes("number")) glyphs.add(String(lesson.number));
  const images = new Map<string, GlyphImage>();
  for (const glyph of glyphs) {
    try {
      images.set(glyph, await dottedGlyph(glyph));
    } catch {
      // A missing dotted picture still leaves the handwriting lines.
    }
  }
  return images;
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadLesson(lesson: Lesson, studentName = ""): Promise<void> {
  const blob = await Packer.toBlob(buildWorksheet(lesson, await imagesFor(lesson), studentName));
  saveBlob(blob, `daily-${lesson.date}.docx`);
}
