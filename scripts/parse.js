const columns = [
  'Minor', 'Legal First Name', 'Preferred First Name', 'Last Name', 'Personal Pronouns', 'Email', 'Phone', 'Languages Spoken', 'FIRST Youth Protection Policy', 'Certified', 'Shirt Size', 'Self-Reported Accommodations', 'Team Affiliation', 'Employer', 'Alumni', 'Emergency Contact', 'Emergency Contact Phone Number', 'Affiliations', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

// List of key volunteer roles
const keyVolunteerRoles = [
  'Control System Advisor',
  'Emcee',
  'Field Supervisor',
  'FIRST Technical Advisor',
  'FIRST Technical Advisor Assistant',
  'Game Announcer',
  'Head Referee',
  'Judge Advisor',
  'Lead Queuer',
  'Lead Robot Inspector',
  'Pit Administration Supervisor',
  'Referee',
  'Robot Inspector',
  'Safety Manager',
  'Scorekeeper',
  'Volunteer Coordinator',
  'Webcast Operator'
];

// Keep track of all parsed data for filtering
let allVolunteerData = [];

// Event listeners for drag and drop
document.addEventListener('DOMContentLoaded', function() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('csvFile');

  if (!dropzone || !fileInput) {
    console.error('Required elements not found: dropzone or csvFile');
    return;
  }

  // Initialize drag and drop functionality
  setupDragAndDrop(dropzone, fileInput, loadFile);
});

function loadFile(event) {
  let file;

  if (event.target && event.target.files) {
    file = event.target.files[0];
  } else if (event.length) {
    file = event[0];
  }

  if (!file) return;

  document.getElementById('buttonContainer').innerHTML = '';
  document.getElementById('outputTable').innerHTML = '';
  clearError();

  if (!validateCSVFile(file)) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {
    const csvData = reader.result;
    const preprocessedData = preprocessCSV(csvData);
    allVolunteerData = reformatCSV(preprocessedData);
    
    // Create filter dropdown
    createFilterControls();
    
    // Display data with current filter
    applyCurrentFilter();
  };

  reader.readAsText(file);
}

function createFilterControls() {
  const buttonContainer = document.getElementById('buttonContainer');
  
  // Create filter container
  const filterContainer = document.createElement('div');
  filterContainer.style.display = 'flex';
  filterContainer.style.alignItems = 'center';
  filterContainer.style.gap = '10px';
  filterContainer.style.marginBottom = '15px';
  
  // Create filter label
  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter volunteers: ';
  filterLabel.setAttribute('for', 'volunteerFilter');
  
  // Create filter dropdown
  const filterDropdown = document.createElement('select');
  filterDropdown.id = 'volunteerFilter';
  filterDropdown.className = 'form-select';
  filterDropdown.style.width = 'auto';
  
  // Add options
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Volunteers';
  
  const keyOption = document.createElement('option');
  keyOption.value = 'key';
  keyOption.textContent = 'Key Volunteers Only';
  
  filterDropdown.appendChild(allOption);
  filterDropdown.appendChild(keyOption);
  
  // Add event listener
  filterDropdown.addEventListener('change', applyCurrentFilter);
  
  // Add elements to container
  filterContainer.appendChild(filterLabel);
  filterContainer.appendChild(filterDropdown);
  
  // Create download button
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download CSV';
  downloadButton.onclick = () => {
    const filteredData = getFilteredData();
    downloadCSV(columns, filteredData);
  };
  
  // Add to DOM
  buttonContainer.appendChild(filterContainer);
  buttonContainer.appendChild(downloadButton);
}

function getFilteredData() {
  const filterValue = document.getElementById('volunteerFilter').value;
  
  if (filterValue === 'all') {
    return allVolunteerData;
  } else if (filterValue === 'key') {
    return allVolunteerData.filter(volunteer => isKeyVolunteer(volunteer));
  }
  
  return allVolunteerData; // Default fallback
}

