import assert from "node:assert/strict";
import test from "node:test";
import { parseImportMarkdown, isImportDate } from "../features/schedule/todos/lib/import-markdown.ts";
import { exportMarkdown } from "../features/schedule/todos/lib/export-markdown.ts";

test("iCloud title date wins over modification and mismatched body dates", () => {
  const result = parseImportMarkdown("# 2025-11-21 金 スケジュール\n\n- 文件夹：スケジュール\n- 日期：25/11/23\n\n2026-7-30 スケジュール\n-----\n七月(しちがつ)三十日(さんじゅうにち)\n復習\nNextjs 中 104", "004-2025-11-21 金 スケジュール.md");
  assert.equal(result.date, "2025-11-21");
  assert.deepEqual(result.conflictingDates, ["2026-07-30"]);
  assert.deepEqual(result.todos.map(todo => todo.title), ["復習", "Nextjs 中 104"]);
  assert.ok(result.todos.every(todo => !todo.isCompleted && !todo.isOptional));
});

test("exported Markdown round-trips completion, optional status and escaping", () => {
  const todos = [
    { title: "Read [chapter] #1", isCompleted: true, isOptional: true },
    { title: "准备 2027-01-01 日程", isCompleted: false, isOptional: false },
  ];
  const result = parseImportMarkdown(exportMarkdown("2026-09-19", todos), "2026-09-19.md");
  assert.deepEqual(result.todos, todos);
  assert.equal(result.date, "2026-09-19");
});

test("missing and invalid dates are not silently replaced with today", () => {
  assert.equal(parseImportMarkdown("- task", "unknown.md").date, "");
  assert.equal(parseImportMarkdown("# 2026-2-30\n- task", "unknown.md").date, "");
  assert.equal(isImportDate("2026-02-30"), false);
  assert.equal(isImportDate("2024-02-29"), true);
  assert.deepEqual(parseImportMarkdown(exportMarkdown("2026-09-19", []), "day.md").todos, []);
});
