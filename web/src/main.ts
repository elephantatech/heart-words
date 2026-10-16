import { registerSW } from "virtual:pwa-register";
import { buildLesson } from "./lesson/daily";
import { buildDaily, isSheetGrade } from "./lesson/dailySheet";
import { buildGrade5, grade5ExercisesFrom } from "./lesson/grade5";
import type { Assignment } from "./lesson/types";
import { gradeById } from "./lesson/types";
import { activeStudent, getParent, listStudents, setActiveStudent, skippedLogin, skipLogin } from "./profile/store";
import { bindHunt } from "./hunt";
import { downloadDaily } from "./print/dailySheetDocx";
import { downloadLesson } from "./print/docx";
import { downloadGrade5 } from "./print/grade5docx";
import { bindCards, cardsHtml } from "./render/cards";
import { bindParent, lockParent, parentHtml, welcomeHtml } from "./render/parent";
import { esc } from "./render/html";
import { dailyHtml } from "./render/dailySheet";
import { grade5Html } from "./render/grade5";
import { numberSheetFromHash } from "./lesson/sheets";
import { alphabetHtml, bindNumberSheet, missingNumbersHtml, numbersHtml, sheetsIndexHtml } from "./render/sheets";
import { downloadAlphabet, downloadMissingNumbers, downloadNumbers } from "./print/sheetsDocx";
import { lessonFor, todayHtml } from "./render/today";
import { wordsHtml } from "./render/words";
import { bindTracing } from "./trace";
import "./site.css";

registerSW({ immediate: true });

type View = "today" | "cards" | "words" | "login" | "sheets";
let mix = Number(new URLSearchParams(location.search).get("mix") ?? "0") || 0;

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function viewFromHash(): View {
  const hash = location.hash.replace("#/", "");
  if (hash.startsWith("sheets")) return "sheets";
  if (hash.startsWith("cards")) return "cards";
  if (hash.startsWith("words")) return "words";
  if (hash.startsWith("login") || hash.startsWith("parent")) return "login";
  return "today";
}

function cardKind(): "heart" | "sight" {
  return location.hash.includes("kind=sight") ? "sight" : "heart";
}

