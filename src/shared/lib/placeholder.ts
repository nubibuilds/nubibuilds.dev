/**
 * The marker the content templates use for text that has not been written yet, as in
 * `[[TODO: one sentence about the problem]]`. A draft may still contain it; a published entry
 * (`draft: false`) fails the build while one is left in its frontmatter or body.
 */
export const PLACEHOLDER = '[[TODO:';

/** Paths (as Zod issue paths) of every string inside `value` that still contains the marker. */
export function findPlaceholders(value: unknown, path: (string | number)[] = []): (string | number)[][] {
  if (typeof value === 'string') return value.includes(PLACEHOLDER) ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((item, i) => findPlaceholders(item, [...path, i]));
  if (value && typeof value === 'object' && !(value instanceof Date))
    return Object.entries(value).flatMap(([key, item]) => findPlaceholders(item, [...path, key]));
  return [];
}
