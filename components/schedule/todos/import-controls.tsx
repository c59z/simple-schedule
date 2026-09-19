"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { isImportDate, parseImportMarkdown, type ImportPreview } from "@/features/schedule/todos/lib/import-markdown";

type Preview = ImportPreview & { name: string; error?: string };
type Outcome = { name: string; date: string; added?: number; skipped?: number; error?: string };

export function ImportControls() {
  const t = useTranslations("Import");
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const button = "rounded-md border border-[#c9dcf7] bg-white px-3 py-2 text-sm text-[#456898] disabled:opacity-50";

  async function readFiles(files: File[]) {
    setError("");
    setOutcomes([]);
    setPreviews([]);
    if (files.length > 1000 || files.reduce((sum, file) => sum + file.size, 0) > 10 * 1024 * 1024) { setError("limit"); return; }
    setBusy(true);
    try {
      const next: Preview[] = [];
      for (const file of files) {
        try {
          if (!/\.md$/i.test(file.name) || file.size > 256 * 1024) throw new Error("invalid");
          const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
          const parsed = parseImportMarkdown(text, file.name);
          next.push({ ...parsed, name: file.name, error: !parsed.todos.length || parsed.todos.length > 500 || parsed.todos.some((todo) => todo.title.length > 160) ? "invalid" : undefined });
        } catch { next.push({ name: file.name, date: "", todos: [], conflictingDates: [], error: "invalid" }); }
      }
      setPreviews(next);
    } finally { setBusy(false); }
  }

  async function upload() {
    setBusy(true);
    setOutcomes([]);
    try {
      for (const [index, preview] of previews.entries()) {
        setProgress(t("progress", { current: index + 1, total: previews.length, name: preview.name }));
        const outcome: Outcome = { name: preview.name, date: preview.date };
        if (preview.error || !isImportDate(preview.date)) outcome.error = preview.error || "dateRequired";
        else {
          try {
            const response = await fetch("/api/schedule/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: preview.date, todos: preview.todos }) });
            if (!response.ok) throw new Error("failed");
            Object.assign(outcome, await response.json());
          } catch { outcome.error = "failed"; }
        }
        setOutcomes((current) => [...current, outcome]);
      }
    } finally { setBusy(false); setProgress(""); router.refresh(); }
  }

  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className="mt-2 w-full py-1 text-xs text-[#6681ad] underline-offset-4 hover:underline">{t("open")}</button>
    <dialog ref={dialog} aria-labelledby="import-title" onCancel={(event) => { if (busy) event.preventDefault(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(94vw,640px)] overflow-y-auto rounded-2xl border border-[#c9dcf7] bg-[#f5faff] p-5 text-[#17345f] shadow-xl backdrop:bg-[#16345f]/25">
      <div className="flex items-center justify-between gap-3"><h2 id="import-title" className="text-xl font-bold">{t("title")}</h2><button className={button} disabled={busy} onClick={() => dialog.current?.close()}>{t("close")}</button></div>
      <p className="my-3 text-sm leading-6">{t("hint")}</p>
      <label className="block text-sm">{t("files")}<input type="file" multiple accept=".md,text/markdown" disabled={busy} onChange={(event) => { void readFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} className="my-2 block w-full text-sm" /></label>
      {error && <p role="alert">{t("limit")}</p>}
      <div className="my-3 max-h-[40dvh] space-y-3 overflow-y-auto">
        {previews.map((preview, index) => <div key={index} className="rounded-lg border border-[#dbe9fb] bg-white p-3 text-sm">
          <p className="break-all font-semibold">{preview.name}</p>
          <label className="my-2 flex flex-wrap items-center gap-2">{t("date")}<input type="date" disabled={busy} value={preview.date} onChange={(event) => setPreviews((current) => current.map((item, position) => position === index ? { ...item, date: event.target.value } : item))} className="rounded border border-[#c9dcf7] p-1" /></label>
          {preview.conflictingDates.length > 0 && <p className="text-amber-700">{t("conflict", { dates: preview.conflictingDates.join(", ") })}</p>}
          {!isImportDate(preview.date) && <p className="text-red-700">{t("dateRequired")}</p>}
          {preview.error ? <p className="text-red-700">{t("invalid")}</p> : <details><summary className="cursor-pointer">{t("tasks", { count: preview.todos.length })}</summary><ul className="mt-2 space-y-1">{preview.todos.map((todo, taskIndex) => <li key={taskIndex} className="break-words">{todo.isCompleted ? "[x]" : "[ ]"} {todo.isOptional ? t("optional") : ""}{todo.title}</li>)}</ul></details>}
        </div>)}
      </div>
      <button disabled={busy || previews.length === 0} onClick={upload} className={button}>{t("confirm")}</button>
      <div role="status" aria-live="polite" className="mt-3 text-sm">
        {busy && <p>{progress || t("reading")}</p>}
        {outcomes.length > 0 && <><p>{t("result", { success: outcomes.filter((item) => !item.error).length, failed: outcomes.filter((item) => item.error).length })}</p><ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">{outcomes.map((item, index) => <li key={index} className="break-words">{item.name} ({item.date || "-"}): {item.error ? t(item.error === "dateRequired" ? "dateRequired" : item.error === "invalid" ? "invalid" : "failed") : t("added", { added: item.added ?? 0, skipped: item.skipped ?? 0 })}</li>)}</ul></>}
      </div>
    </dialog>
  </>;
}
