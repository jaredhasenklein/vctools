// Home page: drop any VMS export and get pointed to the tools that read it.
import { readReportFile, toolsForReport, handOff } from '../lib/vms/index.js';

const zone = document.getElementById('homeDropzone');
const input = document.getElementById('homeInput');
const result = document.getElementById('homeResult');

function show(...nodes) {
  result.replaceChildren(...nodes);
}

function para(text, className) {
  const p = document.createElement('p');
  p.textContent = text;
  if (className) p.className = className;
  return p;
}

async function onFiles(files) {
  if (files.target) files = files.target.files;
  const file = files?.[0];
  if (!file) return;
  clearError();
  resetDropzone(zone);
  let report;
  try {
    report = await readReportFile(file);
  } catch (err) {
    show(para(err.message, 'home-result__error'));
    return;
  }
  const name = report.meta.report || 'Unnamed report';
  setDropzoneLoaded(zone, { fileName: file.name, detail: describeReport(report, `${report.rows.length} rows`) });

  const matches = toolsForReport(report.meta.report);
  const specific = matches.filter(({ input }) => !input.accepts.includes('*'));
  const heading = para(specific.length
    ? `These tools read ${name} reports:`
    : `No tool is built for ${name} reports yet, but you can open it as a table:`);
  const list = document.createElement('div');
  list.className = 'home-result__tools';
  for (const { tool, input: toolInput } of matches) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = tool.name;
    if (tool.beta) {
      const tag = document.createElement('span');
      tag.className = 'beta-tag';
      tag.textContent = 'Beta';
      button.append(tag);
    }
    button.addEventListener('click', () => handOff(file, tool, toolInput).catch((err) => showError(err.message)));
    list.append(button);
  }
  show(heading, list);
}

setupDragAndDrop(zone, input, onFiles);
