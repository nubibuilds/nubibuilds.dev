/**
 * Content for /now: what you are focused on at the moment.
 * The location shown beside the date is `owner.base` in src/shared/config/site.ts.
 * Written to hold for 2–3 months; review it around February 2027.
 *
 * `state` drives the status light on the page, like a process list:
 *   running    what has my time right now (pulsing light)
 *   listening  what I'm open to (steady ring)
 *   stopped    what I'm deliberately not doing (dimmed)
 */
export type NowState = 'running' | 'listening' | 'stopped';

export const now: {
  updated: string;
  items: { label: string; text: string; color: string; state: NowState }[];
} = {
  /** Shown as "last updated"; change it whenever you edit this file. */
  updated: '2026-11-18',
  items: [
    {
      label: 'building',
      state: 'running',
      text: 'Web and mobile apps built hand in hand with AI, using agentic coding to go from idea to working product faster.',
      color: 'var(--accent)',
    },
    {
      label: 'learning',
      state: 'running',
      text: 'Practical, day-to-day ways to work with AI models: Claude, Claude Code, ChatGPT and Gemini. Comparing vibe coding with structured agentic workflows to see where each one holds up.',
      color: 'var(--cyan)',
    },
    {
      label: 'crafting',
      state: 'running',
      text: 'My own reusable skills for AI coding agents that encode how I like to plan, build, test and review apps, so every new project starts on solid ground.',
      color: 'var(--violet)',
    },
    {
      label: 'open to',
      state: 'listening',
      text: 'Freelance projects building web or mobile apps, collaborating on products built with AI-assisted workflows, and swapping notes with developers exploring the same tools.',
      color: 'var(--amber)',
    },
    {
      label: 'not doing',
      state: 'stopped',
      text: 'Chasing every new AI tool launch. I keep a small toolkit and go deep instead of wide.',
      color: 'var(--coral)',
    },
  ],
};
