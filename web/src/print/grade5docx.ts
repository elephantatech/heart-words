import { Document, Packer, PageBreak, Paragraph, type FileChild } from "docx";
import { grade5KeyText, type Grade5Lesson } from "../lesson/grade5";
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

export function buildGrade5Worksheet(lesson: Grade5Lesson, studentName = ""): Document {
  const children: FileChild[] = [
    para(studentName ? `${studentName} · Grade 5` : "Grade 5", "28pt", true),
    para(`${lesson.date}    Name ____________________`, "12pt"),
  ];
  const word = lesson.vocabulary?.word ?? lesson.passage?.word;
  if (word) {
    children.push(para("Reading", "16pt", true), para(word, "28pt", true));
    if (lesson.vocabulary) children.push(para(lesson.vocabulary.pos), para(lesson.vocabulary.meaning));
    if (lesson.passage) children.push(para(lesson.passage.text), para(lesson.passage.question), blank(), blank());
    if (lesson.vocabulary) children.push(para("Write a sentence that uses this word."), blank(), blank());
  }
  if (lesson.hunt) {
    children.push(para("Word hunt", "16pt", true), para(`Find these words: ${lesson.huntWords.join(", ")}`));
    lesson.hunt.rows.forEach((row) => children.push(para(row.split("").join(" "), "12pt")));
  }
  if (lesson.grammar) {
    children.push(para("Grammar", "16pt", true), para(lesson.grammar.skill, "14pt", true), para(lesson.grammar.prompt), para("Write the sentence correctly."), blank(), blank());
  }
  const language = Boolean(word || lesson.grammar || lesson.hunt);
  const math = Boolean(lesson.operations || lesson.fractions || lesson.decimals || lesson.expressions || lesson.volume || lesson.rounding);
  if (math) {
    if (language) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para("Math sheet", "28pt", true), para(`${lesson.date}    Name ____________________`, "12pt"));
    for (const [heading, problem] of [
      ["Whole numbers", lesson.operations],
      ["Fractions", lesson.fractions],
      ["Decimals", lesson.decimals],
      ["Order of operations", lesson.expressions],
      ["Volume", lesson.volume],
      ["Rounding", lesson.rounding],
    ] as const) {
      if (!problem) continue;
      children.push(para(heading, "16pt", true), para(problem.prompt, "22pt", true), para("Show your work."), blank(), blank(), blank());
    }
  }
  if (!language && !math) children.push(para("No exercises are turned on."));
  const key = grade5KeyText(lesson);
  if (key) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para("Grown-up key", "20pt", true));
    for (const line of key.split("\n")) children.push(para(line));
  }
  return new Document({ sections: [{ properties: LETTER, children }] });
}

export async function downloadGrade5(lesson: Grade5Lesson, studentName = ""): Promise<void> {
  const blob = await Packer.toBlob(buildGrade5Worksheet(lesson, studentName));
  saveBlob(blob, `grade5-${lesson.date}.docx`);
}
