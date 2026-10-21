// Badge template editor: an interactive canvas preview plus a panel of block settings.
// Used by scripts/badge.js. Drawing goes through drawBadge() so it matches the PDF.
import { drawBadge, sharedSizes, normalizeBlock, unknownVariables, VARIABLES, BLOCK_DEFAULTS } from '../lib/badges/template.js';
import { saveTemplate, deleteTemplate, copyOf, toJSON, fromJSON, allTemplates } from '../lib/badges/store.js';

const $ = (id) => document.getElementById(id);
const FONT = 'Helvetica, Arial, sans-serif'; // Arial matches Helvetica's widths.
const HANDLE = 10; // Resize handle size in CSS pixels.
const round = (n) => Math.round(n * 1000) / 1000;

/** Drawing surface for a 2D canvas; `ppi` is CSS pixels per inch. */
export function canvasSurface(ctx, ppi) {
  const font = (size, bold, italic) => `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${(size / 72) * ppi}px ${FONT}`;
  return {
    measure(text, size, bold, italic) {
      ctx.font = font(size, bold, italic);
      return ctx.measureText(text).width / ppi;
    },
    text(text, x, baseline, size, bold, italic, color) {
      ctx.font = font(size, bold, italic);
      ctx.fillStyle = color;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, x * ppi, baseline * ppi);
    },
    rect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * ppi, y * ppi, w * ppi, h * ppi);
    },
  };
}

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas
 * @param {() => object} o.getTemplate  template selected on the page
 * @param {() => {labelWidth: number, labelHeight: number}} o.getLabel
 * @param {() => object} o.getVars  variables for the person being previewed
 * @param {() => object[]} o.getAllVars  variables for everyone (for shared font sizes)
 * @param {(selectId?: string) => void} o.onTemplatesChanged  refresh the page's template list
 */
