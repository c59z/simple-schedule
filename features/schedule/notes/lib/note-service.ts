import { isValid, parseISO } from "date-fns";

import { formatScheduleDate } from "@/features/schedule/lib/format";
import {
  getDayNote,
  listRecentDayNotes,
  upsertDayNote,
} from "@/features/schedule/notes/data/note-repository";
import { saveDayNoteSchema } from "@/features/schedule/notes/lib/validation";

function buildDefaultMarkdown(noteDate: string) {
  return `# ${noteDate} Schedule

## Tasks

- [ ] 

## Notes

`;
}

export async function getScheduleNotePage(date?: string) {
  const parsedDate = date ? parseISO(date) : new Date();
  const selectedDate = isValid(parsedDate)
    ? formatScheduleDate(parsedDate)
    : formatScheduleDate(new Date());
  const [note, recentNotes] = await Promise.all([
    getDayNote(selectedDate),
    listRecentDayNotes(),
  ]);

  return {
    selectedDate,
    selectedDateValue: parseISO(selectedDate),
    note:
      note ?? {
        noteDate: selectedDate,
        content: buildDefaultMarkdown(selectedDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    recentNotes,
  };
}

export async function saveScheduleDayNote(input: Record<string, FormDataEntryValue>) {
  const parsed = saveDayNoteSchema.parse({
    noteDate: input.noteDate,
    content: input.content,
  });

  return upsertDayNote(parsed.noteDate, parsed.content);
}
