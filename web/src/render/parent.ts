import type { Exercise, GradeId } from "../lesson/types";
import { grade5ExercisesFrom } from "../lesson/grade5";
import { GRADES, exercisesFor, readyGrade } from "../lesson/types";
import {
  activeStudentId,
  checkPin,
  getParent,
  listStudents,
  newStudent,
  removeStudent,
  saveParent,
  saveStudent,
  setActiveStudent,
  type Student,
} from "../profile/store";
import { esc } from "./html";

const LABELS: Record<Exercise, string> = {
  uppercase: "Uppercase letter",
  lowercase: "Lowercase letter",
  heart: "Heart words",
  sight: "Sight words",
  hunt: "Word hunt",
  number: "Write the number",
  count: "Count the dots",
  count_on: "Count on",
  skip: "Skip counting",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  passage: "Reading",
  wordhunt: "Challenge word hunt",
  operations: "Whole numbers",
  fractions: "Fractions",
  decimals: "Decimals",
  expressions: "Order of operations",
  volume: "Volume",
  rounding: "Rounding",
  blend: "Blend a word",
  words: "Words",
  sentence: "Sentences",
  place: "Place value",
  facts: "Facts",
  rotate: "Extra math",
  divisibility: "Divisibility",
  factors: "Factors",
  integers: "Integers",
  notation: "Scientific notation",
  squares: "Squares and roots",
  proportion: "Percent",
};

function gradeField(selected: GradeId): string {
  return `<fieldset><legend>Grade</legend>${GRADES.map((grade) => {
    const chosen = grade.id === selected ? "checked" : "";
    const unavailable = grade.ready ? "" : "disabled";
    const note = grade.ready ? "" : ` <span class="later">later</span>`;
    return `<label class="${grade.ready ? "" : "later-grade"}"><input type="radio" name="grade" value="${grade.id}" ${chosen} ${unavailable}> ${esc(grade.label)}${note}</label>`;
  }).join("")}</fieldset>`;
}

function chosenExercises(grade: GradeId, stored: Exercise[], allowed: Exercise[]): Set<Exercise> {
  if (grade === "5") {
    const expanded = grade5ExercisesFrom(stored);
    return new Set(expanded === undefined ? allowed : expanded);
  }
  if (grade === "1") return new Set(stored.some((item) => allowed.includes(item)) ? stored : allowed);
  if (stored.length === 0) return new Set();
  const matched = stored.filter((item) => allowed.includes(item));
  if (stored.some((item) => !allowed.includes(item)) || matched.length === 0) return new Set(allowed);
  return new Set(matched);
}

function exerciseFields(grade: GradeId, stored: Exercise[]): string {
  const allowed = exercisesFor(grade);
  const chosen = chosenExercises(grade, stored, allowed);
  return `<fieldset data-grade-exercises="${grade}"><legend>Exercises</legend>${allowed
    .map(
      (exercise) =>
        `<label><input type="checkbox" name="exercise" value="${exercise}" ${chosen.has(exercise) ? "checked" : ""}> ${LABELS[exercise]}</label>`,
    )
    .join("")}</fieldset>`;
}

function gradeFrom(data: FormData, fallback: GradeId): GradeId {
  const chosen = String(data.get("grade") ?? "");
  return GRADES.some((grade) => grade.ready && grade.id === chosen) ? readyGrade(chosen) : fallback;
}

let unlocked = false;

export function lockParent(): void {
  unlocked = false;
}

