import { getLocale } from "next-intl/server";

import { NoteHeader } from "@/components/schedule/note-header";
import { Sidebar } from "@/components/schedule/sidebar";
import { ScheduleTodoList } from "@/components/schedule/todos/schedule-todo-list";
import { getScheduleTodoPage } from "@/features/schedule/todos/lib/todo-service";

export default async function SchedulePage(props: PageProps<"/schedule">) {
  const locale = await getLocale();
  const searchParams = await props.searchParams;
  const schedule = await getScheduleTodoPage(
    typeof searchParams.date === "string" ? searchParams.date : undefined,
  );
  const completedCount = schedule.todos.filter((todo) => todo.isCompleted).length;

  return (
    <main className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar
          locale={locale}
          recentDays={schedule.recentDays}
          selectedDate={schedule.selectedDateValue}
        />

        <div className="min-w-0 space-y-6">
          <NoteHeader
            completedCount={completedCount}
            locale={locale}
            selectedDate={schedule.selectedDateValue}
            todoCount={schedule.todos.length}
          />
          <ScheduleTodoList
            selectedDate={schedule.selectedDate}
            todos={schedule.todos}
          />
        </div>
      </div>
    </main>
  );
}
