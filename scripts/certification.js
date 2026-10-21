// Program-specific role configurations (PROGRAM_CONFIGS) come from scripts/roleconfig.js.

// Current selected program - will be updated when file is processed
let selectedProgram = 'FRC';
// Active role configurations based on selected program
let ROLE_CONFIGS = PROGRAM_CONFIGS[selectedProgram];
// Store detected event name
let eventName = '';

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

    VMS.loadReport(file, TC_NEEDS, { accepts: VMS.acceptsFor('certification') })
        .then(({ report, records }) => processCSV(report, records, file.name))
        .catch((error) => {
            if (VMS.isCancelled(error)) return;
            showError('Error reading file. Please make sure this is a Training and Certifications report from VMS. Details: ' + error.message);
            // Hide version tag on error
            if (document.getElementById('version-tag')) {
                document.getElementById('version-tag').style.display = 'none';
            }
        });
}

// Fields read from the Training and Certifications report (see lib/vms/fields.js).
const TC_NEEDS = {
    preferredFirstName: { required: true },
    lastName: { required: true },
    email: { required: true },
    role: { required: true },
    assignmentStatus: {},
    courseName: { required: true },
    enrollmentDate: {},
    startedDate: {},
    completionDate: {},
};

// Fields read from the optional Assigned Volunteers report.
const AV_NEEDS = {
    preferredFirstName: { required: true },
    lastName: { required: true },
    rolesAssigned: {},
};

// Program from the report's Event line; FRC when the event name doesn't say.
function applyEventInfo(meta) {
    if (meta.event) {
        eventName = meta.event;
        const eventInput = document.getElementById('eventInput');
        if (eventInput) {
            eventInput.value = eventName;
        }
    }
    return meta.program || 'FRC';
}

function getDisplayNameForProgram(programCode) {
    const displayNames = {
        'FRC': 'FRC',
        'FTC': 'FTC',
        'FLL': 'FLL Challenge'
    };
    
    return displayNames[programCode] || programCode;
}

function processCSV(report, records, loadedFileName) {
    clearError();

    // Detect program from the report's Event line
    const detectedProgram = applyEventInfo(report.meta);

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
    const isBeta = BETA_PROGRAMS.has(selectedProgram);
    document.getElementById('programBeta').hidden = !isBeta;
    document.getElementById('programBetaNote').hidden = !isBeta;

    const processedData = processData(records);
    renderResults(processedData);

    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        setDropzoneLoaded(dropzone, { fileName: loadedFileName, detail: describeReport(report, `${Object.keys(personData).length} volunteers`) });
    }
}

// Helper function to check if a course name contains any of the required course patterns
function matchesCoursePattern(coursePattern, actualCourseName) {
    if (!actualCourseName) return false;
    
    // Handle placeholder courses - they won't match any actual courses
    if (coursePattern.startsWith('[Placeholder')) return false;
    
    return actualCourseName.toLowerCase().includes(coursePattern.toLowerCase());
}

