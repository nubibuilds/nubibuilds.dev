/** Content for the About feature. Replace the [PLACEHOLDERS] with your own story. */

export const principles = [
  {
    title: "Builder mindset",
    text: "Focused on products that actually get built and the real problems they solve.",
    color: "var(--accent)",
  },
  {
    title: "Engineering craftsmanship",
    text: "Code quality, architecture that makes sense, and maintainability come first.",
    color: "var(--cyan)",
  },
  {
    title: "Continuous improvement",
    text: "Keep learning, experimenting, shipping, and refining what already exists.",
    color: "var(--violet)",
  },
];

export const story = [
  "I'm an AI-native full-stack developer who does more than write code: I design systems, untangle problems, and carry ideas all the way to software that actually works.",
  "Every product starts with a clear purpose, is built on sound engineering, and keeps getting better after it ships.",
  "I work across the full stack in TypeScript: React and Next.js on the front, Node.js on the back, PostgreSQL with Prisma or Drizzle underneath, and Cloudflare to ship it.",
  "Lately I build web and mobile apps with AI as a working partner, using agentic coding with Claude Code and writing my own agent skills so every project starts from the same solid habits. I'm available for freelance projects.",
];

/** Newest first, like `git log`. */
export const journey = [
  {
    year: "2026",
    text: "Started NubiBuilds and rebuilt how I work around AI: agentic coding with Claude Code and agent skills of my own.",
    color: "var(--accent)",
  },
  {
    year: "2024–2025",
    text: "Built a steady stream of practice apps from tutorials, learning React, Next.js and the full stack one project at a time.",
    color: "var(--cyan)",
  },
  {
    year: "2023",
    text: "Built a personal website for a friend, my first project made for someone else.",
    color: "var(--violet)",
  },
  {
    year: "2020",
    text: "Initial commit: wrote my first lines of code in university, and kept going.",
    color: "var(--coral)",
  },
];

export const toolbox = [
  {
    dir: "frontend",
    tools: ["TypeScript", "React", "Next.js", "Astro", "Tailwind CSS", "shadcn/ui"],
    color: "var(--accent)",
  },
  {
    dir: "backend",
    tools: [
      "Node.js",
      "Hono",
      "Express",
      "NestJS",
      "Next.js (route handlers, server actions)",
      "TanStack Start (server routes)",
    ],
    color: "var(--cyan)",
  },
  {
    dir: "data",
    tools: ["PostgreSQL", "Prisma", "Drizzle ORM"],
    color: "var(--violet)",
  },
  {
    dir: "infra",
    tools: ["Cloudflare", "GitHub Actions"],
    color: "var(--coral)",
  },
  {
    dir: "learning",
    tools: [
      "AI-assisted and agentic coding",
      "Claude Code",
      "ChatGPT",
      "Gemini",
      "Custom agent skills",
    ],
    color: "var(--amber)",
    /** Still being explored: the folder gets a "wip" badge. */
    wip: true,
  },
];
