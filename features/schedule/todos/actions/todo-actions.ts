"use server";

import { revalidatePath } from "next/cache";

import {
  createScheduleTodo,
  removeScheduleTodo,
  updateScheduleTodo,
} from "@/features/schedule/todos/lib/todo-service";

function formEntries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createTodoAction(formData: FormData) {
  await createScheduleTodo(formEntries(formData));
  revalidatePath("/schedule");
}

export async function updateTodoAction(formData: FormData) {
  const entries = formEntries(formData);
  const id = String(entries.id);

  await updateScheduleTodo(id, entries);
  revalidatePath("/schedule");
}

export async function toggleTodoAction(formData: FormData) {
  const entries = formEntries(formData);
  const id = String(entries.id);

  await updateScheduleTodo(id, {
    isCompleted: String(entries.isCompleted) === "true" ? "false" : "true",
  });
  revalidatePath("/schedule");
}

export async function deleteTodoAction(formData: FormData) {
  const entries = formEntries(formData);
  const id = String(entries.id);

  await removeScheduleTodo(id);
  revalidatePath("/schedule");
}
