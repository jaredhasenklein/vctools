// Content script to run in Google Sheets
// This script shows a notification in the Google Sheets tab ONLY when navigated from VMS

// Function to show guidance in Google Sheets
function showGuidance() {
    // Check if we already added the guidance
    if (document.querySelector('.vc-sheets-guidance')) {
      return;
    }
    
    // First check if we should show guidance by checking if we were directed here by our extension
    chrome.storage.local.get(['showGoogleSheetsGuidance'], function(data) {
      // Only show guidance if the flag is set
      if (data.showGoogleSheetsGuidance) {
        // Create guidance element - as a banner at the top
        const guidance = document.createElement('div');
        guidance.className = 'vc-sheets-banner';
        guidance.innerHTML = `
          <div class="banner-content">
            <div class="banner-message">
              <strong>📋 CSV Data Ready:</strong> 
              Click cell A1 and press <kbd>Ctrl+V</kbd> (or <kbd>⌘+V</kbd>) to paste your data
            </div>
            <button id="close-guidance" class="close-button">×</button>
          </div>
        `;
        
        // Add to document
        document.body.appendChild(guidance);
        
        // Handle close button click
        document.getElementById('close-guidance').addEventListener('click', function() {
          guidance.remove();
          // Clear the flag after user dismisses
          chrome.storage.local.remove(['showGoogleSheetsGuidance']);
        });
        
        // Also add a cell highlight to help users identify A1
        setTimeout(() => {
          // Try to find and highlight cell A1
          highlightCellA1();
        }, 1000);
        
        // Auto-hide after 20 seconds
        setTimeout(() => {
          if (document.body.contains(guidance)) {
            guidance.remove();
          }
          // Remove any cell highlights
          const highlight = document.querySelector('.cell-a1-highlight');
          if (highlight) highlight.remove();
          
          // Clear the flag after timeout
          chrome.storage.local.remove(['showGoogleSheetsGuidance']);
        }, 20000);
        
        // Clear the flag so it doesn't show again on next sheet load
        // unless specifically set by the extension again
        chrome.storage.local.remove(['showGoogleSheetsGuidance']);
      }
    });
  }
  
  // Function to attempt to highlight cell A1
  function highlightCellA1() {
    // First check if there's a visible grid
    const gridCells = document.querySelectorAll('[role="gridcell"]');
    if (gridCells.length === 0) return; // Grid not ready yet
    
    // Find the top-left cell (which should be A1)
    // We can't reliably identify A1 by ID, so we'll use the position
    const topLeftCell = gridCells[0];
    
    if (topLeftCell) {
      // Get the position and size of the cell
      const rect = topLeftCell.getBoundingClientRect();
      
      // Create a highlight element
      const highlight = document.createElement('div');
      highlight.className = 'cell-a1-highlight';
      highlight.style.position = 'absolute';
      highlight.style.left = `${rect.left}px`;
      highlight.style.top = `${rect.top}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
      highlight.style.border = '2px solid #4CAF50';
      highlight.style.borderRadius = '2px';
      highlight.style.zIndex = '9998';
      highlight.style.pointerEvents = 'none'; // Allow clicking through
      
      // Add a small 'A1' label
      const label = document.createElement('div');
      label.className = 'a1-label';
      label.textContent = 'A1';
      label.style.position = 'absolute';
      label.style.right = '-30px';
      label.style.top = '-25px';
      label.style.backgroundColor = '#4CAF50';
      label.style.color = 'white';
      label.style.padding = '3px 6px';
      label.style.borderRadius = '3px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      highlight.appendChild(label);
      
      // Add to document
      document.body.appendChild(highlight);
      
      // Click effect - make the highlight pulse once
      highlight.style.animation = 'pulse 1.5s ease-in-out';
    }
  }
  
  // Wait for the page to load
  window.addEventListener('load', function() {
    // Slight delay to ensure Google Sheets is fully loaded
    setTimeout(showGuidance, 800);
  });