function isKeyVolunteer(volunteer) {
  // Check each day for key volunteer roles
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (const day of days) {
    if (!volunteer[day] || !Array.isArray(volunteer[day])) continue;
    
    // Check if any role for this day is a key role
    for (const role of volunteer[day]) {
      if (keyVolunteerRoles.includes(role)) {
        return true;
      }
    }
  }
  
  return false;
}

function applyCurrentFilter() {
  const filteredData = getFilteredData();
  displayData(filteredData);
}

function preprocessCSV(csvData) {
  return csvData.replace(/(".*?")/g, (match) => {
    // If the quoted string contains a comma, keep the quotes, otherwise remove them
    return match.includes(',') ? match : match.replace(/"/g, '');
  });
}

function reformatCSV(csvData) {
  const rows = csvData.trim().split('\n');
  const headerRow = rows[11].split(',');
  const dayIndex = headerRow.indexOf('Day');

  const data = [];

  for (let i = 12; i < rows.length; i++) {
    const row = replaceCommasInQuotes(rows[i], '|').split(',');
    const email = row[5];
    const day = row[dayIndex];
    const role = row[7];

    const person = data.find(p => p.email === email) || {};

    for (let j = 0; j < headerRow.length; j++) {
      if (headerRow[j] !== 'Day' && headerRow[j] !== 'Start Time' && headerRow[j] !== 'End Time' && headerRow[j] !== 'Roles') {
        person[headerRow[j]] = row[j].replace(/\|/g, ',').replace(/^"(.*)"$/, '$1') || '';
      }
    }

    if (day) {
      person[day] = (person[day] || []).concat(role);
    }

    if (!data.find(p => p.email === email)) {
      person.email = email;
      data.push(person);
    }
  }

  return data;
}

function replaceCommasInQuotes(str, replacement) {
  const regex = /"((?:[^"\\]|\\.)*)"/g;
  return str.replace(regex, match => match.replace(/,/g, replacement));
}

function displayData(reformattedData) {
  const table = document.getElementById('outputTable');
  table.innerHTML = '';

  // Filter out columns where all rows have null or undefined values
  const visibleColumns = columns.filter(header => reformattedData.some(row => row[header] !== null && row[header] !== undefined));

  // Create table header with scope attribute
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  visibleColumns.forEach(header => {
    const th = document.createElement('th');
    th.setAttribute('scope', 'col');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');

  reformattedData.forEach(row => {
    const tr = document.createElement('tr');
    visibleColumns.forEach(header => {
      const td = document.createElement('td');
      const value = Array.isArray(row[header]) ? row[header].join(', ') : row[header];
      td.textContent = value || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  
  // Show record count
  // Remove existing count info if present
  const existingCountInfo = document.getElementById('volunteerCountInfo');
  if (existingCountInfo) {
    existingCountInfo.remove();
  }
  
  // Create new count info with total count
  const countInfo = document.createElement('div');
  countInfo.id = 'volunteerCountInfo';
  countInfo.textContent = `Showing ${reformattedData.length} out of ${allVolunteerData.length} volunteer${allVolunteerData.length !== 1 ? 's' : ''}`;
  countInfo.style.marginTop = '10px';
  countInfo.style.marginBottom = '10px';
  table.before(countInfo);
}

function downloadCSV(headers, data) {
  // Filter out columns where all rows have null or undefined values
  const visibleColumns = headers.filter(header => data.some(row => row[header] !== null && row[header] !== undefined));

  const headerRow = visibleColumns.join(',');
  const csvContent = [headerRow, ...data.map(row => visibleColumns.map(header => {
    const value = Array.isArray(row[header]) ? row[header].join(', ').replace(/,/g, '""') : (row[header] === undefined ? '' : row[header]);
    return `"${value}"`;
  }).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Get current filter for filename
    const filterType = document.getElementById('volunteerFilter').value === 'key' ? 'Key' : 'All';
    link.setAttribute('download', `${filterType} Volunteers Reformatted.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(URL.createObjectURL(blob));
  }
}