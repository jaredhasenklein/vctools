// Program-specific role configurations
const PROGRAM_CONFIGS = {
    'FRC': {
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FRC General Judge Training']
        },
        'Judge - Dean\'s List Award': {
            requiredRoles: ['Judge - Dean\'s List Award'],
            requiredCourses: ['FRC Dean\'s List Judge Training', 'FIRST Data Privacy and Protection Training']
        },
        'Judge - FIRST Impact Award': {
            requiredRoles: ['Judge - FIRST Impact Award'],
            requiredCourses: ['FRC FIRST Impact Award Judge Training', 'FRC General Judge Training']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FRC Judge Advisor Training', 'FIRST Data Privacy and Protection Training']
        },
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['FRC Referee Training', 'FRC Head Referee Training']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FRC Referee Training']
        },
        'Lead Robot Inspector': {
            requiredRoles: ['Lead Robot Inspector'],
            requiredCourses: ['FRC Robot Inspector Test']
        },
        'Robot Inspector': {
            requiredRoles: ['Robot Inspector'],
            requiredCourses: ['FRC Robot Inspector Test']
        },
        'Lead Queuer': {
            requiredRoles: ['Lead Queuer'],
            requiredCourses: ['FRC Lead Queuer Training']
        },
        'Safety Manager': {
            requiredRoles: ['Safety Manager'],
            requiredCourses: ['FRC Safety Manager Training']
        },
        'Pit Admin Supervisor': {
            requiredRoles: ['Pit Administration Supervisor'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Accommodation Coordinator (optional role)': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['Accommodation Coordinator Training', 'FIRST Data Privacy and Protection Training']
        }
    },
    'FLL': {
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['FIRST LEGO League Challenge Head Referee Training', 'FIRST Data Privacy and Protection Training']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FIRST LEGO League Challenge Judge Advisor Training', 'FIRST Data Privacy and Protection Training']
        },
        'Tournament Director': {
            requiredRoles: ['Tournament Director'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Volunteer Coordinator': {
            requiredRoles: ['Volunteer Coordinator'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Accommodation Coordinator': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FIRST LEGO League Challenge Judge Training', 'FIRST Data Privacy and Protection Training']
        },
        'Lead Judge': {
            requiredRoles: ['Lead Judge'],
            requiredCourses: ['FIRST LEGO League Challenge Judge Training', 'FIRST Data Privacy and Protection Training']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FIRST LEGO League Challenge Referee Training']
        },
        'Team Registration': {
            requiredRoles: ['Team Registration'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Pit Administrator': {
            requiredRoles: ['Pit Administrator'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        }
    },
    'FTC': {
        'Field Supervisor': {
            requiredRoles: ['Field Supervisor'],
            requiredCourses: ['FTC Field Supervisor', 'FTC Gracious Professionalism']
        },
        'FIRST Technical Advisor': {
            requiredRoles: ['FIRST Technical Advisor'],
            requiredCourses: ['FTC FIRST Technical Advisor', 'FTC Gracious Professionalism']
        },
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['FTC Head Referee', 'FTC Referee', 'FTC Gracious Professionalism']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FIRST Data Privacy and Protection Training', 'FTC Gracious Professionalism', 'FTC Judge Advisor']
        },
        'Lead Queuer': {
            requiredRoles: ['Lead Queuer'],
            requiredCourses: ['FTC Queuer', 'FTC Gracious Professionalism']
        },
        'Queuer': {
            requiredRoles: ['Queuer'],
            requiredCourses: ['FTC Queuer', 'FTC Gracious Professionalism']
        },
        'Lead Robot Inspector': {
            requiredRoles: ['Lead Robot Inspector'],
            requiredCourses: ['FTC Gracious Professionalism', 'FTC Robot Inspector']
        },
        'Lead Scorekeeper': {
            requiredRoles: ['Lead Scorekeeper'],
            requiredCourses: ['FTC Scorekeeper/Scoring System', 'FTC Gracious Professionalism']
        },
        'Scorekeeper': {
            requiredRoles: ['Scorekeeper'],
            requiredCourses: ['FTC Scorekeeper/Scoring System', 'FTC Gracious Professionalism']
        },
        'Pit Administrator': {
            requiredRoles: ['Pit Administrator'],
            requiredCourses: ['FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training', 'FTC Pit Administrator']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FTC Referee', 'FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Volunteer Coordinator': {
            requiredRoles: ['Volunteer Coordinator'],
            requiredCourses: ['FTC Volunteer Coordinator', 'FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Accommodation Coordinator': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['FIRST Data Privacy and Protection Training']
        },
        'Dean\'s List Reviewers': {
            requiredRoles: ['Dean\'s List Reviewer'],
            requiredCourses: ['FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training', 'FTC Dean\'s List Reviewer']
        },
        'Emcee': {
            requiredRoles: ['Emcee'],
            requiredCourses: ['FTC Emcee and Game Announcer', 'FTC Gracious Professionalism']
        },
        'Game Announcer': {
            requiredRoles: ['Game Announcer'],
            requiredCourses: ['FTC Emcee and Game Announcer', 'FTC Gracious Professionalism']
        },
        'Field Inspector': {
            requiredRoles: ['Field Inspector'],
            requiredCourses: ['FTC Field Inspector', 'FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Lead Field Inspector': {
            requiredRoles: ['Lead Field Inspector'],
            requiredCourses: ['FTC Field Inspector', 'FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'FTA Assistant': {
            requiredRoles: ['FTA Assistant'],
            requiredCourses: ['[Placeholder for FTA Assistant]']
        },
        'FTC Scoring Event Admin': {
            requiredRoles: ['FTC Scoring Event Admin'],
            requiredCourses: ['FTC Scoring Event Administrator', 'FTC Gracious Professionalism', '[Placeholder for additional course]']
        },
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FIRST Data Privacy and Protection Training', 'FTC Gracious Professionalism', 'FTC Judge']
        },
        'Judge Advisor Assistant': {
            requiredRoles: ['Judge Advisor Assistant'],
            requiredCourses: ['[Placeholder for Judge Advisor Assistant]']
        },
        'Judge Match Observer': {
            requiredRoles: ['Judge Match Observer'],
            requiredCourses: ['[Placeholder for Judge Match Observer]']
        },
        'Robot Inspector': {
            requiredRoles: ['Robot Inspector'],
            requiredCourses: ['FTC Robot Inspector', 'FTC Gracious Professionalism']
        },
        'Team Registration': {
            requiredRoles: ['Team Registration'],
            requiredCourses: ['FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Volunteer Check In': {
            requiredRoles: ['Volunteer Check In'],
            requiredCourses: ['FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Control System Advisor': {
            requiredRoles: ['Control System Advisor'],
            requiredCourses: ['FTC Gracious Professionalism', 'FIRST Data Privacy and Protection Training']
        },
        'Wi-Fi Technical Advisor': {
            requiredRoles: ['Wi-Fi Technical Advisor'],
            requiredCourses: ['[Placeholder for Wi-Fi Technical Advisor]']
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
    const expectedHeaders = ['Minor', 'Preferred First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Course Name', 'Enrollment Date', 'Completion Date', 'Required?'];

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
    
    // We no longer need to update a program selector
    
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

function determineCourseStatus(course) {
    if (course.enrollmentDate && course.completionDate) return '✅';
    if (course.enrollmentDate) return '⏰';
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