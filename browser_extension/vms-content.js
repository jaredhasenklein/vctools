// Runs on VMS report pages. Adds "Open in VC Tools" and "Open in Google Sheets"
// next to VMS's Export button.

// VMS report id -> VC Tools page. Reports not listed open on the VC Tools home page,
// which recognizes the report and offers every tool that can use it.
const REPORT_TOOLS = {
  23: 'badge',
  21: 'certification',
  19: 'parse',
  17: 'eventplanning',
};

/** Ask VMS for the export, the same request its Export button makes. Resolves to { text, fileName }. */
async function exportReport() {
  const form = document.getElementById('Form1');
  const formData = new FormData(form);
  formData.append('ctl00$MainContent$btnExport', 'Export');
  const response = await fetch(window.location.href, { method: 'POST', body: formData, credentials: 'include' });
  if (!response.ok) throw new Error(`VMS returned ${response.status}`);
  // Decode as UTF-8 ourselves: names and the season title can contain non-ASCII characters.
  const text = new TextDecoder('utf-8').decode(await response.arrayBuffer());
  const title = document.getElementById('MainContent_lblReportName')?.textContent || 'Report';
  return { text, fileName: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv` };
}

/** CSV -> tab-separated text for pasting into a spreadsheet. Handles quoted commas, quotes, and line breaks. */
function csvToTsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (quoted) {
      if (ch === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && csv[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  // Tabs and line breaks inside a cell would split it when pasted, so flatten them.
  return rows.map((r) => r.map((c) => c.replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
  textarea.style.cssText = 'position:absolute;left:-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  return Promise.resolve();
}

function makeButton(label, className, exportButton) {
  const button = document.createElement('input');
  button.type = 'button';
  button.value = label;
  button.className = className;
  button.setAttribute('style', exportButton.getAttribute('style') || '');
  return button;
}

function showSheetsNotice() {
  const notice = document.createElement('div');
  notice.className = 'sheets-notification';
  const head = Object.assign(document.createElement('div'), { className: 'notification-header', textContent: 'Report copied to clipboard' });
  const body = document.createElement('div');
  body.className = 'notification-content';
  body.innerHTML = '<p>A new Google Sheet has been opened. When it loads, click cell A1 and press <strong>Ctrl+V</strong> (or <strong>⌘+V</strong> on Mac).</p>';
  notice.append(head, body);
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 10000);
}

function addCustomButtons() {
  const reportId = window.location.href.match(/ReportID=(\d+)/)?.[1];
  const exportButton = document.getElementById('MainContent_btnExport');
  if (!reportId || !exportButton || document.querySelector('.sheets-button')) return;

  const sheetsButton = makeButton('📊 Open in Google Sheets', 'sheets-button', exportButton);
  const toolsButton = makeButton('✨ Open in VC Tools', 'vc-tools-button', exportButton);
  exportButton.after(toolsButton, sheetsButton);

  toolsButton.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const { text, fileName } = await exportReport();
      const targetTool = REPORT_TOOLS[reportId] || 'index';
      await chrome.storage.local.set({ csvData: text, csvFileName: fileName, targetTool });
      window.open(`https://volunteer.systems/${targetTool === 'index' ? '' : targetTool}`, '_blank');
    } catch (error) {
      console.error('VC Tools: export failed', error);
      alert('Could not get the report from VMS. Use the Export button instead.');
    }
  });

  sheetsButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const loading = Object.assign(document.createElement('div'), { className: 'sheets-loading', textContent: 'Preparing data for Google Sheets...' });
    document.body.appendChild(loading);
    try {
      const { text } = await exportReport();
      await copyToClipboard(csvToTsv(text));
      await chrome.storage.local.set({ showGoogleSheetsGuidance: true });
      window.open('https://docs.google.com/spreadsheets/u/0/create', '_blank');
      showSheetsNotice();
    } catch (error) {
      console.error('VC Tools: Google Sheets export failed', error);
      alert('Error preparing data for Google Sheets. Use the Export button instead.');
    } finally {
      loading.remove();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCustomButtons);
} else {
  addCustomButtons();
}
// VMS sometimes builds the page late; try once more.
setTimeout(addCustomButtons, 1000);
