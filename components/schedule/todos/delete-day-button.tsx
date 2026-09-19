"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteDayAction } from "@/features/schedule/todos/actions/todo-actions";

export function DeleteDayButton({ date, count }: { date: string; count: number }) {
  const t = useTranslations("DeleteDay");
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function remove() {
    setError(false);
    startTransition(async () => {
      try {
        await deleteDayAction(date);
        setDeleted(true);
        dialog.current?.close();
      } catch { setError(true); }
    });
  }

  return <div>
    <button type="button" disabled={count === 0 || pending} onClick={() => { setError(false); setDeleted(false); dialog.current?.showModal(); }} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#ffd1d8] bg-white px-3 text-sm text-[#b34461] disabled:cursor-not-allowed disabled:opacity-40">
      <Trash2 size={16} aria-hidden />{t("button")}
    </button>
    {deleted && count === 0 && <p role="status" className="mt-2 text-sm text-[#456898]">{t("success")}</p>}
    <dialog ref={dialog} aria-labelledby="delete-day-title" onCancel={(event) => { if (pending) event.preventDefault(); }} className="fixed inset-0 m-auto w-[min(92vw,440px)] rounded-2xl border border-[#dbe9fb] bg-white p-6 text-[#17345f] shadow-xl backdrop:bg-[#16345f]/25">
      <h2 id="delete-day-title" className="text-xl font-bold">{t("button")}</h2>
      <p className="my-4 text-sm leading-7">{t("confirm", { date, count })}</p>
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{t("error")}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={pending} onClick={() => dialog.current?.close()} className="rounded-md border border-[#dbe9fb] px-4 py-2 text-sm">{t("cancel")}</button>
        <button type="button" disabled={pending} onClick={remove} className="rounded-md bg-[#b34461] px-4 py-2 text-sm text-white disabled:opacity-50">{pending ? t("pending") : t("delete")}</button>
      </div>
    </dialog>
  </div>;
}
