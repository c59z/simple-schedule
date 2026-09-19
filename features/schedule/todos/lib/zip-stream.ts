import { deflateRawSync } from "node:zlib";

export type ZipEntry = { name: string; content: string };

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});

function crc32(data: Buffer) {
  let value = 0xffffffff;
  for (const byte of data) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

// Keep only the central directory in memory; compress and emit one entry at a time.
export async function* zipStream(entries: AsyncIterable<ZipEntry>) {
  const directory: Buffer[] = [];
  let offset = 0;
  for await (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = Buffer.from(entry.content);
    const compressed = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    local.copy(central, 6, 4, 30);
    central.writeUInt32LE(offset, 42);
    directory.push(Buffer.concat([central, name]));
    yield Buffer.concat([local, name]);
    for (let start = 0; start < compressed.length; start += 65536) yield compressed.subarray(start, start + 65536);
    offset += local.length + name.length + compressed.length;
    if (offset > 0xffffffff || directory.length > 65535) throw new Error("ZIP size limit exceeded");
  }
  const size = directory.reduce((total, entry) => total + entry.length, 0);
  for (const entry of directory) yield entry;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(directory.length, 8);
  end.writeUInt16LE(directory.length, 10);
  end.writeUInt32LE(size, 12);
  end.writeUInt32LE(offset, 16);
  yield end;
}
