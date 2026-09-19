import { isValid, parseISO } from "date-fns";
import { z } from "zod";

import { formatScheduleDate } from "@/features/schedule/lib/format";

export const todoDateSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, context) => {
    const parsed = parseISO(value);

    if (!isValid(parsed)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid todo date.",
      });
      return z.NEVER;
    }

    return formatScheduleDate(parsed);
  });

export const createTodoSchema = z.object({
  isOptional: z.boolean().default(false),
  todoDate: todoDateSchema,
  title: z.string().trim().min(1).max(160),
  details: z.string().trim().max(1000).optional().default(""),
});

export const updateTodoSchema = z.object({
  isOptional: z.boolean().optional(),
  title: z.string().trim().min(1).max(160).optional(),
  details: z.string().trim().max(1000).nullable().optional(),
  isCompleted: z.boolean().optional(),
});
