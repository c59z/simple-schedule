import { endOfDay, isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";

const eventStatusSchema = z.enum(["scheduled", "completed", "cancelled"]);

const isoDateTimeSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, context) => {
    const parsed = parseISO(value);

    if (!isValid(parsed)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid datetime value.",
      });
      return z.NEVER;
    }

    return parsed;
  });

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1000).optional().default(""),
    startsAt: isoDateTimeSchema,
    endsAt: isoDateTimeSchema,
  })
  .refine((value) => value.startsAt < value.endsAt, {
    message: "End time must be after start time.",
    path: ["endsAt"],
  });

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    startsAt: isoDateTimeSchema.optional(),
    endsAt: isoDateTimeSchema.optional(),
    status: eventStatusSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.startsAt && value.endsAt && value.startsAt >= value.endsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time.",
        path: ["endsAt"],
      });
    }
  });

export const scheduleDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return new Date();
    }

    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  });

export function buildDayRange(value?: string) {
  const date = scheduleDateSchema.parse(value);

  return {
    selectedDate: date,
    from: startOfDay(date),
    to: endOfDay(date),
  };
}