function installed(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function installNote(): string {
  if (installed()) return `<p>This tablet is using the installed app. Profiles stay on this device.</p>`;
  return `<p>To install, on iPad tap Share, then Add to Home Screen. In Chrome or Edge, use Install. Profiles stay on this device. Clearing site data deletes them.</p><button class="download" type="button" data-install hidden>Install</button>`;
}

export async function parentHtml(): Promise<string> {
  const parent = await getParent();
  if (!parent) return setupHtml();
  if (!unlocked) return pinHtml(parent.name);
  const students = await listStudents();
  return settingsHtml(parent.name, students, await activeStudentId());
}

export function welcomeHtml(): string {
  return `<h1>Login</h1><p>Log in to save a student on this tablet, or continue without an account.</p><p class="actions"><a class="download" href="#/login">Login</a><button type="button" class="download" data-bypass>Continue without login</button></p>`;
}

function setupHtml(): string {
  return `<h1>Login</h1><p>Save a parent name, a 4-digit PIN, and a student. They stay in this browser or installed app. They are not an online account.</p>${installNote()}<form data-setup><label>Parent name<input name="parent" autocomplete="name" required></label><label>PIN<input name="pin" type="password" inputmode="numeric" autocomplete="off" pattern="[0-9]{4}" minlength="4" maxlength="4" required></label><label>Student name<input name="student" autocomplete="off" required></label>${gradeField("1")}<button class="download" type="submit">Save</button><p data-error role="status"></p></form>`;
}

function pinHtml(name: string): string {
  return `<h1>Login</h1><p>${esc(name)}, enter the PIN to change exercises.</p><form data-pin><label>PIN<input name="pin" type="password" inputmode="numeric" autocomplete="off" pattern="[0-9]{4}" minlength="4" maxlength="4" required></label><button class="download" type="submit">Open settings</button><p data-error role="status"></p></form>`;
}

function settingsHtml(parentName: string, students: Student[], activeId: string | undefined): string {
  const cards = students
    .map((student) => {
      const active = student.id === activeId;
      return `<form data-student="${esc(student.id)}" data-saved-grade="${esc(student.grade)}"><h2>${esc(student.name)}</h2><p>${active ? "This student is on Today." : "Saved on this tablet."}</p><label>Name<input name="name" value="${esc(student.name)}" required></label>${gradeField(student.grade)}${GRADES.filter((grade) => grade.ready)
        .map((grade) => exerciseFields(grade.id, student.exercises))
        .join("")}<div data-grade-focus><label>Letter<input name="letter" maxlength="1" value="${esc(student.focus.letter ?? "")}" placeholder="today"></label><label>Number<input name="number" inputmode="numeric" value="${student.focus.number ?? ""}" placeholder="today"></label><label>Skip by<select name="skip"><option value="">today</option>${[2, 5, 10]
        .map((step) => `<option value="${step}" ${student.focus.skipBy === step ? "selected" : ""}>${step}s</option>`)
        .join("")}</select></label></div><button class="download" type="submit">Save ${esc(student.name)}</button><button class="download" type="button" data-use ${active ? "disabled" : ""}>Show on Today</button><button class="download" type="button" data-remove>Remove</button></form>`;
    })
    .join("");
  return `<h1>Settings</h1><p>${esc(parentName)}</p>${installNote()}<form data-add><label>New student<input name="name" autocomplete="off" required></label>${gradeField("1")}<button class="download" type="submit">Add a student</button></form>${cards}`;
}

function pinValue(data: FormData): string | null {
  const pin = String(data.get("pin") ?? "");
  return /^\d{4}$/.test(pin) ? pin : null;
}

function focusFrom(data: FormData, current: Student): Student["focus"] {
  const letter = String(data.get("letter") ?? "").trim().toLowerCase();
  const numberText = String(data.get("number") ?? "").trim();
  const skip = String(data.get("skip") ?? "");
  let number = current.focus.number;
  if (numberText === "") number = undefined;
  else if (Number.isFinite(Number(numberText))) number = Math.min(20, Math.max(0, Math.trunc(Number(numberText))));
  return {
    letter: /^[a-z]$/.test(letter) ? letter : undefined,
    number,
    skipBy: skip === "2" || skip === "5" || skip === "10" ? (Number(skip) as 2 | 5 | 10) : undefined,
  };
}

function syncGradeFields(form: HTMLFormElement): void {
  const grade = form.querySelector<HTMLInputElement>('input[name="grade"]:checked')?.value ?? "1";
  form.querySelectorAll<HTMLElement>("[data-grade-exercises]").forEach((set) => {
    const on = set.dataset.gradeExercises === grade;
    set.hidden = !on;
    set.querySelectorAll("input").forEach((input) => {
      input.disabled = !on;
    });
  });
  form.querySelectorAll<HTMLElement>("[data-grade-focus]").forEach((node) => {
    const on = grade === "1";
    node.hidden = !on;
    node.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select").forEach((input) => {
      input.disabled = !on;
    });
  });
}