async function draw(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;
  const view = viewFromHash();
  if (view !== "login") lockParent();
  document.querySelectorAll<HTMLAnchorElement>(".top a[data-view]").forEach((link) => {
    const current = (link.dataset.view ?? "today") === view;
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (view !== "login" && !(await getParent()) && !(await skippedLogin())) {
    app.innerHTML = welcomeHtml();
    app.querySelector("[data-bypass]")?.addEventListener("click", () => {
      void skipLogin().then(() => draw());
    });
    return;
  }
  if (view === "sheets") {
    const page = location.hash.includes("missing") ? "missing" : location.hash.includes("numbers") ? "numbers" : location.hash.includes("alphabet") ? "alphabet" : "index";
    const numbers = page === "numbers" ? numberSheetFromHash(location.hash) : null;
    app.innerHTML = page === "missing" ? missingNumbersHtml() : page === "numbers" ? numbersHtml(numbers!) : page === "alphabet" ? alphabetHtml() : sheetsIndexHtml();
    bindTracing(app);
    if (page === "numbers") bindNumberSheet(app);
    app.querySelector("[data-print]")?.addEventListener("click", () => window.print());
    app.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Preparing the Word file…";
      try {
        if (page === "missing") await downloadMissingNumbers();
        else if (page === "numbers" && numbers?.ok) await downloadNumbers(numbers.sheet);
        else if (page === "alphabet") await downloadAlphabet();
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
    document.title = "Grade 1 sheets · Heart words";
    return;
  }
  if (view === "cards") {
    const kind = cardKind();
    app.innerHTML = cardsHtml(kind);
    bindCards(app, kind);
    return;
  }
  if (view === "words") {
    app.innerHTML = wordsHtml();
    return;
  }
  if (view === "login") {
    app.innerHTML = await parentHtml();
    bindParent(app, () => {
      void draw();
    });
    return;
  }
  const student = await activeStudent();
  const assignment: Assignment | undefined = student
    ? {
        exercises: student.exercises,
        letter: student.focus.letter,
        number: student.focus.number,
        count: student.focus.count,
        skipBy: student.focus.skipBy,
      }
    : undefined;
  const lesson = lessonFor(todayISO(), mix, assignment);
  const students = await listStudents();
  const grade = gradeById(student?.grade);
  const switcher =
    students.length > 1
      ? `<label class="student-switch">Student <select data-student>${students
          .map((item) => `<option value="${esc(item.id)}" ${item.id === student?.id ? "selected" : ""}>${esc(item.name)} · ${esc(gradeById(item.grade).label)}</option>`)
          .join("")}</select></label>`
      : "";
  if (student?.grade === "5") {
    const lesson5 = buildGrade5(todayISO(), mix, grade5ExercisesFrom(student.exercises));
    app.innerHTML = `${switcher}${grade5Html(lesson5, student.name)}`;
    bindHunt(app);
    app.querySelector("[data-print]")?.addEventListener("click", () => window.print());
    app.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Preparing the Word file…";
      try {
        await downloadGrade5(lesson5, student.name);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
    app.querySelector("[data-new-sheet]")?.addEventListener("click", () => {
      mix += 1;
      const url = new URL(location.href);
      url.searchParams.set("mix", String(mix));
      history.replaceState(null, "", url);
      void draw();
    });
    app.querySelector<HTMLSelectElement>("[data-student]")?.addEventListener("change", async (event) => {
      await setActiveStudent((event.currentTarget as HTMLSelectElement).value);
      void draw();
    });
    document.title = "Grade 5 · Heart words";
    return;
  }
  if (student && isSheetGrade(student.grade)) {
    const sheet = buildDaily(student.grade, todayISO(), mix, student.exercises);
    app.innerHTML = `${switcher}${dailyHtml(sheet, student.name)}`;
    bindTracing(app);
    bindHunt(app);
    app.querySelector("[data-print]")?.addEventListener("click", () => window.print());
    app.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Preparing the Word file…";
      try {
        await downloadDaily(sheet, student.name);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
    app.querySelector("[data-new-sheet]")?.addEventListener("click", () => {
      mix += 1;
      const url = new URL(location.href);
      url.searchParams.set("mix", String(mix));
      history.replaceState(null, "", url);
      void draw();
    });
    app.querySelector<HTMLSelectElement>("[data-student]")?.addEventListener("change", async (event) => {
      await setActiveStudent((event.currentTarget as HTMLSelectElement).value);
      void draw();
    });
    document.title = `${grade.label} · Heart words`;
    return;
  }
  if (student && !grade.ready) {
    app.innerHTML = `${switcher}<h1 class="cue">${esc(`${student.name} · ${grade.label}`)}</h1><p>${esc(grade.label)} sheets are not ready yet.</p>`;
    app.querySelector<HTMLSelectElement>("[data-student]")?.addEventListener("change", async (event) => {
      await setActiveStudent((event.currentTarget as HTMLSelectElement).value);
      void draw();
    });
    document.title = `${grade.label} · Heart words`;
    return;
  }
  app.innerHTML = `${switcher}${todayHtml(lesson, student?.name ?? "", student ? grade.label : "")}`;
  bindTracing(app);
  bindHunt(app);
  app.querySelector("[data-print]")?.addEventListener("click", () => window.print());
  app.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Preparing the Word file…";
    try {
      await downloadLesson(lesson, student?.name ?? "");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
  app.querySelector("[data-new-sheet]")?.addEventListener("click", () => {
    mix += 1;
    const url = new URL(location.href);
    url.searchParams.set("mix", String(mix));
    history.replaceState(null, "", url);
    void draw();
  });
  app.querySelector<HTMLSelectElement>("[data-student]")?.addEventListener("change", async (event) => {
    await setActiveStudent((event.currentTarget as HTMLSelectElement).value);
    void draw();
  });
  document.title = `${lesson.letter.letter.toUpperCase()} · Heart words`;
}

document.querySelectorAll<HTMLAnchorElement>(".top a[data-view]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    location.hash = link.getAttribute("href") ?? "#/";
  });
});

window.addEventListener("hashchange", () => {
  void draw();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  (window as Window & { heartInstall?: Event }).heartInstall = event;
});

void draw();

export { buildLesson };
