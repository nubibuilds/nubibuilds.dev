---
# Case study template (English). Guide: docs/writing-case-studies.md
# Copy it to src/content/work/en/<project-slug>.md (the file name becomes the URL /work/<project-slug>),
# replace every [[TODO: …]] and delete what you do not use. These comment lines can be deleted too.
# The build refuses to publish (draft: false) while any [[TODO: …]] is left.

title: "[[TODO: project name]]"
summary: "[[TODO: one sentence: what the product is and the outcome it produced]]"
year: "[[TODO: year the work shipped, e.g. 2026]]"
role: "[[TODO: your role, e.g. Lead engineer (full-stack)]]"
timeline: "[[TODO: start → end, e.g. Mar 2026 → Jul 2026]]"
status: "[[TODO: Live, Archived, In progress …]]"
stack: ["[[TODO: technology]]", "[[TODO: technology]]"]
order: 0
draft: true
# featured: true                 # show on the home page
# publishedAt: 2026-07-01        # YYYY-MM-DD; newer first among equal `order`

highlights:
  problem: "[[TODO: one sentence: who had the problem and what it cost them]]"
  architecture: "[[TODO: one sentence: the key decision and the trade-off it accepted]]"
  implementation: "[[TODO: one sentence: how the hard part was built]]"
  result: "[[TODO: one sentence: the measurable outcome]]"

metrics:
  - value: "[[TODO: figure, e.g. 28% → 9%]]"
    label: "[[TODO: what the figure measures]]"
  - value: "[[TODO: figure]]"
    label: "[[TODO: what the figure measures]]"

# repo: "https://github.com/<user>/<repo>"
# demo: "https://<live-site>"

# cover: "../assets/<project-slug>/cover.png"
# coverAlt: "What the screenshot shows"
# gallery:
#   - src: "../assets/<project-slug>/screen-1.png"
#     alt: "What the screenshot shows"
#     caption: "Short caption"

# youtube: "<11-character video id>"
# youtubeTitle: "Video title"
---

## Problem

[[TODO: the situation before this project: who the users were, what they did, and what it cost them (time, money, errors). Use real figures where you have them.]]

[[TODO: why the existing tools or the previous approach fell short.]]

**Constraints**

- [[TODO: team size and time]]
- [[TODO: budget, scale or performance target]]
- [[TODO: legal, security or platform requirement (delete the line if there is none)]]

## Architecture

[[TODO: the shape of the system in two or three sentences, and the principle behind it.]]

```text
[[TODO: an ASCII diagram of the main components and how data flows between them]]
```

### [[TODO: the architecture decision, as a short statement, e.g. One shared database isolated with row-level security]]

[[TODO: the context that forced a choice.]]

- **Why:** [[TODO: why this option fits]]
- **Cost:** [[TODO: the trade-off accepted, and how it is contained]]

## Implementation

[[TODO: the hardest part of the build: what you tried first, what failed, and what you changed.]]

```[[TODO: language]] title="[[TODO: path/to/file]]"
[[TODO: the smallest piece of code that shows the key idea]]
```

**Milestones**

1. [[TODO: first milestone and what it delivered]]
2. [[TODO: next milestone]]
3. [[TODO: launch]]

## Result

[[TODO: what changed for users and for the business, with the same figures as `metrics`, and how they were measured.]]

**What I would do next**

- [[TODO: an improvement you would make with more time]]
- [[TODO: a limitation that is still open]]
