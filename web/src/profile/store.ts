import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Exercise, GradeId } from "../lesson/types";
import { DEFAULT_GRADE, GRADES, exercisesFor, readyGrade } from "../lesson/types";

export interface Focus {
  letter?: string;
  number?: number;
  count?: number;
  skipBy?: 2 | 5 | 10;
}

export interface Student {
  id: string;
  name: string;
  grade: GradeId;
  exercises: Exercise[];
  focus: Focus;
}

export interface Parent {
  id: "parent";
  name: string;
  salt: string;
  hash: string;
}

interface Schema extends DBSchema {
  parent: { key: string; value: Parent };
  students: { key: string; value: Student };
  meta: { key: string; value: string };
}

let database: IDBPDatabase<Schema> | null = null;

async function db(): Promise<IDBPDatabase<Schema>> {
  if (!database) {
    database = await openDB<Schema>("heart-words", 1, {
      upgrade(upgradeDb) {
        upgradeDb.createObjectStore("parent");
        upgradeDb.createObjectStore("students");
        upgradeDb.createObjectStore("meta");
      },
    });
  }
  return database;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export async function hashPin(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export async function getParent(): Promise<Parent | undefined> {
  return (await db()).get("parent", "parent");
}

export async function saveParent(name: string, pin: string): Promise<void> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToBase64(saltBytes);
  const hash = await hashPin(pin, saltBytes);
  await (await db()).put("parent", { id: "parent", name, salt, hash }, "parent");
}

export async function checkPin(pin: string): Promise<boolean> {
  const parent = await getParent();
  if (!parent) return false;
  const hash = await hashPin(pin, base64ToBytes(parent.salt));
  return hash === parent.hash;
}

export function withGrade(student: Omit<Student, "grade"> & { grade?: GradeId }): Student {
  const known = GRADES.some((grade) => grade.id === student.grade);
  return { ...student, grade: known ? student.grade! : DEFAULT_GRADE };
}

export async function listStudents(): Promise<Student[]> {
  return (await (await db()).getAll("students")).map((student) => withGrade(student));
}

export async function saveStudent(student: Student): Promise<void> {
  await (await db()).put("students", student, student.id);
  if (!(await activeStudentId())) await setActiveStudent(student.id);
}

export async function removeStudent(id: string): Promise<void> {
  const database = await db();
  await database.delete("students", id);
  if ((await activeStudentId()) === id) {
    const remaining = await database.getAll("students");
    if (remaining[0]) await setActiveStudent(remaining[0].id);
    else await database.delete("meta", "active");
  }
}

export async function activeStudentId(): Promise<string | undefined> {
  return (await db()).get("meta", "active");
}

export async function setActiveStudent(id: string): Promise<void> {
  await (await db()).put("meta", id, "active");
}

export async function skippedLogin(): Promise<boolean> {
  return (await (await db()).get("meta", "entry")) === "skipped";
}

export async function skipLogin(): Promise<void> {
  await (await db()).put("meta", "skipped", "entry");
}

export async function activeStudent(): Promise<Student | undefined> {
  const id = await activeStudentId();
  if (!id) return undefined;
  const student = await (await db()).get("students", id);
  return student ? withGrade(student) : undefined;
}

export function newStudent(name: string, grade?: string): Student {
  const chosen = readyGrade(grade);
  return { id: crypto.randomUUID(), name, grade: chosen, exercises: [...exercisesFor(chosen)], focus: {} };
}
