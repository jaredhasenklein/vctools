window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-LNHZ3NT97K');

// Drag and drop event handlers
function setupDragAndDrop(dropzone, fileInput, handleFiles) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

    dropzone.addEventListener('click', () => fileInput.click(), false);
    dropzone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function highlight() {
        dropzone.classList.add('dragover');
    }

    function unhighlight() {
        dropzone.classList.remove('dragover');
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        console.error('Error element not found:', message);
    }
}

function clearError() {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

// Check if file is CSV
function validateCSVFile(file) {
    if (!file.name.endsWith('.csv')) {
        showError('Please upload a CSV file.');
        return false;
    }
    return true;
}

// Dark mode implementation
function addDarkModeToggle() {
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'theme-toggle';
  toggleButton.setAttribute('aria-label', 'Toggle dark mode');
  toggleButton.setAttribute('title', 'Toggle dark mode');
  toggleButton.innerHTML = `
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  document.body.appendChild(toggleButton);

  // Check for saved preference and apply
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Toggle dark mode on click
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // Check for system preference if no saved preference
  if (!savedTheme) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  }
}

// Dark mode CSS with special handling for specific elements
function addDarkModeCSS() {
  // First, add the basic dark mode CSS
  const darkModeCSS = document.createElement('style');
  darkModeCSS.textContent = `
    /* Dark mode variables and styles with fixes */
    :root {
      /* Light mode (default) variables */
      --background-color: #ffffff;
      --text-color: #000000;
      --secondary-bg-color: #f8f9fa;
      --border-color: #ddd;
      --table-header-bg: #f2f2f2;
      --table-hover-bg: #f5f5f5;
      --table-border: #ddd;
      --primary-button-bg: #0066cc; /* Changed from #0dcaf0 for better contrast */
      --primary-button-text: white;
      --primary-button-hover-bg: #0052a3;
      --secondary-button-bg: #6c757d;
      --secondary-button-text: white;
      --dropdown-bg: white;
      --dropdown-text: #333;
      --input-bg: white;
      --input-text: #333;
      --input-border: #ced4da;
      --error-text: #dc3545;
      --success-bg: #d4edda;
      --success-text: #155724;
      --warning-bg: #fff3cd;
      --warning-text: #856404;
      --dropzone-bg: white;
      --dropzone-border: #ccc;
      --dropzone-text: #333; /* Added for dropzone text color */
      --dropzone-hover-bg: #f0f0f0;
      --extension-button-bg: #4285F4;
      --extension-button-text: white;
      --footer-bg: #f8f9fa;
      --modal-bg: white;
      --instructions-bg: #f8f9fa; /* Added for instructions box background */
      --instructions-text: #000000; /* Added for instructions text */
      --tile-bg: #f8f9fa; /* Added for homepage tiles */
      --tile-text: #000000; /* Added for homepage tile text */
      --disabled-bg: #e9ecef; /* For disabled inputs */
      --disabled-text: #6c757d; /* For disabled text */
      --placeholder-text: #6c757d; /* For placeholder text */
      --email-button-bg: #0dcaf0; /* For email buttons */
      --email-button-text: white; /* For email button text */
    }

    /* Dark mode class that will be toggled */
    .dark-mode {
      --background-color: #121212;
      --text-color: #e0e0e0;
      --secondary-bg-color: #1e1e1e;
      --border-color: #444;
      --table-header-bg: #2c2c2c;
      --table-hover-bg: #2a2a2a;
      --table-border: #444;
      --primary-button-bg: #0080c7;
      --primary-button-text: white;
      --primary-button-hover-bg: #0066a3;
      --secondary-button-bg: #495057;
      --secondary-button-text: white;
      --dropdown-bg: #333;
      --dropdown-text: #e0e0e0;
      --input-bg: #333;
      --input-text: #e0e0e0;
      --input-border: #555;
      --error-text: #ff6b6b;
      --success-bg: #204d30;
      --success-text: #8fffb8;
      --warning-bg: #4d3800;
      --warning-text: #ffe066;
      --dropzone-bg: #1e1e1e;
      --dropzone-border: #555;
      --dropzone-text: #e0e0e0; /* Added for dropzone text color */
      --dropzone-hover-bg: #2c2c2c;
      --extension-button-bg: #1a73e8;
      --extension-button-text: white;
      --footer-bg: #1e1e1e;
      --modal-bg: #2c2c2c;
      --instructions-bg: #1e1e1e; /* Added for instructions box background */
      --instructions-text: #e0e0e0; /* Added for instructions text */
      --tile-bg: #2c2c2c; /* Added for homepage tiles */
      --tile-text: #ffffff; /* Added for homepage tile text - made white for higher contrast */
      --disabled-bg: #2c2c2c; /* For disabled inputs in dark mode */
      --disabled-text: #aaaaaa; /* For disabled text in dark mode */
      --placeholder-text: #aaaaaa; /* For placeholder text in dark mode */
      --email-button-bg: #0080c7; /* For email buttons in dark mode */
      --email-button-text: white; /* For email button text in dark mode */
    }

    /* Apply variables to elements */
    body {
      background-color: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s, color 0.3s;
    }

    /* Fix for instruction boxes */
    table td p, table td ol, table td ul, table td li {
      color: var(--instructions-text);
    }

    /* Fix for the instructions box background */
    table td {
      background-color: var(--background-color);
    }

    /* Fix for dropzone text */
    #dropzone {
      background-color: var(--dropzone-bg);
      border-color: var(--dropzone-border);
      color: var(--dropzone-text);
    }

    #dropzone.dragover {
      background-color: var(--dropzone-hover-bg);
    }

    /* Fix for homepage tiles */
    .tile {
      background-color: var(--tile-bg);
      border-color: var(--border-color);
    }

    .tile h2, .tile p {
      color: var(--tile-text);
    }

    /* General table styling */
    table {
      color: var(--text-color);
      border-color: var(--table-border);
    }

    th {
      background-color: var(--table-header-bg);
      color: var(--text-color);
      border-color: var(--table-border);
    }

    td {
      border-color: var(--table-border);
    }

    .table {
      color: var(--text-color);
    }

    .table-striped tbody tr:nth-of-type(odd) {
      background-color: var(--secondary-bg-color);
    }

    .table-hover tbody tr:hover {
      background-color: var(--table-hover-bg);
    }

    .table-bordered {
      border-color: var(--table-border);
    }

    .card, .report-section {
      background-color: var(--secondary-bg-color);
      border-color: var(--border-color);
    }

    button, .btn {
      transition: background-color 0.3s;
    }

    .btn-primary, #buttonContainer button, .export-btn {
      background-color: var(--primary-button-bg);
      color: var(--primary-button-text);
      border-color: var(--primary-button-bg);
    }

    .btn-primary:hover, #buttonContainer button:hover, .export-btn:hover {
      background-color: var(--primary-button-hover-bg);
      border-color: var(--primary-button-hover-bg);
    }

    .btn-secondary {
      background-color: var(--secondary-button-bg);
      color: var(--secondary-button-text);
    }

    input, select, textarea, .form-control {
      background-color: var(--input-bg);
      color: var(--input-text);
      border-color: var(--input-border);
    }

    /* Fix placeholder text color */
    ::placeholder {
      color: var(--placeholder-text) !important;
      opacity: 0.7 !important;
    }

    input[type="time"] {
      color-scheme: var(--color-scheme, light);
    }

    .dark-mode input[type="time"] {
      --color-scheme: dark;
    }

    select option {
      background-color: var(--dropdown-bg);
      color: var(--dropdown-text);
    }

    /* Fix disabled inputs */
    input:disabled, select:disabled, textarea:disabled, .form-control:disabled {
      background-color: var(--disabled-bg) !important;
      color: var(--disabled-text) !important;
      opacity: 0.8 !important;
    }

    #error {
      color: var(--error-text);
    }

    .footer {
      background-color: var(--footer-bg);
      border-color: var(--border-color);
    }

    .modal-content {
      background-color: var(--modal-bg);
      color: var(--text-color);
    }

    .extension-button {
      background-color: var(--extension-button-bg);
      color: var(--extension-button-text);
    }

    .success {
      background-color: var(--success-bg);
      color: var(--success-text);
    }

    .loading, .instructions {
      background-color: var(--secondary-bg-color);
      color: var(--text-color);
      border-color: var(--border-color);
    }

    .warning {
      background-color: var(--warning-bg);
      color: var(--warning-text);
    }

    /* Fix for charts and tables in dark mode */
    .meal-report th.rotated-header > div,
    .total-row {
      color: var(--text-color);
    }

    .meal-report td:first-child,
    .meal-report th:first-child {
      color: var(--text-color);
    }

    /* Dark mode toggle button styling */
    .theme-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--secondary-bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }

    .theme-toggle:hover {
      transform: scale(1.1);
    }

    .theme-toggle svg {
      width: 24px;
      height: 24px;
      transition: transform 0.5s ease;
    }

    .dark-mode .theme-toggle .sun-icon {
      display: block;
    }

    .dark-mode .theme-toggle .moon-icon {
      display: none;
    }

    .theme-toggle .sun-icon {
      display: none;
    }

    .theme-toggle .moon-icon {
      display: block;
    }

    /* Fix links in dark mode */
    .dark-mode a:not(.btn):not(.extension-button) {
      color: #4dabf7;
    }

    .dark-mode a:not(.btn):not(.extension-button):hover {
      color: #74c0fc;
    }

    /* Additional fixes for specific elements */
    .dark-mode .highlight-box {
      background-color: var(--secondary-bg-color);
      border-color: var(--primary-button-bg);
    }

    .dark-mode .privacy-section h3 {
      color: var(--text-color);
    }

    /* Fix for bootstrap components in dark mode */
    .dark-mode .container,
    .dark-mode .container-fluid {
      background-color: var(--background-color);
    }

    /* Comprehensive fixes for dark mode across all pages */

    /* Fix for tables with class="table" in dark mode - more specific selector */
    .dark-mode table.table,
    .dark-mode .table {
      color: var(--text-color) !important;
    }

    .dark-mode table.table td,
    .dark-mode .table td {
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
    }

    .dark-mode table.table th,
    .dark-mode .table th {
      background-color: var(--table-header-bg) !important;
      color: var(--text-color) !important;
    }

    /* Fix for table row hover in dark mode */
    .dark-mode .table-hover tbody tr:hover {
      background-color: var(--secondary-bg-color) !important;
      color: var(--text-color) !important;
    }

    /* Fix for Badge page sample table - preserve colors regardless of mode */
    table[style*="text-align: center"][style*="margin: 0px auto"] {
      /* This targets the sample badge table specifically */
      background-color: white !important;
      color: black !important;
    }

    table[style*="text-align: center"][style*="margin: 0px auto"] td,
    table[style*="text-align: center"][style*="margin: 0px auto"] p,
    table[style*="text-align: center"][style*="margin: 0px auto"] input,
    table[style*="text-align: center"][style*="margin: 0px auto"] select {
      background-color: white !important;
      color: black !important;
    }

    /* Exception for the black background row in the badge table */
    table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] {
      background-color: black !important;
    }

    table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] p {
      color: white !important;
    }

    /* Fix for abbreviation tables in dark mode */
    .dark-mode .role-abbreviation-container h3,
    .dark-mode .role-abbreviation-container p {
      color: var(--text-color) !important;
    }

    .dark-mode .role-abbreviation-table th {
      background-color: var(--table-header-bg) !important;
      color: var(--text-color) !important;
    }

    .dark-mode .role-abbreviation-table td {
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
    }

    .dark-mode .role-abbreviation-input {
      background-color: var(--input-bg) !important;
      color: var(--input-text) !important;
      border-color: var(--input-border) !important;
    }

    /* Fix for placeholder text in role abbreviation inputs */
    .dark-mode .role-abbreviation-input::placeholder {
      color: #aaaaaa !important;
      opacity: 0.8 !important;
    }

    /* Fix for select elements in dark mode */
    .dark-mode select,
    .dark-mode #roleSortOrder,
    .dark-mode #volunteerFilter,
    .dark-mode #programSelector,
    .dark-mode [id$="-display"] {
      background-color: var(--dropdown-bg) !important;
      color: var(--dropdown-text) !important;
    }

    /* Fix for homepage tile hover in dark mode */
    .dark-mode .tile:hover {
      background-color: var(--secondary-bg-color) !important;
    }

    .dark-mode .tile:hover h2,
    .dark-mode .tile:hover p {
      color: var(--text-color) !important;
    }

    /* Fix for parser page table */
    .dark-mode #outputTable th,
    .dark-mode #outputTable td {
      background-color: var(--table-header-bg) !important;
      color: var(--text-color) !important;
    }

    .dark-mode #outputTable tbody td {
      background-color: var(--background-color) !important;
    }

    /* Fix for certification page */
    .dark-mode .role-section h4 {
      border-bottom-color: var(--text-color) !important;
      color: var(--text-color) !important;
    }

    .dark-mode .role-section h5 {
      color: var(--text-color) !important;
    }

    .dark-mode #version-tag,
    .dark-mode label[for="programSelector"],
    .dark-mode .program-selector-container label {
      color: var(--text-color) !important;
    }

    .dark-mode i {
      color: var(--text-color) !important;
    }

    /* Fix for email buttons */
    .email-button {
      background-color: var(--email-button-bg) !important;
      color: var(--email-button-text) !important;
      border: none !important;
    }

    .dark-mode .email-button {
      background-color: var(--email-button-bg) !important;
      color: var(--email-button-text) !important;
      border: none !important;
    }

    /* Fix for event planning reporter */
    .dark-mode .meal-report th,
    .dark-mode .meal-report td {
      color: var(--text-color) !important;
    }

    .dark-mode #yearsOfServiceReport th,
    .dark-mode #yearsOfServiceReport td,
    .dark-mode #shirtSizeReport th,
    .dark-mode #shirtSizeReport td,
    .dark-mode #consentReport th,
    .dark-mode #consentReport td {
      color: var(--text-color) !important;
    }

    /* Fix for time inputs in event planning */
    .dark-mode .time-input-container input[type="time"] {
      background-color: var(--input-bg) !important;
      color: var(--input-text) !important;
      border-color: var(--input-border) !important;
    }

    /* Fix for disabled time inputs in event planning */
    .dark-mode .time-input-container input[type="time"]:disabled {
      background-color: var(--disabled-bg) !important;
      color: var(--disabled-text) !important;
      opacity: 0.8 !important;
    }

    /* Fix for time checkbox labels */
    .dark-mode .nomeal-label {
      color: var(--text-color) !important;
    }

    /* Fix for any other form controls that might be affected */
    .dark-mode button,
    .dark-mode .btn,
    .dark-mode input,
    .dark-mode select,
    .dark-mode textarea {
      color: var(--input-text) !important;
    }

    /* Fix for instructions text */
    .dark-mode table td small,
    .dark-mode table td i,
    .dark-mode .table td small,
    .dark-mode .table td i {
      color: var(--text-color) !important;
    }

    /* General fix for various text elements */
    .dark-mode h1,
    .dark-mode h2,
    .dark-mode h3,
    .dark-mode h4,
    .dark-mode h5,
    .dark-mode h6,
    .dark-mode p,
    .dark-mode span,
    .dark-mode div {
      color: var(--text-color);
    }

    /* Fix for any additional borders */
    .dark-mode hr,
    .dark-mode .border,
    .dark-mode *[class*="border"] {
      border-color: var(--border-color) !important;
    }

    /* Fix specifically for the "See more resources" button */
    .dark-mode .btn-primary {
      background-color: var(--primary-button-bg) !important;
      color: var(--primary-button-text) !important;
      border-color: var(--primary-button-bg) !important;
    }

    .dark-mode .btn-primary:hover {
      background-color: var(--primary-button-hover-bg) !important;
    }

    /* ADDITIONAL FIXES BASED ON FEEDBACK */

    /* Badges: Role box - remove white background and ensure black box with white text */
    table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] td,
    table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] div {
      background-color: transparent !important;
    }

    /* Badges: "Sort by" selector in dark mode */
    .dark-mode #roleSortOrder {
      background-color: var(--dropdown-bg) !important;
      color: var(--dropdown-text) !important;
      border-color: var(--input-border) !important;
    }

    /* Badges: Placeholder text in abbreviation fields */
    .dark-mode .role-abbreviation-input::placeholder {
      color: #aaaaaa !important;
      opacity: 1 !important;
    }

    /* Parser: "Filter volunteers" selector */
    .dark-mode #volunteerFilter {
      background-color: var(--dropdown-bg) !important;
      color: var(--dropdown-text) !important;
      border-color: var(--input-border) !important;
    }

    /* Certification: Email button text */
    .email-button {
      background-color: #0dcaf0 !important;
      color: #000000 !important; /* Dark text on light background */
      font-weight: bold !important;
      border: none !important;
    }

    .dark-mode .email-button {
      background-color: #0080c7 !important;
      color: #ffffff !important; /* Light text on dark background */
      font-weight: bold !important;
      border: none !important;
    }

    /* Certification: "Select program" selector */
    .dark-mode #programSelector {
      background-color: var(--dropdown-bg) !important;
      color: var(--dropdown-text) !important;
      border-color: var(--input-border) !important;
    }

    /* Event Planning: Disabled fields for "no meal" checkboxes */
    .dark-mode input[type="time"]:disabled,
    .dark-mode select:disabled {
      background-color: #2c2c2c !important; /* Darker background */
      color: #aaaaaa !important; /* Light gray text for better contrast */
      opacity: 0.8 !important;
    }

    /* Event Planning: Time selectors */
    .dark-mode input[type="time"] {
      background-color: var(--input-bg) !important;
      color: var(--input-text) !important;
      border-color: var(--input-border) !important;
    }
  `;
  document.head.appendChild(darkModeCSS);

  // Special handling for the badge preview table
  // This ensures it always looks the same regardless of dark/light mode
  if (window.location.href.includes('badge.html')) {
    setTimeout(() => {
      const badgeTable = document.querySelector('table[style*="text-align: center"][style*="margin: 0px auto"]');
      if (badgeTable) {
        // Make sure badge table keeps its styles
        const badgeTableStyle = document.createElement('style');
        badgeTableStyle.textContent = `
          /* Badge table should look the same in both modes */
          table[style*="text-align: center"][style*="margin: 0px auto"] {
            background-color: white !important;
            color: black !important;
          }

          table[style*="text-align: center"][style*="margin: 0px auto"] td,
          table[style*="text-align: center"][style*="margin: 0px auto"] p,
          table[style*="text-align: center"][style*="margin: 0px auto"] input,
          table[style*="text-align: center"][style*="margin: 0px auto"] select {
            background-color: white !important;
            color: black !important;
          }

          /* Keep black background row black */
          table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] {
            background-color: black !important;
          }

          table[style*="text-align: center"][style*="margin: 0px auto"] td[bgcolor="black"] p {
            color: white !important;
          }
        `;
        document.head.appendChild(badgeTableStyle);
      }
    }, 500); // Small delay to ensure the table is loaded
  }
}

function addCommonElements() {

  // Chrome extension
  const buttonStyle = document.createElement('style');
  buttonStyle.textContent = `
    .extension-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4285F4;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      text-decoration: none !important;
      font-weight: bold;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: background-color 0.3s, transform 0.2s;
    }

    .extension-button:hover {
      background-color: #3367D6;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      color: white !important;
      text-decoration: none !important;
    }

    .extension-button img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }

    @media (max-width: 767px) {
      .extension-button {
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        font-size: 14px;
      }

      .extension-button img {
        width: 20px;
        height: 20px;
        margin-right: 6px;
      }
    }
  `;
  document.head.appendChild(buttonStyle);

  // Create the extension button
  const button = document.createElement('a');
  button.href = 'https://chromewebstore.google.com/detail/vc-tools-integration/bgndacoknekjiadmlogmnechjnabggjf';
  button.className = 'extension-button';
  button.target = '_blank';

  // Create the inline SVG for Chrome logo
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.style.marginRight = '8px';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  const gradients = [
    {
      id: 'a',
      x1: '3.2173', y1: '15', x2: '44.7812', y2: '15',
      stops: [
        {offset: '0', color: '#d93025'},
        {offset: '1', color: '#ea4335'}
      ]
    },
    {
      id: 'b',
      x1: '20.7219', y1: '47.6791', x2: '41.5039', y2: '11.6837',
      stops: [
        {offset: '0', color: '#fcc934'},
        {offset: '1', color: '#fbbc04'}
      ]
    },
    {
      id: 'c',
      x1: '26.5981', y1: '46.5015', x2: '5.8161', y2: '10.506',
      stops: [
        {offset: '0', color: '#1e8e3e'},
        {offset: '1', color: '#34a853'}
      ]
    }
  ];

  gradients.forEach(gradient => {
    const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    linearGradient.setAttribute('id', gradient.id);
    linearGradient.setAttribute('x1', gradient.x1);
    linearGradient.setAttribute('y1', gradient.y1);
    linearGradient.setAttribute('x2', gradient.x2);
    linearGradient.setAttribute('y2', gradient.y2);
    linearGradient.setAttribute('gradientUnits', 'userSpaceOnUse');

    gradient.stops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      linearGradient.appendChild(stopElement);
    });

    defs.appendChild(linearGradient);
  });

  svg.appendChild(defs);

  // Create the main SVG elements
  const elements = [
    {
      type: 'circle',
      attrs: {
        cx: '24', cy: '23.9947', r: '12',
        style: 'fill:#fff'
      }
    },
    {
      type: 'path',
      attrs: {
        d: 'M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z',
        style: 'fill:none'
      }
    },
    {
      type: 'path',
      attrs: {
        d: 'M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z',
        style: 'fill:url(#a)'
      }
    },
    {
      type: 'circle',
      attrs: {
        cx: '24', cy: '24', r: '9.5',
        style: 'fill:#1a73e8'
      }
    },
    {
      type: 'path',
      attrs: {
        d: 'M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z',
        style: 'fill:url(#b)'
      }
    },
    {
      type: 'path',
      attrs: {
        d: 'M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z',
        style: 'fill:url(#c)'
      }
    }
  ];

  // Add each element to the SVG
  elements.forEach(element => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', element.type);

    // Set all attributes
    for (const [key, value] of Object.entries(element.attrs)) {
      svgElement.setAttribute(key, value);
    }

    svg.appendChild(svgElement);
  });

  // Create the button text
  const buttonText = document.createTextNode('Add to Chrome');

  // Assemble the button
  button.appendChild(svg);
  button.appendChild(buttonText);

  // Add the button to the page
  document.body.appendChild(button);

  // Footer (checks first for existing footer and omits)
  let existingFooter = document.querySelector('.footer');

  if (!existingFooter) {
    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
      .footer {
        margin-top: 40px;
        padding: 20px 0;
        text-align: center;
        background-color: #f8f9fa;
        border-top: 1px solid #ddd;
        width: 100%;
      }

      .footer p {
        margin-bottom: 0;
      }

      .footer a {
        color: #007bff;
        text-decoration: none;
      }

      .footer a:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(footerStyle);

    const footer = document.createElement('div');
    footer.className = 'footer';

    const p = document.createElement('p');

    p.innerHTML = '<a href="https://www.nytimes.com/2025/02/27/technology/personaltech/vibecoding-ai-software-programming.html">Vibecoded</a> by <a href="mailto:tools@jaredhk.com">Jared Hasen-Klein</a> with help from <a href="https://www.anthropic.com/news/introducing-claude">Claude</a> and <a href="https://github.com/jaredhasenklein/vctools">you (hopefully)</a>.<br><small><a href="privacy.html">Privacy Policy</a></small>';

    footer.appendChild(p);

    document.body.appendChild(footer);
  }

  // Add dark mode toggle and CSS
  addDarkModeCSS();
  addDarkModeToggle();
}

// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCommonElements);
} else {
  addCommonElements();
}
