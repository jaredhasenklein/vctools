// Asks the user to fill in fields a report is missing, and remembers the answers.
//
// When FIRST renames or drops a column, the tool shows one dialog: for each missing
// field, pick the matching column or choose "Not in this report". Choices are saved
// in this browser per report name, so the question comes up once.

import { FIELDS } from './fields.js';
import { resolveFields } from './parse.js';

const STORAGE_PREFIX = 'vctools.columnMap.';
const SKIP = '__skip__';

function storageKey(reportName) {
  return STORAGE_PREFIX + String(reportName || 'unknown').toLowerCase().trim();
}

/** Saved choices for a report: field key -> header text, or null for skipped. */
export function loadMapping(reportName) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(reportName))) ?? {};
  } catch {
    return {};
  }
}

export function saveMapping(reportName, mapping) {
  try {
    localStorage.setItem(storageKey(reportName), JSON.stringify(mapping));
  } catch {
    // Storage blocked (private window, policy). The tool still works; it just asks again next time.
  }
}

export function clearMapping(reportName) {
  try {
    localStorage.removeItem(storageKey(reportName));
  } catch {
    /* ignore */
  }
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

/**
 * Show the mapping dialog for `missing` fields. Resolves to field key -> header text
 * (or null for skip), or rejects if the user cancels.
 */
export function promptForMapping(report, missing, needs) {
  return new Promise((resolve, reject) => {
    const reportName = report.meta.report || 'this report';
    const unknown = new Set(report.unknownHeaders);
    // New, unrecognized columns are the likely matches, so list them first.
    const options = [...report.headers.filter((h) => unknown.has(h)), ...report.headers.filter((h) => h && !unknown.has(h))];

    const rows = missing.map((key) => {
      const select = el('select', { 'data-field': key, id: `vms-map-${key}` });
      select.append(el('option', { value: '' }, 'Choose a column...'));
      select.append(el('option', { value: SKIP }, 'Not in this report (skip)'));
      for (const h of options) select.append(el('option', { value: h }, h + (unknown.has(h) ? ' (new column)' : '')));
      const label = el('label', { for: select.id }, FIELDS[key].label, needs[key]?.required ? el('span', { class: 'vms-map-required' }, ' required') : '');
      return el('div', { class: 'vms-map-row' }, label, select);
    });

    const error = el('p', { class: 'vms-map-error', role: 'alert' });
    const cancel = el('button', { type: 'button', class: 'btn btn-secondary' }, 'Cancel');
    const ok = el('button', { type: 'submit', class: 'btn btn-primary' }, 'Continue');
    const form = el(
      'form',
      { method: 'dialog' },
      el('h2', {}, 'Some columns were not found'),
      el('p', {}, `FIRST may have renamed or removed these columns in ${reportName}. Pick the matching column, or skip it. Skipped fields are left blank and features that need them are turned off.`),
      ...rows,
      error,
      el('div', { class: 'vms-map-actions' }, cancel, ok),
    );
    const dialog = el('dialog', { class: 'vms-map-dialog', 'aria-labelledby': 'vms-map-title' }, form);
    form.querySelector('h2').id = 'vms-map-title';

    const close = () => {
      dialog.close?.();
      dialog.remove();
    };
    cancel.addEventListener('click', () => {
      close();
      reject(new Error('Column mapping cancelled.'));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = {};
      for (const select of form.querySelectorAll('select')) {
        if (!select.value) {
          error.textContent = `Choose a column or "skip" for ${FIELDS[select.dataset.field].label}.`;
          select.focus();
          return;
        }
        result[select.dataset.field] = select.value === SKIP ? null : select.value;
      }
      close();
      resolve(result);
    });

    document.body.append(dialog);
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
  });
}

/**
 * Resolve the fields a tool needs, asking the user about any that are missing.
 *
 * @param {object} report  from readReport / readReportFile
 * @param {Object<string, {required?: boolean}>} needs  field key -> options
 * @returns {Promise<Object<string, number|null>>} field key -> column index, or null when skipped
 */
export async function resolveWithUser(report, needs) {
  const reportName = report.meta.report;
  let mapping = loadMapping(reportName);
  let { columns, missing } = resolveFields(report, needs, mapping);
  if (missing.length) {
    mapping = { ...mapping, ...(await promptForMapping(report, missing, needs)) };
    saveMapping(reportName, mapping);
    ({ columns } = resolveFields(report, needs, mapping));
  }
  return columns;
}
