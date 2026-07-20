import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { scheduleDayNotes } from "@/db/schema";
import type {
  ScheduleDayNote,
  ScheduleDayNoteSummary,
} from "@/features/schedule/notes/types/note";

function mapNote(
  record: typeof scheduleDayNotes.$inferSelect,
): ScheduleDayNote {
  return {
    noteDate: record.noteDate,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function summarizeContent(content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      title: "Untitled",
      preview: "",
    };
  }

  const lines = trimmed
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);

  const title = lines[0] || "Untitled";
  const preview = lines.slice(1).join(" ").slice(0, 90);

  return {
    title,
    preview,
  };
}

export async function getDayNote(noteDate: string) {
  const [record] = await db
    .select()
    .from(scheduleDayNotes)
    .where(eq(scheduleDayNotes.noteDate, noteDate))
    .limit(1);

  return record ? mapNote(record) : null;
}

export async function upsertDayNote(noteDate: string, content: string) {
  const [record] = await db
    .insert(scheduleDayNotes)
    .values({
      noteDate,
      content,
    })
    .onConflictDoUpdate({
      target: scheduleDayNotes.noteDate,
      set: {
        content,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapNote(record);
}

export async function listRecentDayNotes(limit = 20) {
  const records = await db
    .select()
    .from(scheduleDayNotes)
    .orderBy(desc(scheduleDayNotes.noteDate), desc(scheduleDayNotes.updatedAt))
    .limit(limit);

  return records.map((record): ScheduleDayNoteSummary => {
    const summary = summarizeContent(record.content);

    return {
      noteDate: record.noteDate,
      title: summary.title,
      preview: summary.preview,
      updatedAt: record.updatedAt,
    };
  });
}
