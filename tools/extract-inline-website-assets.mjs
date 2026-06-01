import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const siteDir = new URL("website/", root);
const stylesDir = new URL("website/assets/styles/", root);
const scriptsDir = new URL("website/assets/scripts/", root);

const pages = [
  "index.html",
  "goldfish-society.html",
  "goldfish-games.html",
];

function pageSlug(fileName) {
  return path.basename(fileName, ".html").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

function extractAttributes(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/\s([a-zA-Z0-9:-]+)(?:=(["'])(.*?)\2|=([^\s>]+))?/g)) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function indentOf(html, index) {
  const lineStart = html.lastIndexOf("\n", index) + 1;
  const prefix = html.slice(lineStart, index);
  return prefix.match(/^\s*/)?.[0] ?? "";
}

function rewriteCssUrls(css) {
  return css.replace(/url\((["']?)assets\//g, "url($1../");
}

function keepOneStylesheetLink(html, slug) {
  const linkPattern = new RegExp(
    `\\s*<link\\s+rel=["']stylesheet["']\\s+href=["']assets/styles/${slug}\\.css["']>\\s*`,
    "gi",
  );
  let seen = false;

  return html.replace(linkPattern, (match) => {
    if (seen) {
      return "\n";
    }

    seen = true;
    return match;
  });
}

await mkdir(stylesDir, { recursive: true });
await mkdir(scriptsDir, { recursive: true });

for (const fileName of pages) {
  const slug = pageSlug(fileName);
  const pageUrl = new URL(fileName, siteDir);
  let html = await readFile(pageUrl, "utf8");

  const cssBlocks = [];
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (full, css, offset) => {
    cssBlocks.push(css.trim());
    return `${indentOf(html, offset)}<link rel="stylesheet" href="assets/styles/${slug}.css">`;
  });

  const jsBlocks = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, rawAttrs, js, offset) => {
    const attrs = extractAttributes(`<script${rawAttrs}>`);
    if (attrs.src || attrs.type) {
      return full;
    }

    jsBlocks.push(js.trim());
    return `${indentOf(html, offset)}<script src="assets/scripts/${slug}.js"></script>`;
  });

  if (cssBlocks.length > 0) {
    const css = rewriteCssUrls(cssBlocks.join("\n\n/* --- */\n\n")) + "\n";
    await writeFile(new URL(`${slug}.css`, stylesDir), css, "utf8");
  }

  if (jsBlocks.length > 0) {
    const js = jsBlocks.join("\n\n// ---\n\n") + "\n";
    await writeFile(new URL(`${slug}.js`, scriptsDir), js, "utf8");
  }

  html = keepOneStylesheetLink(html, slug);

  await writeFile(pageUrl, html, "utf8");
  console.log(`${fileName}: ${cssBlocks.length} CSS block(s), ${jsBlocks.length} JS block(s)`);
}
