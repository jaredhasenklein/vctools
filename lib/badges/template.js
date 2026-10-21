// Badge templates: a list of text blocks placed on the label, each with variables
// like {firstName} or {role}. One layout function drives both the PDF (jsPDF) and the
// editor preview (canvas), so the preview matches the printout.
//
// Positions are fractions of the label (0..1) so a template fits any label size.
// Font sizes are points. Fonts are Helvetica in the PDF and Helvetica/Arial on screen,
// which share the same character widths.

export const VARIABLES = [
  { key: 'firstName', label: 'First name', sample: 'Avery' },
  { key: 'lastName', label: 'Last name', sample: 'Quintana' },
  { key: 'lastInitial', label: 'Last initial', sample: 'Q.' },
  { key: 'role', label: 'Role(s)', sample: 'Head Referee' },
  { key: 'pronouns', label: 'Pronouns', sample: 'she/her' },
  { key: 'languages', label: 'Languages', sample: 'English, Spanish' },
  { key: 'event', label: 'Event name (from the form)', sample: '2027 FIRST Agrestic Regional' },
  { key: 'bottomLeft', label: 'Bottom left (from the form)', sample: 'she/her' },
  { key: 'bottomRight', label: 'Bottom right (from the form)', sample: 'FIRST Alumni' },
];
const VARIABLE_KEYS = new Set(VARIABLES.map((v) => v.key));

export const BLOCK_DEFAULTS = {
  name: 'Text',
  text: '',
  x: 0.1, y: 0.4, w: 0.8, h: 0.2,
  size: 18,
  minSize: 8,
  bold: false,
  italic: false,
  upper: false,
  align: 'center',
  color: '#000000',
  fill: '',
  sameSize: true,
  wrap: false,
  maxLines: 2,
};

const clamp = (n, lo, hi, fallback) => (Number.isFinite(Number(n)) ? Math.min(hi, Math.max(lo, Number(n))) : fallback);
const HEX = /^#[0-9a-f]{6}$/i;

/** Clean a block from storage or an imported file. Unknown fields are dropped. */
export function normalizeBlock(raw = {}) {
  const d = BLOCK_DEFAULTS;
  const b = {
    name: String(raw.name ?? d.name).slice(0, 40),
    text: String(raw.text ?? d.text).slice(0, 200),
    x: clamp(raw.x, 0, 1, d.x),
    y: clamp(raw.y, 0, 1, d.y),
    w: clamp(raw.w, 0.02, 1, d.w),
    h: clamp(raw.h, 0.02, 1, d.h),
    size: clamp(raw.size, 4, 96, d.size),
    minSize: clamp(raw.minSize, 4, 96, d.minSize),
    bold: Boolean(raw.bold),
    italic: Boolean(raw.italic),
    upper: Boolean(raw.upper),
    align: ['left', 'center', 'right'].includes(raw.align) ? raw.align : d.align,
    color: HEX.test(raw.color) ? raw.color : d.color,
    fill: HEX.test(raw.fill) ? raw.fill : '',
    sameSize: raw.sameSize === undefined ? d.sameSize : Boolean(raw.sameSize),
    wrap: Boolean(raw.wrap),
    maxLines: Math.round(clamp(raw.maxLines, 1, 6, d.maxLines)),
  };
  b.w = Math.min(b.w, 1 - b.x);
  b.h = Math.min(b.h, 1 - b.y);
  b.minSize = Math.min(b.minSize, b.size);
  return b;
}

/** Clean a whole template. Throws if it isn't one. */
export function normalizeTemplate(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.blocks)) {
    throw new Error('This file is not a badge template.');
  }
  return {
    id: String(raw.id || `t${Date.now().toString(36)}`).slice(0, 40),
    name: String(raw.name || 'Untitled template').slice(0, 60),
    blocks: raw.blocks.slice(0, 30).map(normalizeBlock),
  };
}

/** Variable names in a block's text that aren't known variables. */
export function unknownVariables(text) {
  return [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => !VARIABLE_KEYS.has(k));
}

/** Replace {variables} in text. Unknown variables are left as typed so the mistake shows. */
export function fillText(block, vars) {
  const out = String(block.text).replace(/\{(\w+)\}/g, (m, k) => (VARIABLE_KEYS.has(k) ? String(vars[k] ?? '') : m)).trim();
  return block.upper ? out.toUpperCase() : out;
}

/** Split text so every "FIRST" can be set in italics, per FIRST's brand guidelines. */
export function segments(text) {
  return String(text).split(/(FIRST)/g).filter(Boolean).map((t) => ({ text: t, firstMark: t === 'FIRST' }));
}

function textWidth(measure, text, size, block) {
  return segments(text).reduce((sum, s) => sum + measure(s.text, size, block.bold, block.italic || s.firstMark), 0);
}

const SIZE_STEP = 0.5;
const LINE_HEIGHT = 1.15; // Line spacing for wrapped text, as a multiple of the font size.

