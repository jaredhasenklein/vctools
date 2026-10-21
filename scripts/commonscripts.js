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
function addDarkModeCSS() {
  // Theme styles live in style/darkmode.css. Appended last so they win the cascade.
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'style/darkmode.css';
  link.media = 'screen'; // Printouts always use the light theme.
  document.head.appendChild(link);
}

// Function to create and add the home button
// ============================================================
// SITE HEADER, THEME, FOOTER
// Every page gets the same slim header (home link, extension link, theme switch)
// and footer. Pages only need to load this script.
// ============================================================
const EXTENSION_STORE_URL = 'https://chromewebstore.google.com/detail/vc-tools-integration/bgndacoknekjiadmlogmnechjnabggjf';
const EXTENSION_MANUAL_URL = 'https://github.com/jaredhasenklein/vctools/tree/main/browser_extension#install';
const CHROME_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fff"/><path d="M24 12h20.8A24 24 0 0 0 3.2 12L13.6 30A12 12 0 0 1 24 12z" fill="#ea4335"/><path d="M34.4 30L24 48A24 24 0 0 0 44.8 12H24a12 12 0 0 1 10.4 18z" fill="#fbbc04"/><path d="M13.6 30L3.2 12A24 24 0 0 0 24 48l10.4-18a12 12 0 0 1-20.8 0z" fill="#34a853"/><circle cx="24" cy="24" r="9.5" fill="#1a73e8"/></svg>';
const THEME_ICONS = `<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    </svg>`;

function isHomePage() {
  return /^\/(index(\.html)?)?$/.test(window.location.pathname);
}

function isChromiumBrowser() {
  const ua = navigator.userAgent;
  return /Chrome|Edg|OPR|CriOS/.test(ua) && !/Firefox|FxiOS/.test(ua);
}

/** Apply the saved theme (or the computer's setting) and return the header's toggle button. */
function createThemeToggle() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* storage blocked */ }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark-mode', saved ? saved === 'dark' : Boolean(prefersDark));

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.innerHTML = THEME_ICONS;
  const label = () => (document.body.classList.contains('dark-mode') ? 'Switch to light mode' : 'Switch to dark mode');
  button.setAttribute('aria-label', label());
  button.title = label();
  button.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* storage blocked */ }
    button.setAttribute('aria-label', label());
    button.title = label();
  });
  return button;
}

function createSiteHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'top-bar';

  const brand = document.createElement(isHomePage() ? 'span' : 'a');
  brand.className = 'site-brand';
  brand.innerHTML = '<span class="site-brand__mark" aria-hidden="true">VC</span><span>VC Tools</span>';
  if (!isHomePage()) {
    brand.href = './';
    brand.title = 'All tools';
  }

  const actions = document.createElement('div');
  actions.className = 'site-actions';
  const ext = document.createElement('a');
  ext.className = 'site-ext';
  ext.target = '_blank';
  ext.rel = 'noopener';
  if (isChromiumBrowser()) {
    ext.href = EXTENSION_STORE_URL;
    ext.innerHTML = `${CHROME_ICON}<span>Get the Chrome extension</span>`;
    ext.title = 'Adds "Open in VC Tools" buttons to VMS reports';
  } else {
    ext.href = EXTENSION_MANUAL_URL;
    ext.innerHTML = '<span>Browser extension</span>';
    ext.title = 'How to install the VC Tools extension';
  }
  actions.append(ext, createThemeToggle());
  header.append(brand, actions);
  return header;
}

function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer footer';
  footer.innerHTML = '<a href="https://www.nytimes.com/2025/02/27/technology/personaltech/vibecoding-ai-software-programming.html">Vibecoded</a> by <a href="mailto:tools@jaredhk.com">Jared Hasen-Klein</a> with help from <a href="https://www.anthropic.com/news/introducing-claude">Claude</a> and <a href="https://github.com/jaredhasenklein/vctools">you (hopefully)</a> · <a href="privacy">Privacy</a> · Not an official <i>FIRST</i> site';
  return footer;
}

function addCommonElements() {
  if (document.getElementById('top-bar')) return;
  addDarkModeCSS();
  document.body.prepend(createSiteHeader());
  document.body.append(createFooter());
}

// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCommonElements);
} else {
  addCommonElements();
}
