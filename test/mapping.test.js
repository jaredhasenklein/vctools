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
  });

  it('rejects when the user cancels', async () => {
    const pending = resolveWithUser(report(), NEEDS);
    document.querySelector('.vms-map-actions .btn-secondary').click();
    await expect(pending).rejects.toThrow(/cancelled/);
  });
});
