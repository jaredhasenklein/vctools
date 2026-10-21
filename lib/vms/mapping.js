// Asks the user to fill in fields a report is missing, and remembers the answers.
//
// When FIRST renames or drops a column, the tool shows one dialog: for each missing
// field, pick the matching column or choose "Not in this report". Choices are saved
// in this browser per report name, so the question comes up once.

import { FIELDS, normalizeHeader } from './fields.js';
import { resolveFields, readReportFile, toRecords } from './parse.js';

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
      const err = new Error('Column mapping cancelled.');
      err.name = 'MappingCancelled';
      reject(err);
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
// The browser extension can hand a page the same file twice (change event plus a direct
// handleFiles call). Share one open dialog per report and field set instead of stacking two.
const openPrompts = new Map();

export async function resolveWithUser(report, needs) {
  const reportName = report.meta.report;
  let mapping = loadMapping(reportName);
  let { columns, missing } = resolveFields(report, needs, mapping);
  // A missing optional field is only worth asking about when the report has new,
  // unrecognized columns that could be its rename. Otherwise it is simply absent.
  if (!report.unknownHeaders.length) missing = missing.filter((key) => needs[key]?.required);
  if (missing.length) {
    const key = `${reportName}|${missing.join(',')}`;
    if (!openPrompts.has(key)) {
      openPrompts.set(key, promptForMapping(report, missing, needs).finally(() => openPrompts.delete(key)));
    }
    mapping = { ...mapping, ...(await openPrompts.get(key)) };
    saveMapping(reportName, mapping);
    ({ columns } = resolveFields(report, needs, mapping));
  }
  return columns;
}

/** True when the error is the user cancelling the mapping dialog, which needs no error message. */
export function isCancelled(err) {
  return err?.name === 'MappingCancelled';
}

/** Put this in a tool's `accepts` to take every VMS report. */
export const ANY_REPORT = '*';

// Report names compare ignoring case, spacing, "&" vs "and", and plurals
// ("Training and Certification" in the data dictionary, "...Certifications" in exports).
const reportKey = (name) => normalizeHeader(String(name).replace(/&/g, 'and').replace(/s\b/gi, ''));
const sameName = (a, b) => reportKey(a) === reportKey(b);

/** True when two report names refer to the same report. */
export function matchesReport(a, b) {
  if (a === ANY_REPORT || b === ANY_REPORT) return true;
  return Boolean(a && b) && sameName(a, b);
}

/**
 * Reports differ in shape: some have one row per person (Name Badges), others one row
 * per shift or per course (Assigned Volunteers, Training and Certifications). A tool lists
 * the reports it was built for so a different report can't be mapped in by mistake.
 * Files with no "Report:" line are allowed through.
 */
export function checkAccepted(report, accepts) {
  if (!accepts?.length || !report.meta.report || accepts.includes(ANY_REPORT)) return;
  if (accepts.some((name) => sameName(name, report.meta.report))) return;
  const list = accepts.length === 1 ? accepts[0] : `${accepts.slice(0, -1).join(', ')} or ${accepts.at(-1)}`;
  const err = new Error(`This is a ${report.meta.report} report. This tool needs ${list}.`);
  err.name = 'WrongReport';
  throw err;
}

/**
 * One call for a tool: read the file, resolve the fields it needs (asking if necessary),
 * and return records keyed by field.
 *
 * @param {{ accepts?: string[] }} [options]  report names this tool works with, e.g. ['Name Badges']
 * @returns {Promise<{ report: object, columns: Object<string, number|null>, records: object[] }>}
 */
export async function loadReport(file, needs, { accepts } = {}) {
  const report = await readReportFile(file);
  checkAccepted(report, accepts);
  const columns = await resolveWithUser(report, needs);
  return { report, columns, records: toRecords(report, columns) };
}
