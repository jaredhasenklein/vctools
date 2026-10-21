// Name Badge Generator page. Layout lives in lib/badges/template.js; the editor in
// scripts/badge-editor.js. Reads Name Badges or Assigned Volunteers reports.
import { drawBadge, sharedSizes, badgeVariables } from '../lib/badges/template.js';
import { allTemplates } from '../lib/badges/store.js';
import { formatRole, suggestAbbreviation } from '../lib/badges/roles.js';
import { createEditor, canvasSurface } from './badge-editor.js';

const $ = (id) => document.getElementById(id);

// Label stock. Positions in inches on the printed page.
const LABEL_TYPES = {
  avery5163: {
    name: 'Avery 5163 (sheet of 10)', pageOrientation: 'p', pageWidth: 8.5, pageHeight: 11,
    labelWidth: 4, labelHeight: 2, startX: 0.16, startY: 0.5, columnGap: 0.19, labelsPerRow: 2, labelsPerPage: 10,
  },
  dymo2x4: {
    name: 'Dymo 2x4 (thermal roll)', pageOrientation: 'l', pageWidth: 4, pageHeight: 2,
    labelWidth: 4, labelHeight: 2, startX: 0, startY: 0.05, columnGap: 0, labelsPerRow: 1, labelsPerPage: 1,
  },
};

// Shown in the preview before a file is loaded. Invented people.
const SAMPLE_PEOPLE = [
  { firstName: 'Avery', lastName: 'Quintana', roles: ['Head Referee'], pronouns: 'she/her', languages: 'English, Spanish' },
  { firstName: 'Morgan', lastName: 'Tran', roles: ['Judge Advisor'], pronouns: 'he/him', languages: 'English' },
  { firstName: 'Maximiliana', lastName: 'Okonkwo-Lindqvist', roles: ['Pit Administration Supervisor', 'Queuer'], pronouns: 'they/them', languages: 'English, Swedish' },
];

let people = [];            // From the loaded report
let previewIndex = 0;
let roleAbbreviations = {}; // Formatted role -> replacement

// ---------- Roles ----------

function roleText(person) {
  const role = formatRole(person.roles);
  return roleAbbreviations[role]?.trim() || role;
}

// ---------- Form values ----------

function corner(side, person) {
  const type = $(`bottom${side}Type`).value;
  if (type === 'custom') return $(`bottom${side}Text`).value;
  if (type === 'pronouns') return person.pronouns;
  if (type === 'languages') return person.languages;
  return '';
}

function varsFor(person) {
  return badgeVariables({ ...person, role: roleText(person) }, {
    event: $('topText').value,
    bottomLeft: corner('Left', person),
    bottomRight: corner('Right', person),
  });
}

function currentPeople() {
  return people.length ? people : SAMPLE_PEOPLE;
}

function currentTemplate() {
  const id = $('labelStyle').value;
  return allTemplates().find((t) => t.id === id) ?? allTemplates()[0];
}

function currentLabel() {
  return LABEL_TYPES[$('labelType').value] ?? LABEL_TYPES.avery5163;
}

// ---------- Preview ----------

const editor = createEditor({
  canvas: $('badgeCanvas'),
  getTemplate: currentTemplate,
  getLabel: currentLabel,
  getVars: () => varsFor(currentPeople()[previewIndex % currentPeople().length]),
  getAllVars: () => currentPeople().map(varsFor),
  onTemplatesChanged: (selectId) => fillTemplateSelect(selectId),
});

function renderPreview() {
  const list = currentPeople();
  previewIndex = (previewIndex + list.length) % list.length;
  const p = list[previewIndex];
  $('previewWho').textContent = people.length
    ? `${p.firstName} ${p.lastName} (${previewIndex + 1} of ${list.length})`
    : `Sample volunteer ${previewIndex + 1} of ${list.length}`;
  editor.render();
}

