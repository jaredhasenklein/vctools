// Runs on volunteer.systems. If the VMS page handed over a report for this page,
// put it in the page's file input; the page reacts to the change event like a normal upload.

function pageKey() {
  const last = window.location.pathname.split('/').pop() || 'index';
  return last.replace(/\.html$/, '') || 'index';
}

function receiveReport() {
  chrome.storage.local.get(['csvData', 'csvFileName', 'targetTool'], (data) => {
    if (chrome.runtime.lastError || !data.csvData) return;
    const target = String(data.targetTool || '').replace(/\.html$/, '') || 'index';
    if (target !== pageKey()) return;
    chrome.storage.local.remove(['csvData', 'csvFileName', 'targetTool']);

    const input = document.querySelector('input[type="file"][accept*=".csv"]') || document.querySelector('input[type="file"]');
    if (!input) return;
    const transfer = new DataTransfer();
    transfer.items.add(new File([data.csvData], data.csvFileName || 'report.csv', { type: 'text/csv' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// The script can be injected after the page has already loaded (e.g. from cache).
if (document.readyState === 'complete') receiveReport();
else window.addEventListener('load', receiveReport);
