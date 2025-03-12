// Default meal times
const DEFAULT_MEAL_TIMES = {
  breakfast: '07:30',
  lunch: '12:00',
  dinner: '18:00'
};

// Global variables
let parsedData = [];
let mealTimes = {};
let disabledMeals = {};
let mealDisplayOptions = {}; // New variable to store display options
let eventDays = [];
let reportData = {}; // Store report data for Excel exports
let allEnabledMeals = []; // Make this global to fix the scope issue

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('csvFile');

  if (!dropzone || !fileInput) {
    console.error('Required elements not found: dropzone or csvFile');
    return;
  }

  // Initialize drag and drop functionality
  setupDragAndDrop(dropzone, fileInput, loadFile);

  // Set up event listener for meal times update
  document.getElementById('updateMealTimes').addEventListener('click', function() {
    updateMealTimes();
    generateReports();
  });

  // Export Buttons
  document.getElementById('exportAllData').addEventListener('click', exportAllToExcel);
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('export-btn')) {
      const reportType = event.target.getAttribute('data-report');
      exportReportToExcel(reportType);
    }
  });

  // Email C&R button
  document.getElementById('emailIncomplete').addEventListener('click', emailIncompleteVolunteers);

  window.addEventListener('load', function() {
    if (eventDays && eventDays.length > 0) {
      generateMealTimesGrid();
    }
  });
});

// Load and process the CSV file
function loadFile(event) {
  let file;

  if (event.target && event.target.files) {
    file = event.target.files[0];
  } else if (event.length) {
    file = event[0];
  }

  if (!file) return;

  document.getElementById('mealTimesConfig').style.display = 'none';
  document.getElementById('reportsContainer').style.display = 'none';
  clearError();

  if (!validateCSVFile(file)) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {
    const csvData = reader.result;
    processCSVData(csvData);
  };

  reader.readAsText(file);
}

// Find column index with case-insensitive and partial matching
function findColumnIndex(headers, possibleNames) {
  if (!Array.isArray(possibleNames)) {
    possibleNames = [possibleNames];
  }

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim().toLowerCase();

    for (const name of possibleNames) {
      if (header === name.toLowerCase() || header.includes(name.toLowerCase())) {
        return i;
      }
    }
  }

  return -1;
}

