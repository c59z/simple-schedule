import assert from "node:assert/strict";
import test from "node:test";
import { crc32, inflateRawSync } from "node:zlib";
import { exportMarkdown } from "../features/schedule/todos/lib/export-markdown.ts";
import { zipStream } from "../features/schedule/todos/lib/zip-stream.ts";

test("Markdown preserves task status and escapes user formatting", () => {
  const markdown = exportMarkdown("2026-09-19", [
    { title: "Read [chapter]", isCompleted: true, isOptional: false },
    { title: "Extra\npractice", isCompleted: false, isOptional: true },
  ]);
  assert.match(markdown, /^# 2026-09-19 日程/);
  assert.ok(markdown.includes("- 文件夹：日程\n- 日期：2026-09-19"));
  assert.ok(markdown.includes("- [x] Read \\[chapter\\]"));
  assert.ok(markdown.includes("- [ ] （可选）Extra practice"));
  assert.match(exportMarkdown("2026-09-19", []), /当天暂无待办/);
});

test("streamed ZIP has valid UTF-8 entries, CRCs and central-directory offsets", async () => {
  const expected = [
    { name: "2026/09/2026-09-19.md", content: "# 中文日程\n- [x] 完成\n" },
    { name: "export-report.json", content: '{"success":1,"failures":[]}' },
  ];
  async function* entries() { yield* expected; }
  const chunks = [];
  for await (const chunk of zipStream(entries())) chunks.push(chunk);
  assert.ok(chunks.length > expected.length);
  const zip = Buffer.concat(chunks);
  const end = zip.subarray(-22);
  assert.equal(end.readUInt32LE(0), 0x06054b50);
  assert.equal(end.readUInt16LE(10), expected.length);
  let centralOffset = end.readUInt32LE(16);
  for (const entry of expected) {
    assert.equal(zip.readUInt32LE(centralOffset), 0x02014b50);
    const offset = zip.readUInt32LE(centralOffset + 42);
    assert.equal(zip.readUInt32LE(offset), 0x04034b50);
    assert.equal(zip.readUInt16LE(offset + 6), 0x800);
    const size = zip.readUInt32LE(offset + 18);
    const nameSize = zip.readUInt16LE(offset + 26);
    assert.equal(zip.subarray(offset + 30, offset + 30 + nameSize).toString(), entry.name);
    const data = inflateRawSync(zip.subarray(offset + 30 + nameSize, offset + 30 + nameSize + size));
    assert.equal(data.toString(), entry.content);
    assert.equal(zip.readUInt32LE(offset + 14), crc32(data));
    centralOffset += 46 + nameSize;
  }
  assert.equal(centralOffset, zip.length - 22);
});
