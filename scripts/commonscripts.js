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
}

// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCommonElements);
} else {
  addCommonElements();
}