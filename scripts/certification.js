// Program-specific role configurations
const PROGRAM_CONFIGS = {
    'FRC': {
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FIRST Robotics Competition Judge']
        },
        'Judge - Dean\'s List Award': {
            requiredRoles: ['Judge - Dean\'s List Award'],
            requiredCourses: ['FIRST Robotics Competition Dean\'s List Award Judge', 'FIRST Data Privacy and Protection Training']
        },
        'Judge - FIRST Impact Award': {
            requiredRoles: ['Judge - FIRST Impact Award'],
            requiredCourses: ['FIRST Robotics Competition Judge', 'FIRST Robotics Competition FIRST Impact Award Judge']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FIRST Robotics Competition Dean\'s List Award Judge', 'Data Privacy for Event Volunteers', 'FIRST Robotics Competition FIRST Impact Award Judge', 'FIRST Robotics Competition Judge', 'FIRST Robotics Competition Judge Advisor']
        },
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'TBD HR training name']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['TBD Referee training name']
        },
        'Lead Robot Inspector': {
            requiredRoles: ['Lead Robot Inspector'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'TBD LRI training name']
        },
        'Robot Inspector': {
            requiredRoles: ['Robot Inspector'],
            requiredCourses: ['TBD Robot Inspector course name']
        },
        'Lead Queuer': {
            requiredRoles: ['Lead Queuer'],
            requiredCourses: ['TBD LQ training name']
        },
        'Safety Manager': {
            requiredRoles: ['Safety Manager'],
            requiredCourses: ['FIRST® Robotics Competition Safety Manager',]
        },
        'Pit Admin Supervisor': {
            requiredRoles: ['Pit Administration Supervisor'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'TBD Pit Admin training name']
        },
        'Accommodation Coordinator (optional role)': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['Accommodation Coordinator', 'Data Privacy for Event Volunteers']
        }
    },
    'FLL': {
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['FIRST LEGO League Challenge Head Referee', 'Data Privacy for Event Volunteers']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FIRST LEGO League Challenge Judge Advisor', 'Data Privacy for Event Volunteers']
        },
        'Tournament Director': {
            requiredRoles: ['Tournament Director'],
            requiredCourses: ['Data Privacy for Event Volunteers']
        },
        'Volunteer Coordinator': {
            requiredRoles: ['Volunteer Coordinator'],
            requiredCourses: ['Data Privacy for Event Volunteers']
        },
        'Accommodation Coordinator': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['Accommodation Coordinator', 'Data Privacy for Event Volunteers']
        },
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FIRST LEGO League Challenge Judge', 'Data Privacy for Event Volunteers']
        },
        'Lead Judge': {
            requiredRoles: ['Lead Judge'],
            requiredCourses: ['FIRST LEGO League Challenge Judge', 'Data Privacy for Event Volunteers']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FIRST LEGO League Challenge Referee']
        },
        'Team Registration': {
            requiredRoles: ['Team Registration'],
            requiredCourses: ['Data Privacy for Event Volunteers']
        },
        'Pit Administrator': {
            requiredRoles: ['Pit Administrator'],
            requiredCourses: ['Data Privacy for Event Volunteers']
        }
    },
    'FTC': {
        'Field Supervisor': {
            requiredRoles: ['Field Supervisor'],
            requiredCourses: ['FIRST Tech Challenge Field Supervisor', 'Welcome to FIRST']
        },
        'FIRST Technical Advisor': {
            requiredRoles: ['FIRST Technical Advisor'],
            requiredCourses: ['FIRST Tech Challenge FIRST Technical Advisor', 'Welcome to FIRST']
        },
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Head Referee', 'FIRST Tech Challenge Referee']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Judge Advisor', 'Welcome to FIRST']
        },
        'Lead Queuer': {
            requiredRoles: ['Lead Queuer'],
            requiredCourses: ['FIRST Tech Challenge Lead Queuer', 'Welcome to FIRST']
        },
        'Queuer': {
            requiredRoles: ['Queuer'],
            requiredCourses: ['Welcome to FIRST']
        },
        'Lead Robot Inspector': {
            requiredRoles: ['Lead Robot Inspector'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Lead Robot Inspector', 'FIRST Tech Challenge Robot Inspector', 'Welcome to FIRST']
        },
        'Lead Scorekeeper': {
            requiredRoles: ['Lead Scorekeeper'],
            requiredCourses: ['Data Privacy for Event Volunteers','FIRST Tech Challenge Scorekeeper (Lead)', 'Welcome to FIRST']
        },
        'Scorekeeper': {
            requiredRoles: ['Scorekeeper'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Pit Administrator': {
            requiredRoles: ['Pit Administrator'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Pit Admin Supervisor', 'Welcome to FIRST']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FIRST Tech Challenge Referee', 'Welcome to FIRST']
        },
        'Volunteer Coordinator': {
            requiredRoles: ['Volunteer Coordinator'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Volunteer Coordinator' ]
        },
        'Accommodation Coordinator': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['Accommodation Coordinator', 'Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Dean\'s List Reviewers': {
            requiredRoles: ['Dean\'s List Reviewer'],
            requiredCourses: ['FIRST Tech Challenge Dean\'s List Reviewer', 'Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Emcee': {
            requiredRoles: ['Emcee', 'Game Announcer'],
            requiredCourses: ['FIRST Tech Challenge Emcee and Game Announcer', 'Welcome to FIRST']
        },
        'FIRST Technical Advisor Assistant': {
            requiredRoles: ['FIRST Technical Advisor Assistant'],
            requiredCourses: ['The Gracious Volunteer', 'The Gracious Volunteer - Event Volunteer']
        },
        'FTC Scoring Event Admin': {
            requiredRoles: ['FTC Scoring Event Admin'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Judge', 'Welcome to FIRST']
        },
        'Judge Advisor Assistant': {
            requiredRoles: ['Judge Advisor Assistant'],
            requiredCourses: ['Welcome to FIRST']
        },
        'Judge Match Observer': {
            requiredRoles: ['Judge Match Observer'],
            requiredCourses: ['Welcome to FIRST']
        },
        'Robot Inspector': {
            requiredRoles: ['Robot Inspector'],
            requiredCourses: ['FIRST Tech Challenge Robot Inspector', 'Welcome to FIRST']
        },
        'Team Registration': {
            requiredRoles: ['Team Registration'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Volunteer Check-In': {
            requiredRoles: ['Volunteer Check-In'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        'Control System Advisor': {
            requiredRoles: ['Control System Advisor'],
            requiredCourses: ['FIRST Tech Challenge Control System Advisor', 'Welcome to FIRST']
        },
        'Wi-Fi Technical Advisor': {
            requiredRoles: ['Wi-Fi Technical Advisor'],
            requiredCourses: ['FIRST Tech Challenge Wi-Fi Technical Advisor', 'Welcome to FIRST']
        }
    }
};

// Current selected program - will be updated when file is processed
let selectedProgram = 'FRC';
// Active role configurations based on selected program
let ROLE_CONFIGS = PROGRAM_CONFIGS[selectedProgram];

// Initialize everything after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const assignedVolunteersDropzone = document.getElementById('assignedVolunteersDropzone');
    const assignedVolunteersInput = document.getElementById('assignedVolunteersInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const versionBox = document.querySelector('.version-box');
    
    if (!dropzone || !fileInput) {
        console.error('Required elements not found: dropzone or fileInput');
        return;
    }
    
    // Hide version info initially - it will be shown after processing the CSV
    if (document.getElementById('version-tag')) {
        document.getElementById('version-tag').style.display = 'none';
    }
    
    // Initialize drag and drop functionality
    setupDragAndDrop(dropzone, fileInput, handleFiles);

    if (assignedVolunteersDropzone && assignedVolunteersInput) {
        setupDragAndDrop(assignedVolunteersDropzone, assignedVolunteersInput, handleAssignedVolunteersFiles);
    }
});

let personData = {}; // Global variable to store person data with emails

function handleFiles(files) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (files.target) {
        files = files.target.files;
    }

    if (files.length === 0) return;

    const file = files[0];

    if (!validateCSVFile(file)) {
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        // Hide version tag if validation fails
        if (document.getElementById('version-tag')) {
            document.getElementById('version-tag').style.display = 'none';
        }
        return;
    }

    Papa.parse(file, {
        complete: function(results) {
            processCSV(results.data);
        },
        error: function(error) {
            showError('Error parsing file. Please make sure this is a Training and Certifications report from VMS. Details: ' + error);
            // Hide version tag on error
            if (document.getElementById('version-tag')) {
                document.getElementById('version-tag').style.display = 'none';
            }
        },
        skipEmptyLines: true,
        header: false
    });
}

function findHeaderRow(rows) {
    // New CSV format headers (12 columns)
    const expectedHeaders = ['Minor', 'Preferred First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Assignment Status', 'Course Name', 'Enrollment Date', 'Started Date', 'Completion Date', 'Required?'];

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

// Function to detect program from CSV data
function detectProgramFromCSV(rows) {
    // Look for event information in row 4 (index 3) if available
    if (rows.length > 3) {
        for (let i = 0; i < 10; i++) { // Check first 10 rows to find event info
            if (i >= rows.length) break;
            
            const row = rows[i];
            // Check if this row contains event information
            if (row.length > 0 && typeof row[0] === 'string' && row[0].trim().startsWith('Event:')) {
                const eventInfo = row[0].trim();
                console.log("Found event info:", eventInfo);
                
                // Extract program code at the end after the last dash
                const lastDashIndex = eventInfo.lastIndexOf('-');
                if (lastDashIndex !== -1) {
                    const programPart = eventInfo.substring(lastDashIndex + 1).trim();
                    console.log("Program part:", programPart);
                    
                    // Check for FTC
                    if (programPart.includes('FTC') || programPart.includes('Tech Challenge')) {
                        console.log("Detected FTC");
                        return 'FTC';
                    }
                    // Check for FRC 
                    else if (programPart.includes('FRC') || programPart.includes('Robotics Competition')) {
                        console.log("Detected FRC");
                        return 'FRC';
                    }
                    // Check for FLL
                    else if (programPart.includes('FLL') || programPart.includes('LEGO League')) {
                        console.log("Detected FLL");
                        return 'FLL';
                    }
                }
                
                // If no dash or couldn't detect from last part, check the entire event name
                if (eventInfo.includes('Tech Challenge') || eventInfo.includes('FTC')) {
                    console.log("Detected FTC from full event name");
                    return 'FTC';
                } else if (eventInfo.includes('Robotics Competition') || eventInfo.includes('FRC')) {
                    console.log("Detected FRC from full event name");
                    return 'FRC';
                } else if (eventInfo.includes('LEGO League') || eventInfo.includes('FLL')) {
                    console.log("Detected FLL from full event name");
                    return 'FLL';
                }
            }
        }
    }
    
    // Default to FRC if we can't detect
    console.log("Could not detect program, defaulting to FRC");
    return 'FRC';
}

// Get a display name for a program code
function getDisplayNameForProgram(programCode) {
    const displayNames = {
        'FRC': 'FRC',
        'FTC': 'FTC',
        'FLL': 'FLL Challenge'
    };
    
    return displayNames[programCode] || programCode;
}

function processCSV(rows) {
    clearError();

    // Find header row
    const headerRowIndex = findHeaderRow(rows);

    if (headerRowIndex === -1) {
        showError('Invalid CSV format. Could not find matching header row.');
        return;
    }
    
    // Detect program from the CSV
    const detectedProgram = detectProgramFromCSV(rows);
    
    // Update the selected program and configurations
    selectedProgram = detectedProgram;
    
    // Handle FLL Challenge differently for display vs. config key
    if (selectedProgram === 'FLL') {
        ROLE_CONFIGS = PROGRAM_CONFIGS['FLL']; 
    } else {
        ROLE_CONFIGS = PROGRAM_CONFIGS[selectedProgram];
    }
    
    // Update the version box and show the version tag
    const versionTag = document.getElementById('version-tag');
    const versionBox = document.querySelector('.version-box');
    
    if (versionBox) {
        versionBox.textContent = getDisplayNameForProgram(selectedProgram);
    }
    
    if (versionTag) {
        versionTag.style.display = 'block';
    }

    // Process data rows (starting from the row after headers)
    const dataRows = rows.slice(headerRowIndex + 1);
    const processedData = processData(dataRows);
    renderResults(processedData);

    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        dropzone.textContent = `Loaded ${Object.keys(personData).length} volunteers.`;
        dropzone.style.backgroundColor = 'var(--success-bg)';
        dropzone.style.color = 'var(--success-text)';
        dropzone.style.borderColor = 'var(--success-bg)';
    }
}

// Helper function to check if a course name contains any of the required course patterns
function matchesCoursePattern(coursePattern, actualCourseName) {
    if (!actualCourseName) return false;
    
    // Handle placeholder courses - they won't match any actual courses
    if (coursePattern.startsWith('[Placeholder')) return false;
    
    return actualCourseName.toLowerCase().includes(coursePattern.toLowerCase());
}

function processData(rows) {
    personData = {}; // Reset global person data

    // Collect person information
    // New CSV column indices (12 columns):
    // 0: Minor
    // 1: Preferred First Name
    // 2: Last Name
    // 3: Email
    // 4: Phone
    // 5: Role
    // 6: Assignment Status
    // 7: Course Name
    // 8: Enrollment Date
    // 9: Started Date
    // 10: Completion Date
    // 11: Required?
    
    rows.forEach(row => {
        // Skip rows with insufficient columns (need at least 12 for full data)
        if (row.length < 12) return;

        // Extract and trim fields using correct indices
        const minor = (row[0] || '').trim();
        const firstName = (row[1] || '').trim();
        const lastName = (row[2] || '').trim();
        const email = (row[3] || '').trim();
        const phone = (row[4] || '').trim();
        const role = (row[5] || '').trim();
        const assignmentStatus = (row[6] || '').trim();
        const courseName = (row[7] || '').trim();
        const enrollmentDate = (row[8] || '').trim();
        const startedDate = (row[9] || '').trim();
        const completionDate = (row[10] || '').trim();
        // const required = (row[11] || '').trim(); // Not currently used

        const fullName = `${firstName} ${lastName}`.trim();

        if (!fullName) return; // Skip rows without a name

        if (!personData[fullName]) {
            personData[fullName] = {
                roles: [],
                assignedRoles: [], // Track which roles are actually assigned
                courses: {},
                email: email
            };
        }

        // Track all roles (for potential future use)
        if (role && !personData[fullName].roles.includes(role)) {
            personData[fullName].roles.push(role);
        }

        // Track assigned roles separately - only "Assigned" status counts
        if (role && assignmentStatus.toLowerCase() === 'assigned' && !personData[fullName].assignedRoles.includes(role)) {
            personData[fullName].assignedRoles.push(role);
        }

        // Track courses using Started Date and Completion Date
        personData[fullName].courses[courseName] = {
            startedDate: startedDate,
            completionDate: completionDate
        };
    });

    return categorizeData();
}

let assignedVolunteersFilters = null;

function categorizeData() {
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
        // If assigned volunteers file was uploaded, filter by it
        if (assignedVolunteersFilters !== null) {
            if (!(name in assignedVolunteersFilters)) {
                return; // Skip this person entirely
            }
        }

        Object.entries(ROLE_CONFIGS).forEach(([roleName, config]) => {
            // Check if person's ASSIGNED role matches required roles
            let assignedRolesToCheck = personInfo.assignedRoles;
            
            if (assignedVolunteersFilters !== null && assignedVolunteersFilters[name] && assignedVolunteersFilters[name].size > 0) {
                // Use the exact roles assigned for this event
                assignedRolesToCheck = Array.from(assignedVolunteersFilters[name]);
            }

            const hasRequiredRole = config.requiredRoles.some(requiredRole =>
                assignedRolesToCheck.includes(requiredRole)
            );

            if (!hasRequiredRole) return;

            // Check course status using partial matching
            const courseStatus = config.requiredCourses.map(requiredCoursePattern => {
                // Find any course that matches the pattern
                const matchingCourse = Object.keys(personInfo.courses).find(actualCourseName => 
                    matchesCoursePattern(requiredCoursePattern, actualCourseName)
                );
                
                return matchingCourse 
                    ? determineCourseStatus(personInfo.courses[matchingCourse]) 
                    : '❌';
            });

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

function handleAssignedVolunteersFiles(files) {
    if (files.target) {
        files = files.target.files;
    }

    if (files.length === 0) return;

    const file = files[0];

    if (!validateCSVFile(file)) {
        return;
    }

    Papa.parse(file, {
        complete: function(results) {
            processAssignedVolunteersCSV(results.data);
            
            // Re-render results if main data was already processed
            if (Object.keys(personData).length > 0) {
                const processedData = categorizeData();
                renderResults(processedData);
            }
        },
        error: function(error) {
            showError('Error parsing Assigned Volunteers file. Details: ' + error);
        },
        skipEmptyLines: true,
        header: false
    });
}

function processAssignedVolunteersCSV(rows) {
    assignedVolunteersFilters = {};
    
    // Find header row based on expected columns
    const expectedHeaders = ['Minor', 'Legal First Name', 'Preferred First Name', 'Last Name', 'Personal Pronouns', 'Email'];
    
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) continue;
        
        const hasEmail = row.some(cell => cell && typeof cell === 'string' && cell.trim().toLowerCase() === 'email');
        if (hasEmail) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        showError('Invalid Assigned Volunteers CSV format. Could not find header row.');
        return;
    }
    
    const headerRow = rows[headerRowIndex];
    let firstNameIndex = -1;
    let lastNameIndex = -1;
    let rolesAssignedIndex = -1;
    
    headerRow.forEach((header, index) => {
        if (!header || typeof header !== 'string') return;
        const normalized = header.trim().toLowerCase();
        if (normalized === 'preferred first name') firstNameIndex = index;
        if (normalized === 'last name') lastNameIndex = index;
        if (normalized === 'roles assigned') rolesAssignedIndex = index;
    });

    if (firstNameIndex === -1 || lastNameIndex === -1) {
        showError('Invalid Assigned Volunteers CSV format. Could not find required columns.');
        return;
    }
    
    const dataRows = rows.slice(headerRowIndex + 1);
    dataRows.forEach(row => {
        if (row.length <= Math.max(firstNameIndex, lastNameIndex)) return;
        
        const firstName = (row[firstNameIndex] || '').trim();
        const lastName = (row[lastNameIndex] || '').trim();
        let roles = [];
        if (rolesAssignedIndex !== -1 && row[rolesAssignedIndex]) {
            let rolesStr = row[rolesAssignedIndex];
            roles = rolesStr.split(',').map(r => r.trim().replace(/^"|"$/g, ''));
        }
        
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
            if (!assignedVolunteersFilters[fullName]) {
                assignedVolunteersFilters[fullName] = new Set();
            }
            roles.forEach(r => {
                if (r) assignedVolunteersFilters[fullName].add(r);
            });
        }
    });

    const dropzone = document.getElementById('assignedVolunteersDropzone');
    if (dropzone) {
        dropzone.textContent = `Loaded ${Object.keys(assignedVolunteersFilters).length} assigned volunteers.`;
        dropzone.style.backgroundColor = 'var(--success-bg)';
        dropzone.style.color = 'var(--success-text)';
        dropzone.style.borderColor = 'var(--success-bg)';
    }
}

/**
 * Determine course completion status based on Started Date and Completion Date
 * - ✅ Complete: Has both Started Date AND Completion Date
 * - ⏰ In Progress: Has Started Date but NO Completion Date
 * - ❌ Incomplete: No Started Date (regardless of Completion Date)
 */
function determineCourseStatus(course) {
    if (course.startedDate && course.completionDate) return '✅';
    if (course.startedDate) return '⏰';
    return '❌';
}

function renderResults(processedData) {
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
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
