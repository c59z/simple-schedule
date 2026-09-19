export type ImportTodo = { title: string; isCompleted: boolean; isOptional: boolean };
export type ImportPreview = { date: string; todos: ImportTodo[]; conflictingDates: string[] };

export function isImportDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function findDate(text: string) {
  const match = text.match(/(?:^|[^\d])(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?!\d)/);
  if (!match) return "";
  const value = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return isImportDate(value) ? value : "";
}

export function parseImportMarkdown(content: string, filename: string): ImportPreview {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim());
  const heading = lines.find((line) => /^#\s+/.test(line)) ?? "";
  const metadata = lines.find((line) => /^-\s*日期[：:]/.test(line)) ?? "";
  const date = findDate(heading) || findDate(filename) || findDate(metadata);
  const bodyDates = lines.filter((line) => !/^[-*+]\s+\[[ xX]\]/.test(line) && /スケジュール|日程/.test(line)).map(findDate);
  const conflictingDates = [...new Set([findDate(heading), findDate(filename), ...bodyDates].filter((value) => value && value !== date))];
  const todos: ImportTodo[] = [];
  for (const line of lines) {
    const task = line.match(/^[-*+]\s+\[([ xX])\]\s*(.*)$/);
    if (!line || /^#/.test(line) || /^-\s*(文件夹|日期)[：:]/.test(line) || /^[-*_]{3,}$/.test(line)) continue;
    if (!task && findDate(line) && /スケジュール|日程/.test(line)) continue;
    if (!task && (/^[一二三四五六七八九十]+月.*日/.test(line) || line === "当天暂无待办。")) continue;
    let title = task ? task[2] : line.replace(/^[-*+]\s+/, "");
    const isOptional = title.startsWith("（可选）");
    if (isOptional) title = title.slice(4);
    title = title.replace(/\\([\\`*_{}\[\]<>#|])/g, "$1").trim();
    if (title) todos.push({ title, isCompleted: !!task && task[1].toLowerCase() === "x", isOptional });
  }
  return { date, todos, conflictingDates };
}