// Process the CSV data
function processCSVData(csvData) {
  try {
    // Preprocess CSV data to handle quotation marks and commas
    const preprocessedData = preprocessCSV(csvData);

    // Process the rows
    const rows = preprocessedData.trim().split('\n');

    // Find the header row
    let headerRowIndex = -1;
    let headerRow = [];
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const potentialHeader = rows[i].split(',').map(h => h.trim());
      if (
        potentialHeader.some(h => /day/i.test(h)) &&
        potentialHeader.some(h => /start.*time/i.test(h)) &&
        potentialHeader.some(h => /end.*time/i.test(h))
      ) {
        headerRowIndex = i;
        headerRow = potentialHeader;
        break;
      }
    }
    if (headerRowIndex === -1) {
      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const potentialHeader = rows[i].split(',').map(h => h.trim());
                if (
          potentialHeader.some(h => /email/i.test(h)) &&
          potentialHeader.some(h => /name/i.test(h))
        ) {
          headerRowIndex = i;
          headerRow = potentialHeader;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Could not find header row in CSV file');
    }

    // Find required columns with flexible matching
    const dayIndex = findColumnIndex(headerRow, ['Day', 'Days']);
    const startTimeIndex = findColumnIndex(headerRow, ['Start Time', 'Start', 'Start_Time']);
    const endTimeIndex = findColumnIndex(headerRow, ['End Time', 'End', 'End_Time']);
    const rolesIndex = findColumnIndex(headerRow, ['Roles', 'Role', 'Position']);
    const emailIndex = findColumnIndex(headerRow, ['Email']);
    const dietaryIndex = findColumnIndex(headerRow, ['Dietary', 'Dietary Restrictions', 'Allergies', 'Dietary Restrictions/Allergies']);
    const yearsOfServiceIndex = findColumnIndex(headerRow, ['Years of Service', 'Years', 'Service Years']);
    const shirtSizeIndex = findColumnIndex(headerRow, ['Shirt Size', 'Shirt']);
    const consentIndex = findColumnIndex(headerRow, ['Consent', 'Consent & Release', 'Release']);

    // Check if essential columns exist, with more specific error messages
    const missingColumns = [];
    if (dayIndex === -1) missingColumns.push('Day');
    if (startTimeIndex === -1) missingColumns.push('Start Time');
    if (endTimeIndex === -1) missingColumns.push('End Time');
    if (rolesIndex === -1) missingColumns.push('Roles');
    if (emailIndex === -1) missingColumns.push('Email');

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns in CSV file: ${missingColumns.join(', ')}`);
    }

    // Extract unique days from the data
    const uniqueDays = new Set();

    // Process data rows
    parsedData = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      if (!rows[i].trim() || rows[i].includes('Start Time,End Time')) continue;

      const row = replaceCommasInQuotes(rows[i], '|').split(',');

      if (row.length <= 1) continue; // Skip truly empty rows

      // Extract data from columns
      const day = row[dayIndex]?.trim();
      if (day && day !== '') uniqueDays.add(day);

      const startTime = row[startTimeIndex]?.trim();
      const endTime = row[endTimeIndex]?.trim();
      const roles = row[rolesIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '';
      const email = row[emailIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '';

      const dietary = dietaryIndex !== -1 && row[dietaryIndex] ?
        row[dietaryIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '' : '';

      const yearsOfService = yearsOfServiceIndex !== -1 && row[yearsOfServiceIndex] ?
        row[yearsOfServiceIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '' : '';

      const shirtSize = shirtSizeIndex !== -1 && row[shirtSizeIndex] ?
        row[shirtSizeIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '' : '';

      const consentStatus = consentIndex !== -1 && row[consentIndex] ?
        row[consentIndex]?.replace(/\|/g, ',').replace(/^"(.*)"$/, '$1').trim() || '' : '';

      // Skip rows without essential data
      if (!day || !startTime || !endTime || !email) continue;

      parsedData.push({
        day,
        startTime: normalizeTime(startTime),
        endTime: normalizeTime(endTime),
        roles,
        email,
        dietary,
        yearsOfService,
        shirtSize,
        consentStatus,
        isJudge: roles.toLowerCase().includes('judge')
      });
    }

    // Check for valid data rows
    if (parsedData.length === 0) {
      throw new Error('No valid data rows found in the CSV file');
    }

    console.log(`Found ${parsedData.length} valid data rows`);
    console.log(`Found ${uniqueDays.size} unique days:`, Array.from(uniqueDays));

    // Sort days
    eventDays = Array.from(uniqueDays).sort((a, b) => {
      const dayOrder = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
      return (dayOrder[a] || 99) - (dayOrder[b] || 99);
    });

    initializeMealTimes();
    document.getElementById('mealTimesConfig').style.display = 'block';
    generateMealTimesGrid();
    generateReports();
    document.getElementById('reportsContainer').style.display = 'block';

  } catch (error) {
    showError('Error processing CSV: ' + error.message);
    console.error('Error processing CSV:', error);
  }
}

// Preprocess CSV data
function preprocessCSV(csvData) {
  return csvData.replace(/(".*?")/g, (match) => {
    // If the quoted string contains a comma, keep the quotes, otherwise remove them
    return match.includes(',') ? match : match.replace(/"/g, '');
  });
}

// Replace commas in quoted strings
function replaceCommasInQuotes(str, replacement) {
  const regex = /"((?:[^"\\]|\\.)*)"/g;
  return str.replace(regex, match => match.replace(/,/g, replacement));
}

// Normalize time format to 24-hour format
function normalizeTime(timeStr) {
  if (!timeStr) return '';

  // Check if already in 24-hour format
  if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
    return timeStr.padStart(5, '0'); // Ensure 2 digits for hour
  }

  // Handle AM/PM format
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);

    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return timeStr;
}

// Initialize meal times with display options
function initializeMealTimes() {
  mealTimes = {};
  disabledMeals = {};
  mealDisplayOptions = {}; // Initialize the display options

  eventDays.forEach(day => {
    mealTimes[day] = {
      breakfast: DEFAULT_MEAL_TIMES.breakfast,
      lunch: DEFAULT_MEAL_TIMES.lunch,
      dinner: DEFAULT_MEAL_TIMES.dinner
    };

    disabledMeals[day] = {
      breakfast: false,
      lunch: false,
      dinner: false
    };

    mealDisplayOptions[day] = {
      breakfast: 'separate', // Default: separate judges & general volunteers
      lunch: 'separate',
      dinner: 'separate'
    };
  });
}

// Generate meal times configuration grid
function generateMealTimesGrid() {
  const container = document.getElementById('mealTimesGrid');
  container.innerHTML = '';

  // Check if the display is mobile (less than 768px)
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Mobile layout - vertical stacking
    generateMobileLayout(container);
  } else {
    // Desktop layout - standard table
    generateDesktopLayout(container);
  }
}

// Generate desktop layout for meal configuration
function generateDesktopLayout(container) {
  const table = document.createElement('table');
  table.className = 'table table-bordered';

  // Create header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const cornerCell = document.createElement('th');
  cornerCell.textContent = 'Meal / Day';
  headerRow.appendChild(cornerCell);

  eventDays.forEach(day => {
    const dayHeader = document.createElement('th');
    dayHeader.textContent = day;
    headerRow.appendChild(dayHeader);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body rows for each meal
  const tbody = document.createElement('tbody');

  ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    const row = document.createElement('tr');

    const mealCell = document.createElement('td');
    mealCell.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
    row.appendChild(mealCell);

    eventDays.forEach(day => {
      const timeCell = document.createElement('td');

      // Create a container for time input, checkbox, and display option
      const container = document.createElement('div');
      container.className = 'meal-config-container';

      // Time input container
      const timeInputContainer = document.createElement('div');
      timeInputContainer.className = 'time-input-container';

      const timeInput = document.createElement('input');
      timeInput.type = 'time';
      timeInput.value = mealTimes[day][meal];
      timeInput.id = `${day}-${meal}-time`;
      timeInput.className = 'form-control';
      timeInput.disabled = disabledMeals[day][meal];

      timeInputContainer.appendChild(timeInput);
      container.appendChild(timeInputContainer);

      // Display options dropdown container
      const displayOptionContainer = document.createElement('div');
      displayOptionContainer.className = 'display-option-container';
      
      const displaySelect = document.createElement('select');
      displaySelect.id = `${day}-${meal}-display`;
      displaySelect.className = 'form-control form-select form-select-sm display-select';
      displaySelect.disabled = disabledMeals[day][meal];
      
      // Add options
      const options = [
        { value: 'separate', text: 'Separate judges & general' },
        { value: 'combine', text: 'Combine all volunteers' },
        { value: 'omit-judges', text: 'Omit judges' }
      ];
      
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (mealDisplayOptions[day][meal] === opt.value) {
          option.selected = true;
        }
        displaySelect.appendChild(option);
      });
      
      displayOptionContainer.appendChild(displaySelect);
      container.appendChild(displayOptionContainer);

      // No meal checkbox container
      const noMealContainer = document.createElement('div');
      noMealContainer.className = 'nomeal-container';

      const noMealCheckbox = document.createElement('input');
      noMealCheckbox.type = 'checkbox';
      noMealCheckbox.id = `${day}-${meal}-disabled`;
      noMealCheckbox.checked = disabledMeals[day][meal];
      noMealCheckbox.addEventListener('change', function() {
        timeInput.disabled = this.checked;
        displaySelect.disabled = this.checked;
      });

      const noMealLabel = document.createElement('label');
      noMealLabel.setAttribute('for', `${day}-${meal}-disabled`);
      noMealLabel.className = 'nomeal-label';
      noMealLabel.textContent = 'No meal';

      noMealContainer.appendChild(noMealCheckbox);
      noMealContainer.appendChild(noMealLabel);
      container.appendChild(noMealContainer);

      timeCell.appendChild(container);
      row.appendChild(timeCell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Export a specific report to Excel
function exportReportToExcel(reportType) {
  const workbook = XLSX.utils.book_new();

  if (reportType === 'yearsOfService') {
    const data = [
      ['Years of Service', 'Number of Volunteers'],
      ...reportData.yearsOfService.years.map(year => [year, reportData.yearsOfService.counts[year]])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Years of Service');
    XLSX.writeFile(workbook, 'Years_of_Service_Report.xlsx');
  }
  else if (reportType === 'shirtSize') {
    const data = [
      ['Shirt Size', 'Number of Volunteers'],
      ...reportData.shirtSizes.sizes.map(size => [size, reportData.shirtSizes.counts[size]])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shirt Sizes');
    XLSX.writeFile(workbook, 'Shirt_Sizes_Report.xlsx');
  }
  else if (reportType === 'consent') {
    const data = [
      ['Consent & Release Status', 'Number of Volunteers'],
      ...reportData.consentStatus.statuses.map(status => [status, reportData.consentStatus.counts[status]])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consent Status');
    XLSX.writeFile(workbook, 'Consent_Status_Report.xlsx');
  }
  else if (reportType === 'meal-all') {
    const allMeals = reportData.mealReports.allMeals;

    if (!allMeals || !allMeals.meals || allMeals.meals.length === 0) {
      alert('No meal data available to export.');
      return;
    }

    const data = [];

    // Header rows
    const headerRow1 = ['Dietary Restriction'];
    const headerRow2 = [];

    allMeals.meals.forEach((meal, index) => {
      const mealInfo = allEnabledMeals[index];
      const displayOption = allMeals.data[meal].displayOption;
      
      if (displayOption === 'separate') {
        headerRow1.push(meal, ''); // Add empty cell for colspan
        headerRow2.push('General', 'Judge');
      } else if (displayOption === 'combine') {
        headerRow1.push(meal);
        headerRow2.push('All');
      } else if (displayOption === 'omit-judges') {
        headerRow1.push(meal);
        headerRow2.push('General');
      }
    });

    data.push(headerRow1, headerRow2);

    // Data rows
    allMeals.restrictions.forEach(restriction => {
      const row = [restriction];

      allMeals.meals.forEach(meal => {
        // Check if data exists for this meal
        if (!allMeals.data[meal]) {
          row.push(0); // Add zero if no data
          if (allMeals.data[meal]?.displayOption === 'separate') {
            row.push(0); // Add second zero for Judge column
          }
          return;
        }

        const displayOption = allMeals.data[meal].displayOption;
        
        if (displayOption === 'separate') {
          row.push(
            allMeals.data[meal].general[restriction] || 0,
            allMeals.data[meal].judge[restriction] || 0
          );
        } else if (displayOption === 'combine') {
          row.push(allMeals.data[meal].combined[restriction] || 0);
        } else if (displayOption === 'omit-judges') {
          row.push(allMeals.data[meal].general[restriction] || 0);
        }
      });

      data.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Apply formatting
    // Merge cells for meal headers
    if (!worksheet['!merges']) worksheet['!merges'] = [];

    let colIndex = 1; // Start after the "Dietary Restriction" column
    allMeals.meals.forEach(meal => {
      const displayOption = allMeals.data[meal].displayOption;
      
      if (displayOption === 'separate') {
        // Merge cells for the meal header (spans 2 columns)
        worksheet['!merges'].push({
          s: {r: 0, c: colIndex},
          e: {r: 0, c: colIndex + 1}
        });
        colIndex += 2; // Move past the two columns (General and Judge)
      } else {
        // For 'combine' and 'omit-judges', no merging needed
        colIndex += 1;
      }
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, `All Meals`);
    XLSX.writeFile(workbook, `Meal_Attendance_Report.xlsx`);
  }
}

// Export all reports to a single Excel file
function exportAllToExcel() {
  const workbook = XLSX.utils.book_new();

  // Add Years of Service sheet
  const yosData = [
    ['Years of Service', 'Number of Volunteers'],
    ...reportData.yearsOfService.years.map(year => [year, reportData.yearsOfService.counts[year]])
  ];
  const yosWorksheet = XLSX.utils.aoa_to_sheet(yosData);
  XLSX.utils.book_append_sheet(workbook, yosWorksheet, 'Years of Service');

  // Add Shirt Sizes sheet
  const shirtData = [
    ['Shirt Size', 'Number of Volunteers'],
    ...reportData.shirtSizes.sizes.map(size => [size, reportData.shirtSizes.counts[size]])
  ];
  const shirtWorksheet = XLSX.utils.aoa_to_sheet(shirtData);
  XLSX.utils.book_append_sheet(workbook, shirtWorksheet, 'Shirt Sizes');

  // Add Consent Status sheet
  const consentData = [
    ['Consent & Release Status', 'Number of Volunteers'],
    ...reportData.consentStatus.statuses.map(status => [status, reportData.consentStatus.counts[status]])
  ];
  const consentWorksheet = XLSX.utils.aoa_to_sheet(consentData);
  XLSX.utils.book_append_sheet(workbook, consentWorksheet, 'Consent Status');

  // Add Meals sheet
  const allMeals = reportData.mealReports.allMeals;
  if (allMeals && allMeals.meals && allMeals.meals.length > 0) {
    const data = [];

    // Header rows
    const headerRow1 = ['Dietary Restriction'];
    const headerRow2 = [];
    
    allMeals.meals.forEach((meal, index) => {
      const displayOption = allMeals.data[meal].displayOption;
      
      if (displayOption === 'separate') {
        headerRow1.push(meal, ''); // Add empty cell for colspan
        headerRow2.push('General', 'Judge');
      } else if (displayOption === 'combine') {
        headerRow1.push(meal);
        headerRow2.push('All');
      } else if (displayOption === 'omit-judges') {
        headerRow1.push(meal);
        headerRow2.push('General');
      }
    });

    data.push(headerRow1, headerRow2);

    // Data rows
    allMeals.restrictions.forEach(restriction => {
      const row = [restriction];

      allMeals.meals.forEach(meal => {
        // Check if data exists for this meal
        if (!allMeals.data[meal]) {
          row.push(0);
          if (allMeals.data[meal]?.displayOption === 'separate') {
            row.push(0); // Add a second zero for Judge column
          }
          return;
        }

        const displayOption = allMeals.data[meal].displayOption;
        
        if (displayOption === 'separate') {
          row.push(
            allMeals.data[meal].general[restriction] || 0,
            allMeals.data[meal].judge[restriction] || 0
          );
        } else if (displayOption === 'combine') {
          row.push(allMeals.data[meal].combined[restriction] || 0);
        } else if (displayOption === 'omit-judges') {
          row.push(allMeals.data[meal].general[restriction] || 0);
        }
      });

      data.push(row);
    });

    const mealsWorksheet = XLSX.utils.aoa_to_sheet(data);

    // Apply formatting - merge cells for meal headers with separate columns
    if (!mealsWorksheet['!merges']) mealsWorksheet['!merges'] = [];

    let colIndex = 1; // Reset column index
    allMeals.meals.forEach(meal => {
      const displayOption = allMeals.data[meal].displayOption;
      
      if (displayOption === 'separate') {
        // Merge cells for the meal header (spans 2 columns)
        mealsWorksheet['!merges'].push({
          s: {r: 0, c: colIndex},
          e: {r: 0, c: colIndex + 1}
        });
        colIndex += 2; // Move past the two columns
      } else {
        colIndex += 1; // Just move to the next column
      }
    });

    XLSX.utils.book_append_sheet(workbook, mealsWorksheet, 'Meal Attendance');
  }

  XLSX.writeFile(workbook, 'Volunteer_Metrics_Report.xlsx');
}

// Function to create a mailto link for incomplete volunteers
function emailIncompleteVolunteers() {
  // Find volunteers with "Incomplete" consent status
  const incompleteEmails = [];

  // Create a map of email to consent status to deduplicate volunteers
  const emailConsent = new Map();

  parsedData.forEach(volunteer => {
    if (volunteer.email) {
      emailConsent.set(volunteer.email, volunteer.consentStatus);
    }
  });

  // Find all unique emails with incomplete status
  emailConsent.forEach((status, email) => {
    if (status && status.toLowerCase().includes('incomplete')) {
      incompleteEmails.push(email);
    }
  });

  if (incompleteEmails.length === 0) {
    alert('No volunteers with incomplete consent status found.');
    return;
  }

  // Create the mailto link with BCC only
  const mailtoLink = `mailto:?bcc=${incompleteEmails.join(',')}`;

  window.open(mailtoLink);
}

// Generate vertical layout for mobile
function generateMobileLayout(container) {
  const mealList = document.createElement('div');
  mealList.className = 'mobile-meal-grid';

  eventDays.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const mealItem = document.createElement('div');
      mealItem.className = 'mobile-meal-item';

      // Label for the meal
      const mealLabel = document.createElement('div');
      mealLabel.className = 'mobile-meal-label';
      mealLabel.textContent = `${day} ${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
      mealItem.appendChild(mealLabel);

      // Container for controls
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'mobile-meal-controls';

      // Time input
      const timeInputContainer = document.createElement('div');
      timeInputContainer.className = 'mobile-time-input';

      const timeInput = document.createElement('input');
      timeInput.type = 'time';
      timeInput.value = mealTimes[day][meal];
      timeInput.id = `${day}-${meal}-time`;
      timeInput.className = 'form-control';
      timeInput.disabled = disabledMeals[day][meal];

      timeInputContainer.appendChild(timeInput);
      controlsContainer.appendChild(timeInputContainer);

      // Display options dropdown
      const displayOptionContainer = document.createElement('div');
      displayOptionContainer.className = 'mobile-display-option';
      
      const displaySelect = document.createElement('select');
      displaySelect.id = `${day}-${meal}-display`;
      displaySelect.className = 'form-control form-select form-select-sm display-select';
      displaySelect.disabled = disabledMeals[day][meal];
      
      // Add options
      const options = [
        { value: 'separate', text: 'Separate judges & general' },
        { value: 'combine', text: 'Combine all volunteers' },
        { value: 'omit-judges', text: 'Omit judges' }
      ];
      
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        if (mealDisplayOptions[day][meal] === opt.value) {
          option.selected = true;
        }
        displaySelect.appendChild(option);
      });
      
      displayOptionContainer.appendChild(displaySelect);
      controlsContainer.appendChild(displayOptionContainer);

      // No meal checkbox
      const noMealContainer = document.createElement('div');
      noMealContainer.className = 'mobile-nomeal-container';

      const noMealCheckbox = document.createElement('input');
      noMealCheckbox.type = 'checkbox';
      noMealCheckbox.id = `${day}-${meal}-disabled`;
      noMealCheckbox.checked = disabledMeals[day][meal];
      noMealCheckbox.addEventListener('change', function() {
        timeInput.disabled = this.checked;
        displaySelect.disabled = this.checked;
      });

      const noMealLabel = document.createElement('label');
      noMealLabel.setAttribute('for', `${day}-${meal}-disabled`);
      noMealLabel.className = 'nomeal-label';
      noMealLabel.textContent = 'No meal';

      noMealContainer.appendChild(noMealCheckbox);
      noMealContainer.appendChild(noMealLabel);
      controlsContainer.appendChild(noMealContainer);

      mealItem.appendChild(controlsContainer);
      mealList.appendChild(mealItem);
    });
  });

  container.appendChild(mealList);
}

