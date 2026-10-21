// Saved badge templates: kept in this browser (localStorage), and exported or imported
// as .json files to share between computers or with other coordinators.
import { BUILT_IN_TEMPLATES, normalizeTemplate } from './template.js';

const KEY = 'vctools.badgeTemplates';

export function loadSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list.map(normalizeTemplate) : [];
  } catch {
    return [];
  }
}

function writeSaved(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false; // Storage blocked; the template still works until the page closes.
  }
}

/** Built-ins first, then this browser's saved templates. */
export function allTemplates() {
  return [...BUILT_IN_TEMPLATES, ...loadSaved()];
}

/** Save (insert or replace by id). Returns false if the browser blocked storage. */
export function saveTemplate(template) {
  const t = normalizeTemplate(template);
  if (BUILT_IN_TEMPLATES.some((b) => b.id === t.id)) throw new Error('Built-in templates can\'t be changed. Make a copy first.');
  const list = loadSaved().filter((s) => s.id !== t.id);
  list.push(t);
  return writeSaved(list);
}

export function deleteTemplate(id) {
  return writeSaved(loadSaved().filter((s) => s.id !== id));
}

/** A copy with a new id, ready to edit. */
export function copyOf(template, name) {
  const t = normalizeTemplate(JSON.parse(JSON.stringify(template)));
  return { ...t, id: `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: name ?? `Copy of ${template.name}` };
}

export function toJSON(template) {
  const { id, name, blocks } = normalizeTemplate(template);
  return JSON.stringify({ format: 'vctools-badge-template', version: 1, id, name, blocks }, null, 2);
}

/** Read an exported file. Always gets a new id so it never overwrites a saved template. */
export function fromJSON(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not a badge template.');
  }
  return copyOf(normalizeTemplate(raw), raw.name || 'Imported template');
}
