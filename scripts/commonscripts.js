window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-LNHZ3NT97K');

// ============================================================
// FILE DROP ZONE
// Every upload box on the site is built here so they all look and behave the same.
// Markup:  <input type="file" id="x" accept=".csv" hidden>
//          <div class="vms-drop" data-title="Name Badges report" data-optional></div>
// Pages call setupDragAndDrop(zone, input, handler), then setDropzoneLoaded(zone, {...})
// once the file has been read.
// ============================================================
const DROP_ICONS = {
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  done: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function renderDropzone(dropzone, state = {}) {
  const title = dropzone.dataset.title || 'VMS report';
  const optional = 'optional' in dropzone.dataset;
  const loaded = Boolean(state.fileName);
  dropzone.classList.add('vms-drop');
  dropzone.classList.toggle('is-loaded', loaded);
  dropzone.innerHTML = '';

  const icon = document.createElement('div');
  icon.className = 'vms-drop__icon';
  icon.innerHTML = loaded ? DROP_ICONS.done : DROP_ICONS.upload;

  const body = document.createElement('div');
  body.className = 'vms-drop__body';
  const heading = document.createElement('div');
  heading.className = 'vms-drop__title';
  heading.textContent = loaded ? state.fileName : title;
  const hint = document.createElement('div');
  hint.className = 'vms-drop__hint';
  hint.textContent = loaded
    ? [state.detail, 'Drop or click to replace'].filter(Boolean).join(' · ')
    : 'Drag your VMS export here, or click to choose a CSV file';
  body.append(heading, hint);
  dropzone.append(icon, body);

  if (optional && !loaded) {
    const tag = document.createElement('span');
    tag.className = 'vms-drop__tag';
    tag.textContent = 'Optional';
    dropzone.append(tag);
  }
  dropzone.setAttribute('aria-label', loaded ? `${title}: ${state.fileName} loaded. Choose a different file.` : `${title}: choose a CSV file`);
}

/** Show a drop zone's loaded state: file name plus a short detail line, e.g. "Assigned Volunteers · 42 volunteers". */
function setDropzoneLoaded(dropzone, { fileName, detail } = {}) {
  if (dropzone) renderDropzone(dropzone, { fileName: fileName || 'File loaded', detail });
}

/** Put a drop zone back to its empty state. */
function resetDropzone(dropzone) {
  if (dropzone) renderDropzone(dropzone);
}

/** "Name Badges · CA-Van Nuys Kickoff - FRC" style summary of a report from lib/vms. */
function describeReport(report, countText) {
  return [report?.meta?.report, report?.meta?.event, countText].filter(Boolean).join(' · ');
}

function setupDragAndDrop(dropzone, fileInput, handleFiles) {
  renderDropzone(dropzone);
  dropzone.setAttribute('role', 'button');
  dropzone.tabIndex = 0;
  fileInput.hidden = true;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add('is-dragover'), false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('is-dragover'), false);
  });

  dropzone.addEventListener('click', () => fileInput.click(), false);
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files), false);
  fileInput.addEventListener('change', handleFiles, false);
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
  // Theme styles live in style/darkmode.css. Appended last so they win the cascade.
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'style/darkmode.css';
  document.head.appendChild(link);
}

// Function to create and add the home button
function addHomeButton() {
  // Don't add on the home page
  if (window.location.pathname === '/' || 
      window.location.pathname === '/index' || 
      window.location.pathname === '/index.html') {
    return null;
  }

  const homeButton = document.createElement('a');
  homeButton.href = 'index';
  homeButton.className = 'btn btn-primary home-button';
  homeButton.innerHTML = '🏠 See more resources';
  
  return homeButton;
}

// Function to check if the browser is Chromium-based
function isChromiumBrowser() {
  // Check for Chrome, Edge, Opera, and other Chromium-based browsers
  return navigator.userAgent.indexOf("Chrome") !== -1 || 
         navigator.userAgent.indexOf("Edg") !== -1 || 
         navigator.userAgent.indexOf("OPR") !== -1 || 
         navigator.userAgent.indexOf("CriOS") !== -1;
}

// Simplified approach - just show the button in Chromium browsers

// Chrome extension button - simplified to just check browser type
function addExtensionButton() {
  // Only add for Chromium browsers
  if (!isChromiumBrowser()) {
    return null;
  }

  const buttonStyle = document.createElement('style');
  buttonStyle.textContent = `
    .extension-button {
      background-color: #4285F4;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      text-decoration: none !important;
      font-weight: bold;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: background-color 0.3s, transform 0.2s;
      margin-left: 15px;
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

  return button;
}

// Create a sticky top bar
function createTopBar(homeButton, extensionButton) {
  // Create top bar container
  const topBar = document.createElement('div');
  topBar.className = 'top-bar';
  topBar.id = 'top-bar';
  
  // Add the home button if available
  if (homeButton) {
    topBar.appendChild(homeButton);
  }
  
  // Add the extension button if available
  if (extensionButton) {
    topBar.appendChild(extensionButton);
  }
  
  return topBar;
}

// Initialize scroll behavior for the top bar
function initScrollBehavior(topBar) {
  if (!topBar) return;
  
  const topBarHeight = topBar.offsetHeight;
  const topBarOffsetTop = topBar.offsetTop;
  
  // Function to handle scroll
  function handleScroll() {
    if (window.pageYOffset > topBarOffsetTop) {
      if (!topBar.classList.contains('sticky')) {
        topBar.classList.add('sticky');
        // Add padding to body to prevent content jump
        document.body.style.paddingTop = `${topBarHeight}px`;
      }
    } else {
      if (topBar.classList.contains('sticky')) {
        topBar.classList.remove('sticky');
        // Remove padding from body
        document.body.style.paddingTop = '0';
      }
    }
  }
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
}

// Footer (checks first for existing footer and omits)
function addFooter() {
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
}

async function addCommonElements() {
  // Check if top bar already exists to avoid duplicates
  const existingTopBar = document.getElementById('top-bar');
  if (existingTopBar) {
    return; // Top bar already exists, so exit
  }
  
  // Generate buttons first
  const homeButton = addHomeButton();
  const extensionButton = await addExtensionButton();
  
  // Remove any existing standalone home buttons
  // IMPORTANT: Do this AFTER the top bar is created and inserted
  
  // Create top bar with buttons
  if (homeButton || extensionButton) {
    const topBar = createTopBar(homeButton, extensionButton);
    
    // Insert at the beginning of the body
    if (document.body.firstChild) {
      document.body.insertBefore(topBar, document.body.firstChild);
    } else {
      document.body.appendChild(topBar);
    }
    
    // Initialize scrolling behavior
    initScrollBehavior(topBar);
    
    // NOW remove any existing standalone home buttons
    // This ensures we don't remove buttons until after the top bar is added
    const existingHomeButtons = document.querySelectorAll('a[href="index"].btn.btn-primary:not(.home-button)');
    existingHomeButtons.forEach(button => {
      button.remove();
    });
  }

  // Add footer if it doesn't exist yet
  addFooter();

  // Add dark mode toggle and CSS if not added yet
  const darkModeToggle = document.querySelector('.theme-toggle');
  if (!darkModeToggle) {
    addDarkModeCSS();
    addDarkModeToggle();
  }
}
// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCommonElements);
} else {
  addCommonElements();
}