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

describe('vms-content csvToHtml', () => {
  it('keeps a comma-separated team list and line breaks in one cell', () => {
    window.eval(readFileSync('browser_extension/vms-content.js', 'utf8'));
    const csv = 'Name,Team Affiliation\n"Tester, Alex","Team ABC, Team 123DEF, Team 7"\nRiley,"Line one\nline <two>"\n';
    expect(window.csvToHtml(csv)).toBe(
      '<table><tr><td>Name</td><td>Team Affiliation</td></tr>'
      + '<tr><td>Tester, Alex</td><td>Team ABC, Team 123DEF, Team 7</td></tr>'
      + '<tr><td>Riley</td><td>Line one<br>line &lt;two&gt;</td></tr></table>');
  });
});

describe('vms-content buttons', () => {
  function vmsPage(reportId, extra = '') {
    window.history.replaceState({}, '', `/VMS/Reports/ReportViewer.aspx?ReportID=${reportId}`);
    document.body.innerHTML = `<form id="Form1"><span><input type="submit" id="MainContent_btnExport" value="Export">${extra}</span></form>`;
    window.eval(readFileSync('browser_extension/vms-content.js', 'utf8'));
    return [...document.querySelectorAll('[data-vctools-button]')].map((b) => b.value);
  }

  it('adds both buttons on reports without a dedicated tool (Judges, Shirt Sizes)', () => {
    expect(vmsPage(33)).toEqual(['✨ Open in VC Tools', '📊 Open in Google Sheets']);
  });

  it('replaces buttons from the older store version, leaving one of each', () => {
    const old = '<input type="button" class="vc-tools-button" value="✨ Open in VC Tools"><input type="button" class="sheets-button" value="📊 Open in Google Sheets">';
    expect(vmsPage(23, old)).toHaveLength(2);
    expect(document.querySelectorAll('input[type=button]')).toHaveLength(2);
  });

  it('removes older buttons that appear after ours on the retry', () => {
    vmsPage(33);
    document.querySelector('#MainContent_btnExport').insertAdjacentHTML('afterend', '<input type="button" class="sheets-button" value="old">');
    window.addCustomButtons();
    expect(document.querySelectorAll('.sheets-button')).toHaveLength(1);
  });

  it('adds them only once', () => {
    vmsPage(19);
    window.addCustomButtons();
    expect(document.querySelectorAll('[data-vctools-button]')).toHaveLength(2);
  });
});