function fillTemplateSelect(selectId) {
  const select = $('labelStyle');
  const keep = selectId ?? select.value;
  select.replaceChildren();
  const groups = [['Built-in', allTemplates().filter((t) => t.builtIn)], ['Saved in this browser', allTemplates().filter((t) => !t.builtIn)]];
  for (const [label, list] of groups) {
    if (!list.length) continue;
    const group = document.createElement('optgroup');
    group.label = label;
    for (const t of list) group.append(new Option(t.name, t.id));
    select.append(group);
  }
  if ([...select.options].some((o) => o.value === keep)) select.value = keep;
  renderPreview();
}

// ---------- PDF ----------

function pdfSurface(doc, offsetX, offsetY) {
  const style = (bold, italic) => (bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');
  return {
    measure(text, size, bold, italic) {
      doc.setFont('helvetica', style(bold, italic));
      doc.setFontSize(size);
      return doc.getTextWidth(text);
    },
    text(text, x, baseline, size, bold, italic, color) {
      doc.setFont('helvetica', style(bold, italic));
      doc.setFontSize(size);
      doc.setTextColor(color);
      doc.text(text, offsetX + x, offsetY + baseline);
    },
    rect(x, y, w, h, color) {
      doc.setFillColor(color);
      doc.rect(offsetX + x, offsetY + y, w, h, 'F');
    },
  };
}

function createPDF() {
  const type = currentLabel();
  const template = currentTemplate();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF(type.pageOrientation, 'in', [type.pageWidth, type.pageHeight]);
  const varsList = people.map(varsFor);
  const sizes = sharedSizes(template, varsList, pdfSurface(doc, 0, 0).measure, type.labelWidth, type.labelHeight);

  varsList.forEach((vars, i) => {
    const onPage = i % type.labelsPerPage;
    if (i > 0 && onPage === 0) doc.addPage();
    const row = Math.floor(onPage / type.labelsPerRow);
    const col = onPage % type.labelsPerRow;
    const x = type.startX + col * (type.labelWidth + type.columnGap);
    const y = type.startY + row * type.labelHeight;
    drawBadge(pdfSurface(doc, x, y), template, vars, { labelW: type.labelWidth, labelH: type.labelHeight, sizes });
  });
  doc.save('labels.pdf');
}

// ---------- Report loading ----------

// Fields read from the Name Badges or Assigned Volunteers report (see lib/vms/fields.js).
const BADGE_NEEDS = {
  preferredFirstName: { required: true },
  lastName: { required: true },
  rolesAssigned: { required: true },
  personalPronouns: {},
  languagesSpoken: {},
};

/** One person per badge. Assigned Volunteers has a row per shift, so roles are merged by name. */
async function loadPeople(file) {
  const { records } = await VMS.loadReport(file, BADGE_NEEDS, { accepts: VMS.acceptsFor('badge') });
  const byPerson = new Map();
  for (const rec of records) {
    const key = `${rec.preferredFirstName}|${rec.lastName}`.toLowerCase();
    const roles = rec.rolesAssigned.split(',').map((r) => r.trim()).filter(Boolean);
    const person = byPerson.get(key);
    if (person) {
      for (const r of roles) if (!person.roles.includes(r)) person.roles.push(r);
      continue;
    }
    byPerson.set(key, {
      firstName: rec.preferredFirstName,
      lastName: rec.lastName,
      roles,
      pronouns: rec.personalPronouns,
      languages: rec.languagesSpoken,
    });
  }
  return [...byPerson.values()];
}

function handleFiles(files) {
  if (files.target) files = files.target.files;
  const file = files?.[0];
  if (!file || !validateCSVFile(file)) return;
  clearError();
  loadPeople(file).then((loaded) => {
    people = loaded;
    previewIndex = 0;
    roleAbbreviations = {};
    setDropzoneLoaded($('dropzone'), { fileName: file.name, detail: `${people.length} badges` });
    renderAbbreviations();
    $('nameTagForm').classList.add('has-data');
    renderPreview();
  }).catch((error) => {
    if (VMS.isCancelled(error)) return;
    showError('Error reading file. Details: ' + error.message);
  });
}

// ---------- Role abbreviations ----------

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function renderAbbreviations() {
  const container = $('labelContainer');
  const roles = [...new Set(people.map((p) => formatRole(p.roles)).filter(Boolean))];
  if (!roles.length) {
    container.replaceChildren();
    return;
  }
  const body = el('tbody');
  const sort = el('select', { className: 'form-select', id: 'roleSortOrder' },
    new Option('Length (longest first)', 'length'), new Option('Alphabetical', 'alphabetical'));

  const fill = () => {
    const sorted = sort.value === 'length' ? [...roles].sort((a, b) => b.length - a.length) : [...roles].sort();
    body.replaceChildren(...sorted.map((role) => {
      const input = el('input', { type: 'text', className: 'form-control role-abbreviation-input', placeholder: 'Enter abbreviation', value: roleAbbreviations[role] ?? '' });
      input.dataset.originalRole = role;
      input.setAttribute('aria-label', `Abbreviation for ${role}`);
      input.addEventListener('input', () => {
        roleAbbreviations[role] = input.value.toUpperCase();
        renderPreview();
      });
      return el('tr', {}, el('td', { textContent: role }), el('td', { textContent: String(role.length) }), el('td', {}, input));
    }));
  };

  const insert = el('button', { type: 'button', className: 'btn btn-secondary', id: 'insertCommonAbbreviations', textContent: 'Insert Common Abbreviations' });
  insert.addEventListener('click', () => {
    for (const role of roles) {
      const short = suggestAbbreviation(role);
      if (short !== role) roleAbbreviations[role] = short;
    }
    fill();
    renderPreview();
  });
  sort.addEventListener('change', fill);

  container.replaceChildren(el('div', { className: 'role-abbreviation-container' },
    el('h3', { textContent: 'Role Abbreviations' }),
    el('p', { textContent: 'Long role names print in a small font. Add shorter versions here; the preview updates as you type.' }),
    el('div', { className: 'abbreviation-controls' }, insert,
      el('div', { className: 'sort-control' }, el('label', { htmlFor: 'roleSortOrder', textContent: 'Sort by: ' }), sort)),
    el('div', { className: 'table-responsive' }, el('table', { className: 'table role-abbreviation-table' },
      el('thead', {}, el('tr', {}, el('th', { textContent: 'Original Role' }), el('th', { textContent: 'Length' }), el('th', { textContent: 'Abbreviation' }))),
      body)),
  ));
  fill();
}

// ---------- Wiring ----------

for (const [value, type] of Object.entries(LABEL_TYPES)) $('labelType').append(new Option(type.name, value));
fillTemplateSelect('styleA');

for (const side of ['Left', 'Right']) {
  const select = $(`bottom${side}Type`);
  const input = $(`bottom${side}Text`);
  select.addEventListener('change', () => {
    input.hidden = select.value !== 'custom';
    renderPreview();
  });
  input.addEventListener('input', renderPreview);
}
for (const id of ['topText', 'labelType', 'labelStyle']) {
  $(id).addEventListener(id === 'topText' ? 'input' : 'change', () => {
    if (id === 'labelStyle') editor.close();
    renderPreview();
  });
}
$('prevPerson').addEventListener('click', () => { previewIndex--; renderPreview(); });
$('nextPerson').addEventListener('click', () => { previewIndex++; renderPreview(); });
$('customizeTemplate').addEventListener('click', () => editor.open());
$('newBlankTemplate').addEventListener('click', () => editor.open({ blank: true }));

$('nameTagForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!people.length) {
    showError('Choose a Name Badges or Assigned Volunteers report first.');
    return;
  }
  createPDF();
});

setupDragAndDrop($('dropzone'), $('fileInput'), handleFiles);
