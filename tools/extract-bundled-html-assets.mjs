import { gunzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node tools/extract-bundled-html-assets.mjs <input.html> <output.html>");
  process.exit(1);
}

const source = readFileSync(inputPath, "utf8");

function readScript(type) {
  const pattern = new RegExp(
    `<script[^>]+type=["']${type.replace("/", "\\/")}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i",
  );
  const match = source.match(pattern);
  return match ? match[1].trim() : null;
}

const manifestRaw = readScript("__bundler/manifest");
const templateRaw = readScript("__bundler/template");

if (!manifestRaw || !templateRaw) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, source, "utf8");
  console.log(`Copied ${inputPath} -> ${outputPath} (no bundler manifest found)`);
  process.exit(0);
}

const manifest = JSON.parse(manifestRaw);
let template = JSON.parse(templateRaw);
const pageSlug = basename(outputPath, extname(outputPath));
const assetDir = join(dirname(outputPath), "assets", pageSlug);
mkdirSync(assetDir, { recursive: true });

const mimeToExt = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["font/woff2", ".woff2"],
  ["font/woff", ".woff"],
  ["application/font-woff2", ".woff2"],
  ["application/octet-stream", ".bin"],
]);

let count = 0;

for (const [uuid, entry] of Object.entries(manifest)) {
  const ext = mimeToExt.get(entry.mime) || ".bin";
  const outName = `asset-${String(++count).padStart(3, "0")}${ext}`;
  const outPath = join(assetDir, outName);
  let bytes = Buffer.from(entry.data, "base64");
  if (entry.compressed) bytes = gunzipSync(bytes);
  writeFileSync(outPath, bytes);

  const relPath = relative(dirname(outputPath), outPath).replaceAll("\\", "/");
  template = template.split(uuid).join(relPath);
}

template = template
  .replace(/\s+integrity="[^"]*"/gi, "")
  .replace(/\s+crossorigin="[^"]*"/gi, "");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, template, "utf8");

console.log(`Extracted ${count} assets from ${inputPath}`);
console.log(`Wrote ${outputPath}`);
