/**
 * Generative ASCII cover for a case study: a block-character waveform that is
 * unique to, and stable for, each project slug. Used until a real screenshot exists.
 */
const LEVELS = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export function coverArt(seed: string, cols = 44, rows = 6): string {
  // FNV-1a hash of the seed, then xorshift for a repeatable pseudo-random stream.
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };

  const fast = 0.18 + random() * 0.25;
  const slow = 0.05 + random() * 0.1;
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;

  const heights = Array.from({ length: cols }, (_, i) => {
    const wave = (Math.sin(i * fast + phaseA) + Math.sin(i * slow + phaseB) + 2) / 4;
    const level = Math.min(1, Math.max(0.1, wave * 0.8 + random() * 0.25));
    return level * rows;
  });

  const lines: string[] = [];
  for (let row = rows; row >= 1; row--) {
    let line = '';
    for (const height of heights) {
      const fill = Math.min(1, Math.max(0, height - (row - 1)));
      line += LEVELS[Math.round(fill * 8)];
    }
    lines.push(line);
  }
  return lines.join('\n');
}