function processData(records) {
    personData = {}; // Reset global person data

    records.forEach(rec => {
        const firstName = rec.preferredFirstName;
        const lastName = rec.lastName;
        const email = rec.email;
        const role = rec.role;
        const assignmentStatus = rec.assignmentStatus;
        const courseName = rec.courseName;
        const enrollmentDate = rec.enrollmentDate;
        const startedDate = rec.startedDate;
        const completionDate = rec.completionDate;

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

            // Check course status using partial matching and track missing ones
            const missingTrainings = [];
            const courseStatus = config.requiredCourses.map(requiredCoursePattern => {
                // Find any course that matches the pattern
                const matchingCourse = Object.keys(personInfo.courses).find(actualCourseName => 
                    matchesCoursePattern(requiredCoursePattern, actualCourseName)
                );
                
                const status = matchingCourse 
                    ? determineCourseStatus(personInfo.courses[matchingCourse]) 
                    : '❌';

                if (status !== '✅') {
                    // Use the pattern as the training name if no matching course found, 
                    // or a descriptive placeholder if it's a TBD training
                    const displayName = requiredCoursePattern.includes('TBD') ? "Assigned Role Training" : requiredCoursePattern;
                    missingTrainings.push(displayName);
                }
                
                return status;
            });

            // Check if all required courses have a valid status
            const allCoursesValid = courseStatus.every(status => status !== null);
            const allCoursesCompleted = courseStatus.every(status => status === '✅');

            // Categorize results
            const personEntry = { name, missingTrainings };
            if (allCoursesValid) {
                if (allCoursesCompleted) {
                    roleResults[roleName].complete.push(personEntry);
                } else if (courseStatus.some(status => status === '⏰')) {
                    roleResults[roleName].inProgress.push(personEntry);
                } else {
                    roleResults[roleName].incomplete.push(personEntry);
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

    VMS.loadReport(file, AV_NEEDS, { accepts: VMS.acceptsFor('certification', 'assigned') })
        .then(({ records }) => {
            processAssignedVolunteersCSV(records, file.name);

            // Re-render results if main data was already processed
            if (Object.keys(personData).length > 0) {
                const processedData = categorizeData();
                renderResults(processedData);
            }
        })
        .catch((error) => {
            if (VMS.isCancelled(error)) return;
            showError('Error reading Assigned Volunteers file. Details: ' + error.message);
        });
}

function processAssignedVolunteersCSV(records, loadedFileName) {
    assignedVolunteersFilters = {};

    records.forEach(rec => {
        // Roles Assigned is one comma-separated cell, e.g. "Judge, Judge Advisor"
        const roles = rec.rolesAssigned ? rec.rolesAssigned.split(',').map(r => r.trim()) : [];

        const fullName = `${rec.preferredFirstName} ${rec.lastName}`.trim();
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
        setDropzoneLoaded(dropzone, { fileName: loadedFileName, detail: `${Object.keys(assignedVolunteersFilters).length} assigned volunteers` });
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

function getEmailsForCategory(entries) {
    return entries.map(entry => {
        const name = entry.name;
        const person = Object.entries(personData).find(([fullName]) => fullName === name);
        if (person) {
            // Split name to get first name
            const firstName = name.split(' ')[0];
            return {
                fullName: name,
                firstName: firstName,
                email: person[1].email,
                missingTrainings: entry.missingTrainings
            };
        }
        return null;
    }).filter(e => e !== null);
}

/**
 * Generate email data object for modal and standard links
 * @param {Array} recipients - Array of objects {email, firstName, ...}
 * @param {boolean} isBulk - Whether this is a bulk email (BCC)
 * @param {string} specificFirstName - Optional first name for single recipient
 */
function generateEmailData(recipients, isBulk = false, specificFirstName = null) {
    if (recipients.length === 0) return '#';

    const coordinatorName = document.getElementById('coordinatorName')?.value || '';
    const coordinatorEmail = document.getElementById('coordinatorEmail')?.value || '';
    const coordinatorPhone = document.getElementById('coordinatorPhone')?.value || '';
    const deadlineDate = document.getElementById('deadlineDate')?.value || '';
    const currentEventName = document.getElementById('eventInput')?.value || eventName || 'our upcoming event';
    
    // Format deadline date if provided
    let formattedDeadline = deadlineDate;
    if (deadlineDate) {
        try {
            const date = new Date(deadlineDate + 'T00:00:00');
            formattedDeadline = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            console.error("Error formatting date", e);
        }
    }

    const greeting = specificFirstName ? `Hi ${specificFirstName},` : "Hi,";
    const rawSubject = `${currentEventName} Certification Reminder`;
    
    // Add missing training info if available for individual emails
    let trainingInfo = "";
    let trainingInfoHtml = "";
    
    if (!isBulk && recipients.length === 1 && recipients[0].missingTrainings && recipients[0].missingTrainings.length > 0) {
        const list = recipients[0].missingTrainings.map(t => `- ${t}`).join('\n');
        trainingInfo = `\n\nAccording to our records, you still need to complete one or more of the following trainings:\n${list}`;
        
        const listHtml = recipients[0].missingTrainings.map(t => `<li>${t}</li>`).join('');
        trainingInfoHtml = `<p>According to our records, you still need to complete one or more of the following trainings:</p><ul>${listHtml}</ul>`;
    }
    
    const bodyTemplate = `${greeting}

This is a reminder that you must complete your volunteer certifications before coming to our ${currentEventName}. Your certification must be completed by ${formattedDeadline}.${trainingInfo}

To complete testing:
- Login to the FIRST Dashboard: https://www.firstinspires.org/Dashboard
- Navigate to the Volunteer Registration Tab
- Click the “FIRST Training” button and this will bring you directly to the training site. Alternately, you may also go directly to https://training.firstinspires.com and click the “My Training Portal” tab to see courses assigned to you.
- From there, you will be able to access any required trainings
- If you have any questions on accessing the trainings, please refer to the Knowledgebase Articles (https://help.firstinspires.org/s/?language=en_US) or reach out to training@firstinspires.org for assistance.

Thank you for all your hard work. Please do not hesitate to contact me with any questions or concerns.


Sincerely,

${coordinatorName}
FIRST Robotics Competition Volunteer Coordinator
${currentEventName}
${coordinatorEmail}
${coordinatorPhone}`;

    const bodyHtmlTemplate = `${greeting}<br><br>
<b>This is a reminder that you must complete your volunteer certifications before coming to our ${currentEventName}. Your certification must be completed by ${formattedDeadline}.</b><br>
${trainingInfoHtml}<br>
<b>To complete testing:</b><br>
- Login to the <a href="https://www.firstinspires.org/Dashboard"><em>FIRST</em> Dashboard</a><br>
- Navigate to the Volunteer Registration Tab<br>
- Click the <b>“<em>FIRST</em> Training”</b> button and this will bring you directly to the training site. Alternately, you may also go directly to <a href="https://training.firstinspires.com">training.firstinspires.com</a> and click the “My Training Portal” tab to see courses assigned to you.<br>
- From there, you will be able to access any required trainings<br>
- If you have any questions on accessing the trainings, please refer to the <a href="https://help.firstinspires.org/s/?language=en_US">Knowledgebase Articles</a> or reach out to <a href="mailto:training@firstinspires.org">training@firstinspires.org</a> for assistance.<br><br>
Thank you for all your hard work. Please do not hesitate to contact me with any questions or concerns.<br><br><br>
Sincerely,<br><br>
${coordinatorName}<br>
<em>FIRST</em> Robotics Competition Volunteer Coordinator<br>
${currentEventName}<br>
${coordinatorEmail}<br>
${coordinatorPhone}`;

    // Clean up any accidental leading spaces on each line and remove newlines for HTML
    const cleanBody = bodyTemplate.split('\n').map(line => line.trimStart()).join('\n');
    const cleanBodyHtml = bodyHtmlTemplate.split('\n').map(line => line.trimStart()).join('');

    return {
        recipients: isBulk ? recipients.map(r => r.email).join(', ') : recipients[0].email,
        subject: rawSubject.trim(),
        body: cleanBody.trim(),
        bodyHtml: cleanBodyHtml.trim(),
        mailtoLink: `mailto:${!isBulk ? recipients[0].email : ''}?bcc=${isBulk ? recipients.map(r => r.email).join(',') : ''}&subject=${encodeURIComponent(rawSubject)}&body=${encodeURIComponent(cleanBody)}`,
        gmailLink: `https://mail.google.com/mail/?view=cm&fs=1&to=${!isBulk ? recipients[0].email : ''}&bcc=${isBulk ? recipients.map(r => r.email).join(',') : ''}&su=${encodeURIComponent(rawSubject)}&body=${encodeURIComponent(cleanBody)}`
    };
}

/**
 * Show the email options modal
 */
let lastEmailSource = null;

function showEmailModal(element, recipients, isBulk = false, specificFirstName = null) {
    lastEmailSource = element;
    const emailData = generateEmailData(recipients, isBulk, specificFirstName);
    
    const modal = document.getElementById('emailModal');
    const gmailLink = document.getElementById('modalGmailLink');
    const mailtoLink = document.getElementById('modalMailtoLink');
    const recipientsInput = document.getElementById('modalRecipients');
    const subjectInput = document.getElementById('modalSubject');
    const bodyTextarea = document.getElementById('modalBody');
    const bodyHtmlDiv = document.getElementById('modalBodyHtml');
    
    if (!modal || !gmailLink || !mailtoLink || !recipientsInput || !subjectInput || !bodyTextarea || !bodyHtmlDiv) {
        console.error("Modal elements not found");
        return;
    }
    
    // Set values and clear any extra whitespace from templates
    recipientsInput.value = emailData.recipients.trim();
    subjectInput.value = emailData.subject.trim();
    bodyTextarea.value = emailData.body.trim();
    bodyHtmlDiv.innerHTML = emailData.bodyHtml.trim();
    
    gmailLink.href = emailData.gmailLink;
    mailtoLink.href = emailData.mailtoLink;
    
    // Add click handlers to external links to grey out the original button
    const markAsEmailed = () => {
        if (lastEmailSource) {
            lastEmailSource.style.opacity = '0.3';
            lastEmailSource.style.filter = 'grayscale(100%)';
            lastEmailSource.title = (lastEmailSource.title || '') + " (Emailed)";
        }
        modal.style.display = 'none';
    };
    
    gmailLink.onclick = markAsEmailed;
    mailtoLink.onclick = markAsEmailed;
    
    modal.style.display = 'flex';
}

/**
 * Copy rich text (HTML) to clipboard
 */
function copyRichText() {
    const btn = window.event.target;
    const html = document.getElementById('modalBodyHtml').innerHTML.trim();
    const text = document.getElementById('modalBody').value.trim();
    
    try {
        const typeHtml = "text/html";
        const blobHtml = new Blob([html], { type: typeHtml });
        // Use only HTML type as requested to avoid conflicts or extra spacing from plain text fallback
        const data = [new ClipboardItem({ [typeHtml]: blobHtml })];
        
        navigator.clipboard.write(data).then(() => {
            const originalText = btn.textContent;
            btn.textContent = 'Copied Formatted!';
            btn.classList.replace('btn-outline-primary', 'btn-success');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.replace('btn-success', 'btn-outline-primary');
            }, 2000);
        });
    } catch (err) {
        console.error('Failed to copy rich text: ', err);
        // Fallback to plain text if rich copy fails
        copyToClipboard('modalBody');
    }
}

/**
 * Copy text from an element to clipboard
 */
function copyToClipboard(elementId) {
    const btn = window.event.target;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const valueToCopy = element.value.trim();
    element.select();
    element.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        navigator.clipboard.writeText(valueToCopy);
        
        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.replace('btn-outline-secondary', 'btn-success');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.replace('btn-success', 'btn-outline-secondary');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function renderSection(sectionTitle, names, emails) {
    // Only render if there are names
    if (names.length === 0) return '';

    const isComplete = sectionTitle === 'Complete';

    // Create bulk email button - Only if NOT complete
    const emailsJson = JSON.stringify(emails).replace(/"/g, '&quot;');
    const emailButton = (!isComplete && emails.length > 0)
        ? `<button onclick="showEmailModal(this, ${emailsJson}, true)" class="email-button" style="border:none; cursor:pointer;">Email All</button>`
        : '';

    const sectionEmoji = isComplete ? '✅' : sectionTitle === 'In Progress' ? '⏰' : '❌';

    // Create list of names with individual email buttons - Only if NOT complete
    const namesHtml = emails.map(person => {
        const personJson = JSON.stringify([person]).replace(/"/g, '&quot;');
        const emailIcon = !isComplete 
            ? ` <a href="javascript:void(0)" onclick="showEmailModal(this, ${personJson}, false, '${person.firstName}')" title="Email ${person.firstName}" style="text-decoration:none; font-size: 14px; transition: all 0.3s;">✉️</a>`
            : '';
        return `<span>${person.fullName}${emailIcon}</span>`;
    }).join(', ');

    // If no emails found (shouldn't happen with getEmailsForCategory), fallback to names only
    const displayList = namesHtml || names.join(', ');

    return `
        <div style="margin-bottom: 15px;">
            <h5 style="margin-bottom: 5px;">
                ${sectionTitle} ${sectionEmoji}
                ${emailButton}
            </h5>
            <div style="font-size: 0.9em; line-height: 1.6;">${displayList}</div>
        </div>
    `;
}
