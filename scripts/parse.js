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
    try {
      const csvData = reader.result;
      
      // Pre-process the CSV to handle line breaks within quoted fields
      const processedCsv = preprocessCSVWithLineBreaks(csvData);
      const preprocessedData = preprocessCSV(processedCsv);
      allVolunteerData = reformatCSV(preprocessedData);
      
      // Create filter dropdown
      createFilterControls();
      
      // Display data with current filter
      applyCurrentFilter();
    } catch (error) {
      console.error('Error processing file:', error);
      showError(`Error processing file: ${error.message || "Unknown error"}. Please check console for details.`);
    }
  };

  reader.onerror = function() {
    showError('Error reading file. Please try again.');
  };

  reader.readAsText(file, 'UTF-8');
}

// Special function to handle line breaks in quoted fields
function preprocessCSVWithLineBreaks(csvData) {
  if (!csvData) return '';
  
  // Process the CSV to properly handle quoted fields with line breaks
  let inQuote = false;
  let result = '';
  
  for (let i = 0; i < csvData.length; i++) {
    const char = csvData[i];
    
    // Toggle quote state when we see a quote
    if (char === '"') {
      inQuote = !inQuote;
      result += char;
    } 
    // Replace newlines within quotes with a placeholder
    else if ((char === '\n' || char === '\r') && inQuote) {
      result += '[NEWLINE]';
    }
    // Keep everything else as is
    else {
      result += char;
    }
  }
  
  return result;
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

function safeGetValue(array, index) {
  // Safely get a value from an array at the given index
  // Returns empty string if index is out of bounds or value is undefined/null
  if (!array || index < 0 || index >= array.length) {
    return '';
  }
  return array[index] || '';
}

function safeReplace(str, search, replace) {
  // Safely replace all occurrences of search with replace in str
  // Returns empty string if str is undefined/null/not a string
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(search, replace);
}

function reformatCSV(csvData) {
  const rows = csvData.trim().split('\n');
  console.log('Total rows:', rows.length);
  
  if (rows.length <= 11) {
    console.error('Not enough rows in CSV file');
    return [];
  }
  
  const headerRow = rows[11].split(',');
  console.log('Header row:', headerRow);
  
  const dayIndex = headerRow.indexOf('Day');
  const emailIndex = headerRow.indexOf('Email');
  
  // Find role column - try several possible column names
  let roleIndex = headerRow.indexOf('Roles');
  if (roleIndex === -1) {
    roleIndex = headerRow.indexOf('Roles Assigned');
    if (roleIndex === -1) {
      roleIndex = headerRow.indexOf('Role');
      if (roleIndex === -1) {
        roleIndex = headerRow.findIndex(col => col && col.includes('Role'));
      }
    }
  }
  
  // Find accommodation column index
  const accommodationIndex = headerRow.findIndex(col => 
    col && (col.includes('Accommodation') || col.includes('accommodation'))
  );
  
  console.log('Column indices found - Day:', dayIndex, 'Email:', emailIndex, 'Role:', roleIndex, 'Accommodation:', accommodationIndex);
  
  // Validate required columns exist
  if (dayIndex === -1 || emailIndex === -1 || roleIndex === -1) {
    throw new Error(`CSV format is invalid. Missing required columns - Day: ${dayIndex !== -1 ? 'Found' : 'Missing'}, Email: ${emailIndex !== -1 ? 'Found' : 'Missing'}, Roles: ${roleIndex !== -1 ? 'Found' : 'Missing'}`);
  }

  const data = [];

  for (let i = 12; i < rows.length; i++) {
    try {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const row = replaceCommasInQuotes(rows[i], '|').split(',');
      
      // Skip rows with insufficient columns for required fields
      if (row.length <= Math.max(emailIndex, dayIndex, roleIndex)) {
        console.warn(`Row ${i} has insufficient columns (${row.length}), needs at least ${Math.max(emailIndex, dayIndex, roleIndex) + 1}.`);
        continue;
      }
      
      // Use safe methods to get and process values
      const email = safeReplace(safeGetValue(row, emailIndex), /\|/g, ',').replace(/^"(.*)"$/, '$1');
      const day = safeReplace(safeGetValue(row, dayIndex), /\|/g, ',').replace(/^"(.*)"$/, '$1');
      const role = safeReplace(safeGetValue(row, roleIndex), /\|/g, ',').replace(/^"(.*)"$/, '$1');
      
      // Skip rows without a valid email
      if (!email) {
        console.warn(`Row ${i} has no email, skipping`);
        continue;
      }

      // Find or create person entry
      let person = data.find(p => p.email === email);
      if (!person) {
        person = { email };
        data.push(person);
      }

      // Copy other columns
      for (let j = 0; j < headerRow.length; j++) {
        if (j >= row.length) continue; // Skip if row doesn't have this column
        
        const columnName = headerRow[j];
        if (columnName !== 'Day' && columnName !== 'Start Time' && columnName !== 'End Time' && 
            columnName !== 'Roles' && columnName !== 'Roles Assigned' && columnName !== 'Role') {
            
          let value = safeReplace(safeGetValue(row, j), /\|/g, ',').replace(/^"(.*)"$/, '$1');
          
          // Special handling for accommodations field
          if (j === accommodationIndex && value.includes('[NEWLINE]')) {
            value = "This user entered an accommodation request which cannot be displayed";
            console.log(`Replaced accommodation field with placeholder for user ${email}`);
          } else if (value.includes('[NEWLINE]')) {
            // Replace any other fields with newlines with cleaned version
            value = value.replace(/\[NEWLINE\]/g, ' ');
          }
          
          person[columnName] = value;
        }
      }

      // Add role to appropriate day
      if (day) {
        person[day] = (person[day] || []).concat(role);
      }
    } catch (rowError) {
      console.warn(`Error processing row ${i}:`, rowError);
      // Continue with next row
    }
  }

  return data;
}

function replaceCommasInQuotes(str, replacement) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  try {
    const regex = /"((?:[^"\\]|\\.)*)"/g;
    return str.replace(regex, match => match.replace(/,/g, replacement));
  } catch (e) {
    console.error('Error in replaceCommasInQuotes:', e, 'for string:', str);
    return str; // Return original string if there's an error
  }
}

function displayData(reformattedData) {
  const table = document.getElementById('outputTable');
  table.innerHTML = '';

  if (!reformattedData || reformattedData.length === 0) {
    const noDataRow = document.createElement('tr');
    const noDataCell = document.createElement('td');
    noDataCell.textContent = 'No data available';
    noDataCell.style.padding = '20px';
    noDataCell.style.textAlign = 'center';
    noDataRow.appendChild(noDataCell);
    table.appendChild(noDataRow);
    return;
  }

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