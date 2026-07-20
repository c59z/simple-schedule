"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import {
  createTodoAction,
  deleteTodoAction,
  toggleTodoAction,
  updateTodoAction,
} from "@/features/schedule/todos/actions/todo-actions";
import type { ScheduleTodo } from "@/features/schedule/todos/types/todo";

type ScheduleTodoListProps = {
  selectedDate: string;
  todos: ScheduleTodo[];
};

export function ScheduleTodoList({
  selectedDate,
  todos,
}: ScheduleTodoListProps) {
  const t = useTranslations("Todo");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="rounded-lg border border-white/75 bg-white/85 shadow-[0_18px_48px_rgba(89,136,214,0.12)]">
      <div className="flex flex-col gap-3 border-b border-[#e4eefc] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f8fbe]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#153361]">
            {t("title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#2f83e6] px-4 text-sm font-bold text-white transition hover:bg-[#256fca]"
          title={t("add")}
        >
          {isCreating ? <X size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
          {isCreating ? t("cancel") : t("add")}
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        {isCreating ? (
          <form
            action={createTodoAction}
            className="rounded-lg border border-[#dbe9fb] bg-[#f8fbff] p-4"
            onSubmit={() => setIsCreating(false)}
          >
            <input type="hidden" name="todoDate" value={selectedDate} />
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <input
                autoFocus
                name="title"
                required
                maxLength={160}
                placeholder={t("titlePlaceholder")}
                className="h-11 rounded-md border border-[#d5e5fb] bg-white px-3 text-sm text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2f83e6] px-4 text-sm font-bold text-white transition hover:bg-[#256fca]"
              >
                <Plus size={16} aria-hidden />
                {t("create")}
              </button>
            </div>
            <textarea
              name="details"
              maxLength={1000}
              placeholder={t("detailsPlaceholder")}
              className="mt-3 min-h-20 w-full resize-y rounded-md border border-[#d5e5fb] bg-white px-3 py-2 text-sm leading-6 text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
            />
          </form>
        ) : null}

        {todos.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-[#c9dcf7] bg-[#f8fbff] px-6 py-10 text-center">
            <div className="max-w-sm">
              <p className="text-lg font-bold text-[#153361]">
                {t("emptyTitle")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#6681ad]">
                {t("emptyDescription")}
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <li
                  key={todo.id}
                  className="rounded-lg border border-[#dbe9fb] bg-[#fbfdff] p-4"
                >
                  {isEditing ? (
                    <form action={updateTodoAction} className="space-y-3">
                      <input type="hidden" name="id" value={todo.id} />
                      <input
                        name="title"
                        required
                        maxLength={160}
                        defaultValue={todo.title}
                        className="h-11 w-full rounded-md border border-[#d5e5fb] bg-white px-3 text-sm font-semibold text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
                      />
                      <textarea
                        name="details"
                        maxLength={1000}
                        defaultValue={todo.details ?? ""}
                        className="min-h-20 w-full resize-y rounded-md border border-[#d5e5fb] bg-white px-3 py-2 text-sm leading-6 text-[#17345f] outline-none transition focus:border-[#7ebdf7]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          onClick={() => setEditingId(null)}
                          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2f83e6] px-3 text-sm font-bold text-white transition hover:bg-[#256fca]"
                        >
                          <Save size={15} aria-hidden />
                          {t("save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d5e5fb] bg-white px-3 text-sm font-semibold text-[#456898] transition hover:bg-[#f1f7ff]"
                        >
                          <X size={15} aria-hidden />
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex gap-3">
                      <form action={toggleTodoAction} className="pt-0.5">
                        <input type="hidden" name="id" value={todo.id} />
                        <input
                          type="hidden"
                          name="isCompleted"
                          value={String(todo.isCompleted)}
                        />
                        <button
                          type="submit"
                          className={[
                            "flex size-7 items-center justify-center rounded-md border transition",
                            todo.isCompleted
                              ? "border-[#41b883] bg-[#41b883] text-white"
                              : "border-[#b9cceb] bg-white text-transparent hover:text-[#7a9ccd]",
                          ].join(" ")}
                          title={
                            todo.isCompleted ? t("markOpen") : t("markDone")
                          }
                        >
                          <Check size={16} aria-hidden />
                        </button>
                      </form>

                      <div className="min-w-0 flex-1">
                        <p
                          className={[
                            "text-base font-bold text-[#17345f]",
                            todo.isCompleted ? "text-[#7d91ad] line-through" : "",
                          ].join(" ")}
                        >
                          {todo.title}
                        </p>
                        {todo.details ? (
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#6681ad]">
                            {todo.details}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(todo.id)}
                          className="flex size-9 items-center justify-center rounded-md border border-[#d5e5fb] bg-white text-[#456898] transition hover:bg-[#f1f7ff]"
                          title={t("edit")}
                        >
                          <Pencil size={16} aria-hidden />
                        </button>
                        <form action={deleteTodoAction}>
                          <input type="hidden" name="id" value={todo.id} />
                          <button
                            type="submit"
                            className="flex size-9 items-center justify-center rounded-md border border-[#ffd1d8] bg-white text-[#c14f76] transition hover:bg-[#fff4f6]"
                            title={t("delete")}
                          >
                            <Trash2 size={16} aria-hidden />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
