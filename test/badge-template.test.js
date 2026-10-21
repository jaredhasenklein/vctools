import { describe, it, expect, beforeEach } from 'vitest';
import {
  BUILT_IN_TEMPLATES, normalizeTemplate, fillText, segments, sharedSizes, drawBadge, badgeVariables, unknownVariables,
} from '../lib/badges/template.js';
import { allTemplates, saveTemplate, loadSaved, deleteTemplate, copyOf, toJSON, fromJSON } from '../lib/badges/store.js';

// Fake font: every character is 0.6 em wide, bold 0.7 em.
const measure = (text, size, bold) => text.length * (bold ? 0.7 : 0.6) * (size / 72);

describe('template text', () => {
  const vars = badgeVariables({ firstName: 'Avery', lastName: 'quintana', role: 'Judge / FIRST Liaison', pronouns: 'Not Specified' }, { event: '2027 Agrestic Regional' });
  it('fills variables and applies caps', () => {
    expect(fillText({ text: '{firstName} {lastInitial}', upper: true }, vars)).toBe('AVERY Q.');
    expect(fillText({ text: '{pronouns}' }, vars)).toBe('');
    expect(fillText({ text: 'Hi {nope}' }, vars)).toBe('Hi {nope}');
    expect(unknownVariables('{firstName} {nope} {role}')).toEqual(['nope']);
  });
  it('marks FIRST for italics', () => {
    expect(segments('2027 FIRST Agrestic')).toEqual([
      { text: '2027 ', firstMark: false }, { text: 'FIRST', firstMark: true }, { text: ' Agrestic', firstMark: false },
    ]);
  });
});

describe('normalize', () => {
  it('drops unknown fields, clamps numbers, rejects bad colors', () => {
    const t = normalizeTemplate({ name: 'X', blocks: [{ text: 'a', x: 0.9, w: 0.5, size: 500, color: 'red', fill: '#00ff00', onclick: 'x' }] });
    expect(t.blocks[0]).toMatchObject({ x: 0.9, w: expect.closeTo(0.1, 5), size: 96, color: '#000000', fill: '#00ff00' });
    expect(t.blocks[0].onclick).toBeUndefined();
    expect(() => normalizeTemplate({ name: 'no blocks' })).toThrow(/not a badge template/);
  });
  it('ships three valid built-ins', () => {
    expect(BUILT_IN_TEMPLATES.map((t) => t.id)).toEqual(['styleA', 'styleB', 'largeRole']);
  });
});

describe('layout', () => {
  const template = normalizeTemplate({ blocks: [{ text: '{firstName}', x: 0, y: 0, w: 1, h: 0.5, size: 40, minSize: 8, bold: true }] });
  const people = ['Al', 'Maximiliana-Josephine'].map((n) => badgeVariables({ firstName: n }));

  it('shrinks text to fit and shares one size across badges', () => {
    const [size] = sharedSizes(template, people, measure, 4);
    expect(measure('Maximiliana-Josephine', size, true)).toBeLessThanOrEqual(4);
    expect(size).toBeLessThan(40);
  });

  it('draws text inside its box with FIRST in italics', () => {
    const calls = [];
    const surface = { measure, text: (...a) => calls.push(['text', ...a]), rect: (...a) => calls.push(['rect', ...a]) };
    const t = normalizeTemplate({ blocks: [{ text: 'Go FIRST', x: 0.25, y: 0.5, w: 0.5, h: 0.25, size: 12, fill: '#000000', color: '#ffffff' }] });
    drawBadge(surface, t, {}, { labelW: 4, labelH: 2 });
    expect(calls[0]).toEqual(['rect', 1, 1, 2, 0.5, '#000000']);
    expect(calls.slice(1).map((c) => [c[1], c[6]])).toEqual([['Go ', false], ['FIRST', true]]);
    const left = calls[1][2];
    const right = calls[2][2] + measure('FIRST', 12);
    expect(left).toBeGreaterThanOrEqual(1);
    expect(right).toBeLessThanOrEqual(3 + 1e-9);
    expect((left + right) / 2).toBeCloseTo(2, 5);
  });

  it('skips a block and its background when its text is empty', () => {
    const calls = [];
    const t = normalizeTemplate({ blocks: [{ text: '{pronouns}', fill: '#000000' }] });
    drawBadge({ measure, text: () => calls.push(1), rect: () => calls.push(1) }, t, badgeVariables({ pronouns: 'Not Specified' }), { labelW: 4, labelH: 2 });
    expect(calls).toEqual([]);
  });
});

describe('store', () => {
  beforeEach(() => localStorage.clear());

  it('saves, lists after built-ins, and deletes', () => {
    const mine = copyOf(BUILT_IN_TEMPLATES[0], 'Mine');
    expect(saveTemplate(mine)).toBe(true);
    expect(allTemplates().map((t) => t.name)).toEqual([...BUILT_IN_TEMPLATES.map((t) => t.name), 'Mine']);
    deleteTemplate(mine.id);
    expect(loadSaved()).toEqual([]);
  });

  it('refuses to overwrite a built-in', () => {
    expect(() => saveTemplate(BUILT_IN_TEMPLATES[0])).toThrow(/Make a copy/);
  });

  it('round-trips through a file with a fresh id', () => {
    const mine = copyOf(BUILT_IN_TEMPLATES[1], 'Shared');
    const back = fromJSON(toJSON(mine));
    expect(back.name).toBe('Shared');
    expect(back.id).not.toBe(mine.id);
    expect(back.blocks).toEqual(mine.blocks);
    expect(() => fromJSON('not json')).toThrow(/not a badge template/);
  });

  it('ignores corrupt storage', () => {
    localStorage.setItem('vctools.badgeTemplates', '{oops');
    expect(loadSaved()).toEqual([]);
  });
});