// Add a window resize listener to redraw the grid when resizing
window.addEventListener('resize', function() {
  // Add debounce to prevent excessive redraws
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(function() {
    generateMealTimesGrid();
  }, 250);
});

// Update meal times from the grid inputs
function updateMealTimes() {
  eventDays.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const input = document.getElementById(`${day}-${meal}-time`);
      const disabledCheckbox = document.getElementById(`${day}-${meal}-disabled`);
      const displaySelect = document.getElementById(`${day}-${meal}-display`);

      if (input) {
        mealTimes[day][meal] = input.value;
      }

      if (disabledCheckbox) {
        disabledMeals[day][meal] = disabledCheckbox.checked;
      }

      if (displaySelect) {
        mealDisplayOptions[day][meal] = displaySelect.value;
      }
    });
  });
}

// Convert time string to minutes for easier comparison
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if a volunteer is present during a meal
function isVolunteerPresentDuringMeal(volunteer, day, mealTime) {
  // Check if the meal is disabled
  if (disabledMeals[day] && disabledMeals[day][getMealFromTime(day, mealTime)]) {
    return false;
  }

  if (volunteer.day !== day) return false;

  const startMinutes = timeToMinutes(volunteer.startTime);
  const endMinutes = timeToMinutes(volunteer.endTime);
  const mealMinutes = timeToMinutes(mealTime);

  return startMinutes <= mealMinutes && endMinutes >= mealMinutes;
}