export function createEditor({ canvas, getTemplate, getLabel, getVars, getAllVars, onTemplatesChanged }) {
  let editing = null;   // Template being edited (a saved, non-built-in template)
  let selected = 0;     // Selected block index
  let drag = null;      // { mode: 'move'|'resize', startX, startY, block }
  let ppi = 100;

  const template = () => editing ?? getTemplate();

  // ----- Drawing -----

  function render() {
    const label = getLabel();
    const cssWidth = Math.min(canvas.parentElement.clientWidth || 400, 480);
    ppi = cssWidth / label.labelWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${label.labelHeight * ppi}px`;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(label.labelHeight * ppi * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cssWidth, label.labelHeight * ppi);

    const t = template();
    const surface = canvasSurface(ctx, ppi);
    const sizes = sharedSizes(t, getAllVars(), surface.measure, label.labelWidth);
    drawBadge(surface, t, getVars(), { labelW: label.labelWidth, labelH: label.labelHeight, sizes });

    if (editing) {
      t.blocks.forEach((b, i) => {
        const [x, y, w, h] = [b.x * cssWidth, b.y * label.labelHeight * ppi, b.w * cssWidth, b.h * label.labelHeight * ppi];
        ctx.save();
        ctx.setLineDash(i === selected ? [] : [4, 3]);
        ctx.lineWidth = i === selected ? 2 : 1;
        ctx.strokeStyle = i === selected ? '#0066cc' : 'rgba(0, 102, 204, 0.5)';
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        if (i === selected) {
          ctx.fillStyle = '#0066cc';
          ctx.fillRect(x + w - HANDLE, y + h - HANDLE, HANDLE, HANDLE);
        }
        ctx.restore();
      });
    }
    canvas.classList.toggle('is-editing', Boolean(editing));
  }

  // ----- Panel -----

  const fields = {
    text: $('propText'), x: $('propX'), y: $('propY'), w: $('propW'), h: $('propH'),
    size: $('propSize'), minSize: $('propMin'), bold: $('propBold'), italic: $('propItalic'),
    upper: $('propUpper'), sameSize: $('propSame'), color: $('propColor'), fill: $('propFill'), hasFill: $('propHasFill'),
  };

  function block() {
    return editing?.blocks[selected];
  }

  function fillPanel() {
    const label = getLabel();
    $('templateName').value = editing.name;
    $('blockList').replaceChildren(...editing.blocks.map((b, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `badge-block${i === selected ? ' is-selected' : ''}`;
      button.textContent = b.name || b.text || `Block ${i + 1}`;
      button.setAttribute('aria-pressed', String(i === selected));
      button.addEventListener('click', () => select(i));
      const li = document.createElement('li');
      li.append(button);
      return li;
    }));
    const b = block();
    $('blockProps').hidden = !b;
    $('removeBlock').disabled = !b;
    if (!b) return;
    fields.text.value = b.text;
    fields.x.value = round(b.x * label.labelWidth);
    fields.y.value = round(b.y * label.labelHeight);
    fields.w.value = round(b.w * label.labelWidth);
    fields.h.value = round(b.h * label.labelHeight);
    fields.size.value = b.size;
    fields.minSize.value = b.minSize;
    for (const k of ['bold', 'italic', 'upper', 'sameSize']) fields[k].checked = b[k];
    fields.color.value = b.color;
    fields.hasFill.checked = Boolean(b.fill);
    fields.fill.value = b.fill || '#000000';
    fields.fill.disabled = !b.fill;
    for (const btn of document.querySelectorAll('[data-align]')) btn.classList.toggle('active', btn.dataset.align === b.align);
    const unknown = unknownVariables(b.text);
    $('propWarning').textContent = unknown.length ? `Unknown variable${unknown.length > 1 ? 's' : ''}: ${unknown.map((k) => `{${k}}`).join(', ')}. Use the buttons above.` : '';
  }

  let saveTimer;
  function changed({ panel = true } = {}) {
    editing.blocks = editing.blocks.map(normalizeBlock);
    render();
    if (panel) fillPanel();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (!saveTemplate(editing)) showError('Your browser blocked saving. Use Export template to keep a copy.');
      onTemplatesChanged(editing.id);
    }, 300);
  }

  function select(i) {
    selected = Math.max(0, Math.min(i, editing.blocks.length - 1));
    render();
    fillPanel();
  }

  function update(patch) {
    if (!block()) return;
    Object.assign(editing.blocks[selected], patch);
    changed();
  }

  // Text and numbers: update the preview while typing but keep focus in the field.
  fields.text.addEventListener('input', () => {
    if (!block()) return;
    editing.blocks[selected].text = fields.text.value;
    changed({ panel: false });
    const unknown = unknownVariables(fields.text.value);
    $('propWarning').textContent = unknown.length ? `Unknown variable: ${unknown.map((k) => `{${k}}`).join(', ')}` : '';
  });
  fields.text.addEventListener('change', fillPanel);
  const inches = { x: 'labelWidth', y: 'labelHeight', w: 'labelWidth', h: 'labelHeight' };
  for (const [key, dim] of Object.entries(inches)) {
    fields[key].addEventListener('input', () => {
      const v = parseFloat(fields[key].value);
      if (Number.isFinite(v)) {
        editing.blocks[selected][key] = v / getLabel()[dim];
        changed({ panel: false });
      }
    });
    fields[key].addEventListener('change', fillPanel);
  }
  for (const key of ['size', 'minSize']) {
    fields[key].addEventListener('input', () => {
      const v = parseFloat(fields[key].value);
      if (Number.isFinite(v)) {
        editing.blocks[selected][key] = v;
        changed({ panel: false });
      }
    });
    fields[key].addEventListener('change', fillPanel);
  }
  for (const key of ['bold', 'italic', 'upper', 'sameSize']) {
    fields[key].addEventListener('change', () => update({ [key]: fields[key].checked }));
  }
  fields.color.addEventListener('input', () => update({ color: fields.color.value }));
  fields.hasFill.addEventListener('change', () => update({ fill: fields.hasFill.checked ? fields.fill.value : '' }));
  fields.fill.addEventListener('input', () => update({ fill: fields.fill.value }));
  for (const btn of document.querySelectorAll('[data-align]')) {
    btn.addEventListener('click', () => update({ align: btn.dataset.align }));
  }

  $('variableChips').replaceChildren(...VARIABLES.map((v) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'badge-var';
    chip.textContent = `{${v.key}}`;
    chip.title = v.label;
    chip.addEventListener('click', () => {
      const input = fields.text;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.setRangeText(`{${v.key}}`, start, end, 'end');
      input.dispatchEvent(new Event('input'));
      input.focus();
    });
    return chip;
  }));

  $('templateName').addEventListener('input', () => {
    editing.name = $('templateName').value || 'Untitled template';
    changed({ panel: false });
  });
  $('addBlock').addEventListener('click', () => {
    editing.blocks.push(normalizeBlock({ ...BLOCK_DEFAULTS, name: `Text ${editing.blocks.length + 1}`, text: 'New text', y: 0.4 }));
    selected = editing.blocks.length - 1;
    changed();
    fields.text.select();
  });
  $('removeBlock').addEventListener('click', () => {
    if (!block()) return;
    editing.blocks.splice(selected, 1);
    selected = Math.max(0, selected - 1);
    changed();
  });
  $('exportTemplate').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([toJSON(editing)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${editing.name.replace(/[^\w -]+/g, '').trim() || 'badge-template'}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  $('importTemplate').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = fromJSON(await file.text());
      saveTemplate(imported);
      onTemplatesChanged(imported.id);
      open();
    } catch (err) {
      showError(err.message);
    }
  });
  $('deleteTemplate').addEventListener('click', () => {
    if (!editing) return;
    if (!window.confirm(`Delete "${editing.name}" from this browser? Export it first if you might want it later.`)) return;
    deleteTemplate(editing.id);
    close({ save: false });
    onTemplatesChanged('styleA');
  });
  $('closeEditor').addEventListener('click', () => {
    close();
    $('customizeTemplate').focus();
  });

  // ----- Canvas interaction -----

  function pointToLabel(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, px: e.clientX - r.left, py: e.clientY - r.top, r };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!editing) return;
    const p = pointToLabel(e);
    const b = block();
    if (b) {
      const right = (b.x + b.w) * p.r.width;
      const bottom = (b.y + b.h) * p.r.height;
      if (p.px >= right - HANDLE && p.px <= right && p.py >= bottom - HANDLE && p.py <= bottom) {
        drag = { mode: 'resize', start: p, orig: { ...b } };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    // Topmost block under the pointer.
    for (let i = editing.blocks.length - 1; i >= 0; i--) {
      const c = editing.blocks[i];
      if (p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h) {
        select(i);
        drag = { mode: 'move', start: p, orig: { ...c } };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = pointToLabel(e);
    const dx = p.x - drag.start.x;
    const dy = p.y - drag.start.y;
    const b = editing.blocks[selected];
    if (drag.mode === 'move') {
      b.x = Math.min(1 - b.w, Math.max(0, drag.orig.x + dx));
      b.y = Math.min(1 - b.h, Math.max(0, drag.orig.y + dy));
    } else {
      b.w = Math.max(0.03, Math.min(1 - b.x, drag.orig.w + dx));
      b.h = Math.max(0.03, Math.min(1 - b.y, drag.orig.h + dy));
    }
    changed({ panel: false });
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    fillPanel();
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', (e) => {
    if (!editing || !block()) return;
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves = { ArrowLeft: ['x', -step], ArrowRight: ['x', step], ArrowUp: ['y', -step], ArrowDown: ['y', step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [k, d] = moves[e.key];
      update({ [k]: block()[k] + d });
    } else if (e.key === 'Tab' && !e.shiftKey && selected < editing.blocks.length - 1) {
      e.preventDefault();
      select(selected + 1);
    }
  });
  window.addEventListener('resize', () => render());

  // ----- Open / close -----

  /** Edit the selected template. A built-in is copied first so the original stays intact. */
  function open() {
    let t = getTemplate();
    if (t.builtIn) {
      t = copyOf(t, `My ${t.name.replace(/\s*\(.*\)$/, '')}`);
      if (!saveTemplate(t)) showError('Your browser blocked saving. Use Export template to keep a copy.');
      onTemplatesChanged(t.id);
    }
    editing = JSON.parse(JSON.stringify(allTemplates().find((x) => x.id === t.id) ?? t));
    selected = 0;
    $('templateEditor').hidden = false;
    $('customizeTemplate').hidden = true;
    render();
    fillPanel();
    canvas.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function close({ save = true } = {}) {
    if (!editing) return;
    clearTimeout(saveTimer);
    if (save) saveTemplate(editing);
    const id = editing.id;
    editing = null;
    drag = null;
    $('templateEditor').hidden = true;
    $('customizeTemplate').hidden = false;
    if (allTemplates().some((t) => t.id === id)) onTemplatesChanged(id);
    else render();
  }

  return { render, open, close };
}
