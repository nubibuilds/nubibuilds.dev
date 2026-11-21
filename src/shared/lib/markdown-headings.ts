/*
 * Reading the ATX headings (`#`, `##` …) of a Markdown source without parsing it. Lines inside
 * fenced code blocks (and, on request, the frontmatter) are skipped, so a `# comment` in a shell
 * block or in the YAML is not taken for a heading.
 */

/**
 * Lines outside fenced code blocks. With `frontmatter: true` (a whole file, not an entry's
 * `body`), a leading `---` … `---` block is skipped too.
 */
export function proseLines(source: string, { frontmatter = false } = {}): string[] {
  const all = source.split(/\r?\n/);
  let start = 0;
  if (frontmatter && all[0]?.trim() === '---') {
    const end = all.findIndex((line, i) => i > 0 && line.trim() === '---');
    if (end > 0) start = end + 1;
  }

  const lines: string[] = [];
  let fence: string | null = null;
  for (const line of all.slice(start)) {
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    if (open) {
      fence = open[1];
      continue;
    }
    lines.push(line);
  }
  return lines;
}

/** The heading lines of a given level (1 for `#`, 2 for `##` …), trimmed. */
export function headingLines(source: string, depth: number, options?: { frontmatter?: boolean }): string[] {
  const pattern = new RegExp(`^ {0,3}#{${depth}}(?!#)(\\s|$)`);
  return proseLines(source, options)
    .filter((line) => pattern.test(line))
    .map((line) => line.trim());
}
