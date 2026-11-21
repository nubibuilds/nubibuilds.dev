/**
 * The neofetch-style summary at the top of /uses: one short line per key.
 * A "packages" line (the number of tools below) is added automatically.
 */
export const system: { key: string; value: string }[] = [
  { key: "os", value: "macOS" },
  { key: "host", value: 'MacBook Pro 14" (M1 Pro)' },
  { key: "display", value: 'LG 27" (2K)' },
  { key: "shell", value: "zsh + Starship" },
  { key: "terminal", value: "iTerm2" },
  { key: "editor", value: "VS Code + Antigravity" },
  { key: "font", value: "JetBrains Mono Nerd Font" },
  { key: "theme", value: "NubiBuilds Dark" },
  { key: "stack", value: "TypeScript · React · Next.js · Node.js" },
  { key: "deploy", value: "Cloudflare" },
];

/** Content for /uses: the tools you work with. */
export const uses = [
  {
    dir: "hardware/",
    color: "var(--accent)",
    items: [
      {
        name: 'MacBook Pro 14" (M1 Pro)',
        note: "Unix under the hood, so it feels close to Linux, with the power and battery life I need for development.",
      },
      {
        name: 'LG 27" monitor (2K)',
        note: "Extra screen space for the editor next to the browser.",
      },
      {
        name: "Apple Magic Keyboard",
        note: "Slim, quiet, and pairs instantly with the Mac.",
      },
      {
        name: "Logitech MX Master 3S",
        note: "Comfortable for long sessions; the side scroll wheel is great for wide files.",
      },
    ],
  },
  {
    dir: "editor/",
    color: "var(--cyan)",
    items: [
      {
        name: "VS Code + Antigravity IDE",
        note: "Theme: NubiBuilds Dark, my own.",
      },
      {
        name: "Extensions",
        note: "ESLint, Prettier, Prisma, Playwright Test for VS Code and more.",
      },
      {
        name: "JetBrains Mono Nerd Font",
        note: "Easy to read, with icons for the terminal prompt.",
      },
      { name: "AI assistants", note: "Claude, Claude Code, ChatGPT, Gemini." },
    ],
  },
  {
    dir: "terminal/",
    color: "var(--violet)",
    items: [
      { name: "iTerm2 + zsh", note: "With the Starship prompt." },
      { name: "CLI tools", note: "pnpm, eza, zoxide." },
      { name: "nvm", note: "Switches Node versions per project." },
    ],
  },
  {
    dir: "stack/",
    color: "var(--amber)",
    items: [
      {
        name: "TypeScript, React, Next.js, Node.js",
        note: "What I reach for first: React on the front, Node on the back.",
      },
      {
        name: "Tailwind CSS + shadcn/ui",
        note: "Fast styling with components I own and can customize.",
      },
      {
        name: "PostgreSQL + Prisma / Drizzle ORM",
        note: "Type-safe queries over a solid relational database.",
      },
      { name: "Cloudflare", note: "Hosting and deployment." },
    ],
  },
  {
    dir: "services/",
    color: "var(--coral)",
    items: [
      {
        name: "Google Chrome",
        note: "Main browser; DevTools for debugging and Lighthouse checks.",
      },
      {
        name: "GitHub",
        note: "Where my code lives, with GitHub Actions for CI.",
      },
      {
        name: "Notion + Apple Notes",
        note: "Notion for planning and docs, Apple Notes for quick thoughts.",
      },
      { name: "Spotify", note: "Music while I code." },
    ],
  },
];
