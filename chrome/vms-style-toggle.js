// Simple style toggle that applies layout improvements without dark mode
// This focuses on container width, table formatting, and color changes

(function() {
    // Self-executing function to avoid global scope pollution
    let currentMode = 'improved'; // Default to improved style
    let styleTag = null;
    let toggleBtn = null;
    
    // Main function to set up the toggle
    function init() {
      console.log("VMS Style Toggle: Initializing...");
      
      // Create a floating toggle button
      addFloatingToggle();
      
      // Apply initial styles
      applyStyles(currentMode);
    }
    
    // Create a floating button that won't be affected by page structure
    function addFloatingToggle() {
      // Check if we already added it
      if (document.getElementById('style-toggle-floating')) return;
      
      // Create the button
      toggleBtn = document.createElement('div');
      toggleBtn.id = 'style-toggle-floating';
      Object.assign(toggleBtn.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        backgroundColor: '#1c3d73',
        padding: '5px 10px',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '4px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      });
      toggleBtn.textContent = 'Improved Style';
      
      // Add click event
      toggleBtn.addEventListener('click', function() {
        if (currentMode === 'improved') {
          currentMode = 'original';
          toggleBtn.textContent = 'Original Style';
        } else {
          currentMode = 'improved';
          toggleBtn.textContent = 'Improved Style';
        }
        
        applyStyles(currentMode);
      });
      
      // Add to document
      document.body.appendChild(toggleBtn);
    }
    
    // Function to apply styles
    function applyStyles(mode) {
      console.log("VMS Style Toggle: Applying mode:", mode);
      
      // Remove existing style tag if present
      if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
      
      // If mode is original, we're done (no styles to apply)
      if (mode === 'original') return;
      
      // Create new style tag for improved style
      styleTag = document.createElement('style');
      styleTag.id = 'vms-improved-style';
      
      // Check if we're on a ReportViewer page
      const isReportViewer = window.location.href.indexOf('ReportViewer.aspx') > -1;
      
      // Style improvements
      let css = `
        /* Adjust container width */
        .container {
          width: 95% !important;
          max-width: 1800px !important;
        }
        
        /* Set ReportContainer width to 95% */
        #ReportContainer, div[id="ReportContainer"], [style*="max-width: 960px"] {
          max-width: 95% !important;
          width: 95% !important;
        }
      `;
      
      // Only add groupingOpen style for ReportViewer pages
      if (isReportViewer) {
        css += `
        /* Adjust groupingOpen width only on ReportViewer pages */
        div.groupingOpen:not([id="groupHeader1"]) {
          width: 95% !important;
          max-width: 1800px !important;
        }
        `;
      }
      
      css += `
        /* Change specific colors */
        [style*="#a0d468"], .bg-green, div[style*="background-color: rgb(160, 212, 104)"] {
          background-color: #add4a0 !important;
        }
        
        [style*="#ffce55"], .bg-yellow, div[style*="background-color: rgb(255, 206, 85)"] {
          background-color: #c3a4cf !important;
        }
        
        /* Adjust table columns */
        .table th, .table td {
          width: auto !important;
          white-space: nowrap;
        }
        
        /* Make tables more responsive */
        .dataTable {
          width: auto !important;
          min-width: 100%;
        }
        
        /* Improve spacing */
        .dataTables_wrapper {
          overflow-x: auto;
          padding-bottom: 15px;
        }
        
        /* Better table styling */
        .table-striped > tbody > tr:nth-of-type(odd) {
          background-color: #f9f9f9 !important;
        }
        
        /* Improve hover states */
        .table-hover > tbody > tr:hover {
          background-color: #f5f5f5 !important;
        }
        
        /* Better borders */
        .table, .table td, .table th {
          border-color: #ddd !important;
        }
        
        /* Improved table header */
        .table > thead > tr > th {
          border-bottom: 2px solid #ddd !important;
          background-color: #f5f5f5 !important;
        }
      `;
      
      // Add the CSS to the style tag
      try {
        styleTag.appendChild(document.createTextNode(css));
      } catch (e) {
        styleTag.textContent = css; // For older browsers
      }
      
      // Add to document
      document.head.appendChild(styleTag);
    }
    
    // Start everything when the page is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    
    // Also try again after a delay in case page is slow to load
    setTimeout(init, 1000);
  })();