/** Break text into lines no wider than maxWidth at this size (words longer than a line stay whole). */
export function wrapLines(measure, text, size, block, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(measure, next, size, block) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Lines to draw for a block at a size: wrapped when the block allows it, else one line. */
function linesFor(measure, text, size, block, w) {
  return block.wrap ? wrapLines(measure, text, size, block, w) : [text];
}

function fits(measure, text, size, block, w, h) {
  const lines = linesFor(measure, text, size, block, w);
  if (lines.some((l) => textWidth(measure, l, size, block) > w)) return false;
  if (!block.wrap) return true;
  return lines.length <= block.maxLines && lines.length * (size / 72) * LINE_HEIGHT <= h + 1e-9;
}

/** Largest size from block.size down to block.minSize where the text fits the box. */
function fitSize(measure, text, block, maxWidth, maxHeight) {
  let size = block.size;
  while (size > block.minSize && !fits(measure, text, size, block, maxWidth, maxHeight)) size -= SIZE_STEP;
  return size;
}

/**
 * Font size for each block. With `sameSize`, a block uses the size that fits its text on
 * every badge, so names line up across the sheet (how the original styles worked).
 *
 * @param {object} template
 * @param {object[]} varsList  variables for every badge being printed
 * @param {(text, sizePt, bold, italic) => number} measure  width in inches
 * @param {number} labelW  inches
 * @param {number} [labelH]  inches (defaults to a 2:1 label)
 * @returns {number[]} size per block index
 */
export function sharedSizes(template, varsList, measure, labelW, labelH = labelW / 2) {
  return template.blocks.map((block) => {
    if (!block.sameSize) return null;
    const maxWidth = block.w * labelW;
    const maxHeight = block.h * labelH;
    return varsList.reduce((min, vars) => {
      const text = fillText(block, vars);
      return text ? Math.min(min, fitSize(measure, text, block, maxWidth, maxHeight)) : min;
    }, block.size);
  });
}

/**
 * Draw one badge.
 * @param {{ measure, text: (str, x, baseline, sizePt, bold, italic, color) => void, rect: (x, y, w, h, color) => void }} surface
 *   all positions in inches from the label's top-left corner
 * @param {object} template
 * @param {object} vars  variables for this badge
 * @param {{ labelW: number, labelH: number, sizes?: (number|null)[] }} opts
 */
export function drawBadge(surface, template, vars, { labelW, labelH, sizes = [] }) {
  template.blocks.forEach((block, i) => {
    const text = fillText(block, vars);
    if (!text) return; // Nothing to show (e.g. pronouns "Not Specified"): skip the block and its background.
    const x = block.x * labelW;
    const y = block.y * labelH;
    const w = block.w * labelW;
    const h = block.h * labelH;
    if (block.fill) surface.rect(x, y, w, h, block.fill);

    const size = sizes[i] ?? fitSize(surface.measure, text, block, w, h);
    const lines = linesFor(surface.measure, text, size, block, w);
    const lineH = (size / 72) * LINE_HEIGHT;
    // Center the lines as a group; each baseline sits so capitals are centered in their line.
    let baseline = y + h / 2 - (lines.length * lineH) / 2 + lineH / 2 + (size / 72) * 0.35;
    for (const line of lines) {
      const total = textWidth(surface.measure, line, size, block);
      let cursor = block.align === 'left' ? x : block.align === 'right' ? x + w - total : x + (w - total) / 2;
      for (const s of segments(line)) {
        const italic = block.italic || s.firstMark;
        surface.text(s.text, cursor, baseline, size, block.bold, italic, block.color);
        cursor += surface.measure(s.text, size, block.bold, italic);
      }
      baseline += lineH;
    }
  });
}

/** Trimmed text, with VMS's "Not Specified" treated as blank. */
export function clean(value) {
  const s = String(value ?? '').trim();
  return /^not specified$/i.test(s) ? '' : s;
}

/** Variables for one person. `form` holds the event and bottom-corner text from the page. */
export function badgeVariables(person, form = {}) {
  const last = clean(person.lastName);
  return {
    firstName: clean(person.firstName),
    lastName: last,
    lastInitial: last ? `${last[0]}.` : '',
    role: person.role ?? '',
    pronouns: clean(person.pronouns),
    languages: clean(person.languages),
    event: clean(form.event),
    bottomLeft: clean(form.bottomLeft),
    bottomRight: clean(form.bottomRight),
  };
}

// Ready-made items for the editor's "Add to badge" buttons. Positions are a starting
// point; the user drags them where they want.
export const BLOCK_PRESETS = [
  { key: 'firstName', label: 'First name', block: { name: 'First name', text: '{firstName}', x: 0.05, y: 0.15, w: 0.9, h: 0.22, size: 30, minSize: 10, bold: true, upper: true } },
  { key: 'lastName', label: 'Last name', block: { name: 'Last name', text: '{lastName}', x: 0.05, y: 0.38, w: 0.9, h: 0.14, size: 18, minSize: 10, upper: true } },
  { key: 'nameInitial', label: 'First name + last initial', block: { name: 'Name', text: '{firstName} {lastInitial}', x: 0.05, y: 0.18, w: 0.9, h: 0.25, size: 34, minSize: 10, bold: true, upper: true } },
  { key: 'role', label: 'Role', block: { name: 'Role', text: '{role}', x: 0.05, y: 0.56, w: 0.9, h: 0.16, size: 18, minSize: 10, upper: true } },
  { key: 'event', label: 'Event name', block: { name: 'Event', text: '{event}', x: 0.05, y: 0.04, w: 0.9, h: 0.09, size: 12, minSize: 6, sameSize: false } },
  { key: 'pronouns', label: 'Pronouns', block: { name: 'Pronouns', text: '{pronouns}', x: 0.025, y: 0.85, w: 0.45, h: 0.09, size: 11, minSize: 6, align: 'left', sameSize: false } },
  { key: 'languages', label: 'Languages', block: { name: 'Languages', text: '{languages}', x: 0.525, y: 0.85, w: 0.45, h: 0.09, size: 11, minSize: 6, align: 'right', sameSize: false } },
  { key: 'custom', label: 'Your own text', block: { name: 'Text', text: 'Your text', x: 0.2, y: 0.75, w: 0.6, h: 0.09, size: 12, minSize: 6, sameSize: false } },
].map((p) => ({ ...p, block: normalizeBlock(p.block) }));

/** An empty template for building a badge from scratch. */
export function blankTemplate(name = 'My badge') {
  return { id: `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, blocks: [] };
}

// Built-in templates. Users duplicate these to make their own.
// Style A and B reproduce the original two label styles; Large Role answers issue #5.
export const BUILT_IN_TEMPLATES = [
  {
    id: 'styleA',
    name: 'Style A - Full Name',
    builtIn: true,
    blocks: [
      { name: 'Event', text: '{event}', x: 0.0725, y: 0.048, w: 0.855, h: 0.083, size: 12, minSize: 6, sameSize: false },
      { name: 'First name', text: '{firstName}', x: 0.0725, y: 0.147, w: 0.855, h: 0.21, size: 30, minSize: 10, bold: true, upper: true },
      { name: 'Last name', text: '{lastName}', x: 0.0725, y: 0.4125, w: 0.855, h: 0.14, size: 20, minSize: 10, upper: true },
      { name: 'Role bar', text: '{role}', x: 0, y: 0.6, w: 1, h: 0.15, size: 16, minSize: 10, upper: true, color: '#ffffff', fill: '#000000' },
      { name: 'Bottom left', text: '{bottomLeft}', x: 0.025, y: 0.839, w: 0.45, h: 0.0835, size: 12, minSize: 6, align: 'left', sameSize: false },
      { name: 'Bottom right', text: '{bottomRight}', x: 0.525, y: 0.839, w: 0.45, h: 0.0835, size: 12, minSize: 6, align: 'right', sameSize: false },
    ],
  },
  {
    id: 'styleB',
    name: 'Style B - First Name with Initial',
    builtIn: true,
    blocks: [
      { name: 'Event', text: '{event}', x: 0.025, y: 0, w: 0.95, h: 0.0417, size: 12, minSize: 6, sameSize: false },
      { name: 'Name', text: '{firstName} {lastInitial}', x: 0.025, y: 0.1955, w: 0.95, h: 0.25, size: 36, minSize: 10, bold: true, upper: true },
      { name: 'Role', text: '{role}', x: 0.025, y: 0.619, w: 0.95, h: 0.165, size: 24, minSize: 10, upper: true },
      { name: 'Bottom left', text: '{bottomLeft}', x: 0.025, y: 0.8906, w: 0.45, h: 0.07, size: 10, minSize: 6, align: 'left', sameSize: false },
      { name: 'Bottom right', text: '{bottomRight}', x: 0.525, y: 0.8906, w: 0.45, h: 0.07, size: 10, minSize: 6, align: 'right', sameSize: false },
    ],
  },
  {
    id: 'largeRole',
    name: 'Large Role (high contrast)',
    builtIn: true,
    blocks: [
      { name: 'Event', text: '{event}', x: 0.05, y: 0.04, w: 0.9, h: 0.09, size: 12, minSize: 6, sameSize: false },
      { name: 'First name', text: '{firstName}', x: 0.05, y: 0.15, w: 0.9, h: 0.22, size: 32, minSize: 10, bold: true, upper: true },
      { name: 'Last name', text: '{lastName}', x: 0.05, y: 0.38, w: 0.9, h: 0.12, size: 16, minSize: 10, upper: true },
      { name: 'Role', text: '{role}', x: 0.03, y: 0.54, w: 0.94, h: 0.26, size: 30, minSize: 12, bold: true, upper: true },
      { name: 'Bottom left', text: '{bottomLeft}', x: 0.025, y: 0.85, w: 0.45, h: 0.09, size: 12, minSize: 6, align: 'left', sameSize: false },
      { name: 'Bottom right', text: '{bottomRight}', x: 0.525, y: 0.85, w: 0.45, h: 0.09, size: 12, minSize: 6, align: 'right', sameSize: false },
    ],
  },
].map((t) => ({ ...normalizeTemplate(t), builtIn: true }));
