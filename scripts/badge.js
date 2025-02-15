


document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('nameTagForm');
  const labelContainer = document.getElementById('labelContainer');

  // Update the select elements
  const labelTypeSelect = document.getElementById('labelType');
  const labelStyleSelect = document.getElementById('labelStyle');

  // Define label types and their properties
  const labelTypes = {
    'avery5163': {
      name: 'Avery 5163',
      pageOrientation: 'p',
      pageWidth: 8.5,
      pageHeight: 11,
      labelWidth: 4,
      labelHeight: 2,
      startX: 0.16,
      startY: 0.5,
      columnGap: 0.19,
      rowGap: 0,
      labelsPerRow: 2,
      labelsPerPage: 10
    },
    'dymo2x4': {
      name: 'Dymo 2x4',
      pageOrientation: 'l',
      pageWidth: 4,
      pageHeight: 2,
      labelWidth: 4,
      labelHeight: 2,
      startX: 0,
      startY: 0.05,
      labelsPerRow: 1,
      labelsPerPage: 1
    }
  };

  // Define label styles
  const labelStyles = {
    'styleA': {
      name: 'Style A - Full Name',
      render: (label, doc, x, y, width, height, config) => {
        const margin = 0.1; // 0.1 inch margin on each side
        const availableWidth = width - (2 * margin);

        // Function to fit text within available width
        function fitText(text, fontSize, isBold = false) {
          doc.setFont(undefined, isBold ? 'bold' : 'normal');
          doc.setFontSize(fontSize);
          while (doc.getTextWidth(text) > availableWidth && fontSize > 10) {
            fontSize -= 0.5;
            doc.setFontSize(fontSize);
          }
          return fontSize;
        }

        function formatRole(role) {
          return (role || '').replace(/,\s*/g, '/');
        }

        function applyFirstItalics(text, doc, x, y, alignment) {
          // Split text where "FIRST" appears
          const parts = text.split(/(FIRST)/g);
          let currentX = x;

          // For center alignment, we need to calculate total width first
          if (alignment === 'center') {
            const totalWidth = doc.getTextWidth(text);
            currentX = x - (totalWidth / 2);
          } else if (alignment === 'right') {
            const totalWidth = doc.getTextWidth(text);
            currentX = x - totalWidth;
          }

          // Track position as we draw
          let xOffset = 0;

          // Draw each part, making "FIRST" italic
          parts.forEach(part => {
            if (part === 'FIRST') {
              const currentFont = doc.getFont();
              const currentFontSize = doc.getFontSize();
              doc.setFont(undefined, 'italic');
              doc.text(part, currentX + xOffset, y);
              xOffset += doc.getTextWidth(part);
              doc.setFont(undefined, currentFont.style);
            } else if (part) {
              doc.text(part, currentX + xOffset, y);
              xOffset += doc.getTextWidth(part);
            }
          });
        }


        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(config.topText, x + width / 2, y + 0.15, { align: 'center' });

        // First name
        doc.setFontSize(18);
        doc.text((label.firstname || '').toUpperCase(), x + width / 2, y + 0.48, { align: 'center' });

        // Last name
        doc.setFontSize(12);
        doc.text((label.lastname || '').toUpperCase(), x + width / 2, y + 0.83, { align: 'center' });

        // Role (with adaptive font sizing)
        const role = (label.roles || '').toUpperCase();
        doc.setFillColor(0, 0, 0);
        doc.rect(x, y + 1.05, width, 0.2, 'F');
        doc.setTextColor(255, 255, 255);

        // Find appropriate font size for role
        const roleFontSize = fitText(role, 12);
        doc.setFontSize(roleFontSize);
        doc.text(role, x + width / 2, y + 1.2, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Bottom text
        doc.setFontSize(12);
        doc.text(config.bottomLeftText, x + 0.1, y + height - 0.38, { align: 'left' });
        doc.text(config.bottomRightText, x + width - 0.1, y + height - 0.38, { align: 'right' });
      }
    },
    'styleB': {
      name: 'Style B - First Name with Initial',
      render: (label, doc, x, y, width, height, config) => {
        const margin = 0.1; // 0.1 inch margin on each side
        const availableWidth = width - (2 * margin);

        // Function to fit text within available width
        function fitText(text, fontSize, isBold = false) {
          doc.setFont(undefined, isBold ? 'bold' : 'normal');
          doc.setFontSize(fontSize);
          while (doc.getTextWidth(text) > availableWidth && fontSize > 10) {
            fontSize -= 0.5;
            doc.setFontSize(fontSize);
          }
          return fontSize;
        }

        // Calculate vertical spacing
        const topMargin = 0.15; // Space for top text
        const bottomMargin = 0.15; // Space for bottom text
        const availableHeight = height - topMargin - bottomMargin;

        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(config.topText, x + width / 2, y + topMargin, { align: 'center' });

        // Name
        const displayName = formatNameWithInitial(
          (label.firstname || '').toUpperCase(),
          (label.lastname || '').toUpperCase()
        );

        // Fit and measure name
        const nameFontSize = fitText(displayName, 36, true);
        doc.setFontSize(nameFontSize);
        const nameHeight = nameFontSize / 72; // Convert pt to inches

        // Fit and measure role
        const role = (label.roles || '').toUpperCase();
        const roleFontSize = fitText(role, 24);
        doc.setFontSize(roleFontSize);
        const roleHeight = roleFontSize / 72; // Convert pt to inches

        // Calculate vertical positions to center content
        const contentHeight = nameHeight + roleHeight + 0.2; // 0.2 is spacing between name and role
        const startContentY = y + topMargin + (availableHeight - contentHeight) / 2;

        // Render name
        doc.setFontSize(nameFontSize);
        doc.setFont(undefined, 'bold');
        doc.text(displayName, x + width / 2, startContentY + nameHeight, { align: 'center' });

        // Render role
        doc.setFontSize(roleFontSize);
        doc.setFont(undefined, 'normal');
        doc.text(role, x + width / 2, startContentY + nameHeight + 0.2 + roleHeight, { align: 'center' });

        // Bottom text
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(config.bottomLeftText, x + 0.1, y + height - 0.15, { align: 'left' });
        doc.text(config.bottomRightText, x + width - 0.1, y + height - 0.15, { align: 'right' });
      }
    }
  };

  // Event listeners to show/hide custom text inputs
  ['Left', 'Right'].forEach(side => {
      const select = document.getElementById(`bottom${side}Type`);
      const input = document.getElementById(`bottom${side}Text`);

      if (select && input) {
          // Hide input by default
          input.style.display = 'none';

          select.addEventListener('change', () => {
              input.style.display = select.value === 'custom' ? 'block' : 'none';
          });
      }
  });


  // Populate select elements
  labelTypeSelect.innerHTML = Object.entries(labelTypes)
    .map(([value, type]) => `<option value="${value}">${type.name}</option>`)
    .join('');

  labelStyleSelect.innerHTML = Object.entries(labelStyles)
    .map(([value, style]) => `<option value="${value}">${style.name}</option>`)
    .join('');

  function formatNameWithInitial(firstName, lastName) {
    const firstNameStr = (firstName || '').trim();
    const lastNameStr = (lastName || '').trim();
    const lastInitial = lastNameStr ? lastNameStr[0] + '.' : '';
    return `${firstNameStr}${lastInitial ? ' ' + lastInitial : ''}`;
  }

  if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const csvFile = document.getElementById('csvFile').files[0];
        const labelType = document.getElementById('labelType').value;
        const labelStyle = document.getElementById('labelStyle').value;
        const topText = document.getElementById('topText').value;

        const bottomLeftType = document.getElementById('bottomLeftType').value;
        const bottomLeftCustom = document.getElementById('bottomLeftText').value;
        const bottomRightType = document.getElementById('bottomRightType').value;
        const bottomRightCustom = document.getElementById('bottomRightText').value;

        if (csvFile) {
          const reader = new FileReader();
          reader.onload = () => {
            const csvData = reader.result;
            const labels = parseCSV(csvData);
            createPDF(
              labels,
              labelType,
              labelStyle,
              topText,
              bottomLeftType,
              bottomLeftCustom,
              bottomRightType,
              bottomRightCustom
            );
          };
          reader.readAsText(csvFile);
        }
      });
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
        // Use a regex to properly split CSV while respecting quotes
        const headerRow = rows[11].split(',').map(header => header.trim().replace(/^"(.*)"$/, '$1'));
        headers = headerRow.filter(header => header !== '');

        // Parse the data rows after the header row
        for (let i = 12; i < rows.length; i++) {
            const row = parseCSVRow(rows[i]);
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

    // Helper function to properly parse CSV rows with quoted fields
    function parseCSVRow(rowStr) {
        const row = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < rowStr.length; i++) {
            const char = rowStr[i];

            if (char === '"') {
                inQuotes = !inQuotes;
                continue;
            }

            if (char === ',' && !inQuotes) {
                row.push(currentValue.trim());
                currentValue = '';
                continue;
            }

            currentValue += char;
        }

        // Push the last value
        row.push(currentValue.trim());

        return row;
    }

  function createPDF(labels, labelType, labelStyle, topText, bottomLeftType, bottomLeftCustom, bottomRightType, bottomRightCustom) {
      const { jsPDF } = window.jspdf;
      const typeConfig = labelTypes[labelType];
      const styleConfig = labelStyles[labelStyle];

      const doc = new jsPDF(
        typeConfig.pageOrientation,
        'in',
        [typeConfig.pageWidth, typeConfig.pageHeight]
      );

      function getBottomText(type, customText, label) {
        if (type === 'custom') {
          return customText;
        } else if (type === 'pronouns') {
          return label.personalpronouns === 'Not Specified' ? '' : label.personalpronouns;
        } else if (type === 'languages') {
          return label.languagesspoken === 'Not Specified' ? '' : label.languagesspoken;
        }
        return '';
      }

      // Modified config object to include dynamic bottom text
      function getConfigForLabel(label) {
        return {
          topText,
          bottomLeftText: getBottomText(bottomLeftType, bottomLeftCustom, label),
          bottomRightText: getBottomText(bottomRightType, bottomRightCustom, label)
        };
      }

      let currentX = typeConfig.startX;
      let currentY = typeConfig.startY;
      let labelCount = 0;

      for (const label of labels) {
        if (labelCount > 0 && labelCount % typeConfig.labelsPerPage === 0) {
          doc.addPage();
          currentX = typeConfig.startX;
          currentY = typeConfig.startY;
        }

        styleConfig.render(
          label,
          doc,
          currentX,
          currentY,
          typeConfig.labelWidth,
          typeConfig.labelHeight,
          getConfigForLabel(label)
        );

        labelCount++;
        if (typeConfig.labelsPerRow > 1) {
          currentX += typeConfig.labelWidth + (typeConfig.columnGap || 0);
          if (labelCount % typeConfig.labelsPerRow === 0) {
            currentX = typeConfig.startX;
            currentY += typeConfig.labelHeight + (typeConfig.rowGap || 0);
          }
        }
      }

      if (doc.getNumberOfPages() > 1 && labelCount % typeConfig.labelsPerPage === 0) {
        doc.deletePage(doc.getNumberOfPages());
      }

      doc.save('labels.pdf');
    }
});
