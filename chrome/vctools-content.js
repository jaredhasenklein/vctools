// Wait for the page to be fully loaded
window.addEventListener('load', function() {
  // Get the current tool page from the URL
  const path = window.location.pathname;
  const toolPage = path.substring(path.lastIndexOf('/') + 1);
  
  // Check if there's CSV data waiting for this tool
  chrome.runtime.sendMessage({
    action: 'checkForCSVData',
    toolPage: toolPage
  }, function(response) {
    if (response && response.status === 'success') {
      // Convert the data URL to a File object
      fetch(response.csvData)
        .then(res => res.blob())
        .then(blob => {
          // Create a File object
          const file = new File([blob], response.fileName, { type: 'text/csv' });
          
          // Find the file input element
          let fileInput = document.querySelector('input[type="file"]');
          
          if (!fileInput) {
            // If we can't find it directly, check for specific IDs
            fileInput = document.getElementById('fileInput') || 
                       document.getElementById('csvFile');
          }
          
          if (!fileInput) {
            console.error('Could not find file input element');
            return;
          }
          
          // Create a DataTransfer to set the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
          
          // Try different handler functions that the tools might use
          if (typeof window.handleFiles === 'function') {
            window.handleFiles(fileInput.files);
          } else if (typeof window.loadFile === 'function') {
            window.loadFile({ target: { files: fileInput.files } });
          } else {
            // Try to find and call the handler by looking for event listeners
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
          
          // Update the dropzone text if it exists - CHANGED TEXT HERE
          const dropzone = document.getElementById('dropzone');
          if (dropzone) {
            dropzone.innerHTML = `<div class="file-success">✓ File "${response.fileName}" imported automatically from VMS</div>`;
          }
        });
    }
  });
});