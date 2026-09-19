import { getLocale } from "next-intl/server";

import { NoteHeader } from "@/components/schedule/note-header";
import { Sidebar } from "@/components/schedule/sidebar";
import { ScheduleSettings } from "@/components/schedule/schedule-settings";
import { ScheduleTodoList } from "@/components/schedule/todos/schedule-todo-list";
import { getScheduleTodoPage } from "@/features/schedule/todos/lib/todo-service";

export default async function SchedulePage(props: PageProps<"/schedule">) {
  const locale = await getLocale();
  const searchParams = await props.searchParams;
  const schedule = await getScheduleTodoPage(
    typeof searchParams.date === "string" ? searchParams.date : undefined,
  );
  const requiredTodos = schedule.todos.filter((todo) => !todo.isOptional);
  const completedCount = requiredTodos.filter((todo) => todo.isCompleted).length;

  return (
    <main className="w-full flex-1 p-2 md:p-4">
      <div className="grid overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-xl shadow-blue-100/40 md:h-[calc(100dvh-2rem)] md:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar
          locale={locale}
          recentDays={schedule.recentDays}
          selectedDate={schedule.selectedDateValue}
        />

        <div className="min-w-0 overflow-y-auto overscroll-contain p-4 md:p-8">
          <div className="mb-3 flex justify-end">
            <ScheduleSettings date={schedule.selectedDate} />
          </div>
          <NoteHeader
            completedCount={completedCount}
            locale={locale}
            selectedDate={schedule.selectedDateValue}
            todoCount={requiredTodos.length}
          />
          <ScheduleTodoList
            key={schedule.selectedDate}
            selectedDate={schedule.selectedDate}
            todos={schedule.todos}
            dates={schedule.recentDays.map((day) => day.todoDate)}
          />
        </div>
      </div>
    </main>
  );
}
