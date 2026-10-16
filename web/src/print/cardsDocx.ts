import {
  AlignmentType,
  BorderStyle,
  Document,
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
import { loadCatalog } from "../lesson/daily";
import type { Word } from "../lesson/types";
import { saveBlob } from "./docx";
import { HEART, INK, MUTED, text } from "./runs";

const DASH = { style: BorderStyle.DASHED, size: 6, color: "C5CCD6" };
const BORDERS = {
  top: DASH,
  bottom: DASH,
  left: DASH,
  right: DASH,
  insideHorizontal: DASH,
  insideVertical: DASH,
};

function graphemes(word: Word, size: `${number}pt`, gap: boolean): ParagraphChild[] {
  const children: ParagraphChild[] = [];
  word.graphemes.forEach((piece, index) => {
    if (gap && index) children.push(text("  ", size, INK));
    children.push(text(piece.letters, size, piece.heart ? HEART : INK, { bold: true, underline: piece.heart }));
  });
  return children;
}

function cell(children: Paragraph[], width = 5400): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlignTable.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children,
  });
}

function emptyCell(): TableCell {
  return cell([new Paragraph("")]);
}

function frontCell(word: Word): TableCell {
  return cell([
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: graphemes(word, "40pt", false),
    }),
  ]);
}

function backCell(word: Word): TableCell {
  return cell([
    new Paragraph({ alignment: AlignmentType.CENTER, children: [text(word.display, "11pt", MUTED, { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [text(word.meaning, "13pt", INK, { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [text(word.sentence, "12pt", INK, { italic: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: graphemes(word, "14pt", true) }),
  ]);
}

function grid(cells: TableCell[]): Table {
  const rows: TableRow[] = [];
  for (let row = 0; row < 4; row += 1) {
    rows.push(
      new TableRow({
        height: { value: 3312, rule: "exact" },
        children: [cells[row * 2], cells[row * 2 + 1]],
      }),
    );
  }
  return new Table({
    width: { size: 10800, type: WidthType.DXA },
    columnWidths: [5400, 5400],
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    borders: BORDERS,
    rows,
  });
}

export function buildCards(words: Word[]): Document {
  const children: FileChild[] = [];
  const pages = Math.max(1, Math.ceil(words.length / 8));
  for (let page = 0; page < pages; page += 1) {
    const chunk = words.slice(page * 8, page * 8 + 8);
    const fronts = Array.from({ length: 8 }, () => emptyCell());
    const backs = Array.from({ length: 8 }, () => emptyCell());
    chunk.forEach((word, index) => {
      fronts[index] = frontCell(word);
      const backIndex = Math.floor(index / 2) * 2 + (1 - (index % 2));
      backs[backIndex] = backCell(word);
    });
    children.push(grid(fronts));
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(grid(backs));
    if (page < pages - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
  }
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: "8.5in", height: "11in" },
            margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
          },
        },
        children,
      },
    ],
  });
}

export async function downloadCards(kind: "heart" | "sight"): Promise<void> {
  const words = loadCatalog().words.filter((word) => word.kinds.includes(kind));
  const blob = await Packer.toBlob(buildCards(words));
  saveBlob(blob, `${kind}-words.docx`);
}
