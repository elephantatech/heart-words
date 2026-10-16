import { AlignmentType, BorderStyle, Document, ImageRun, Packer, PageBreak, Paragraph, Table, TableCell, TableRow, WidthType, type FileChild, type ParagraphChild } from "docx";
import { betweenNumbers, LOWERCASE, NUMBER_PAGE, UPPERCASE, type NumberSheet } from "../lesson/sheets";
import { dottedGlyph, type GlyphImage } from "./dotted";
import { saveBlob } from "./docx";
import { INK, staffBorder, text } from "./runs";

const LETTER = {
  page: {
    size: { width: "8.5in" as const, height: "11in" as const },
    margin: { top: "0.5in" as const, bottom: "0.5in" as const, left: "0.5in" as const, right: "0.5in" as const },
  },
};

function para(value: string, size: `${number}pt` = "14pt", bold = false): Paragraph {
  return new Paragraph({ spacing: { after: 80 }, children: [text(value, size, INK, { bold })] });
}

function picture(glyph: string, image: GlyphImage): ImageRun {
  const width = glyph.length > 2 ? 22 * glyph.length : 42;
  return new ImageRun({
    type: "png",
    data: image.data,
    transformation: { width, height: Math.max(20, Math.round((width * image.height) / image.width)) },
    altText: { name: glyph, description: `Dotted ${glyph}` },
  });
}

function staffParagraph(children: ParagraphChild[]): Paragraph {
  return new Paragraph({ border: staffBorder, spacing: { before: 40, after: 60 }, children });
}

async function imagesFor(glyphs: string[]): Promise<Map<string, GlyphImage>> {
  const images = new Map<string, GlyphImage>();
  for (const glyph of glyphs) {
    if (!images.has(glyph)) images.set(glyph, await dottedGlyph(glyph));
  }
  return images;
}

function documentFor(children: FileChild[]): Document {
  return new Document({ sections: [{ properties: LETTER, children }] });
}

function numberLineTable(): Table {
  const edge = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const line = { style: BorderStyle.SINGLE, size: 16, color: "1A2744" };
  const width = 360;
  return new Table({
    width: { size: width * 30, type: WidthType.DXA },
    columnWidths: Array.from({ length: 30 }, () => width),
    rows: [
      new TableRow({
        children: NUMBER_PAGE.map(
          (number) =>
            new TableCell({
              width: { size: width, type: WidthType.DXA },
              borders: { top: edge, left: edge, right: edge, bottom: line },
              margins: { top: 20, bottom: 20, left: 0, right: 0 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(number, "8pt", INK)] })],
            }),
        ),
      }),
    ],
  });
}

export async function downloadMissingNumbers(): Promise<void> {
  const rows = betweenNumbers();
  const children: FileChild[] = [
    para("Missing numbers", "28pt", true),
    para("Name ____________________", "12pt"),
    para("Number line. Find the number you need."),
    numberLineTable(),
    para("Write the number that comes between."),
  ];
  for (const row of rows) {
    children.push(
      new Table({
        width: { size: 5000, type: WidthType.DXA },
        columnWidths: [1400, 2200, 1400],
        rows: [
          new TableRow({
            children: [row.left, "", row.right].map(
              (value) =>
                new TableCell({
                  width: { size: value === "" ? 2200 : 1400, type: WidthType.DXA },
                  children: [staffParagraph([text(value === "" ? " " : String(value), "28pt", INK, { bold: value !== "" })])],
                }),
            ),
          }),
        ],
      }),
    );
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(para("Grown-up key", "20pt", true));
  for (const row of rows) children.push(para(`${row.left}, ____, ${row.right}  →  ${row.answer}`));
  const blob = await Packer.toBlob(documentFor(children));
  saveBlob(blob, "missing-numbers.docx");
}

async function downloadTraces(title: string, glyphs: string[], filename: string): Promise<void> {
  const images = await imagesFor(glyphs);
  const children: FileChild[] = [para(title, "28pt", true), para("Name ____________________", "12pt"), para("Trace each one.")];
  for (const glyph of glyphs) {
    const image = images.get(glyph);
    children.push(staffParagraph(image ? [picture(glyph, image)] : [text(glyph, "28pt", INK)]));
  }
  const blob = await Packer.toBlob(documentFor(children));
  saveBlob(blob, filename);
}

export async function downloadNumbers(sheet: NumberSheet): Promise<void> {
  const groups = [sheet.numbers, ...(sheet.skip ? [sheet.skip] : [])];
  const images = await imagesFor(groups.flatMap((group) => group.values));
  const children: FileChild[] = [];
  groups.forEach((group, index) => {
    children.push(para(group.title, index === 0 ? "28pt" : "20pt", true));
    if (index === 0) children.push(para("Name ____________________", "12pt"));
    children.push(para("Trace each one."));
    for (const glyph of group.values) {
      const image = images.get(glyph);
      children.push(staffParagraph(image ? [picture(glyph, image)] : [text(glyph, "28pt", INK)]));
    }
  });
  const blob = await Packer.toBlob(documentFor(children));
  saveBlob(blob, sheet.filename);
}

export async function downloadAlphabet(): Promise<void> {
  await downloadTraces("Full alphabet", [...UPPERCASE, ...LOWERCASE], "alphabet.docx");
}
