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
    const headerMap = {
      'Minor': 'minor',
      'First Name': 'firstname',
      'Last Name': 'lastname',
      'Personal Pronouns': 'personalpronouns',
      'Roles': 'roles',
      'Languages Spoken': 'languagesspoken'
    };

    let headers = [];

    // Get the header row (row 12)
    const headerRow = rows[11].split(',').map(header => header.trim().replace(/^"(.*)"$/, '$1'));
    headers = headerRow.filter(header => header !== '');

    // Parse the data rows after the header row
    for (let i = 12; i < rows.length; i++) {
      const row = rows[i].split(',');
      const label = {};

      for (let j = 0; j < headers.length; j++) {
        const headerKey = Object.keys(headerMap).find(key => key.toLowerCase() === headers[j].toLowerCase())
          ? headerMap[Object.keys(headerMap).find(key => key.toLowerCase() === headers[j].toLowerCase())]
          : headers[j].toLowerCase().replace(/\s+/g, '');

        const columnIndex = headers.findIndex(header => header.toLowerCase() === headers[j].toLowerCase());
        const cellValue = row[columnIndex] ? row[columnIndex].trim().replace(/^"?(.*?)"?$/, '$1') : '';
        label[headerKey] = cellValue;
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

      const rolesElement = document.createElement('div');
      rolesElement.classList.add('roles');
      rolesElement.style.backgroundColor = 'black';
      rolesElement.style.color = 'white';
      rolesElement.style.padding = '5px';
      rolesElement.textContent = label.roles || '';
      labelElement.appendChild(rolesElement);

      const bottomRowElement = document.createElement('div');
      bottomRowElement.classList.add('bottomRow');
      bottomRowElement.style.display = 'flex';
      bottomRowElement.style.justifyContent = 'space-between';

      const bottomLeftTextElement = document.createElement('div');
      bottomLeftTextElement.classList.add('bottomLeftText');
      bottomLeftTextElement.textContent = bottomLeftText;
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
    let doc;

    if (labelTemplate === 'avery5163') {
      doc = new jsPDF('p', 'in', [8.5, 11]);
    } else if (labelTemplate === 'dymo2x4') {
      doc = new jsPDF('l', 'in', [4, 2]);
    }

    for (const label of labels) {
      if (labelTemplate === 'avery5163') {
        const labelWidth = 4;
        const labelHeight = 2;
        const startX = 0.16;
        const startY = 0.5;
        const columnGap = 0.19;
        const rowGap = 0.0;
        const labelsPerRow = 2;
        const labelsPerPage = 10;

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

          fitText(topText, currentX + labelWidth / 2, currentY + 0.15, labelWidth - 0.4, 12, 'center');
          fitText((label.firstname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 0.48, labelWidth - 0.4, 18, 'center');
          fitText((label.lastname || '').toUpperCase(), currentX + labelWidth / 2, currentY + 0.83, labelWidth - 0.4, 12, 'center');
          doc.setFillColor(0, 0, 0);
          doc.rect(currentX, currentY + 1.05, labelWidth, 0.2, 'F');
          doc.setTextColor(255, 255, 255);
          fitText((label.roles || '').toUpperCase(), currentX + labelWidth / 2, currentY + 1.2, labelWidth - 0.4, 10, 'center');
          doc.setTextColor(0, 0, 0);
          fitText(bottomLeftText, currentX + 0.1, currentY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'left');
          fitText(bottomRightText, currentX + labelWidth - 0.1, currentY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'right');

          labelCount++;
          currentX += labelWidth + columnGap;

          if (labelCount % labelsPerRow === 0) {
            currentX = startX;
            currentY += labelHeight + rowGap;
          }
        }
      } else if (labelTemplate === 'dymo2x4') {
        const labelWidth = 4;
        const labelHeight = 2;
        const startX = 0.00;
        const startY = 0.05;

        function fitText(text, x, y, maxWidth, fontSize, alignment) {
          doc.setFontSize(fontSize);
          while (doc.getTextWidth(text) > maxWidth && fontSize > 6) {
            fontSize -= 0.5;
            doc.setFontSize(fontSize);
          }
          doc.text(text, x, y, { align: alignment });
        }

        fitText(topText, startX + labelWidth / 2, startY + 0.23, labelWidth - 0.1, 12, 'center');
        fitText((label.firstname || '').toUpperCase(), startX + labelWidth / 2, startY + 0.63, labelWidth - 0.1, 18, 'center');
        fitText((label.lastname || '').toUpperCase(), startX + labelWidth / 2, startY + 1.03, labelWidth - 0.1, 12, 'center');
        doc.setFillColor(0, 0, 0);
        doc.rect(startX, startY + 1.2, labelWidth, 0.2, 'F');
        doc.setTextColor(255, 255, 255);
        fitText((label.roles || '').toUpperCase(), startX + labelWidth / 2, startY + 1.35, labelWidth - 0.1, 10, 'center');
        doc.setTextColor(0, 0, 0);
        fitText(bottomLeftText, startX + 0.1, startY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'left');
        fitText(bottomRightText, startX + labelWidth - 0.1, startY + labelHeight - 0.38, labelWidth / 2 - 0.2, 10, 'right');
        doc.addPage();
      }
    }

    doc.save('labels.pdf');
  }
});
