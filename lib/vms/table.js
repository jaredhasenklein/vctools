// Sorting, filtering, and column selection for showing a report as a table.
// Pure functions over a report from readReport(); the viewer page draws the result.

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Column indexes whose cells are all blank. */
export function emptyColumns(report) {
  return report.headers
    .map((_, i) => i)
    .filter((i) => report.rows.every((row) => String(row[i] ?? '').trim() === ''));
}

/**
 * Rows to show.
 * @param {object} report  from readReport
 * @param {{ query?: string, sortColumn?: number|null, sortDir?: 'asc'|'desc', columns?: number[] }} view
 *   query matches any visible cell (case-insensitive; all words must appear in the row).
 * @returns {string[][]} rows in display order, full width (index with `columns`)
 */
export function viewRows(report, { query = '', sortColumn = null, sortDir = 'asc', columns } = {}) {
  const cols = columns ?? report.headers.map((_, i) => i);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let rows = report.rows;
  if (words.length) {
    rows = rows.filter((row) => {
      const text = cols.map((i) => String(row[i] ?? '')).join(' ').toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }
  if (sortColumn != null) {
    const dir = sortDir === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const x = String(a[sortColumn] ?? '').trim();
      const y = String(b[sortColumn] ?? '').trim();
      if (!x || !y) return x ? -1 : y ? 1 : 0; // Blanks last either way.
      return dir * collator.compare(x, y);
    });
  }
  return rows;
}

/** Header row plus rows, limited to `columns`, ready for Papa.unparse. */
export function toTable(report, rows, columns) {
  return [columns.map((i) => report.headers[i]), ...rows.map((row) => columns.map((i) => row[i] ?? ''))];
}
