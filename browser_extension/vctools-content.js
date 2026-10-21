console.log('[VCTools] content script injected, readyState:', document.readyState);

function runVCToolsCheck() {
  const path = window.location.pathname;
  const toolPage = path.substring(path.lastIndexOf('/') + 1);

  console.log('[VCTools] runVCToolsCheck called, toolPage:', toolPage);

  chrome.storage.local.get(['csvData', 'csvFileName', 'targetTool'], function(data) {
    console.log('[VCTools] storage.get result:', { hasCsvData: !!data.csvData, targetTool: data.targetTool, toolPage });
    if (chrome.runtime.lastError) {
      console.error('[VCTools] storage.get failed:', chrome.runtime.lastError.message);
      return;
    }
    if (!data.csvData || data.targetTool !== toolPage) {
      console.log('[VCTools] no matching data in storage, bailing out');
      return;
    }

    const csvText = data.csvData;
    const fileName = data.csvFileName;
    console.log('[VCTools] found CSV data, length:', csvText.length, 'fileName:', fileName);
    chrome.storage.local.remove(['csvData', 'csvFileName', 'targetTool']);

    const blob = new Blob([csvText], { type: 'text/csv' });
    const file = new File([blob], fileName, { type: 'text/csv' });

    let fileInput = document.querySelector('input[type="file"]');
    console.log('[VCTools] fileInput (querySelector):', fileInput);
    if (!fileInput) {
      fileInput = document.getElementById('fileInput') ||
                 document.getElementById('csvFile');
      console.log('[VCTools] fileInput (by id):', fileInput);
    }

    if (!fileInput) {
      console.error('[VCTools] could not find file input element');
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
    console.log('[VCTools] dispatched change event, files:', fileInput.files.length);

    if (typeof window.handleFiles === 'function') {
      console.log('[VCTools] calling window.handleFiles');
      window.handleFiles(fileInput.files);
    } else if (typeof window.loadFile === 'function') {
      console.log('[VCTools] calling window.loadFile');
      window.loadFile({ target: { files: fileInput.files } });
    } else {
      console.log('[VCTools] no known handler found, trying possibleHandlers');
      const possibleHandlers = [
        { name: 'handleFiles', obj: window },
        { name: 'loadFile', obj: window },
        { name: 'onchange', obj: fileInput }
      ];

      for (const handler of possibleHandlers) {
        if (typeof handler.obj[handler.name] === 'function') {
          try {
            handler.obj[handler.name](fileInput.files);
            break;
          } catch (e) {
            console.error(`Error calling ${handler.name}:`, e);
          }
        }
      }
    }

    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.innerHTML = `<div class="file-success">✓ File "${fileName}" imported automatically from VMS</div>`;
    }
  });
}

if (document.readyState === 'complete') {
  runVCToolsCheck();
} else {
  window.addEventListener('load', runVCToolsCheck);
}
