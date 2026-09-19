import { z } from "zod";
import { listTodosByDate } from "@/features/schedule/todos/data/todo-repository";
import { exportMarkdown } from "@/features/schedule/todos/lib/export-markdown";
import { zipStream } from "@/features/schedule/todos/lib/zip-stream";

export const runtime = "nodejs";
const dateSchema = z.iso.date();
const requestSchema = z.object({ dates: z.array(dateSchema).min(1).max(10000) });

export async function GET(request: Request) {
  const parsed = dateSchema.safeParse(new URL(request.url).searchParams.get("date"));
  if (!parsed.success) return Response.json({ error: "invalidDate" }, { status: 400 });
  try {
    const todos = await listTodosByDate(parsed.data);
    return new Response(exportMarkdown(parsed.data, todos), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${parsed.data}.md"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "readFailed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalidSelection" }, { status: 400 });
  const dates = [...new Set(parsed.data.dates)].sort();
  const result = { success: 0, failures: [] as { date: string; reason: string }[] };
  async function* entries() {
    for (const date of dates) {
      if (request.signal.aborted) return;
      try {
        const todos = await listTodosByDate(date);
        if (!todos.length) {
          result.failures.push({ date, reason: "emptyDay" });
          continue;
        }
        yield { name: `${date.slice(0, 4)}/${date.slice(5, 7)}/${date}.md`, content: exportMarkdown(date, todos) };
        result.success++;
      } catch {
        result.failures.push({ date, reason: "readFailed" });
      }
    }
    yield { name: "export-report.json", content: JSON.stringify(result, null, 2) };
  }
  // NDJSON carries ZIP chunks and a final report without buffering the archive.
  async function* messages() {
    for await (const chunk of zipStream(entries())) {
      yield JSON.stringify({ type: "chunk", data: chunk.toString("base64") }) + "\n";
    }
    yield JSON.stringify({ type: "result", ...result }) + "\n";
  }
  const iterator = messages();
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(next.value));
      } catch (error) { controller.error(error); }
    },
    async cancel() { await iterator.return(); },
  }), { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
