document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('nameTagForm');
  const labelContainer = document.getElementById('labelContainer');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const csvFile = document.getElementById('csvFile').files[0];
      const labelTemplate = document.getElementById('labelTemplate').value;
      const topText = document.getElementById('topText').value;
      const bottomLeftText = document.getElementById('bottomLeftText').value;
      const bottomRightText = document.getElementById('bottomRightText').value;

      if (csvFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const csvData = reader.result;
          const labels = parseCSV(csvData);
          generateLabels(labels, labelTemplate, topText, bottomLeftText, bottomRightText);
          createPDF(labels, topText, bottomLeftText, bottomRightText, labelTemplate);
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

  function generateLabels(labels, labelTemplate, topText, bottomLeftText, bottomRightText) {
  labelContainer.innerHTML = '';

  for (const label of labels) {
    const labelElement = document.createElement('div');
    labelElement.classList.add('label');

    const topTextElement = document.createElement('div');
    topTextElement.classList.add('topText');
    topTextElement.textContent = topText;
    labelElement.appendChild(topTextElement);

    const firstNameElement = document.createElement('div');
    firstNameElement.classList.add('firstName');
    firstNameElement.textContent = label.firstname || '';
    labelElement.appendChild(firstNameElement);

    const lastNameElement = document.createElement('div');
    lastNameElement.classList.add('lastName');
    lastNameElement.textContent = label.lastname || '';
    labelElement.appendChild(lastNameElement);

    const roleElement = document.createElement('div');
    roleElement.classList.add('role');
    roleElement.textContent = label.role || '';
    labelElement.appendChild(roleElement);

    const bottomRowElement = document.createElement('div');
    bottomRowElement.classList.add('bottomRow');
    bottomRowElement.style.display = 'flex';
    bottomRowElement.style.justifyContent = 'space-between';

    const bottomLeftTextElement = document.createElement('div');
    bottomLeftTextElement.classList.add('bottomLeftText');
   bottomRowElement.appendChild(bottomLeftTextElement);

    const bottomRightTextElement = document.createElement('div');
    bottomRightTextElement.classList.add('bottomRightText');
    bottomRightTextElement.textContent = bottomRightText;
    bottomRowElement.appendChild(bottomRightTextElement);

    labelElement.appendChild(bottomRowElement);
    labelContainer.appendChild(labelElement);
  }
}

function createPDF(labels, topText, bottomLeftText, bottomRightText, labelTemplate) {
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

    // First name (0.7" height)
    fitText((label.firstname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 0.48, labelWidth - 0.4, 18, 'center');

    // Last name (0.35" height)
    fitText((label.lastname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 1.08, labelWidth - 0.4, 12, 'center');

    // Role (0.35" height)
    fitText((label.role || '').toUpperCase(), currentX + labelWidth / 2, currentY + 1.43, labelWidth - 0.4, 12, 'center');

    // Bottom left text
    fitText(bottomLeftText, currentX + 0.1, currentY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'left');

    // Bottom right text (custom text from the form)
    fitText(bottomRightText, currentX + labelWidth - 0.1, currentY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'right');

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
