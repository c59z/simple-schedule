import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

const source = await readFile(new URL("../components/schedule/todos/export-controls.tsx", import.meta.url), "utf8");
const messages = JSON.parse(await readFile(new URL("../messages/zh.json", import.meta.url), "utf8"));
const output = new URL("../temp/runtime/export-controls-check.mjs", import.meta.url);
await mkdir(new URL("../temp/runtime/", import.meta.url), { recursive: true });
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
await writeFile(output, compiled.outputText);
const { ExportControls } = await import(output.href);

function render(dates) {
  return renderToStaticMarkup(createElement(NextIntlClientProvider, {
    locale: "zh", timeZone: "Asia/Shanghai", messages,
  }, createElement(ExportControls, { selectedDate: "2026-09-19", dates })));
}

test("missing date props render an empty export selector without crashing", () => {
  const html = render(undefined);
  assert.ok(html.includes(messages.Export.empty));
  assert.ok(html.includes(messages.Export.single));
  assert.match(html, /disabled=""[^>]*>下载选中的 0 天/);
});

test("empty and populated date lists still render correctly", () => {
  assert.ok(render([]).includes(messages.Export.empty));
  const html = render(["2026-09-19"]);
  assert.ok(html.includes("2026-09-19"));
  assert.ok(!html.includes(messages.Export.empty));
});
