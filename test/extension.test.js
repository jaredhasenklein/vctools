// The extension's content scripts are plain scripts; load them into jsdom with a fake `chrome`.
import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeEach } from 'vitest';

describe('vms-content csvToTsv', () => {
  it('keeps quoted commas and quotes, and flattens line breaks inside a cell', () => {
    window.eval(readFileSync('browser_extension/vms-content.js', 'utf8'));
    const csv = 'Name,Roles,Note\r\n"Tester, Alex","Judge, Referee","He said ""hi""\nthere"\nRiley,Queuer,\n';
    expect(window.csvToTsv(csv)).toBe('Name\tRoles\tNote\nTester, Alex\tJudge, Referee\tHe said "hi" there\nRiley\tQueuer\t');
  });
});

describe('vctools-content', () => {
  let store;
  beforeEach(() => {
    store = {};
    globalThis.chrome = {
      runtime: {},
      storage: { local: {
        get: (keys, cb) => cb({ ...store }),
        remove: (keys) => keys.forEach((k) => delete store[k]),
      } },
    };
    globalThis.DataTransfer = class { constructor() { this.files = []; this.items = { add: (f) => this.files.push(f) }; } };
  });

  function load(path, inputHtml) {
    window.history.replaceState({}, '', path);
    document.body.innerHTML = inputHtml;
    const input = document.querySelector('input');
    let files = [];
    Object.defineProperty(input, 'files', { get: () => files, set: (v) => { files = v; } });
    const seen = [];
    input.addEventListener('change', () => seen.push(input.files[0]));
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    window.eval(readFileSync('browser_extension/vctools-content.js', 'utf8'));
    return seen;
  }

  it('hands a UTF-8 report to the matching page once', async () => {
    store = { csvData: 'Season: BIOCORE™, Zoë', csvFileName: 'name_badges.csv', targetTool: 'badge.html' };
    const seen = load('/badge', '<input type="file" accept=".csv">');
    expect(seen).toHaveLength(1);
    expect(seen[0].name).toBe('name_badges.csv');
    expect(await seen[0].text()).toBe('Season: BIOCORE™, Zoë');
    expect(store).toEqual({});
  });

  it('sends unknown reports to the home page', () => {
    store = { csvData: 'x', csvFileName: 'judges.csv', targetTool: 'index' };
    expect(load('/', '<input type="file" accept=".csv">')).toHaveLength(1);
  });

  it('leaves the report alone on a different page', () => {
    store = { csvData: 'x', csvFileName: 'a.csv', targetTool: 'parse' };
    expect(load('/badge.html', '<input type="file" accept=".csv">')).toHaveLength(0);
    expect(store.csvData).toBe('x');
  });
});
