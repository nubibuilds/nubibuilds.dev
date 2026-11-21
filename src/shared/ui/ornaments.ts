/**
 * Text used by the moving background ornaments (<Rain> and <Marquee>).
 * Each set is themed to the section it sits behind.
 */

/** "NUBIBUILDS" as 8-bit ASCII. */
export const BINARY = ['01001110010101010100001001001001010000100101010101001001010011000100010001010011'];

export const WORDS = [
  'BUILD·LEARN·IMPROVE·BUILD·LEARN·IMPROVE·',
  'WHOAMI·DEVELOPER·BUILDER·WHOAMI·DEVELOPER·BUILDER·',
  'INTENT·CRAFT·SHIP·INTENT·CRAFT·SHIP·INTENT·CRAFT·SHIP·',
];

export const CIRCUIT = [
  '│┬│┴│├│┤│┼│─│┌│┐│└│┘│┬│┴│├│┤│┼│─│┌│┐│└│┘',
  BINARY[0],
];

export const MARKDOWN_RAIN = ['#>-*_`#>-*_`#>-*_`#>-*_`#>-*_`#>-*_`#>-*_`', 'writeeditshipwriteeditshipwriteeditship'];

export const COMMITS = ['*|*|*|\\|*|/|*|*|*|\\|*|/|*|*|*|\\|*|/|*|*|', '0123456789abcdef0123456789abcdef01234567'];

const gap = '     ';
const line = (...parts: string[]) => parts.join(gap) + gap;

export const CODE_LINES = [
  line('// build with intent', 'if (works) ship();', 'while (true) { build(); learn(); improve(); }', "git commit -m 'better'"),
  line('const quality = code + architecture + maintainability;', 'assert(problem.isReal);', 'return product;'),
  line('refactor → test → ship → repeat', '/* craftsmanship */', 'try { experiment(); } finally { learn(); }'),
];

export const BUILD_LINES = [
  line('┌──┐ ├──┤ └──┘', 'make build ✓', '[■■■■■■□□□□] compiling', './deploy --prod', 'tests passed ✓', '▓▒░'),
  line('drwxr-xr-x  work/', '├── problem', '├── architecture', '├── implementation', '└── result'),
  line('[■■■■■■■■□□] linking', '┌─┬─┐ ├─┼─┤ └─┴─┘', 'pnpm build', 'exit 0 ✓', '░▒▓'),
];

export const MARKDOWN_LINES = [
  line('# heading', '## subheading', '> quote', '- list item', '**bold**', '_italic_', '`code`', '[link](url)', '---'),
  line('1. draft', '2. edit', '3. publish', '```js', '```', '> note to self', '* * *', ':wq'),
];

export const FILE_LINES = [line('-rw-r--r--  post.md', '-rw-r--r--  notes.md', '-rw-r--r--  draft.md', 'tail -f ./writing')];

export const NETWORK_LINES = [
  line('ping -c 3 nubi@builds', '··· −−− ···', '))) hello, world (((', 'SYN → SYN-ACK → ACK'),
  line('·−· · ·−−· ·−·· −·−−', 'ssh nubi@builds', 'connection established ✓', '((( · )))'),
];

/** Hex dump of "NUBIBUILDS", "build", "learn", "improve", "ship". */
export const HEX_LINES = [
  line('00000000  4E 55 42 49 42 55 49 4C 44 53  |NUBIBUILDS|', '00000010  62 75 69 6C 64  |build|'),
  line('00000020  6C 65 61 72 6E  |learn|', '00000030  69 6D 70 72 6F 76 65  |improve|', '00000040  73 68 69 70  |ship|'),
];

export const TREE_LINES = [
  line('~/toolbox', '├── frontend/', '├── backend/', '├── data/', '├── infra/', '└── learning/', 'drwxr-xr-x'),
  line('│   ├── index.ts', '│   └── README.md', 'ls -la ./toolbox', 'tree -L 2', '└── .gitkeep'),
];
