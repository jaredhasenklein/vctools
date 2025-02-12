   // Role configurations with required roles and courses
   const ROLE_CONFIGS = {
       'Judge': {
           requiredRoles: ['Judge'],
           requiredCourses: ['2025 FRC General Judge Training']
       },
       'Judge - Dean\'s List Award': {
           requiredRoles: ['Judge - Dean\'s List Award'],
           requiredCourses: ['2025 FRC Dean\'s List Judge Training', 'FIRST Data Privacy and Protection Training 2024-2025']
       },
       'Judge - FIRST Impact Award': {
           requiredRoles: ['Judge - FIRST Impact Award'],
           requiredCourses: ['2025 FRC FIRST Impact Award Judge Training', 'FIRST Data Privacy and Protection Training 2024-2025']
       },
       'Judge Advisor': {
           requiredRoles: ['Judge Advisor'],
           requiredCourses: ['2025 FRC Judge Advisor Training', 'FIRST Data Privacy and Protection Training 2024-2025']
       },
      'Head Referee': {
           requiredRoles: ['Head Referee'],
           requiredCourses: ['2025 FRC Referee Training', '2025 FRC Head Referee Training']
       },
       'Referee': {
           requiredRoles: ['Referee'],
           requiredCourses: ['2025 FRC Referee Training']
       },
       'Lead Robot Inspector': {
           requiredRoles: ['Lead Robot Inspector'],
           requiredCourses: ['FRC Robot Inspector Test']
       },
       'Robot Inspector': {
           requiredRoles: ['Robot Inspector'],
           requiredCourses: ['2025 FRC Robot Inspector Test']
       },
       'Lead Queuer': {
           requiredRoles: ['Lead Queuer'],
           requiredCourses: ['2025 FRC Lead Queuer Training']
       },
       'Safety Manager': {
           requiredRoles: ['Safety Manager'],
           requiredCourses: ['2025 FRC Safety Manager Training']
       },
       'Pit Admin (all roles)': {
           requiredRoles: ['Pit Administrator', 'Pit Administration Supervisor'],
           requiredCourses: ['FIRST Data Privacy and Protection Training 2024-2025']
       }
   };

   const dropzone = document.getElementById('dropzone');
   const fileInput = document.getElementById('fileInput');
   const errorDiv = document.getElementById('error');
   const resultsContainer = document.getElementById('resultsContainer');
   let personData = {}; // Global variable to store person data with emails

   // Drag and drop event handlers
   ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
       dropzone.addEventListener(eventName, preventDefaults, false);
   });

   function preventDefaults(e) {
       e.preventDefault();
       e.stopPropagation();
   }

   ['dragenter', 'dragover'].forEach(eventName => {
       dropzone.addEventListener(eventName, highlight, false);
   });

   ['dragleave', 'drop'].forEach(eventName => {
       dropzone.addEventListener(eventName, unhighlight, false);
   });

   function highlight() {
       dropzone.classList.add('dragover');
   }

   function unhighlight() {
       dropzone.classList.remove('dragover');
   }

   dropzone.addEventListener('click', () => fileInput.click(), false);
   dropzone.addEventListener('drop', handleDrop, false);
   fileInput.addEventListener('change', handleFiles, false);

   function handleDrop(e) {
       const dt = e.dataTransfer;
       const files = dt.files;
       handleFiles(files);
   }

   function handleFiles(files) {
       if (files.target) {
           files = files.target.files;
       }

       if (files.length === 0) return;

       const file = files[0];

       if (!file.name.endsWith('.csv')) {
           showError('Please upload a CSV file.');
           return;
       }

       Papa.parse(file, {
           complete: function(results) {
               processCSV(results.data);
           },
           error: function(error) {
               showError('Error parsing file. Please make sure this is a Training and Certifications report from VMS. Details: ' + error);
           },
           skipEmptyLines: true,
           header: false
       });
   }

   function showError(message) {
       errorDiv.textContent = message;
       resultsContainer.innerHTML = '';
   }

   function findHeaderRow(rows) {
       const expectedHeaders = ['Minor', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Course Name', 'Enrollment Date', 'Completion Date', 'Type'];

       for (let i = 0; i < rows.length; i++) {
           const row = rows[i];
           if (row.length < expectedHeaders.length) continue;

           const headersMatch = expectedHeaders.every((header, index) =>
               row[index] && row[index].trim().toLowerCase() === header.toLowerCase()
           );

           if (headersMatch) {
               return i;
           }
       }

       return -1;
   }

   function processCSV(rows) {
       errorDiv.textContent = '';

       // Find header row
       const headerRowIndex = findHeaderRow(rows);

       if (headerRowIndex === -1) {
           showError('Invalid CSV format. Could not find matching header row.');
           return;
       }

       // Process data rows (starting from the row after headers)
       const dataRows = rows.slice(headerRowIndex + 1);
       const processedData = processData(dataRows);
       renderResults(processedData);
   }

   function processData(rows) {
       personData = {}; // Reset global person data

       // Collect person information
       rows.forEach(row => {
           // Skip rows with insufficient columns
           if (row.length < 10) return;

           // Extract and trim fields
           const [minor, firstName, lastName, email, phone, role, courseName, enrollmentDate, completionDate] =
               row.slice(0, 10).map(field => (field || '').trim());

           const fullName = `${firstName} ${lastName}`.trim();

           if (!fullName) return; // Skip rows without a name

           if (!personData[fullName]) {
               personData[fullName] = {
                   roles: [],
                   courses: {},
                   email: email
               };
           }

           // Track roles and courses
           if (role) {
               personData[fullName].roles.push(role);
           }

           personData[fullName].courses[courseName] = {
               enrollmentDate: enrollmentDate,
               completionDate: completionDate
           };
       });

       // Determine role eligibility
       const roleResults = {};
       Object.keys(ROLE_CONFIGS).forEach(role => {
           roleResults[role] = {
               complete: [],
               inProgress: [],
               incomplete: []
           };
       });

       // Process each person's data
       Object.entries(personData).forEach(([name, personInfo]) => {
           Object.entries(ROLE_CONFIGS).forEach(([roleName, config]) => {
               // Check if person's role matches required roles
               const hasRequiredRole = config.requiredRoles.some(requiredRole =>
                   personInfo.roles.includes(requiredRole)
               );

               if (!hasRequiredRole) return;

               // Check course status
              const courseStatus = config.requiredCourses.map(course =>
                   personInfo.courses[course] ? determineCourseStatus(personInfo.courses[course]) : '❌'
               );

               // Check if all required courses have a valid status
               const allCoursesValid = courseStatus.every(status => status !== null);
               const allCoursesCompleted = courseStatus.every(status => status === '✅');

               // Categorize results
               if (allCoursesValid) {
                   if (allCoursesCompleted) {
                       roleResults[roleName].complete.push(name);
                   } else if (courseStatus.some(status => status === '⏰')) {
                       roleResults[roleName].inProgress.push(name);
                   } else {
                       roleResults[roleName].incomplete.push(name);
                   }
               }
           });
       });

       return roleResults;
   }

   function determineCourseStatus(course) {
       if (course.enrollmentDate && course.completionDate) return '✅';
       if (course.enrollmentDate) return '⏰';
       return '❌';
   }

  function renderResults(processedData) {
       // Clear previous results
       resultsContainer.innerHTML = '';

       // Create a table with 4 columns
       let tableContent = '<table><tr>';
       const roles = Object.keys(ROLE_CONFIGS);

       for (let i = 0; i < roles.length; i++) {
           const role = roles[i];
           const roleData = processedData[role];

           // Collect emails for each category
           const completeEmails = getEmailsForCategory(roleData.complete);
           const inProgressEmails = getEmailsForCategory(roleData.inProgress);
           const incompleteEmails = getEmailsForCategory(roleData.incomplete);

           // Create role section with conditional rendering
           let roleHtml = `
               <div class="role-section">
                   <h4>${role}</h4>
                   ${renderSection('Complete', roleData.complete, completeEmails)}
                   ${renderSection('In Progress', roleData.inProgress, inProgressEmails)}
                   ${renderSection('Incomplete', roleData.incomplete, incompleteEmails)}
               </div>
           `;

           // Add to table cell
           tableContent += `<td>${roleHtml}</td>`;

           // Start new row every 4 columns
           if ((i + 1) % 4 === 0 && i < roles.length - 1) {
               tableContent += '</tr><tr>';
           }
       }

       // Close last row
       tableContent += '</tr></table>';

       resultsContainer.innerHTML = tableContent;
   }

function renderSection(sectionTitle, names, emails) {
       // Only render if there are names
       if (names.length === 0) return '';

       // Create email button if emails exist
       const emailButton = emails.length > 0
           ? `<a href="mailto:?bcc=${emails.join(',')}" target="_blank" class="email-button">Email</a>`
           : '';

       const sectionEmoji = sectionTitle === 'Complete' ? '✅' : sectionTitle === 'In Progress' ? '⏰' : '❌';

       return `
           <div>
               <h5>
                   ${sectionTitle} ${sectionEmoji}
                   ${emailButton}
               </h5>
               <p>${names.join(', ')}</p>
           </div>
       `;
   }

   function getEmailsForCategory(names) {
       return names.map(name => {
           const person = Object.entries(personData).find(([fullName]) => fullName === name);
           return person ? person[1].email : '';
       }).filter(email => email);
   }
