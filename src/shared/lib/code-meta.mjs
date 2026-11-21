/**
 * Shiki transformer that reads the text after the language on a code fence:
 *
 *   ```ts title="src/app.ts" {2,4-6}
 *
 *   title="…"   → data-title on the <pre>, shown in the block's header strip
 *   {2,4-6}     → class "highlighted" on lines 2, 4, 5 and 6
 *
 * Plain .mjs because astro.config.mjs imports it before TypeScript is involved.
 */

/** @param {string} spec e.g. "2,4-6" @returns {Set<number>} */
export function parseLineRanges(spec) {
  const lines = new Set();
  for (const part of spec.split(',')) {
    const [from, to = from] = part.trim().split('-').map(Number);
    if (!Number.isInteger(from) || !Number.isInteger(to)) continue;
    for (let n = Math.min(from, to); n <= Math.max(from, to); n++) lines.add(n);
  }
  return lines;
}

/** @param {unknown} meta @returns {string} */
const rawMeta = (meta) => (meta && typeof meta === 'object' && '__raw' in meta && typeof meta.__raw === 'string' ? meta.__raw : '');

/**
 * @returns {any} A Shiki transformer (typed loosely: `shiki` is a dependency of Astro, not of this project).
 */
export function codeMeta() {
  /** @type {WeakMap<object, Set<number>>} */
  const cache = new WeakMap();

  return {
    name: 'nubibuilds:code-meta',
    pre(node) {
      const title = /title="([^"]+)"/.exec(rawMeta(this.options.meta))?.[1];
      if (title) node.properties.dataTitle = title;
    },
    line(node, line) {
      let lines = cache.get(this.options);
      if (!lines) {
        const spec = /\{([\d,\s-]+)\}/.exec(rawMeta(this.options.meta))?.[1];
        lines = spec ? parseLineRanges(spec) : new Set();
        cache.set(this.options, lines);
      }
      if (lines.has(line)) this.addClassToHast(node, 'highlighted');
    },
  };
}
