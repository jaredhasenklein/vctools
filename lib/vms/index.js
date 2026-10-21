// Entry point for the shared VMS report library.
// Module pages import from here. Classic page scripts (not yet ported) can use window.VMS,
// which is available once this module has run (before any user can drop a file).

import * as fields from './fields.js';
import * as parse from './parse.js';
import * as mapping from './mapping.js';
import * as tools from './tools.js';
import * as handoff from './handoff.js';
import * as table from './table.js';

export * from './fields.js';
export * from './parse.js';
export * from './mapping.js';
export * from './tools.js';
export * from './handoff.js';
export * from './table.js';

if (typeof window !== 'undefined') {
  window.VMS = Object.freeze({ ...fields, ...parse, ...mapping, ...tools, ...handoff, ...table });
  // Page scripts attach their file handlers by the load event.
  if (document.readyState === 'complete') handoff.receiveHandOff();
  else window.addEventListener('load', () => handoff.receiveHandOff());
}
