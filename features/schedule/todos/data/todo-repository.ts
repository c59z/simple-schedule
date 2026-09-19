import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { scheduleTodos } from "@/db/schema";
import type { ImportTodo } from "../lib/import-markdown";
import type {
  ScheduleTodo,
  ScheduleTodoDaySummary,
  ScheduleTodoInput,
  ScheduleTodoUpdate,
} from "@/features/schedule/todos/types/todo";

function mapTodo(record: typeof scheduleTodos.$inferSelect): ScheduleTodo {
  return {
    id: record.id,
    todoDate: record.todoDate,
    title: record.title,
    details: record.details,
    isCompleted: record.isCompleted,
    isOptional: record.isOptional,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listTodosByDate(todoDate: string) {
  const records = await db
    .select()
    .from(scheduleTodos)
    .where(eq(scheduleTodos.todoDate, todoDate))
    .orderBy(
      asc(scheduleTodos.isCompleted),
      asc(scheduleTodos.sortOrder),
      asc(scheduleTodos.createdAt),
    );

  return records.map(mapTodo);
}

export async function createTodo(input: ScheduleTodoInput) {
  const [{ nextSortOrder }] = await db
    .select({
      nextSortOrder: sql<number>`coalesce(max(${scheduleTodos.sortOrder}), -1) + 1`,
    })
    .from(scheduleTodos)
    .where(eq(scheduleTodos.todoDate, input.todoDate));

  const [record] = await db
    .insert(scheduleTodos)
    .values({
      todoDate: input.todoDate,
      title: input.title,
      isOptional: input.isOptional,
      details: input.details || null,
      sortOrder: Number(nextSortOrder),
    })
    .returning();

  return mapTodo(record);
}

export async function updateTodo(id: string, input: ScheduleTodoUpdate) {
  const [record] = await db
    .update(scheduleTodos)
    .set({
      ...input,
      details:
        input.details === undefined ? undefined : input.details?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(scheduleTodos.id, id))
    .returning();

  return record ? mapTodo(record) : null;
}

export async function deleteTodo(id: string) {
  const [record] = await db
    .delete(scheduleTodos)
    .where(eq(scheduleTodos.id, id))
    .returning();

  return record ? mapTodo(record) : null;
}

export async function deleteTodosByDate(todoDate: string) {
  await db.delete(scheduleTodos).where(eq(scheduleTodos.todoDate, todoDate));
}

export async function listRecentTodoDays() {
  const records = await db
    .select({
      todoDate: scheduleTodos.todoDate,
      totalCount: sql<number>`count(*) filter (where not ${scheduleTodos.isOptional})::int`,
      completedCount:
        sql<number>`count(*) filter (where ${scheduleTodos.isCompleted} and not ${scheduleTodos.isOptional})::int`,
      firstTitle: sql<string>`min(${scheduleTodos.title})`,
    })
    .from(scheduleTodos)
    .groupBy(scheduleTodos.todoDate)
    .orderBy(desc(scheduleTodos.todoDate));

  return records.map(
    (record): ScheduleTodoDaySummary => ({
      todoDate: record.todoDate,
      totalCount: Number(record.totalCount),
      completedCount: Number(record.completedCount),
      firstTitle: record.firstTitle,
    }),
  );
}

export async function importTodos(todoDate: string, todos: ImportTodo[]) {
  return db.transaction(async (transaction) => {
    // Serialize imports for the same day to make retries idempotent.
    await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${`schedule-import:${todoDate}`}))`);
    const existing = await transaction.select().from(scheduleTodos).where(eq(scheduleTodos.todoDate, todoDate));
    const titles = new Set(existing.map((todo) => todo.title.trim()));
    let order = existing.reduce((max, todo) => Math.max(max, todo.sortOrder), -1) + 1;
    const additions = [];
    for (const todo of todos) {
      if (titles.has(todo.title)) continue;
      titles.add(todo.title);
      additions.push({ ...todo, todoDate, sortOrder: order++ });
    }
    if (additions.length) await transaction.insert(scheduleTodos).values(additions);
    return { added: additions.length, skipped: todos.length - additions.length };
  });
}
