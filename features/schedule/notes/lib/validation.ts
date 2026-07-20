import { isValid, parseISO } from "date-fns";
import { z } from "zod";

import { formatScheduleDate } from "@/features/schedule/lib/format";

export const noteDateSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, context) => {
    const parsed = parseISO(value);

    if (!isValid(parsed)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid note date.",
      });
      return z.NEVER;
    }

    return formatScheduleDate(parsed);
  });

export const noteContentSchema = z.string().max(50000);

export const saveDayNoteSchema = z.object({
  noteDate: noteDateSchema,
  content: noteContentSchema,
});
