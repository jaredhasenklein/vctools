document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('nameTagForm');
  const labelContainer = document.getElementById('labelContainer');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  // Storage for role abbreviations and parsed labels
  let roleAbbreviations = {};
  let parsedLabels = [];

  // Set up drag and drop functionality
  if (dropzone && fileInput) {
    setupDragAndDrop(dropzone, fileInput, handleFiles);
  } else {
    console.error('Required elements not found: dropzone or fileInput');
  }

  // Get UI elements
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
      columnGap: 0,
      rowGap: 0,
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

  // Apply abbreviations to roles
  function applyRoleAbbreviation(role) {
    if (!role || Object.keys(roleAbbreviations).length === 0) return role;

    // Check if the exact role has an abbreviation
    if (roleAbbreviations[role] && roleAbbreviations[role].trim() !== '') {
      return roleAbbreviations[role];
    }

    return role;
  }

  function applyFirstItalics(text, doc, x, y, alignment) {
    // Ensure text is not null, undefined, or empty
    if (!text || text.trim() === '') return;

    // Check if coordinates are valid numbers
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.error('Invalid coordinates:', x, y);
      return;
    }

    // Split text where "FIRST" appears
    const parts = text.split(/(FIRST)/g);
    let currentX = x;
    const originalFont = doc.getFont();
    const originalFontSize = doc.getFontSize();

    // Calculate total width for alignment
    let totalWidth = 0;
    parts.forEach(part => {
      if (part) {
        totalWidth += doc.getTextWidth(part);
      }
    });

    // Adjust starting position based on alignment
    if (alignment === 'center') {
      currentX = x - (totalWidth / 2);
    } else if (alignment === 'right') {
      currentX = x - totalWidth;
    }

    // Draw each part
    parts.forEach(part => {
      if (!part) return;

      if (part === 'FIRST') {
        doc.setFont(undefined, 'italic');
        doc.text(part, currentX, y);
        currentX += doc.getTextWidth(part);
        doc.setFont(undefined, originalFont.style);
      } else {
        doc.setFont(undefined, 'normal');
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
    // Style A - Full Name
    'styleA': {
      name: 'Style A - Full Name',
      render: (labels, doc, x, y, width, height, config) => {
        const margin = 0.1;
        const availableWidth = width - (2 * margin);

        // Get current label to render (first in array)
        const label = labels[0];

        // Apply role abbreviation if available
        const role = formatRole(label.roles);
        const abbreviatedRole = applyRoleAbbreviation(role);

        // Calculate max font sizes for all elements across all labels
        const allFirstNames = labels.map(label => (label.firstname || '').toUpperCase());
        const allLastNames = labels.map(label => (label.lastname || '').toUpperCase());
        const allRoles = labels.map(label => {
          const role = formatRole(label.roles);
          return applyRoleAbbreviation(role);
        });

        // Calculate font sizes with maximum limits
        const firstNameFontSize = Math.min(calculateMaxFontSize(allFirstNames, doc, availableWidth * 0.9, 36, true), 30);
        const lastNameFontSize = Math.min(calculateMaxFontSize(allLastNames, doc, availableWidth * 0.9, 24), 20);
        const roleFontSize = Math.min(calculateMaxFontSize(allRoles, doc, availableWidth * 0.9, 18), 16);

        // Determine sections for layout
        const totalHeight = height;
        const topSection = totalHeight * 0.4;     // Top 40% for name
        const middleSection = totalHeight * 0.15; // 15% for last name
        const bottomSection = totalHeight * 0.15; // 15% for roles section
        const bottomTextSection = totalHeight * 0.2; // 20% for bottom text
        const padding = totalHeight * 0.05;      // 5% padding between sections

        // Calculate spacing for consistent layout
        const topAreaHeight = topSection + middleSection;
        const equalSpacing = topAreaHeight / 4; // Divide by 4 to get 2 spaces + 2 text areas

        // Position elements
        const topTextY = y + padding + equalSpacing * 0.5;
        const firstNameY = y + padding + equalSpacing * 2;
        const lastNameY = y + padding + equalSpacing * 3.5;
        const roleY = y + padding + topSection + middleSection + padding * 1.5;
        const bottomY = y + height - (padding * 1.8);

        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.topText, doc, x + width / 2, topTextY, 'center');

        // First name
        doc.setFontSize(firstNameFontSize);
        doc.setFont(undefined, 'bold');
        doc.text((label.firstname || '').toUpperCase(), x + width / 2, firstNameY, { align: 'center' });

        // Last name
        doc.setFontSize(lastNameFontSize);
        doc.setFont(undefined, 'normal');
        doc.text((label.lastname || '').toUpperCase(), x + width / 2, lastNameY, { align: 'center' });

        // Role bar
        doc.setFillColor(0, 0, 0);
        doc.rect(x, roleY, width, bottomSection, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(roleFontSize);
        doc.setFont(undefined, 'normal');

        // Calculate exact center for role text
        const roleCenterY = roleY + (bottomSection / 2);
        const fontOffset = roleFontSize / 72 * 0.35; // Convert font size to inches and adjust
        const roleTextY = roleCenterY + fontOffset;

        applyFirstItalics(abbreviatedRole, doc, x + width / 2, roleTextY, 'center');
        doc.setTextColor(0, 0, 0);

        // Bottom text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.bottomLeftText, doc, x + 0.1, bottomY, 'left');
        applyFirstItalics(config.bottomRightText, doc, x + width - 0.1, bottomY, 'right');
      }
    },

    // Style B - First Name with Initial
    'styleB': {
      name: 'Style B - First Name with Initial',
      render: (labels, doc, x, y, width, height, config) => {
        const margin = 0.1;
        const availableWidth = width - (2 * margin);

        // Get current label (first in array)
        const label = labels[0];

        // Apply role abbreviation if available
        const role = formatRole(label.roles);
        const abbreviatedRole = applyRoleAbbreviation(role);

        // Calculate max font sizes across all labels
        const allNames = labels.map(label =>
          formatNameWithInitial(
            (label.firstname || '').toUpperCase(),
            (label.lastname || '').toUpperCase()
          )
        );
        const allRoles = labels.map(label => {
          const role = formatRole(label.roles);
          return applyRoleAbbreviation(role);
        });

        const nameFontSize = calculateMaxFontSize(allNames, doc, availableWidth, 36, true);
        const roleFontSize = calculateMaxFontSize(allRoles, doc, availableWidth, 24);

        // Name
        const displayName = formatNameWithInitial(
          (label.firstname || '').toUpperCase(),
          (label.lastname || '').toUpperCase()
        );

        // Calculate heights
        const nameHeight = nameFontSize / 72;
        const roleHeight = roleFontSize / 72;

        // Use proportional spacing
        const topPadding = height * 0.1;    // 10% padding at top
        const bottomPadding = height * 0.1; // 10% padding at bottom
        const contentHeight = height - topPadding - bottomPadding;
        const nameSectionHeight = contentHeight * 0.55; // 55% for name
        const roleSectionHeight = contentHeight * 0.35; // 35% for role
        const spacing = contentHeight * 0.1;           // 10% spacing between

        // Top text
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.topText, doc, x + width / 2, y + topPadding * 0.5, 'center');

        // Render name
        doc.setFontSize(nameFontSize);
        doc.setFont(undefined, 'bold');
        doc.text(displayName, x + width / 2, y + topPadding + nameSectionHeight * 0.7, { align: 'center' });

        // Render role
        doc.setFontSize(roleFontSize);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(abbreviatedRole, doc, x + width / 2,
                         y + topPadding + nameSectionHeight + spacing + roleSectionHeight * 0.5,
                         'center');

        // Bottom text
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        applyFirstItalics(config.bottomLeftText, doc, x + 0.1, y + height - bottomPadding * 0.5, 'left');
        applyFirstItalics(config.bottomRightText, doc, x + width - 0.1, y + height - bottomPadding * 0.5, 'right');
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
  if (labelTypeSelect && labelStyleSelect) {
    labelTypeSelect.innerHTML = Object.entries(labelTypes)
      .map(([value, type]) => `<option value="${value}">${type.name}</option>`)
      .join('');

    labelStyleSelect.innerHTML = Object.entries(labelStyles)
      .map(([value, style]) => `<option value="${value}">${style.name}</option>`)
      .join('');
  }

  // Initially hide the generate button
  const generateButton = document.querySelector('#nameTagForm button[type="submit"]');
  if (generateButton) {
    generateButton.style.display = 'none';
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const csvFile = document.getElementById('fileInput').files[0];
      const labelType = document.getElementById('labelType').value;
      const labelStyle = document.getElementById('labelStyle').value;
      const topText = document.getElementById('topText').value;
      const bottomLeftType = document.getElementById('bottomLeftType').value;
      const bottomLeftCustom = document.getElementById('bottomLeftText').value;
      const bottomRightType = document.getElementById('bottomRightType').value;
      const bottomRightCustom = document.getElementById('bottomRightText').value;

      if (csvFile) {
        // Store the existing abbreviation table content before showing loading
        let abbreviationContainer = null;
        if (labelContainer) {
          abbreviationContainer = labelContainer.querySelector('.role-abbreviation-container');
          if (abbreviationContainer) {
            // Clone the abbreviation container to preserve it
            abbreviationContainer = abbreviationContainer.cloneNode(true);
          }
        }

        // Show loading indicator
        if (labelContainer) {
          labelContainer.innerHTML = '<div class="loading">Processing file, please wait...</div>';

          // Re-add the abbreviation container if it existed
          if (abbreviationContainer) {
            labelContainer.appendChild(abbreviationContainer);
          }
        }

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

          // Update success message but preserve abbreviation table
          if (labelContainer) {
            // Remove loading message
            const loadingMessage = labelContainer.querySelector('.loading');
            if (loadingMessage) {
              loadingMessage.remove();
            }

            // Add success message at the beginning of the container
            const successMessage = document.createElement('div');
            successMessage.className = 'success';
            successMessage.textContent = 'PDF generated successfully!';

            // Insert at the beginning
            labelContainer.insertBefore(successMessage, labelContainer.firstChild);
          }
        };
        reader.readAsText(csvFile);
      } else {
        showError('Please select a CSV file.');
      }
    });
  }

  // Handle uploaded files
  function handleFiles(files) {
    const generateButton = document.querySelector('#nameTagForm button[type="submit"]');

    if (files.target) {
      files = files.target.files;
    }

    if (files.length === 0) return;

    const file = files[0];

    if (!validateCSVFile(file)) {
      if (labelContainer) {
        labelContainer.innerHTML = '';
      }
      // Hide the generate button if file validation fails
      if (generateButton) {
        generateButton.style.display = 'none';
      }
      return;
    }

    // Update the file input
    fileInput.files = files instanceof FileList ? files : new DataTransfer().files;
    clearError();

    // Process the file to get roles and display the abbreviation interface
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result;
      parsedLabels = parseCSV(csvData);

      // Clear any existing abbreviations
      roleAbbreviations = {};

      // Show file uploaded message
      if (dropzone) {
        dropzone.innerHTML = `<div class="file-success">✓ File "${file.name}" uploaded successfully</div>`;
      }

      // Display the role abbreviation interface
      displayRoleAbbreviationInterface(parsedLabels);

      // Show the generate button
      if (generateButton) {
        generateButton.style.display = 'block';
      }
    };
    reader.readAsText(file);
  }

  // Create and display the role abbreviation interface
  function displayRoleAbbreviationInterface(labels) {
    if (!labelContainer) return;

    // Extract unique roles
    const uniqueRoles = new Set();
    labels.forEach(label => {
      const formattedRole = formatRole(label.roles);
      if (formattedRole) uniqueRoles.add(formattedRole);
    });

    // Convert to array for sorting
    let rolesArray = Array.from(uniqueRoles);

    // Create and append the interface
    const interfaceHTML = `
      <div class="role-abbreviation-container">
        <h3>Role Abbreviations</h3>
        <p>Long role names may appear in a small font on badges. Use this table to create abbreviations for roles.</p>

        <div class="abbreviation-controls">
          <button id="insertCommonAbbreviations" class="btn btn-secondary">Insert Common Abbreviations</button>
          <div class="sort-control">
            <label for="roleSortOrder">Sort by: </label>
            <select id="roleSortOrder" class="form-select">
              <option value="length">Length (longest first)</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table role-abbreviation-table">
            <thead>
              <tr>
                <th>Original Role</th>
                <th>Length</th>
                <th>Abbreviation</th>
              </tr>
            </thead>
            <tbody id="roleAbbreviationTableBody">
              <!-- Roles will be inserted here -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Append the interface after showing success message
    labelContainer.innerHTML = `
      ${interfaceHTML}
    `;

    // Sort and populate the table
    updateRoleAbbreviationTable(rolesArray, 'length');

    // Add event listeners
    document.getElementById('insertCommonAbbreviations').addEventListener('click', applyCommonAbbreviations);
    document.getElementById('roleSortOrder').addEventListener('change', function() {
      updateRoleAbbreviationTable(rolesArray, this.value);
    });
  }

  // Update the role abbreviation table with sorted roles
  function updateRoleAbbreviationTable(roles, sortOrder) {
    const tableBody = document.getElementById('roleAbbreviationTableBody');
    if (!tableBody) return;

    // Sort the roles based on selected order
    let sortedRoles;

    if (sortOrder === 'length') {
      // Sort by length (longest first)
      sortedRoles = [...roles].sort((a, b) => b.length - a.length);
    } else {
      // Sort alphabetically
      sortedRoles = [...roles].sort();
    }

    // Clear the table
    tableBody.innerHTML = '';

    // Add rows for each role
    sortedRoles.forEach((role, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${role}</td>
        <td>${role.length}</td>
        <td>
          <input type="text" class="form-control role-abbreviation-input"
                 data-original-role="${role}"
                 value="${roleAbbreviations[role] || ''}"
                 placeholder="Enter abbreviation">
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to the abbreviation inputs
    document.querySelectorAll('.role-abbreviation-input').forEach(input => {
      input.addEventListener('input', function() {
        const originalRole = this.getAttribute('data-original-role');
        roleAbbreviations[originalRole] = this.value.toUpperCase();
      });
    });
  }

  // Apply common abbreviations
  function applyCommonAbbreviations() {
    const replacements = {
      'MANAGER': 'MGR.',
      'ADVISOR': 'ADVSR.',
      'ATTENDANT': '', // Remove entirely
      'SUPERVISOR': 'SUP.',
      'ASSISTANT': 'ASST.',
      ' - DEAN\'S LIST AWARD': '', // Remove entirely
      ' - FIRST IMPACT AWARD': '' // Remove entirely
    };

    // Get all inputs
    const inputs = document.querySelectorAll('.role-abbreviation-input');

    inputs.forEach(input => {
      const originalRole = input.getAttribute('data-original-role');
      let abbreviated = originalRole;

      // Apply the replacements
      Object.entries(replacements).forEach(([word, replacement]) => {
        // Use case-insensitive regex to find the word
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        abbreviated = abbreviated.replace(regex, replacement);
      });

      // Only update if there was a change
      if (abbreviated !== originalRole) {
        input.value = abbreviated;
        roleAbbreviations[originalRole] = abbreviated;
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

    // Calculate how many complete rows we'll have
    const totalRows = Math.ceil(labels.length / typeConfig.labelsPerRow);
    let pageCount = 0;
    let labelIndex = 0;

    // Process each label
    while (labelIndex < labels.length) {
      // Start a new page if needed
      if (labelIndex > 0 && labelIndex % typeConfig.labelsPerPage === 0) {
        doc.addPage();
        pageCount++;
      }

      // Calculate current row and column
      const positionOnPage = labelIndex % typeConfig.labelsPerPage;
      const row = Math.floor(positionOnPage / typeConfig.labelsPerRow);
      const col = positionOnPage % typeConfig.labelsPerRow;

      // Calculate exact grid positioning based on row and column
      const currentX = typeConfig.startX + col * (typeConfig.labelWidth + typeConfig.columnGap);
      const currentY = typeConfig.startY + row * typeConfig.labelHeight;

      styleConfig.render(
        [labels[labelIndex], ...labels], // Current label first, but include all labels for font calculations
        doc,
        currentX,
        currentY,
        typeConfig.labelWidth,
        typeConfig.labelHeight,
        {
          topText,
          bottomLeftText: getBottomText(bottomLeftType, bottomLeftCustom, labels[labelIndex]),
          bottomRightText: getBottomText(bottomRightType, bottomRightCustom, labels[labelIndex])
        }
      );

      labelIndex++;
    }

    // Remove the last page if it's empty
    if (doc.getNumberOfPages() > 1 && labelIndex % typeConfig.labelsPerPage === 0) {
      doc.deletePage(doc.getNumberOfPages());
    }

    doc.save('labels.pdf');
  }
});
