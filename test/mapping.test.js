import { readFileSync } from 'node:fs';
import Papa from 'papaparse';
import { describe, it, expect, beforeEach } from 'vitest';
import { readReportText } from '../lib/vms/parse.js';
import { resolveWithUser, loadMapping } from '../lib/vms/mapping.js';

const fixture = readFileSync('test/fixtures/training-and-certifications.csv', 'utf8');
const report = () => readReportText(fixture.replace(',Course Name,', ',Training Module,'), Papa);
const NEEDS = { email: { required: true }, courseName: { required: true }, shirtSize: {} };

function answer(choices) {
  const dialog = document.querySelector('.vms-map-dialog');
  for (const [field, value] of Object.entries(choices)) {
    dialog.querySelector(`select[data-field="${field}"]`).value = value;
  }
  dialog.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('resolveWithUser', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('skips the dialog when every field is present', async () => {
    const r = readReportText(fixture, Papa);
    const columns = await resolveWithUser(r, { email: {}, courseName: {} });
    expect(columns).toEqual({ email: 3, courseName: 7 });
    expect(document.querySelector('.vms-map-dialog')).toBeNull();
  });

  it('asks once, lists new columns first, and remembers the answer', async () => {
    const pending = resolveWithUser(report(), NEEDS);
    const select = document.querySelector('select[data-field="courseName"]');
    expect(select.options[2].value).toBe('Training Module');
    expect(select.options[2].textContent).toContain('(new column)');
    answer({ courseName: 'Training Module', shirtSize: '__skip__' });
    expect(await pending).toEqual({ email: 3, courseName: 7, shirtSize: null });
    expect(loadMapping('Training and Certifications')).toEqual({ courseName: 'Training Module', shirtSize: null });

    const again = await resolveWithUser(report(), NEEDS);
    expect(again.courseName).toBe(7);
    expect(document.querySelector('.vms-map-dialog')).toBeNull();
  });

  it('requires a choice for every listed field', async () => {
    resolveWithUser(report(), NEEDS).catch(() => {});
    answer({ courseName: 'Training Module' });
    expect(document.querySelector('.vms-map-error').textContent).toMatch(/Shirt Size/);
    expect(document.querySelector('.vms-map-dialog')).not.toBeNull();
    document.querySelector('.vms-map-actions .btn-secondary').click();
  });

  it('rejects when the user cancels', async () => {
    const pending = resolveWithUser(report(), NEEDS);
    document.querySelector('.vms-map-actions .btn-secondary').click();
    await expect(pending).rejects.toThrow(/cancelled/);
  });
});

describe('loadReport', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    globalThis.Papa = Papa;
  });

  it('returns records keyed by field', async () => {
    const { loadReport } = await import('../lib/vms/mapping.js');
    const file = new Blob([fixture]);
    const { report, records } = await loadReport(file, { email: {}, role: {} });
    expect(report.meta.program).toBe('FRC');
    expect(records[0]).toMatchObject({ email: 'alex@example.com', role: 'Judge, Judge Advisor' });
  });

  it('shows one dialog when the same file arrives twice at once', async () => {
    const { loadReport, isCancelled } = await import('../lib/vms/mapping.js');
    const text = fixture.replace(',Course Name,', ',Training Module,');
    const a = loadReport(new Blob([text]), { courseName: {} });
    const b = loadReport(new Blob([text]), { courseName: {} });
    await new Promise((r) => setTimeout(r, 20));
    expect(document.querySelectorAll('.vms-map-dialog')).toHaveLength(1);
    document.querySelector('.vms-map-actions .btn-secondary').click();
    const results = await Promise.allSettled([a, b]);
    expect(results.every((r) => r.status === 'rejected' && isCancelled(r.reason))).toBe(true);
  });
});

describe('accepted reports', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    globalThis.Papa = Papa;
  });

  it('rejects a report the tool was not built for, without a mapping dialog', async () => {
    const { loadReport } = await import('../lib/vms/mapping.js');
    await expect(loadReport(new Blob([fixture]), { rolesAssigned: {} }, { accepts: ['Name Badges', 'Assigned Volunteers'] }))
      .rejects.toThrow('This is a Training and Certifications report. This tool needs Name Badges or Assigned Volunteers.');
    expect(document.querySelector('.vms-map-dialog')).toBeNull();
  });

  it('matches names loosely ("&" vs "and", spacing, plural)', async () => {
    const { checkAccepted } = await import('../lib/vms/mapping.js');
    const r = (name) => ({ meta: { report: name } });
    expect(() => checkAccepted(r('Consent And Release Status'), ['Consent & Release Status'])).not.toThrow();
    expect(() => checkAccepted(r('Training and Certifications'), ['Training and Certification'])).not.toThrow();
    expect(() => checkAccepted(r('Judges'), ['Name Badges'])).toThrow();
    expect(() => checkAccepted(r(undefined), ['Name Badges'])).not.toThrow();
  });
});

describe('optional fields', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('does not ask about an absent optional field when there are no new columns', async () => {
    const r = readReportText(fixture, Papa);
    const columns = await resolveWithUser(r, { email: { required: true }, shirtSize: {} });
    expect(columns).toEqual({ email: 3, shirtSize: null });
    expect(document.querySelector('.vms-map-dialog')).toBeNull();
  });
});
