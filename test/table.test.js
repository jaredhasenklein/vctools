import { describe, it, expect } from 'vitest';
import { emptyColumns, viewRows, toTable } from '../lib/vms/table.js';

const report = {
  headers: ['Name', 'Role', 'Team', 'Notes'],
  rows: [
    ['Alex', 'Judge', '254', ''],
    ['jordan', 'Referee', '1114', ''],
    ['Riley', 'Judge Advisor', '', ''],
    ['Sam', 'Queuer', '33', ''],
  ],
};

describe('report table', () => {
  it('finds all-blank columns', () => {
    expect(emptyColumns(report)).toEqual([3]);
  });
  it('filters on every word, across visible columns only', () => {
    expect(viewRows(report, { query: 'judge' }).map((r) => r[0])).toEqual(['Alex', 'Riley']);
    expect(viewRows(report, { query: 'judge advisor' }).map((r) => r[0])).toEqual(['Riley']);
    expect(viewRows(report, { query: '254', columns: [0, 1] })).toEqual([]);
  });
  it('sorts case-insensitively, numbers by value, blanks last', () => {
    expect(viewRows(report, { sortColumn: 0 }).map((r) => r[0])).toEqual(['Alex', 'jordan', 'Riley', 'Sam']);
    expect(viewRows(report, { sortColumn: 2 }).map((r) => r[2])).toEqual(['33', '254', '1114', '']);
    expect(viewRows(report, { sortColumn: 2, sortDir: 'desc' }).map((r) => r[2])).toEqual(['1114', '254', '33', '']);
  });
  it('does not reorder the report itself', () => {
    viewRows(report, { sortColumn: 0, sortDir: 'desc' });
    expect(report.rows[0][0]).toBe('Alex');
  });
  it('exports only the chosen columns', () => {
    expect(toTable(report, report.rows.slice(0, 1), [1, 0])).toEqual([['Role', 'Name'], ['Judge', 'Alex']]);
  });
});
