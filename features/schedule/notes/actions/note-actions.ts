"use server";

import { revalidatePath } from "next/cache";

import { saveScheduleDayNote } from "@/features/schedule/notes/lib/note-service";

export type SaveDayNoteState = {
  message: string;
  savedAt: string | null;
};

export async function saveDayNoteAction(
  _previousState: SaveDayNoteState,
  formData: FormData,
): Promise<SaveDayNoteState> {
  const entries = Object.fromEntries(formData.entries());
  const note = await saveScheduleDayNote(entries);

  revalidatePath("/schedule");

  return {
    message: "saved",
    savedAt: note.updatedAt.toISOString(),
  };
}
