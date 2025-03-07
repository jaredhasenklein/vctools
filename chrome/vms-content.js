// Function to add the VC Tools button
function addVcToolsButton() {
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
  
  // Check if this report ID has a corresponding VC Tools page
  if (!reportMapping[reportId]) {
    return; // No corresponding VC Tools page
  }
  
  // Find the export button
  const exportButton = document.getElementById('MainContent_btnExport');
  
  if (!exportButton) {
    return; // Export button not found
  }
  
  // Check if we've already added the button
  if (document.querySelector('.vc-tools-button')) {
    return; // Button already added
  }
  
  // Create the "Open in VC Tools" button
  const vcToolsButton = document.createElement('input');
  vcToolsButton.type = 'button';
  vcToolsButton.value = '✨ Open in VC Tools';
  vcToolsButton.className = 'vc-tools-button';
  vcToolsButton.style.marginRight = '10px';
  vcToolsButton.style.color = 'black';
  
  // Add button to the RIGHT of the export button (cosmetic change)
  exportButton.parentNode.insertBefore(vcToolsButton, exportButton.nextSibling);
  
  // Handle button click
  vcToolsButton.addEventListener('click', function(e) {
    e.preventDefault();
    
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
      // Store the CSV data
      const reader = new FileReader();
      reader.onload = function() {
        const csvData = reader.result;
        
        // Get a name for the file based on the report title
        const reportTitle = document.getElementById('MainContent_lblReportName')?.textContent || 'Report';
        const fileName = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
        
        // Store the CSV data in extension storage
        chrome.storage.local.set({
          csvData: csvData,
          csvFileName: fileName,
          targetTool: reportMapping[reportId]
        }, function() {
          // Now open the VC Tools page
          window.open(`https://volunteer.systems/${reportMapping[reportId]}`, '_blank');
        });
      };
      reader.readAsDataURL(blob);
    })
    .catch(error => {
      console.error('Error fetching CSV:', error);
      alert('Error capturing CSV data. Please try the regular export button.');
    });
  });
}

// Run when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addVcToolsButton);
} else {
  addVcToolsButton();
}

// Also run after a short delay to make sure all elements are loaded
setTimeout(addVcToolsButton, 1000);