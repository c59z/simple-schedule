"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";

type Failure = { date: string; reason: string };
type Result = { success: number; failures: Failure[] };

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function GroupCheckbox({ label, dates, selected, toggle, disabled }: {
  label: string; dates: string[]; selected: Set<string>;
  toggle: (dates: string[]) => void; disabled: boolean;
}) {
  const count = dates.filter((date) => selected.has(date)).length;
  return <label className="inline-flex items-center gap-2 py-1">
    <input type="checkbox" disabled={disabled} checked={count === dates.length} ref={(node) => { if (node) node.indeterminate = count > 0 && count < dates.length; }} onChange={() => toggle(dates)} />
    {label} <span className="text-xs text-[#6681ad]">{count}/{dates.length}</span>
  </label>;
}

export function ExportControls({ selectedDate, dates = [] }: { selectedDate: string; dates: string[] }) {
  const t = useTranslations("Export");
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const years = [...new Set(dates.map((date) => date.slice(0, 4)))].sort().reverse();
  const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9dcf7] bg-white/80 px-3 text-sm font-semibold text-[#456898] disabled:cursor-wait disabled:opacity-50";

  function toggle(group: string[]) {
    setSelected((current) => {
      const next = new Set(current);
      const remove = group.every((date) => current.has(date));
      for (const date of group) { if (remove) next.delete(date); else next.add(date); }
      return next;
    });
  }

  async function download(batch: boolean) {
    const requested = batch ? dates.filter((date) => selected.has(date)) : [selectedDate];
    if (!requested.length || busy) return;
    setBusy(true);
    setReceived(0);
    setResult(null);
    try {
      const response = await fetch(batch ? "/api/schedule/export" : `/api/schedule/export?date=${selectedDate}`, batch ? {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dates: requested }),
      } : undefined);
      if (!response.ok) throw new Error("Download failed");
      if (!batch) {
        saveBlob(await response.blob(), `${selectedDate}.md`);
        setResult({ success: 1, failures: [] });
        return;
      }
      if (!response.body) throw new Error("Missing stream");
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      const parts: ArrayBuffer[] = [];
      let pending = "";
      let total = 0;
      let report: Result | null = null;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += value;
          let end: number;
          while ((end = pending.indexOf("\n")) >= 0) {
            const message = JSON.parse(pending.slice(0, end));
            pending = pending.slice(end + 1);
            if (message.type === "chunk") {
              const bytes = Uint8Array.from(atob(message.data), (char) => char.charCodeAt(0));
              parts.push(bytes.buffer);
              total += bytes.length;
            } else if (message.type === "result") report = message;
          }
          setReceived(Math.ceil(total / 1024));
        }
      } finally { await reader.cancel(); reader.releaseLock(); }
      if (!report) throw new Error("Incomplete stream");
      if (report.success > 0) saveBlob(new Blob(parts, { type: "application/zip" }), "schedule.zip");
      setResult(report);
    } catch {
      setResult({ success: 0, failures: requested.map((date) => ({ date, reason: "downloadFailed" })) });
    } finally { setBusy(false); }
  }

  const status = <div role="status" aria-live="polite" className="text-sm text-[#456898]">
    {busy && <p>{t("receiving", { size: received })}</p>}
    {result && <>
      <p>{t("result", { success: result.success, failed: result.failures.length })}</p>
      {result.success > 0 && <p className="text-xs">{t("saveHint")}</p>}
      {result.failures.length > 0 && <ul className="mt-2 max-h-32 overflow-y-auto text-[#b34461]">{result.failures.map((failure) => <li key={failure.date}>{failure.date}: {t(failure.reason === "emptyDay" ? "emptyDay" : failure.reason === "readFailed" ? "readFailed" : "downloadFailed")}</li>)}</ul>}
    </>}
  </div>;

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => download(false)} className={buttonClass}><Download size={16} />{t("single")}</button>
      <button type="button" disabled={busy} onClick={() => dialog.current?.showModal()} className={buttonClass}>{t("batch")}</button>
    </div>
    {status}
    <dialog ref={dialog} aria-labelledby="export-title" onCancel={(event) => { if (busy) event.preventDefault(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl border border-[#c9dcf7] bg-[#f5faff] p-5 text-[#17345f] shadow-xl backdrop:bg-[#16345f]/25">
      <div className="flex items-center justify-between gap-4">
        <h2 id="export-title" className="text-xl font-bold">{t("batch")}</h2>
        <button type="button" disabled={busy} aria-label={t("close")} onClick={() => dialog.current?.close()} className={buttonClass}><X size={16} /></button>
      </div>
      <p className="my-3 text-sm text-[#6681ad]">{t("hint")}</p>
      {dates.length === 0 ? <p>{t("empty")}</p> : <>
        <GroupCheckbox label={t("all")} dates={dates} selected={selected} toggle={toggle} disabled={busy} />
        <div className="my-3 max-h-[40dvh] space-y-2 overflow-y-auto rounded-lg border border-[#dbe9fb] bg-white p-3">
          {years.map((year) => {
            const yearDates = dates.filter((date) => date.startsWith(year));
            const months = [...new Set(yearDates.map((date) => date.slice(0, 7)))].sort().reverse();
            return <details key={year} open>
              <summary className="cursor-pointer font-semibold">{year}</summary>
              <div className="pl-4">
                <GroupCheckbox label={t("year", { year })} dates={yearDates} selected={selected} toggle={toggle} disabled={busy} />
                {months.map((month) => {
                  const monthDates = yearDates.filter((date) => date.startsWith(month));
                  return <details key={month}>
                    <summary className="cursor-pointer py-1">{month}</summary>
                    <div className="pl-4">
                      <GroupCheckbox label={t("month", { month })} dates={monthDates} selected={selected} toggle={toggle} disabled={busy} />
                      {monthDates.map((date) => <label key={date} className="flex items-center gap-2 py-1 pl-4"><input type="checkbox" disabled={busy} checked={selected.has(date)} onChange={() => toggle([date])} />{date}</label>)}
                    </div>
                  </details>;
                })}
              </div>
            </details>;
          })}
        </div>
      </>}
      <button type="button" disabled={busy || !dates.some((date) => selected.has(date))} onClick={() => download(true)} className={buttonClass}>{t("download", { count: dates.filter((date) => selected.has(date)).length })}</button>
      <div className="mt-3">{status}</div>
    </dialog>
  </div>;
}