export function bindParent(root: ParentNode, refresh: () => void): void {
  root.querySelectorAll<HTMLFormElement>("form").forEach((form) => {
    syncGradeFields(form);
    form.querySelectorAll('input[name="grade"]').forEach((input) => {
      input.addEventListener("change", () => {
        syncGradeFields(form);
        const grade = form.querySelector<HTMLInputElement>('input[name="grade"]:checked')?.value ?? "";
        if (!grade || grade === form.dataset.savedGrade) return;
        form.querySelectorAll<HTMLInputElement>(`[data-grade-exercises="${grade}"] input`).forEach((box) => {
          box.checked = true;
        });
      });
    });
  });
  root.querySelector<HTMLFormElement>("[data-setup]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const error = root.querySelector<HTMLElement>("[data-error]");
    const pin = pinValue(data);
    const parent = String(data.get("parent") ?? "").trim();
    const studentName = String(data.get("student") ?? "").trim();
    if (!parent || !studentName || !pin) {
      if (error) error.textContent = "Use a parent name, a student name, and a 4-digit PIN.";
      return;
    }
    try {
      await saveParent(parent, pin);
      await saveStudent(newStudent(studentName, gradeFrom(data, "1")));
    } catch {
      if (error) error.textContent = "This tablet could not save the profile. Try again.";
      return;
    }
    unlocked = true;
    refresh();
  });
  root.querySelector<HTMLFormElement>("[data-pin]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const error = root.querySelector<HTMLElement>("[data-error]");
    const pin = pinValue(data);
    if (!pin || !(await checkPin(pin))) {
      if (error) error.textContent = "That PIN does not match.";
      return;
    }
    unlocked = true;
    refresh();
  });
  root.querySelector<HTMLFormElement>("[data-add]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    await saveStudent(newStudent(name, gradeFrom(data, "1")));
    refresh();
  });
  root.querySelectorAll<HTMLFormElement>("[data-student]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const current = (await listStudents()).find((student) => student.id === form.dataset.student);
      if (!current) return;
      const data = new FormData(form);
      const name = String(data.get("name") ?? "").trim();
      if (!name) return;
      current.name = name;
      current.grade = gradeFrom(data, current.grade);
      const allowed = new Set(exercisesFor(current.grade));
      current.exercises = (data.getAll("exercise") as Exercise[]).filter((item) => allowed.has(item));
      current.focus = focusFrom(data, current);
      await saveStudent(current);
      refresh();
    });
    form.querySelector("[data-use]")?.addEventListener("click", async () => {
      if (!form.dataset.student) return;
      await setActiveStudent(form.dataset.student);
      refresh();
    });
    form.querySelector("[data-remove]")?.addEventListener("click", async () => {
      const name = String(new FormData(form).get("name") ?? "this student");
      if (!window.confirm(`Remove ${name}? This tablet will forget that student.`)) return;
      await removeStudent(form.dataset.student ?? "");
      refresh();
    });
  });
  const install = root.querySelector<HTMLButtonElement>("[data-install]");
  const prompt = (window as Window & { heartInstall?: BeforeInstallPromptEvent }).heartInstall;
  if (install && prompt) {
    install.hidden = false;
    install.addEventListener("click", async () => {
      await prompt.prompt();
    });
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
