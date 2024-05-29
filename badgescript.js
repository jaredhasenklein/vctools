document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('nameTagForm');
  const labelContainer = document.getElementById('labelContainer');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const csvFile = document.getElementById('csvFile').files[0];
      const labelTemplate = document.getElementById('labelTemplate').value;
      const isAlumni = document.querySelector('input[name="alumni"]:checked').value === 'yes';
      const topText = document.getElementById('topText').value;
      const bottomRightText = document.getElementById('bottomRightText').value; // Move this line inside the event handler

      if (csvFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const csvData = reader.result;
          const labels = parseCSV(csvData);
          generateLabels(labels, labelTemplate, isAlumni, topText, bottomRightText);
          createPDF(labels, topText, bottomRightText, isAlumni, labelTemplate);
        };
        reader.readAsText(csvFile);
      }
    });
  } else {
    console.error('Form element not found');
  }

  function parseCSV(csvData) {
    const labels = [];
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      const label = {};

      for (let j = 0; j < headers.length; j++) {
        label[headers[j].trim()] = row[j].trim();
      }

      labels.push(label);
    }

    return labels;
  }

  function generateLabels(labels, labelTemplate, isAlumni, topText, bottomRightText) {
    labelContainer.innerHTML = '';

    for (const label of labels) {
      const labelElement = document.createElement('div');
      labelElement.classList.add('label');

      const table = document.createElement('table');

      // Row 1: Top text
      let row = table.insertRow();
      let cell = row.insertCell();
      cell.textContent = topText;
      cell.style.height = '0.23in'; // 12pt

      // Row 2: First name
      row = table.insertRow();
      cell = row.insertCell();
      cell.textContent = label.firstname || '';
      cell.style.height = '0.7in'; // 36pt
      cell.style.fontWeight = 'bold';

      // Row 3: Last name
      row = table.insertRow();
      cell = row.insertCell();
      cell.textContent = label.lastname || '';
      cell.style.height = '0.35in'; // 18pt

      // Row 4: Role
      row = table.insertRow();
      cell = row.insertCell();
      cell.textContent = label.role || '';
      cell.style.height = '0.35in'; // 18pt
      cell.style.fontWeight = 'bold';
      cell.style.color = 'white';
      cell.style.backgroundColor = 'black';

      // Row 5: Alumni and bottom right text
      row = table.insertRow();
      cell = row.insertCell();
      if (isAlumni && label.alumni === 'Yes') {
        cell.textContent = 'FIRST Alumni';
      }
      cell.style.height = '0.23in'; // 12pt

      cell = row.insertCell();
      cell.textContent = bottomRightText;
      cell.style.height = '0.23in'; // 12pt

      labelElement.appendChild(table);
      labelContainer.appendChild(labelElement);
    }
  }



function createPDF(labels, topText, bottomRightText, isAlumni, labelTemplate) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'in', [8.5, 11]);

  const labelWidth = 4; // Width of each label (4 inches)
  const labelHeight = 2; // Height of each label (2 inches)
  const startX = 0.16; // Start position for labels (0.16 inches from left)
  const startY = 0.5; // Start position for labels (0.5 inches from top)
  const columnGap = 0.19; // Gap between columns (0.19 inches)
  const rowGap = 0.0; // Gap between rows (0 inches)
  const labelsPerRow = 2; // Number of labels per row
  const labelsPerPage = 10; // Number of labels per page (5 rows of 2 labels each)

  let currentX = startX;
  let currentY = startY;
  let labelCount = 0;

  function fitText(text, x, y, maxWidth, fontSize, alignment) {
    doc.setFontSize(fontSize);
    while (doc.getTextWidth(text) > maxWidth && fontSize > 6) {
      fontSize -= 0.5;
      doc.setFontSize(fontSize);
    }
    doc.text(text, x, y, { align: alignment });
  }

  for (const label of labels) {
    if (labelCount > 0 && labelCount % labelsPerPage === 0) {
      doc.addPage();
      currentX = startX;
      currentY = startY;
    }

    // Top text (0.23" height)
    fitText(topText, currentX + labelWidth / 2, currentY + 0.15, labelWidth - 0.4, 12, 'center');

    // First name (0.7" height), autosize
    fitText((label.firstname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 0.48, labelWidth - 0.4, 18, 'center');

    // Last name (0.35" height), autosize
    fitText((label.lastname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 1.08, labelWidth - 0.4, 12, 'center');

    // Role (0.35" height), autosize
    fitText((label.role || '').toUpperCase(), currentX + labelWidth / 2, currentY + 1.43, labelWidth - 0.4, 12, 'center');

    // Bottom row split into two sections (0.23" height each)
    const bottomRowY = currentY + labelHeight - 0.38; // Starting Y position for bottom row
    // Bottom left text ("FIRST Alumni")
    if (isAlumni && label.alumni === 'Yes') {
      fitText('FIRST Alumni', currentX + 0.1, bottomRowY, labelWidth / 2 - 0.2, 10, 'left');
    }

    // Bottom right text (custom text from the form)
    fitText(bottomRightText.toUpperCase(), currentX + labelWidth - 0.1, bottomRowY, labelWidth / 2 - 0.2, 10, 'right');

    labelCount++;
    currentX += labelWidth + columnGap;

    if (labelCount % labelsPerRow === 0) {
      currentX = startX;
      currentY += labelHeight + rowGap;
    }
  }

  const pdfData = doc.output('datauristring');
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfData;
  downloadLink.download = 'name-tags.pdf';
  downloadLink.target = '_blank';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}







  
});
