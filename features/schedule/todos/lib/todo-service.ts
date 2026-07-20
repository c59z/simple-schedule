import { isValid, parseISO } from "date-fns";

import { formatScheduleDate } from "@/features/schedule/lib/format";
import {
  createTodo,
  deleteTodo,
  listRecentTodoDays,
  listTodosByDate,
  updateTodo,
} from "@/features/schedule/todos/data/todo-repository";
import {
  createTodoSchema,
  updateTodoSchema,
} from "@/features/schedule/todos/lib/validation";

function resolveTodoDate(date?: string) {
  const parsedDate = date ? parseISO(date) : new Date();

  return isValid(parsedDate)
    ? formatScheduleDate(parsedDate)
    : formatScheduleDate(new Date());
}

export async function getScheduleTodoPage(date?: string) {
  const selectedDate = resolveTodoDate(date);
  const [todos, recentDays] = await Promise.all([
    listTodosByDate(selectedDate),
    listRecentTodoDays(),
  ]);

  return {
    selectedDate,
    selectedDateValue: parseISO(selectedDate),
    todos,
    recentDays,
  };
}

export async function createScheduleTodo(
  input: Record<string, FormDataEntryValue>,
) {
  const parsed = createTodoSchema.parse({
    todoDate: input.todoDate,
    title: input.title,
    details: input.details,
  });

  return createTodo(parsed);
}

export async function updateScheduleTodo(
  id: string,
  input: Record<string, FormDataEntryValue | string | boolean | undefined>,
) {
  const parsed = updateTodoSchema.parse({
    title: input.title,
    details:
      input.details === undefined
        ? undefined
        : String(input.details || "").trim() || null,
    isCompleted:
      input.isCompleted === undefined
        ? undefined
        : input.isCompleted === true || input.isCompleted === "true",
  });

  return updateTodo(id, parsed);
}

export async function removeScheduleTodo(id: string) {
  return deleteTodo(id);
}
