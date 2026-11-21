/**
 * NubiBuilds code theme for Shiki.
 *
 * Every colour is a CSS variable (--code-*), defined in src/shared/styles/prose.css:
 * the dark values are tuned for the NubiBuilds Dark page (#0a0e0b) and its code surface (#0f1511),
 * and the light theme overrides the same variables, so code follows the site's theme toggle.
 * Shiki swaps non-hex colours for placeholders while tokenizing and restores them in the HTML.
 *
 * Plain .mjs because astro.config.mjs imports it before TypeScript is involved.
 */

/** @param {string} name */
const v = (name) => `var(--code-${name})`;

/** @type {any} A Shiki theme registration (typed loosely: `shiki` is a dependency of Astro, not of this project). */
export const nubibuildsTheme = {
  name: 'nubibuilds',
  type: 'dark',
  // Set bg/fg directly: Shiki does not restore a CSS-variable editor.background on the <pre>.
  bg: v('bg'),
  fg: v('fg'),
  colors: {
    'editor.background': v('bg'),
    'editor.foreground': v('fg'),
  },
  tokenColors: [
    { settings: { foreground: v('fg') } },

    // Comments
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: v('comment'), fontStyle: 'italic' },
    },

    // Control keywords: if, return, import, FROM/RUN (Dockerfile), etc.
    {
      scope: ['keyword', 'keyword.control', 'keyword.other', 'variable.language', 'support.type.primitive.sh'],
      settings: { foreground: v('keyword') },
    },
    // Declarations and modifiers: const, let, function, class, public, static, func, type
    {
      scope: ['storage', 'storage.type', 'storage.modifier', 'keyword.declaration', 'keyword.function', 'keyword.type'],
      settings: { foreground: v('storage') },
    },
    // Operators: = + => && | (keyword.operator.new etc. stay keywords)
    {
      scope: ['keyword.operator', 'punctuation.separator.key-value', 'keyword.operator.assignment'],
      settings: { foreground: v('operator') },
    },
    {
      scope: ['keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.word'],
      settings: { foreground: v('keyword') },
    },

    // Functions and methods (definitions and calls), shell commands
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'entity.name.command', 'support.function.builtin'],
      settings: { foreground: v('function') },
    },

    // Types, classes, interfaces, namespaces, Go/Java packages
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
        'storage.type.java',
        'storage.type.primitive',
        'entity.name.type.module',
      ],
      settings: { foreground: v('type') },
    },

    // Strings
    {
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string', 'markup.inline.raw'],
      settings: { foreground: v('string') },
    },
    // Escapes, regex, interpolation punctuation ${ }
    {
      scope: ['constant.character.escape', 'string.regexp', 'punctuation.definition.template-expression', 'punctuation.section.embedded'],
      settings: { foreground: v('regex') },
    },

    // Numbers, booleans, null, enum members, CSS units and colours
    {
      scope: [
        'constant',
        'constant.numeric',
        'constant.language',
        'constant.other',
        'support.constant',
        'keyword.other.unit',
        'variable.other.enummember',
      ],
      settings: { foreground: v('constant') },
    },

    // Names that label data: HTML/JSX tags, JSON keys, CSS properties, YAML keys, object keys
    {
      scope: [
        'entity.name.tag',
        'support.type.property-name',
        'meta.object-literal.key',
        'meta.mapping.key string',
        'entity.name.tag.yaml',
      ],
      settings: { foreground: v('tag') },
    },
    // Attributes and CSS selectors
    {
      scope: ['entity.other.attribute-name', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.name.tag.css'],
      settings: { foreground: v('attr') },
    },

    // Variables, parameters, properties
    { scope: ['variable', 'variable.other', 'variable.other.property', 'support.variable.property'], settings: { foreground: v('fg') } },
    { scope: ['variable.parameter', 'meta.parameters variable'], settings: { foreground: v('param') } },
    { scope: ['variable.other.normal.shell', 'punctuation.definition.variable', 'variable.other.readwrite.shell'], settings: { foreground: v('constant') } },

    // Punctuation
    {
      scope: ['punctuation', 'meta.brace', 'punctuation.definition.tag', 'punctuation.separator', 'punctuation.terminator'],
      settings: { foreground: v('punct') },
    },

    // Markdown
    { scope: ['markup.heading', 'entity.name.section'], settings: { foreground: v('string'), fontStyle: 'bold' } },
    { scope: 'markup.bold', settings: { fontStyle: 'bold' } },
    { scope: 'markup.italic', settings: { fontStyle: 'italic' } },
    { scope: ['markup.underline.link', 'string.other.link'], settings: { foreground: v('function') } },

    // Diff
    { scope: 'markup.inserted', settings: { foreground: v('inserted') } },
    { scope: 'markup.deleted', settings: { foreground: v('deleted') } },
    { scope: 'markup.changed', settings: { foreground: v('changed') } },
    { scope: ['meta.diff.range', 'meta.diff.header'], settings: { foreground: v('function') } },

    // Invalid
    { scope: 'invalid', settings: { foreground: v('deleted') } },
  ],
};