// Determine which meal a time corresponds to
function getMealFromTime(day, time) {
  const meals = ['breakfast', 'lunch', 'dinner'];
  for (const meal of meals) {
    if (mealTimes[day][meal] === time) {
      return meal;
    }
  }
  return null;
}

// Standardize dietary restriction string
function standardizeDietaryRestriction(restriction) {
  if (!restriction) return '';
  let standardized = restriction.toLowerCase();
  standardized = standardized.replace(/:/g, '').trim();
  standardized = standardized.replace(/^other\s+/i, '');

  return standardized;
}

// Generate all reports
function generateReports() {
  generateMealReportsByDay();
  generateYearsOfServiceReport();
  generateShirtSizeReport();
  generateConsentReport();
}

// Generate meal reports
function generateMealReportsByDay() {
  const container = document.getElementById('mealReportsContainer');
  container.innerHTML = '';

  // Store report data for Excel export
  reportData.mealReports = {
    allMeals: {
      meals: [],
      restrictions: [],
      data: {}
    }
  };

  // First, collect all unique dietary restrictions without splitting them
  const dietaryRestrictions = new Map();

  parsedData.forEach(volunteer => {
    if (volunteer.dietary && volunteer.dietary.trim()) {
      // Standardize the entire dietary restriction string
      const standardized = standardizeDietaryRestriction(volunteer.dietary);
      if (standardized) {
        dietaryRestrictions.set(standardized, (dietaryRestrictions.get(standardized) || 0) + 1);
      }
    }
  });

  // Convert to array and sort by frequency
  const restrictions = Array.from(dietaryRestrictions.keys());

  // Create a single table for all meals in chronological order
  const reportSection = document.createElement('div');
  reportSection.className = 'report-section meal-report';

  const headerContainer = document.createElement('div');
  headerContainer.className = 'd-flex justify-content-between align-items-center mb-2';

  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = 'Meal Attendance by Dietary Restriction';
  headerContainer.appendChild(sectionTitle);

  const exportButton = document.createElement('button');
  exportButton.className = 'btn btn-sm btn-primary export-btn';
  exportButton.setAttribute('data-report', 'meal-all');
  exportButton.textContent = 'Export';
  headerContainer.appendChild(exportButton);

  reportSection.appendChild(headerContainer);

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-responsive';

  const table = document.createElement('table');
  table.className = 'table table-bordered meal-report';

  // Create header rows
  const thead = document.createElement('thead');
  const headerRow1 = document.createElement('tr');

  const restrictionHeader = document.createElement('th');
  restrictionHeader.textContent = 'Dietary Restriction';
  restrictionHeader.rowSpan = 2;
  headerRow1.appendChild(restrictionHeader);

  // Get all enabled meals in chronological order
  allEnabledMeals = []; // Reset the global variable
  const mealLabels = [];

  eventDays.forEach(day => {
    const dayOrder = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    const sortedMeals = ['breakfast', 'lunch', 'dinner'].filter(meal => !disabledMeals[day][meal]);

    sortedMeals.forEach(meal => {
      const mealLabel = `${day} ${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
      mealLabels.push(mealLabel);
      allEnabledMeals.push({
        day,
        meal,
        mealTime: mealTimes[day][meal],
        displayOption: mealDisplayOptions[day][meal],
        sortOrder: (dayOrder[day] || 99) * 10 + (['breakfast', 'lunch', 'dinner'].indexOf(meal) + 1)
      });
    });
  });

  // Sort meals by day and then by meal time
  allEnabledMeals.sort((a, b) => a.sortOrder - b.sortOrder);

  // Store for Excel export
  reportData.mealReports.allMeals.meals = mealLabels;
  reportData.mealReports.allMeals.restrictions = ['Total', 'None'].concat(restrictions);

  // Initialize data structure for Excel export
  mealLabels.forEach((label, index) => {
    const mealInfo = allEnabledMeals[index];
    reportData.mealReports.allMeals.data[label] = {
      general: {},
      judge: {},
      combined: {},
      displayOption: mealInfo.displayOption
    };
  });

  // If no enabled meals, show message
  if (allEnabledMeals.length === 0) {
    const noMealsMsg = document.createElement('p');
    noMealsMsg.textContent = 'No meals are enabled. Please enable at least one meal to see this report.';
    noMealsMsg.className = 'text-center mt-3';
    reportSection.appendChild(noMealsMsg);
    container.appendChild(reportSection);
    return;
  }

  // Add column headers for each meal based on display option
  allEnabledMeals.forEach((mealInfo, index) => {
    const mealHeader = document.createElement('th');
    mealHeader.className = 'meal-header';
    mealHeader.textContent = `${mealInfo.day} ${mealInfo.meal.charAt(0).toUpperCase() + mealInfo.meal.slice(1)}`;
    
    // Set colspan based on display option
    if (mealInfo.displayOption === 'separate') {
      mealHeader.colSpan = 2; // General and Judge
    } else {
      mealHeader.colSpan = 1; // Combined or General only
    }
    
    headerRow1.appendChild(mealHeader);
  });

  const headerRow2 = document.createElement('tr');
  
  allEnabledMeals.forEach((mealInfo) => {
    if (mealInfo.displayOption === 'separate') {
      // Add both General and Judge headers
      const generalHeader = document.createElement('th');
      generalHeader.className = 'rotated-header';
      const generalDiv = document.createElement('div');
      generalDiv.textContent = 'General';
      generalHeader.appendChild(generalDiv);
      headerRow2.appendChild(generalHeader);

      const judgeHeader = document.createElement('th');
      judgeHeader.className = 'rotated-header';
      const judgeDiv = document.createElement('div');
      judgeDiv.textContent = 'Judge';
      judgeHeader.appendChild(judgeDiv);
      headerRow2.appendChild(judgeHeader);
    } else if (mealInfo.displayOption === 'combine') {
      // Add a single "All" header
      const allHeader = document.createElement('th');
      allHeader.className = 'rotated-header';
      const allDiv = document.createElement('div');
      allDiv.textContent = 'All';
      allHeader.appendChild(allDiv);
      headerRow2.appendChild(allHeader);
    } else if (mealInfo.displayOption === 'omit-judges') {
      // Add only General header
      const generalHeader = document.createElement('th');
      generalHeader.className = 'rotated-header';
      const generalDiv = document.createElement('div');
      generalDiv.textContent = 'General';
      generalHeader.appendChild(generalDiv);
      headerRow2.appendChild(generalHeader);
    }
  });

  thead.appendChild(headerRow1);
  thead.appendChild(headerRow2);
  table.appendChild(thead);

  // Create body rows
  const tbody = document.createElement('tbody');
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';

  const totalCell = document.createElement('td');
  totalCell.textContent = 'Total';
  totalRow.appendChild(totalCell);

  allEnabledMeals.forEach((mealInfo, index) => {
    // Track unique emails to avoid counting duplicates
    const generalEmails = new Set();
    const judgeEmails = new Set();

    parsedData.forEach(v => {
      if (isVolunteerPresentDuringMeal(v, mealInfo.day, mealInfo.mealTime)) {
        if (v.isJudge) {
          judgeEmails.add(v.email);
        } else {
          generalEmails.add(v.email);
        }
      }
    });

    const generalCount = generalEmails.size;
    const judgeCount = judgeEmails.size;
    const combinedCount = generalCount + judgeCount;

    // Store for Excel export
    const mealKey = mealLabels[index];
    reportData.mealReports.allMeals.data[mealKey].general['Total'] = generalCount;
    reportData.mealReports.allMeals.data[mealKey].judge['Total'] = judgeCount;
    reportData.mealReports.allMeals.data[mealKey].combined['Total'] = combinedCount;

    if (mealInfo.displayOption === 'separate') {
      // Add separate cells for General and Judge
      const generalCell = document.createElement('td');
      generalCell.textContent = generalCount;
      totalRow.appendChild(generalCell);

      const judgeCell = document.createElement('td');
      judgeCell.textContent = judgeCount;
      totalRow.appendChild(judgeCell);
    } else if (mealInfo.displayOption === 'combine') {
      // Add single cell with combined count
      const combinedCell = document.createElement('td');
      combinedCell.textContent = combinedCount;
      totalRow.appendChild(combinedCell);
    } else if (mealInfo.displayOption === 'omit-judges') {
      // Add only General count
      const generalCell = document.createElement('td');
      generalCell.textContent = generalCount;
      totalRow.appendChild(generalCell);
    }
  });

  tbody.appendChild(totalRow);

  // Second row is for "None" dietary restriction
  const noneRow = document.createElement('tr');

  const noneCell = document.createElement('td');
  noneCell.textContent = 'None';
  noneRow.appendChild(noneCell);

  allEnabledMeals.forEach((mealInfo, index) => {
    // Track unique emails to avoid counting duplicates
    const generalEmails = new Set();
    const judgeEmails = new Set();

    parsedData.forEach(v => {
      if (!isVolunteerPresentDuringMeal(v, mealInfo.day, mealInfo.mealTime)) return;

      // Count volunteers with no dietary restrictions
      if (!v.dietary || v.dietary.trim() === '') {
        if (v.isJudge) {
          judgeEmails.add(v.email);
        } else {
          generalEmails.add(v.email);
        }
      }
    });

    const generalCount = generalEmails.size;
    const judgeCount = judgeEmails.size;
    const combinedCount = generalCount + judgeCount;

    // Store for Excel export
    const mealKey = mealLabels[index];
    reportData.mealReports.allMeals.data[mealKey].general['None'] = generalCount;
    reportData.mealReports.allMeals.data[mealKey].judge['None'] = judgeCount;
    reportData.mealReports.allMeals.data[mealKey].combined['None'] = combinedCount;

    if (mealInfo.displayOption === 'separate') {
      // Add separate cells for General and Judge
      const generalCell = document.createElement('td');
      generalCell.textContent = generalCount;
      noneRow.appendChild(generalCell);

      const judgeCell = document.createElement('td');
      judgeCell.textContent = judgeCount;
      noneRow.appendChild(judgeCell);
    } else if (mealInfo.displayOption === 'combine') {
      // Add single cell with combined count
      const combinedCell = document.createElement('td');
      combinedCell.textContent = combinedCount;
      noneRow.appendChild(combinedCell);
    } else if (mealInfo.displayOption === 'omit-judges') {
      // Add only General count
      const generalCell = document.createElement('td');
      generalCell.textContent = generalCount;
      noneRow.appendChild(generalCell);
    }
  });

  tbody.appendChild(noneRow);

  // Rows for each dietary restriction
  restrictions.forEach(restriction => {
    const row = document.createElement('tr');

    const restrictionCell = document.createElement('td');
    // Display original case for better readability
    const displayRestriction = parsedData.find(v => v.dietary && standardizeDietaryRestriction(v.dietary) === restriction)?.dietary || restriction;
    restrictionCell.textContent = displayRestriction;
    row.appendChild(restrictionCell);

    let anyNonZeroCount = false; // Flag to check if this row has any non-zero counts

    allEnabledMeals.forEach((mealInfo, index) => {
      // Track unique emails to avoid counting duplicates
      const generalEmails = new Set();
      const judgeEmails = new Set();

      parsedData.forEach(v => {
        if (!isVolunteerPresentDuringMeal(v, mealInfo.day, mealInfo.mealTime)) return;

        // Check if volunteer has this restriction
        if (v.dietary && standardizeDietaryRestriction(v.dietary) === restriction) {
          if (v.isJudge) {
            judgeEmails.add(v.email);
          } else {
            generalEmails.add(v.email);
          }
        }
      });

      const generalCount = generalEmails.size;
      const judgeCount = judgeEmails.size;
      const combinedCount = generalCount + judgeCount;

      if (generalCount > 0 || judgeCount > 0) {
        anyNonZeroCount = true;
      }

      // Store for Excel export
      const mealKey = mealLabels[index];
      reportData.mealReports.allMeals.data[mealKey].general[restriction] = generalCount;
      reportData.mealReports.allMeals.data[mealKey].judge[restriction] = judgeCount;
      reportData.mealReports.allMeals.data[mealKey].combined[restriction] = combinedCount;

      if (mealInfo.displayOption === 'separate') {
        // Add separate cells for General and Judge
        const generalCell = document.createElement('td');
        generalCell.textContent = generalCount;
        row.appendChild(generalCell);

        const judgeCell = document.createElement('td');
        judgeCell.textContent = judgeCount;
        row.appendChild(judgeCell);
      } else if (mealInfo.displayOption === 'combine') {
        // Add single cell with combined count
        const combinedCell = document.createElement('td');
        combinedCell.textContent = combinedCount;
        row.appendChild(combinedCell);
      } else if (mealInfo.displayOption === 'omit-judges') {
        // Add only General count
        const generalCell = document.createElement('td');
        generalCell.textContent = generalCount;
        row.appendChild(generalCell);
      }
    });

    // Only add this row if there's at least one non-zero count
    if (anyNonZeroCount) {
      tbody.appendChild(row);
    } else {
      // Remove from Excel if null
      reportData.mealReports.allMeals.restrictions = reportData.mealReports.allMeals.restrictions.filter(r => r !== restriction);
    }
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  reportSection.appendChild(tableWrapper);
  container.appendChild(reportSection);

  setTimeout(() => {
    const allRotatedHeaders = document.querySelectorAll('.rotated-header div');
    allRotatedHeaders.forEach(header => {
      header.style.position = 'absolute';
      header.style.top = '30px';
    });
  }, 0);
}

// Years of service report
function generateYearsOfServiceReport() {
  const container = document.getElementById('yearsOfServiceReport');
  container.innerHTML = '';
    const volunteerYears = new Map();

  parsedData.forEach(volunteer => {
    if (volunteer.email && volunteer.yearsOfService && !isNaN(parseInt(volunteer.yearsOfService))) {
      // Only update if we don't have this email yet or if the value is the same
      if (!volunteerYears.has(volunteer.email) ||
          volunteerYears.get(volunteer.email) === volunteer.yearsOfService) {
        volunteerYears.set(volunteer.email, volunteer.yearsOfService);
      }
    }
  });

  const yearCounts = {};

  volunteerYears.forEach((years) => {
    const year = parseInt(years);
    if (!isNaN(year)) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });

  // Create table
  const table = document.createElement('table');
  table.className = 'table table-bordered';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const yearHeader = document.createElement('th');
  yearHeader.textContent = 'Years of Service';
  headerRow.appendChild(yearHeader);

  const countHeader = document.createElement('th');
  countHeader.textContent = 'Number of Volunteers';
  headerRow.appendChild(countHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const sortedYears = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);

  // Store for Excel export
  reportData.yearsOfService = {
    years: sortedYears,
    counts: {}
  };

  sortedYears.forEach(year => {
    const row = document.createElement('tr');

    const yearCell = document.createElement('td');
    yearCell.textContent = year;
    row.appendChild(yearCell);

    const countCell = document.createElement('td');
    countCell.textContent = yearCounts[year];
    row.appendChild(countCell);

    tbody.appendChild(row);

    // Store for Excel export
    reportData.yearsOfService.counts[year] = yearCounts[year];
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Generate shirt size report
function generateShirtSizeReport() {
  const container = document.getElementById('shirtSizeReport');
  container.innerHTML = '';

  const volunteerShirts = new Map();

  parsedData.forEach(volunteer => {
    if (volunteer.email && volunteer.shirtSize) {
      volunteerShirts.set(volunteer.email, volunteer.shirtSize);
    }
  });

  const shirtCounts = {};

  volunteerShirts.forEach((size) => {
    shirtCounts[size] = (shirtCounts[size] || 0) + 1;
  });

  // Create table
  const table = document.createElement('table');
  table.className = 'table table-bordered';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const sizeHeader = document.createElement('th');
  sizeHeader.textContent = 'Shirt Size';
  headerRow.appendChild(sizeHeader);

  const countHeader = document.createElement('th');
  countHeader.textContent = 'Number of Volunteers';
  headerRow.appendChild(countHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const sizeOrder = {
    'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, '2XL': 6, 'XXXL': 7, '3XL': 8
  };

  const sortedSizes = Object.keys(shirtCounts).sort((a, b) => {
    // Extract the size part for comparison
    const sizeA = a.toUpperCase().replace(/WOMEN'S |MEN'S |UNISEX /, '');
    const sizeB = b.toUpperCase().replace(/WOMEN'S |MEN'S |UNISEX /, '');

    // Check if we have a defined order for these sizes
    if (sizeOrder[sizeA] !== undefined && sizeOrder[sizeB] !== undefined) {
      return sizeOrder[sizeA] - sizeOrder[sizeB];
    }

    // Fall back to alphabetical sorting
    return sizeA.localeCompare(sizeB);
  });

  // Store for Excel export
  reportData.shirtSizes = {
    sizes: sortedSizes,
    counts: {}
  };

  sortedSizes.forEach(size => {
    const row = document.createElement('tr');

    const sizeCell = document.createElement('td');
    sizeCell.textContent = size;
    row.appendChild(sizeCell);

    const countCell = document.createElement('td');
    countCell.textContent = shirtCounts[size];
    row.appendChild(countCell);

    tbody.appendChild(row);

    // Store for Excel export
    reportData.shirtSizes.counts[size] = shirtCounts[size];
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Generate consent report
function generateConsentReport() {
  const container = document.getElementById('consentReport');
  container.innerHTML = '';

  // Use a map to track unique emails and their consent status
  const volunteerConsent = new Map();

  parsedData.forEach(volunteer => {
    if (volunteer.email && volunteer.consentStatus) {
      volunteerConsent.set(volunteer.email, volunteer.consentStatus);
    }
  });

  // Count consent statuses
  const consentCounts = {};

  volunteerConsent.forEach((status) => {
    consentCounts[status] = (consentCounts[status] || 0) + 1;
  });

  // Create table
  const table = document.createElement('table');
  table.className = 'table table-bordered';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const statusHeader = document.createElement('th');
  statusHeader.textContent = 'Consent & Release Status';
  headerRow.appendChild(statusHeader);

  const countHeader = document.createElement('th');
  countHeader.textContent = 'Number of Volunteers';
  headerRow.appendChild(countHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');

  // Sort alphabetically
  const sortedStatuses = Object.keys(consentCounts).sort();

  // Store for Excel export
  reportData.consentStatus = {
    statuses: sortedStatuses,
    counts: {}
  };

  sortedStatuses.forEach(status => {
    const row = document.createElement('tr');

    const statusCell = document.createElement('td');
    statusCell.textContent = status;
    row.appendChild(statusCell);

    const countCell = document.createElement('td');
    countCell.textContent = consentCounts[status];
    row.appendChild(countCell);

    tbody.appendChild(row);

    // Store for Excel export
    reportData.consentStatus.counts[status] = consentCounts[status];
  });

  table.appendChild(tbody);
  container.appendChild(table);
}