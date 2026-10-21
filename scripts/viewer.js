// Report Viewer: any VMS report as a searchable, sortable table.
import { readReportFile, checkAccepted, acceptsFor, emptyColumns, viewRows, toTable } from '../lib/vms/index.js';

const $ = (id) => document.getElementById(id);
const MAX_RENDERED_ROWS = 2000; // Keeps the page responsive; search and export still use every row.

let report = null;
let fileName = '';
const view = { query: '', sortColumn: null, sortDir: 'asc', hidden: new Set() };

function visibleColumns() {
  return report.headers.map((_, i) => i).filter((i) => report.headers[i] && !view.hidden.has(i));
}

function renderMeta() {
  const m = report.meta;
  const items = [['Report', m.report], ['Event', m.event], ['Dates', m.eventDates], ['Season', m.season], ['Exported', m.date]];
  $('reportMeta').replaceChildren(...items.filter(([, v]) => v).map(([k, v]) => {
    const wrap = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = k;
    dd.textContent = v;
    wrap.append(dt, dd);
    return wrap;
  }));
}

function renderColumnList() {
  const unknown = new Set(report.unknownHeaders);
  $('columnList').replaceChildren(...report.headers.map((h, i) => {
    if (!h) return '';
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !view.hidden.has(i);
    box.addEventListener('change', () => {
      if (box.checked) view.hidden.delete(i);
      else view.hidden.add(i);
      renderTable();
    });
    label.append(box, ` ${h}`);
    if (unknown.has(h)) {
      const tag = document.createElement('span');
      tag.className = 'is-new';
      tag.textContent = '(not in data dictionary)';
      label.append(' ', tag);
    }
    return label;
  }));
}

function renderTable() {
  const cols = visibleColumns();
  const rows = viewRows(report, { ...view, columns: cols });

  const tr = document.createElement('tr');
  for (const i of cols) {
    const th = document.createElement('th');
    th.scope = 'col';
    if (view.sortColumn === i) th.setAttribute('aria-sort', view.sortDir === 'asc' ? 'ascending' : 'descending');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = report.headers[i];
    button.addEventListener('click', () => {
      if (view.sortColumn === i && view.sortDir === 'asc') view.sortDir = 'desc';
      else if (view.sortColumn === i) view.sortColumn = null;
      else Object.assign(view, { sortColumn: i, sortDir: 'asc' });
      renderTable();
      document.querySelector(`#reportTable th:nth-child(${cols.indexOf(i) + 1}) button`)?.focus();
    });
    th.append(button);
    tr.append(th);
  }
  $('reportTable').tHead.replaceChildren(tr);

  const body = document.createDocumentFragment();
  for (const row of rows.slice(0, MAX_RENDERED_ROWS)) {
    const r = document.createElement('tr');
    for (const i of cols) {
      const td = document.createElement('td');
      td.textContent = row[i] ?? '';
      r.append(td);
    }
    body.append(r);
  }
  $('reportTable').tBodies[0].replaceChildren(body);

  const total = report.rows.length;
  let count = rows.length === total ? `${total} rows` : `${rows.length} of ${total} rows`;
  if (rows.length > MAX_RENDERED_ROWS) count += ` (showing first ${MAX_RENDERED_ROWS}; download for all)`;
  $('rowCount').textContent = count;
}

function hideEmpty(on) {
  for (const i of emptyColumns(report)) {
    if (on) view.hidden.add(i);
    else view.hidden.delete(i);
  }
}

async function onFiles(files) {
  if (files.target) files = files.target.files;
  const file = files?.[0];
  if (!file) return;
  clearError();
  try {
    const next = await readReportFile(file);
    checkAccepted(next, acceptsFor('viewer'));
    report = next;
  } catch (err) {
    showError(err.message);
    return;
  }
  fileName = file.name;
  Object.assign(view, { query: '', sortColumn: null, sortDir: 'asc', hidden: new Set() });
  $('search').value = '';
  hideEmpty($('hideEmpty').checked);
  setDropzoneLoaded($('dropzone'), { fileName, detail: describeReport(report, `${report.rows.length} rows`) });
  renderMeta();
  renderColumnList();
  renderTable();
  $('viewer').hidden = false;
}

let searchTimer;
$('search').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    view.query = e.target.value;
    renderTable();
  }, 120);
});
$('hideEmpty').addEventListener('change', (e) => {
  hideEmpty(e.target.checked);
  renderColumnList();
  renderTable();
});
$('showAll').addEventListener('click', () => {
  view.hidden.clear();
  $('hideEmpty').checked = false;
  renderColumnList();
  renderTable();
});
$('downloadCsv').addEventListener('click', () => {
  const cols = visibleColumns();
  const csv = Papa.unparse(toTable(report, viewRows(report, { ...view, columns: cols }), cols));
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace(/\.csv$/i, '') + ' (filtered).csv';
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
$('printTable').addEventListener('click', () => window.print());

setupDragAndDrop($('dropzone'), $('fileInput'), onFiles);
