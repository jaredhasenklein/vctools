import { describe, it, expect, beforeEach } from 'vitest';
import { TOOLS, acceptsFor } from '../lib/vms/tools.js';
import { toolsForReport, receiveHandOff } from '../lib/vms/handoff.js';

describe('tool registry', () => {
  it('gives each page its accepted reports', () => {
    expect(acceptsFor('badge')).toEqual(['Name Badges', 'Assigned Volunteers']);
    expect(acceptsFor('emailprep', 'cr')).toEqual(['Consent And Release Status']);
    expect(() => acceptsFor('nope')).toThrow(/lib\/vms\/tools\.js/);
  });

  it('every input names a page file input', () => {
    for (const t of TOOLS) for (const i of t.inputs) expect(i.inputId).toMatch(/^\w+$/);
  });
});

describe('toolsForReport', () => {
  it('lists specific tools first, then the catch-all viewer', () => {
    const pages = (name) => toolsForReport(name).map((m) => m.tool.page);
    expect(pages('Assigned Volunteers')).toEqual(['badge', 'parse', 'emailprep', 'viewer']);
    expect(pages('Training and Certifications')).toEqual(['certification', 'emailprep', 'viewer']);
    expect(pages('Judges')).toEqual(['viewer']);
    expect(pages(undefined)).toEqual(['viewer']);
  });

  it('hands Email Prep the right input for each report', () => {
    const input = (name) => toolsForReport(name).find((m) => m.tool.page === 'emailprep').input.inputId;
    expect(input('Assigned Volunteers')).toBe('avInput');
    expect(input('Consent And Release Status')).toBe('crInput');
  });
});

describe('receiveHandOff', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom has no DataTransfer, and input.files only accepts a real FileList.
    globalThis.DataTransfer = class {
      constructor() { this.files = []; this.items = { add: (f) => this.files.push(f) }; }
    };
  });
  const fileInput = (id) => {
    document.body.innerHTML = `<input type="file" id="${id}">`;
    const el = document.getElementById(id);
    let files = [];
    Object.defineProperty(el, 'files', { get: () => files, set: (v) => { files = v; } });
    return el;
  };

  it('fills the named input once, then forgets the file', () => {
    window.history.replaceState({}, '', '/badge');
    const input = fileInput('fileInput');
    const seen = [];
    input.addEventListener('change', () => seen.push(input.files[0].name));
    sessionStorage.setItem('vctools.handoff', JSON.stringify({ page: 'badge', inputId: 'fileInput', name: 'a.csv', text: 'x' }));
    receiveHandOff();
    receiveHandOff();
    expect(seen).toEqual(['a.csv']);
    expect(sessionStorage.getItem('vctools.handoff')).toBeNull();
  });

  it('ignores a file meant for another page', () => {
    window.history.replaceState({}, '', '/parse.html');
    const input = fileInput('csvFile');
    sessionStorage.setItem('vctools.handoff', JSON.stringify({ page: 'badge', inputId: 'csvFile', name: 'a.csv', text: 'x' }));
    receiveHandOff();
    expect(input.files.length).toBe(0);
    expect(sessionStorage.getItem('vctools.handoff')).toBeNull();
  });
});
