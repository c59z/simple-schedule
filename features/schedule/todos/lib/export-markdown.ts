import type { ScheduleTodo } from "../types/todo";

function escapeText(value: string) {
  return value.replace(/\r?\n/g, " ").replace(/[\\`*_{}\[\]<>#|]/g, "\\$&");
}

export function exportMarkdown(date: string, todos: ScheduleTodo[]) {
  const title = `${date} 日程`;
  const lines = [
    `# ${title}`, "", "- 文件夹：日程", `- 日期：${date}`, "", title, "",
    ...todos.map((todo) => `- [${todo.isCompleted ? "x" : " "}] ${todo.isOptional ? "（可选）" : ""}${escapeText(todo.title)}`),
  ];
  if (todos.length === 0) lines.push("当天暂无待办。");
  return `${lines.join("\n")}\n`;
}
