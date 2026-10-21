// Function to add non-clickable stars to report names with available tools
function addStarsToReports() {
  // Check if we're on the reports tab
  const reportsTab = document.querySelector('.tab-pane.tabDetail.active#Reports');
  if (!reportsTab) {
    // Either not on the reports tab, or it's not loaded yet
    return;
  }
  
  // Mapping of report names to their tool URLs
  const reportsWithTools = {
    'Attendance & Event Planning': 'eventplanning.html',
    'Training and Certifications': 'certification.html',
    'Assigned Volunteers': 'parse.html',
    'Name Badges': 'badge.html'
  };
  
  // Find all link elements in the reports tab
  const reportLinks = reportsTab.querySelectorAll('a');
  
  reportLinks.forEach(link => {
    const reportName = link.textContent.trim();
    
    // Check if this report has a tool
    if (reportsWithTools[reportName]) {
      // Check if we've already added a star
      if (!link.querySelector('.vc-tools-star')) {
        // Create a star element (non-clickable for now)
        const star = document.createElement('span');
        star.className = 'vc-tools-star';
        star.textContent = ' ✨';
        star.title = 'Has VC Tools support';
        
        // Add the star to the link
        link.appendChild(star);
      }
    }
  });
}

// Run when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    addStarsToReports();
    // Also add MutationObserver to handle tab switching
    observeTabChanges();
  });
} else {
  addStarsToReports();
  observeTabChanges();
}

// Also run after a short delay to make sure all elements are loaded
setTimeout(addStarsToReports, 1000);

// Function to observe tab changes
function observeTabChanges() {
  // Create a mutation observer to watch for class changes on the Reports tab
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' &&
          mutation.target.id === 'Reports' &&
          mutation.target.classList.contains('active')) {
        // Reports tab was activated
        addStarsToReports();
      }
    });
  });
  
  // Start observing the Reports tab if it exists
  const reportsTab = document.getElementById('Reports');
  if (reportsTab) {
    observer.observe(reportsTab, { attributes: true });
  }
  
  // Also observe the document for tab elements being added
  const tabsContainer = document.querySelector('.nav-tabs');
  if (tabsContainer) {
    observer.observe(tabsContainer, { childList: true, subtree: true });
  }
}