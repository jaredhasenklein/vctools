const columns = [
  'Minor', 'Legal First Name', 'Preferred First Name', 'Last Name', 'Personal Pronouns', 'Email', 'Phone', 'Languages Spoken', 'FIRST Youth Protection Policy', 'Certified', 'Shirt Size', 'Self-Reported Accommodations', 'Team Affiliation', 'Employer', 'Alumni', 'Emergency Contact', 'Emergency Contact Phone Number', 'Affiliations', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

function loadFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function() {
    const csvData = reader.result;
    const preprocessedData = preprocessCSV(csvData);
    const reformattedData = reformatCSV(preprocessedData);
    displayData(reformattedData);

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download CSV';
    downloadButton.onclick = () => downloadCSV(columns, reformattedData);
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.appendChild(downloadButton);
  };

  reader.readAsText(file);
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

  const headerRow = document.createElement('tr');
  visibleColumns.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  reformattedData.forEach(row => {
    const tr = document.createElement('tr');
    visibleColumns.forEach(header => {
      const td = document.createElement('td');
      const value = Array.isArray(row[header]) ? row[header].join(', ') : row[header];
      td.textContent = value || '';
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
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
    link.setAttribute('download', 'Assigned Volunteers Reformatted.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(URL.createObjectURL(blob));
  }
}
