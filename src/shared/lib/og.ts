/**
 * Per-page social preview images (1200×630 PNG), drawn as SVG and rasterised with `sharp`.
 *
 * `sharp` is optional: install it with `pnpm add sharp` to turn this on. Without it nothing
 * is generated and every page keeps the shared /og.png, so the build never depends on it.
 */

import { site } from '@shared/config/site';

export interface OgCard {
  title: string;
  /** Command shown after the prompt, e.g. "less my-post.md". */
  command: string;
  /** Directory shown in the prompt and window bar, e.g. "~/writing". */
  dir: string;
}

type Rasterise = (input: Uint8Array) => { png(): { toBuffer(): Promise<Uint8Array> } };

let renderer: Promise<Rasterise | null> | undefined;

/** Resolves to sharp when it is installed, otherwise to null. */
export function loadSharp(): Promise<Rasterise | null> {
  renderer ??= (async () => {
    try {
      // Kept out of static analysis on purpose so a missing package is not a build error.
      const name = 'sharp';
      const mod = await import(/* @vite-ignore */ name);
      return (mod.default ?? mod) as Rasterise;
    } catch {
      return null;
    }
  })();
  return renderer;
}

export const ogImagePath = (kind: 'work' | 'writing', id: string) => `/og/${kind}/${id}.png`;

/** The page's own preview image, or undefined (→ default image) when sharp is not installed. */
export async function ogImageFor(kind: 'work' | 'writing', id: string): Promise<string | undefined> {
  return (await loadSharp()) ? ogImagePath(kind, id) : undefined;
}

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Break a title into at most `maxLines` lines of about `width` characters. */
export function wrapTitle(title: string, width = 29, maxLines = 4): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of title.trim().split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]!.slice(0, width - 1)}…`;
    return kept;
  }
  return lines;
}

export function ogSvg({ title, command, dir }: OgCard): string {
  const lines = wrapTitle(title);
  const size = lines.length > 3 ? 52 : 60;
  const lineHeight = Math.round(size * 1.25);
  const top = 250;
  const font = `font-family="JetBrains Mono, DejaVu Sans Mono, Menlo, Consolas, monospace"`;
  const titleSpans = lines.map((line, i) => `<tspan x="72" y="${top + i * lineHeight}">${escapeXml(line)}</tspan>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0e0b"/>
  <rect width="1200" height="56" fill="#111813"/>
  <rect y="56" width="1200" height="1" fill="#223027"/>
  <text x="600" y="36" text-anchor="middle" fill="#8a9d8f" font-size="22" ${font}>nubibuilds — ${escapeXml(dir)}</text>
  <text x="72" y="150" font-size="26" ${font}><tspan fill="#62f08f" font-weight="700">nubi@builds</tspan><tspan fill="#8a9d8f">:</tspan><tspan fill="#f0b45a">${escapeXml(dir)}</tspan><tspan fill="#8a9d8f">$ ${escapeXml(command)}</tspan></text>
  <text fill="#e8f1ea" font-size="${size}" font-weight="700" ${font}>${titleSpans}</text>
  <rect x="72" y="548" width="1056" height="1" fill="#223027"/>
  <text x="72" y="592" fill="#7fd4ff" font-size="22" letter-spacing="2" ${font}>${escapeXml(site.role.toUpperCase())}</text>
  <text x="1128" y="592" text-anchor="end" fill="#62f08f" font-size="24" font-weight="700" ${font}>NubiBuilds</text>
</svg>`;
}

/** PNG bytes for a card, or null when sharp is not installed. */
export async function renderOgPng(card: OgCard): Promise<Uint8Array | null> {
  const sharp = await loadSharp();
  if (!sharp) return null;
  return sharp(new TextEncoder().encode(ogSvg(card))).png().toBuffer();
}
