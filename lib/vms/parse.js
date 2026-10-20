// Forgiving reader for VMS report exports.
//
// A VMS export is a preamble (report name, event, season, a PII warning), then a
// header row, then data. FIRST changes the preamble length and adds, renames, and
// removes columns, so nothing here depends on row numbers or column positions:
// the header row is found by content and columns are resolved by field name.

import { fieldForHeader, FIELDS } from './fields.js';

/** How many rows to search for the header. Today it is row 19. */
const HEADER_SEARCH_LIMIT = 60;
/** A row must contain at least this many known field names to count as the header. */
const MIN_HEADER_MATCHES = 2;

/**
 * Repair text that was UTF-8 but got decoded as Windows-1252, e.g. "BIOCOREâ„¢" -> "BIOCORE™".
 * Text that is already fine is returned unchanged.
 */
export function fixMojibake(text) {
  const s = String(text ?? '');
  if (!/[ÂÃâ][\u0080-ÿŒ-™]/.test(s)) return s;
  const cp1252 = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88,
    '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93,
    '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b,
    'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
  };
  const bytes = [];
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code < 0x100) bytes.push(code);
    else if (cp1252[ch] !== undefined) bytes.push(cp1252[ch]);
    else return s; // Not a clean round trip; leave it alone.
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return s;
  }
}

const PROGRAMS = [
  { program: 'FRC', patterns: [/\bFRC\b/, /Robotics Competition/i] },
  { program: 'FTC', patterns: [/\bFTC\b/, /Tech Challenge/i] },
  { program: 'FLL', patterns: [/\bFLL\b/, /LEGO League/i] },
];

/** FRC, FTC, FLL, or null, from an event name like "CA-Van Nuys-... Kickoff - FRC". */
export function detectProgram(eventName) {
  const name = String(eventName ?? '');
  const suffix = name.match(/-\s*(FRC|FTC|FLL)\s*$/i);
  if (suffix) return suffix[1].toUpperCase();
  for (const { program, patterns } of PROGRAMS) {
    if (patterns.some((p) => p.test(name))) return program;
  }
  return null;
}

const PREAMBLE_KEYS = {
  report: 'report',
  date: 'date',
  event: 'event',
  location: 'location',
  eventdates: 'eventDates',
  season: 'season',
};

/**
 * Read the "Key: value" lines and the coordinator list above the header row.
 * Unknown keys are kept in `extra` so a new preamble line never breaks anything.
 */
export function parsePreamble(rows) {
  const meta = { coordinators: [], extra: {} };
  let inCoordinators = false;
  for (const row of rows) {
    const line = fixMojibake((row ?? []).filter((c) => c != null && String(c).trim() !== '').join(', ')).trim();
    if (!line) {
      inCoordinators = false;
      continue;
    }
    if (/^volunteer coordinator/i.test(line)) {
      inCoordinators = true;
      continue;
    }
    if (/^warning:/i.test(line)) break; // The PII notice ends the useful preamble.
    const kv = line.match(/^([A-Za-z ]+):\s*(.*)$/);
    if (kv && !inCoordinators) {
      const key = PREAMBLE_KEYS[kv[1].toLowerCase().replace(/\s+/g, '')];
      if (key) meta[key] = kv[2].trim();
      else meta.extra[kv[1].trim()] = kv[2].trim();
      continue;
    }
    if (inCoordinators) meta.coordinators.push(line);
  }
  meta.program = detectProgram(meta.event);
  return meta;
}

/**
 * Index of the header row: the row within the search window with the most cells
 * that are known field names (earliest wins a tie). -1 if none qualifies.
 */
export function findHeaderRow(rows) {
  let best = -1;
  let bestScore = MIN_HEADER_MATCHES - 1;
  const limit = Math.min(rows.length, HEADER_SEARCH_LIMIT);
  for (let i = 0; i < limit; i++) {
    const score = (rows[i] ?? []).filter((c) => fieldForHeader(c)).length;
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Turn rows (arrays of cells, as PapaParse returns them) into a report.
 *
 * @param {string[][]} rows
 * @returns {{
 *   meta: object,           preamble values (report, event, program, season...)
 *   headers: string[],      header cells as they appear in the file
 *   columns: Object<string, number>,  field key -> column index, for recognized headers
 *   unknownHeaders: string[],          headers not in the field registry (new columns)
 *   rows: string[][],       data rows, blank rows removed
 * }}
 */
export function readReport(rows) {
  const headerIndex = findHeaderRow(rows);
  if (headerIndex === -1) {
    throw new Error('This file does not look like a VMS report: no header row with known column names was found.');
  }
  const headers = rows[headerIndex].map((h) => fixMojibake(String(h ?? '').trim()));
  const columns = {};
  const unknownHeaders = [];
  headers.forEach((h, i) => {
    if (!h) return;
    const key = fieldForHeader(h);
    if (key && columns[key] === undefined) columns[key] = i;
    else if (!key) unknownHeaders.push(h);
  });
  const data = rows
    .slice(headerIndex + 1)
    .filter((r) => r.some((c) => String(c ?? '').trim() !== ''));
  return { meta: parsePreamble(rows.slice(0, headerIndex)), headers, columns, unknownHeaders, rows: data };
}

/**
 * Which of the fields a tool needs are missing from a report.
 *
 * @param {object} report  from readReport
 * @param {Object<string, {required?: boolean}>} needs  field key -> options
 * @param {Object<string, string|null>} [mapping]  user choices: field key -> header text, or null for "skip"
 * @returns {{ columns: Object<string, number|null>, missing: string[] }}
 *   columns: every needed field -> column index, or null if absent or skipped.
 *   missing: needed fields with no column and no user decision yet.
 */
export function resolveFields(report, needs, mapping = {}) {
  const columns = {};
  const missing = [];
  for (const key of Object.keys(needs)) {
    if (!FIELDS[key]) throw new Error(`Unknown field "${key}". Add it to lib/vms/fields.js.`);
    if (report.columns[key] !== undefined) {
      columns[key] = report.columns[key];
      continue;
    }
    if (key in mapping) {
      const idx = mapping[key] === null ? -1 : report.headers.indexOf(mapping[key]);
      columns[key] = idx === -1 ? null : idx;
      if (mapping[key] !== null && idx === -1) missing.push(key); // Saved header no longer present.
      continue;
    }
    columns[key] = null;
    missing.push(key);
  }
  return { columns, missing };
}

/**
 * Data rows as objects keyed by field key, trimmed. Fields without a column are ''.
 * `_raw` keeps the original row for columns the tool does not know about.
 */
export function toRecords(report, columns) {
  return report.rows.map((row) => {
    const rec = { _raw: row };
    for (const [key, idx] of Object.entries(columns)) {
      rec[key] = idx == null ? '' : String(row[idx] ?? '').trim();
    }
    return rec;
  });
}

/** Parse CSV text with PapaParse (loaded by the page as a global) and read it as a report. */
export function readReportText(text, papa = globalThis.Papa) {
  if (!papa) throw new Error('PapaParse is not loaded on this page.');
  const { data } = papa.parse(String(text).replace(/^﻿/, ''), { skipEmptyLines: false });
  return readReport(data);
}

/** Read a File or Blob from a file input, drop zone, or the browser extension. */
export async function readReportFile(file, papa = globalThis.Papa) {
  return readReportText(await file.text(), papa);
}
