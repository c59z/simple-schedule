import { revalidatePath } from "next/cache";
import { z } from "zod";
import { importTodos } from "@/features/schedule/todos/data/todo-repository";

const schema = z.object({
  date: z.iso.date(),
  todos: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    isCompleted: z.boolean(),
    isOptional: z.boolean(),
  })).min(1).max(500),
});

export async function POST(request: Request) {
  // Bound the body while reading, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "invalid" }, { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1024 * 1024) {
        await reader.cancel();
        return Response.json({ error: "invalid" }, { status: 413 });
      }
      chunks.push(value);
    }
    const parsed = schema.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
    const result = await importTodos(parsed.data.date, parsed.data.todos);
    revalidatePath("/schedule");
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "invalid" : "failed" }, { status: error instanceof SyntaxError ? 400 : 500 });
  } finally { reader.releaseLock(); }
}
