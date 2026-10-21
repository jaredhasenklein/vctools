// Function to add the VC Tools button and Google Sheets button
function addCustomButtons() {
  // Check if we're on a report page
  const url = window.location.href;
  const reportIdMatch = url.match(/ReportID=(\d+)/);
  
  if (!reportIdMatch) {
    return; // Not a report page or can't find report ID
  }
  
  const reportId = reportIdMatch[1];
  
  // Define the mapping of report IDs to VC Tools pages
  const reportMapping = {
    '23': 'badge.html',
    '21': 'certification.html',
    '19': 'parse.html',
    '17': 'eventplanning.html'
  };
  
  // Find the export button
  const exportButton = document.getElementById('MainContent_btnExport');
  
  if (!exportButton) {
    return; // Export button not found
  }
  
  // Check if we've already added the buttons
  if (document.querySelector('.sheets-button')) {
    return; // Buttons already added
  }
  
  // Get the export button's parent for insertion
  const buttonParent = exportButton.parentNode;
  
  // Create the Google Sheets button
  const sheetsButton = document.createElement('input');
  sheetsButton.type = 'button';
  sheetsButton.value = '📊 Open in Google Sheets';
  sheetsButton.className = 'sheets-button';
  // Clone styles from the export button
  sheetsButton.setAttribute('style', exportButton.getAttribute('style') || '');
  
  // Add Google Sheets button to the RIGHT of the export button
  buttonParent.insertBefore(sheetsButton, exportButton.nextSibling);
  
  // Only add VC Tools button if this report has a corresponding tool
  if (reportMapping[reportId]) {
    // Create the "Open in VC Tools" button
    const vcToolsButton = document.createElement('input');
    vcToolsButton.type = 'button';
    vcToolsButton.value = '✨ Open in VC Tools';
    vcToolsButton.className = 'vc-tools-button';
    // Clone styles from the export button
    vcToolsButton.setAttribute('style', exportButton.getAttribute('style') || '');
    
    // Add VC Tools button between the export button and the sheets button
    buttonParent.insertBefore(vcToolsButton, sheetsButton);
    
    // Handle VC Tools button click
    vcToolsButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the CSV data and open in VC Tools
      exportAndProcessCSV(function(csvData, fileName) {
        console.log('[VCTools] exportAndProcessCSV callback fired', { fileName, targetTool: reportMapping[reportId], csvDataLength: csvData?.length });
        const csvText = atob(csvData.split(',')[1]);
        console.log('[VCTools] decoded csvText length:', csvText.length);
        chrome.storage.local.set({
          csvData: csvText,
          csvFileName: fileName,
          targetTool: reportMapping[reportId]
        }, function() {
          if (chrome.runtime.lastError) {
            console.error('[VCTools] storage.set failed:', chrome.runtime.lastError.message);
            return;
          }
          console.log('[VCTools] storage.set succeeded, opening tab');
          window.open(`https://volunteer.systems/${reportMapping[reportId]}`, '_blank');
        });
      });
    });
  }
  
  // Handle Google Sheets button click
  sheetsButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'sheets-loading';
    loadingIndicator.textContent = 'Preparing data for Google Sheets...';
    document.body.appendChild(loadingIndicator);
    
    // Get the CSV data and open in Google Sheets
    exportAndProcessCSV(function(csvData, fileName) {
      // Convert data URL to text
      fetch(csvData)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = function() {
            const csvText = reader.result;
            
            // Remove loading indicator
            loadingIndicator.remove();
            
            // Convert CSV text to a spreadsheet-friendly format
            // This converts CSV to TSV (tab-separated values) which pastes better in spreadsheets
            const lines = csvText.split('\n');
            const processedLines = lines.map(line => {
              // Split by commas, but respect quoted values
              let inQuote = false;
              let currentValue = '';
              let values = [];
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                  values.push(currentValue);
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              
              // Add the last value
              values.push(currentValue);
              
              // Join with tabs instead of commas
              return values.join('\t');
            });
            
            const tsvContent = processedLines.join('\n');
            
            // Copy TSV data to clipboard
            copyToClipboard(tsvContent);
            
            // Set flag for Google Sheets to show guidance
            chrome.storage.local.set({
              showGoogleSheetsGuidance: true
            }, function() {
              // Open a new Google Sheets document
              window.open('https://docs.google.com/spreadsheets/u/0/create', '_blank');
            });
            
            // Show a notification to guide the user
            const notification = document.createElement('div');
            notification.className = 'sheets-notification';
            notification.innerHTML = `
              <div class="notification-header">CSV data copied to clipboard</div>
              <div class="notification-content">
                <p>A new Google Sheet has been opened.</p>
                <p>When Google Sheets loads:</p>
                <ol>
                  <li>Click cell A1</li>
                  <li>Press <strong>Ctrl+V</strong> (or ⌘+V on Mac) to paste the CSV data</li>
                  <li>Your data will appear in the spreadsheet</li>
                </ol>
              </div>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 10 seconds
            setTimeout(() => {
              notification.remove();
            }, 10000);
          };
          reader.readAsText(blob);
        })
        .catch(error => {
          console.error('Error processing CSV for Google Sheets:', error);
          loadingIndicator.remove();
          alert('Error preparing data for Google Sheets. Please try the regular export button.');
        });
    });
  });
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  
  // Select the text and copy it
  textarea.select();
  document.execCommand('copy');
  
  // Remove the textarea
  document.body.removeChild(textarea);
}

// Helper function to export and process CSV data
function exportAndProcessCSV(callback) {
  // Get the form data
  const form = document.getElementById('Form1');
  const formData = new FormData(form);
  
  // Add the export button value to trigger CSV export
  formData.append('ctl00$MainContent$btnExport', 'Export');
  
  // Perform the export request manually
  fetch(window.location.href, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })
  .then(response => response.blob())
  .then(blob => {
    // Read the CSV data
    const reader = new FileReader();
    reader.onload = function() {
      const csvData = reader.result;
      
      // Get a name for the file based on the report title
      const reportTitle = document.getElementById('MainContent_lblReportName')?.textContent || 'Report';
      const fileName = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
      
      // Call the callback with the CSV data and filename
      callback(csvData, fileName);
    };
    reader.readAsDataURL(blob);
  })
  .catch(error => {
    console.error('Error fetching CSV:', error);
    alert('Error capturing CSV data. Please try the regular export button.');
  });
}

// Run when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCustomButtons);
} else {
  addCustomButtons();
}

// Also run after a short delay to make sure all elements are loaded
setTimeout(addCustomButtons, 1000);