import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import GithubSlugger from "github-slugger";

export type TocEntry = {
  id: string;
  title: string;
  level: 2 | 3;
};

const SECTION_FILES = [
  "00-introduction.md",
  "01-common.md",
  "02-admin.md",
  "03-manager.md",
  "04-courier.md",
  "05-client.md",
  "06-conclusion.md",
  "07-appendix.md",
] as const;

const HELP_DIR = path.dirname(fileURLToPath(import.meta.url));

function normalizeMarkdown(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function getHelpMarkdown(): string {
  return normalizeMarkdown(
    SECTION_FILES.map((file) =>
      fs.readFileSync(path.join(HELP_DIR, file), "utf8"),
    ).join("\n\n"),
  );
}

export function extractTocFromMarkdown(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];

  for (const rawLine of normalizeMarkdown(markdown).split("\n")) {
    const line = rawLine.trimEnd();
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const title = match[2].replace(/\s*\{#.+\}\s*$/, "").trim();
    const id = slugger.slug(title) || `section-${toc.length + 1}`;
    toc.push({ id, title, level });
  }

  return toc;
}

export function getHelpDocument() {
  const markdown = getHelpMarkdown();
  return {
    markdown,
    toc: extractTocFromMarkdown(markdown),
  };
}
