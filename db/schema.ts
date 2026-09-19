import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
  "scheduled",
  "completed",
  "cancelled",
]);

export const scheduleEvents = pgTable(
  "schedule_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endsAt: timestamp("ends_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    status: eventStatusEnum("status").notNull().default("scheduled"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    startsAtIndex: index("schedule_events_starts_at_idx").on(table.startsAt),
    statusIndex: index("schedule_events_status_idx").on(table.status),
    updatedAtIndex: index("schedule_events_updated_at_idx").on(table.updatedAt),
    validRangeCheck: check(
      "schedule_events_valid_range_check",
      sql`${table.startsAt} < ${table.endsAt}`,
    ),
  }),
);

export const scheduleDayNotes = pgTable(
  "schedule_day_notes",
  {
    noteDate: date("note_date", { mode: "string" }).primaryKey(),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    updatedAtIndex: index("schedule_day_notes_updated_at_idx").on(table.updatedAt),
  }),
);

export const scheduleTodos = pgTable(
  "schedule_todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    todoDate: date("todo_date", { mode: "string" }).notNull(),
    title: text("title").notNull(),
    details: text("details"),
    isOptional: boolean("is_optional").notNull().default(false),
    isCompleted: boolean("is_completed").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    dateIndex: index("schedule_todos_todo_date_idx").on(table.todoDate),
    completedIndex: index("schedule_todos_is_completed_idx").on(
      table.isCompleted,
    ),
    sortIndex: index("schedule_todos_sort_idx").on(
      table.todoDate,
      table.sortOrder,
      table.createdAt,
    ),
  }),
);

export type ScheduleEventRecord = typeof scheduleEvents.$inferSelect;
export type NewScheduleEventRecord = typeof scheduleEvents.$inferInsert;
export type ScheduleDayNoteRecord = typeof scheduleDayNotes.$inferSelect;
export type NewScheduleDayNoteRecord = typeof scheduleDayNotes.$inferInsert;
export type ScheduleTodoRecord = typeof scheduleTodos.$inferSelect;
export type NewScheduleTodoRecord = typeof scheduleTodos.$inferInsert;
