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

  // Helper functions
  function formatNameWithInitial(firstName, lastName) {
    const firstNameStr = (firstName || '').trim();
    const lastNameStr = (lastName || '').trim();
    const lastInitial = lastNameStr ? lastNameStr[0] + '.' : '';
    return `${firstNameStr}${lastInitial ? ' ' + lastInitial : ''}`;
  }

  function formatRole(role) {
    if (!role) return '';

    // Convert to uppercase and split by commas
    const roles = role.toLowerCase().split(',').map(r => r.trim());

    // If there's only one role and it's "field assembly", keep it
    if (roles.length === 1 && roles[0] === 'field assembly') {
      return role.toUpperCase();
    }

    // Filter out "field assembly" and join with " / "
    const filteredRoles = roles.filter(r => r !== 'field assembly');
    return filteredRoles.map(r => r.toUpperCase()).join(' / ');
  }

  function applyFirstItalics(text, doc, x, y, alignment) {
    if (!text) return;

    // Split text where "FIRST" appears
    const parts = text.split(/(FIRST)/g);
    let currentX = x;
    const originalFont = doc.getFont();
    const originalFontSize = doc.getFontSize();

    // Calculate total width for alignment
    let totalWidth = 0;
    parts.forEach(part => {
      totalWidth += doc.getTextWidth(part);
    });

    // Adjust starting position based on alignment
    if (alignment === 'center') {
      currentX = x - (totalWidth / 2);
    } else if (alignment === 'right') {
      currentX = x - totalWidth;
    }

    // Draw each part
    parts.forEach(part => {
      if (part === 'FIRST') {
        doc.setFont(undefined, 'italic');
        doc.text(part, currentX, y);
        currentX += doc.getTextWidth(part);
        doc.setFont(undefined, originalFont.style); // Reset font style after FIRST
      } else if (part) {
        doc.setFont(undefined, 'normal'); // Ensure non-FIRST parts are normal
        doc.text(part, currentX, y);
        currentX += doc.getTextWidth(part);
      }
    });

    // Reset font to original state
    doc.setFont(undefined, originalFont.style);
  }

  function calculateMaxFontSize(texts, doc, maxWidth, defaultSize, isBold = false) {
    if (!texts || texts.length === 0) return defaultSize;

    let fontSize = defaultSize;
    doc.setFont(undefined, isBold ? 'bold' : 'normal');

    texts.forEach(text => {
      if (!text) return;

      doc.setFontSize(fontSize);
      while (doc.getTextWidth(text) > maxWidth && fontSize > 10) {
        fontSize -= 0.5;
        doc.setFontSize(fontSize);
      }
    });

    return fontSize;
}

  // Define label styles
  const labelStyles = {
    'styleA': {
      name: 'Style A - Full Name',
      render: (labels, doc, x, y, width, height, config) => {
        const margin = 0.1;
        const availableWidth = width - (2 * margin);

        // Calculate max font size for roles
        const allRoles = labels.map(label => formatRole(label.roles));
        const roleFontSize = calculateMaxFontSize(allRoles, doc, availableWidth, 12);

        // Get current label to render (first in array)
        const label = labels[0];

        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.topText, doc, x + width / 2, y + 0.15, 'center');

        // First name
        doc.setFontSize(18);
        doc.text((label.firstname || '').toUpperCase(), x + width / 2, y + 0.48, { align: 'center' });

        // Last name
        doc.setFontSize(12);
        doc.text((label.lastname || '').toUpperCase(), x + width / 2, y + 0.83, { align: 'center' });

        // Role
        const role = formatRole(label.roles);
        doc.setFillColor(0, 0, 0);
        doc.rect(x, y + 1.05, width, 0.2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(roleFontSize);
        applyFirstItalics(role, doc, x + width / 2, y + 1.2, 'center');
        doc.setTextColor(0, 0, 0);

        // Bottom text
        doc.setFontSize(12);
        applyFirstItalics(config.bottomLeftText, doc, x + 0.1, y + height - 0.38, 'left');
        applyFirstItalics(config.bottomRightText, doc, x + width - 0.1, y + height - 0.38, 'right');
      }
    },
    'styleB': {
      name: 'Style B - First Name with Initial',
      render: (labels, doc, x, y, width, height, config) => {
        const margin = 0.1;
        const availableWidth = width - (2 * margin);
        const topMargin = 0.15;
        const bottomMargin = 0.15;
        const availableHeight = height - topMargin - bottomMargin;

        // Calculate max font sizes across all labels
        const allNames = labels.map(label =>
          formatNameWithInitial(
            (label.firstname || '').toUpperCase(),
            (label.lastname || '').toUpperCase()
          )
        );
        const allRoles = labels.map(label => formatRole(label.roles));

        const nameFontSize = calculateMaxFontSize(allNames, doc, availableWidth, 36, true);
        const roleFontSize = calculateMaxFontSize(allRoles, doc, availableWidth, 24);

        // Get current label (first in array)
        const label = labels[0];

        // Name
        const displayName = formatNameWithInitial(
          (label.firstname || '').toUpperCase(),
          (label.lastname || '').toUpperCase()
        );

        // Calculate heights
        const nameHeight = nameFontSize / 72;
        const roleHeight = roleFontSize / 72;

        // Calculate vertical positions
        const contentHeight = nameHeight + roleHeight + 0.2;
        const startContentY = y + topMargin + (availableHeight - contentHeight) / 2;

        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.topText, doc, x + width / 2, y + topMargin, 'center');

        // Render name
        doc.setFontSize(nameFontSize);
        doc.setFont(undefined, 'bold');
        doc.text(displayName, x + width / 2, startContentY + nameHeight, { align: 'center' });

        // Render role
        const role = formatRole(label.roles);
        doc.setFontSize(roleFontSize);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(role, doc, x + width / 2, startContentY + nameHeight + 0.2 + roleHeight, 'center');

        // Bottom text
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.bottomLeftText, doc, x + 0.1, y + height - 0.15, 'left');
        applyFirstItalics(config.bottomRightText, doc, x + width - 0.1, y + height - 0.15, 'right');
      }
    }
  };

  // Event listeners to show/hide custom text inputs
  ['Left', 'Right'].forEach(side => {
    const select = document.getElementById(`bottom${side}Type`);
    const input = document.getElementById(`bottom${side}Text`);

    if (select && input) {
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
      'Preferred First Name': 'firstname',
      'Last Name': 'lastname',
      'Personal Pronouns': 'personalpronouns',
      'Roles Assigned': 'roles',
      'Languages Spoken': 'languagesspoken'
    };

    let headers = [];
    const headerRow = rows[11].split(',').map(header => header.trim().replace(/^"(.*)"$/, '$1'));
    headers = headerRow.filter(header => header !== '');

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

      let currentX = typeConfig.startX;
      let currentY = typeConfig.startY;
      let labelCount = 0;

      for (const currentLabel of labels) {
        if (labelCount > 0 && labelCount % typeConfig.labelsPerPage === 0) {
          doc.addPage();
          currentX = typeConfig.startX;
          currentY = typeConfig.startY;
        }

        styleConfig.render(
          [currentLabel, ...labels], // Current label first, but include all labels for font calculations
          doc,
          currentX,
          currentY,
          typeConfig.labelWidth,
          typeConfig.labelHeight,
          {
            topText,
            bottomLeftText: getBottomText(bottomLeftType, bottomLeftCustom, currentLabel),
            bottomRightText: getBottomText(bottomRightType, bottomRightCustom, currentLabel)
          }
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
