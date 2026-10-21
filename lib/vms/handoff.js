// Carries a file from the home page's drop zone to the tool the user picks.
//
// The file text goes into sessionStorage (this tab only, never sent anywhere), and the
// tool page removes it as soon as it reads it.

import { TOOLS } from './tools.js';
import { matchesReport, ANY_REPORT } from './mapping.js';

const KEY = 'vctools.handoff';

/**
 * Tools (and which of their inputs) that take a report with this name, specific tools
 * first and catch-all tools (accepts '*') last. Only an input's first match counts.
 */
export function toolsForReport(reportName) {
  const specific = [];
  const general = [];
  for (const tool of TOOLS) {
    if (tool.listed === false) continue;
    for (const input of tool.inputs) {
      if (input.optional) continue;
      if (input.accepts.includes(ANY_REPORT)) {
        general.push({ tool, input });
        break;
      }
      if (reportName && input.accepts.some((a) => matchesReport(a, reportName))) {
        specific.push({ tool, input });
        break;
      }
    }
  }
  return [...specific, ...general];
}

/** Save the file for the tool page and go there. */
export async function handOff(file, tool, input) {
  const text = await file.text();
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ page: tool.page, inputId: input.inputId, name: file.name, text }));
  } catch {
    throw new Error('Your browser blocked passing the file along. Open the tool and choose the file there.');
  }
  window.location.href = tool.page;
}

/** On a tool page: if a file was handed off to it, put it in the right file input. */
export function receiveHandOff() {
  let data;
  try {
    data = JSON.parse(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
  if (!data) return;
  const page = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  if (data.page !== page) return;
  const input = document.getElementById(data.inputId);
  if (!input) return;
  const transfer = new DataTransfer();
  transfer.items.add(new File([data.text], data.name, { type: 'text/csv' }));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
