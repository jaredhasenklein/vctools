// ============================================================
// PROGRAM CONFIGS (replicated from certification.js)
// ============================================================
const PROGRAM_CONFIGS = {
    'FRC': {
        'Judge': {
            requiredRoles: ['Judge'],
            requiredCourses: ['FIRST Robotics Competition Judge']
        },
        'Judge - FIRST Leadership Award': {
            requiredRoles: ['Judge - FIRST Leadership Award'],
            requiredCourses: ['FIRST Robotics Competition Judge', 'FIRST Robotics Competition Leadership Award Judge', 'Data Privacy for Event Volunteers']
        },
        'Judge - FIRST Impact Award': {
            requiredRoles: ['Judge - FIRST Impact Award'],
            requiredCourses: ['FIRST Robotics Competition Judge', 'FIRST Robotics Competition FIRST Impact Award Judge']
        },
        'Judge Advisor': {
            requiredRoles: ['Judge Advisor'],
            requiredCourses: ['FIRST Robotics Competition Leadership Award Judge', 'Data Privacy for Event Volunteers', 'FIRST Robotics Competition FIRST Impact Award Judge', 'FIRST Robotics Competition Judge', 'FIRST Robotics Competition Judge Advisor']
        },
        'Head Referee': {
            requiredRoles: ['Head Referee'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'FIRST Robotics Competition Head Referee']
        },
        'Referee': {
            requiredRoles: ['Referee'],
            requiredCourses: ['FIRST Robotics Competition Referee']
        },
        'Lead Robot Inspector': {
            requiredRoles: ['Lead Robot Inspector'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'FIRST Robotics Competition Robot Inspector']
        },
        'Field Supervisor': {
            requiredRoles: ['Field Supervisor'],
            requiredCourses: ['The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'FIRST Robotics Competition Field Supervisor']
        },
        'Robot Inspector': {
            requiredRoles: ['Robot Inspector'],
            requiredCourses: ['FIRST Robotics Competition Robot Inspector']
        },
        'Lead Queuer': {
            requiredRoles: ['Lead Queuer'],
            requiredCourses: ['FIRST Robotics Competition Lead Queuer']
        },
        'Safety Manager': {
            requiredRoles: ['Safety Manager'],
            requiredCourses: ['FIRST Robotics Competition Safety Manager']
        },
        'Pit Admin Supervisor': {
            requiredRoles: ['Pit Administration Supervisor'],
            requiredCourses: ['Data Privacy for Event Volunteers', 'The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'FIRST Robotics Competition Pit Administration Supervisor']
        },
        'FIRST Technical Advisor Assistant': {
            requiredRoles: ['FIRST Technical Advisor Assistant'],
            requiredCourses: ['The Gracious Volunteer','The Gracious Volunteer - Event Volunteer', 'FIRST Technical Advisor Assistant']
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
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Scorekeeper (Lead)', 'Welcome to FIRST']
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
            requiredCourses: ['Data Privacy for Event Volunteers', 'FIRST Tech Challenge Volunteer Coordinator']
        },
        'Accommodation Coordinator': {
            requiredRoles: ['Accommodation Coordinator'],
            requiredCourses: ['Accommodation Coordinator', 'Data Privacy for Event Volunteers', 'Welcome to FIRST']
        },
        "Dean's List Reviewers": {
            requiredRoles: ["Dean's List Reviewer"],
            requiredCourses: ["FIRST Tech Challenge Dean's List Reviewer", 'Data Privacy for Event Volunteers', 'Welcome to FIRST']
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

// ============================================================
// ROLES REQUIRING CONFLICT OF INTEREST DISCLOSURE
// ============================================================
const COI_ROLES = new Set([
    'Field Supervisor', 'FIRST Technical Advisor', 'FIRST Technical Advisor Assistant',
    'Head Referee', 'Inspection Manager', 'Judge', 'Judge Advisor', 'Judge Advisor Assistant',
    'Lead Robot Inspector', 'Lead Queuer', 'Referee', 'Robot Inspector', 'Scorekeeper',
    'Judge - FIRST Leadership Award', 'Judge - FIRST Impact Award'
]);

// ============================================================
// NAME PROPER CASING
// Handles: Mc/Mac prefixes, hyphenated names, apostrophes (O'Brien)
// ============================================================
function toProperName(str) {
    if (!str) return str;

    // Split on spaces, process each word
    return str.trim().split(/\s+/).map(word => properCaseWord(word)).join(' ');
}

function properCaseWord(word) {
    if (!word) return word;

    // Handle hyphenated names: capitalize after each hyphen
    if (word.includes('-')) {
        return word.split('-').map(part => properCasePart(part)).join('-');
    }

    return properCasePart(word);
}

function properCasePart(part) {
    if (!part) return part;

    // Special prefix handling: Mc, Mac, O' — must come before lowercasing
    // Mc: McDonald → McDonald
    const mcMatch = part.match(/^(Mc|MC|mc)(.+)$/i);
    if (mcMatch) {
        return 'Mc' + capitalize(mcMatch[2]);
    }

    // Mac: MacGregor — only if followed by a capital or the full word is >4 chars
    // (avoid turning "Mac" or "Mack" into "MacK")
    const macMatch = part.match(/^(Mac|MAC|mac)([A-Z].*)$/i);
    if (macMatch && macMatch[2].length > 1) {
        return 'Mac' + capitalize(macMatch[2]);
    }

    // O'Brien, D'Angelo, L'Oreal
    const apostropheMatch = part.match(/^([A-Za-z]')(.*)/);
    if (apostropheMatch) {
        return apostropheMatch[1].toUpperCase() + capitalize(apostropheMatch[2]);
    }

    return capitalize(part);
}

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
// STATE
// ============================================================
let avData = null;      // Assigned Volunteers: { report, records }
let tcData = null;      // Training & Certifications: { report, records }
let crData = null;      // Consent & Release: { report, records }
let outputRows = [];    // Final computed rows for CSV/preview

// ============================================================
// DOM SETUP
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    setupDragAndDrop(document.getElementById('avDropzone'), document.getElementById('avInput'), (files) => loadFile(files, 'av'));
    setupDragAndDrop(document.getElementById('tcDropzone'), document.getElementById('tcInput'), (files) => loadFile(files, 'tc'));
    setupDragAndDrop(document.getElementById('crDropzone'), document.getElementById('crInput'), (files) => loadFile(files, 'cr'));

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
});

// ============================================================
// FILE LOADING
// ============================================================
function loadFile(files, type) {
    if (files.target) files = files.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith('.csv')) {
        showError('Please upload a CSV file.');
        return;
    }
    VMS.loadReport(file, NEEDS[type], { accepts: ACCEPTS[type] })
        .then((loaded) => {
            clearError();
            const dropzoneId = type === 'av' ? 'avDropzone' : type === 'tc' ? 'tcDropzone' : 'crDropzone';
            const statusId = type === 'av' ? 'avStatus' : type === 'tc' ? 'tcStatus' : 'crStatus';
            const dropzone = document.getElementById(dropzoneId);
            const statusBadge = document.getElementById(statusId);

            if (type === 'av') avData = loaded;
            else if (type === 'tc') tcData = loaded;
            else crData = loaded;
            dropzone.textContent = `✓ ${file.name}`;
            dropzone.classList.add('loaded');
            statusBadge.textContent = 'Loaded';
            statusBadge.className = 'status-badge status-loaded';

            // Enable generate button when at least AV and TC are loaded
            if (avData && tcData) {
                document.getElementById('generateBtn').disabled = false;
            }
        })
        .catch((err) => {
            if (VMS.isCancelled(err)) return;
            showError('Error reading file: ' + err.message);
        });
}

// Which VMS report each drop zone takes.
const ACCEPTS = {
    av: ['Assigned Volunteers'],
    tc: ['Training and Certifications'],
    cr: ['Consent And Release Status'],
};

// Fields read from each report (see lib/vms/fields.js).
const NEEDS = {
    av: {
        preferredFirstName: { required: true },
        lastName: { required: true },
        email: { required: true },
        rolesAssigned: { required: true },
        day: {},
        startTime: {},
        endTime: {},
        youthProtectionPolicy: {},
        caYppStatus: {},
    },
    tc: {
        preferredFirstName: { required: true },
        lastName: { required: true },
        role: { required: true },
        assignmentStatus: {},
        courseName: { required: true },
        startedDate: {},
        completionDate: {},
    },
    cr: {
        preferredFirstName: { required: true },
        lastName: { required: true },
        consentReleaseStatus: { required: true },
    },
};

// ============================================================
// TIME FORMATTING
// Converts "15:45:00" or "15:45" to "3:45 PM"
// ============================================================
function formatTime(raw) {
    if (!raw || !raw.trim()) return '';
    const parts = raw.trim().split(':');
    if (parts.length < 2) return raw.trim();
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return `${hours}:${minutes} ${ampm}`;
}

// Compare two "HH:MM:SS" time strings — returns -1, 0, or 1
function compareTimeStrings(a, b) {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
}

// ============================================================
// PROGRAM DETECTION (from certification.js logic)
// ============================================================
function detectProgram(loaded) {
    return loaded.report.meta.program || 'FRC';
}

// ============================================================
// COURSE MATCHING (from certification.js)
// ============================================================
function matchesCoursePattern(pattern, actual) {
    if (!actual) return false;
    if (pattern.startsWith('[Placeholder')) return false;
    return actual.toLowerCase().includes(pattern.toLowerCase());
}

function determineCourseStatus(course) {
    if (course.startedDate && course.completionDate) return 'complete';
    if (course.startedDate) return 'inprogress';
    return 'incomplete';
}

// ============================================================
// PARSE ASSIGNED VOLUNTEERS CSV
// Returns: Map<fullName, { firstName, lastName, email, rows: [] }>
// Each row: { role, day, startTime, endTime, yppStatus, caYppStatus }
// ============================================================
function parseAssignedVolunteers({ records }) {
    const people = {};

    records.forEach(rec => {
        const firstName = toProperName(rec.preferredFirstName);
        const lastName = toProperName(rec.lastName);
        if (!firstName && !lastName) return;
        const fullName = `${firstName} ${lastName}`.trim();

        if (!people[fullName]) {
            people[fullName] = {
                firstName,
                lastName,
                email: rec.email,
                yppStatus: rec.youthProtectionPolicy,
                caYppStatus: rec.caYppStatus,
                shifts: []  // { role, day, startTime, endTime }
            };
        }

        // Update YPP with whatever is present (should be consistent per person)
        if (rec.youthProtectionPolicy) people[fullName].yppStatus = rec.youthProtectionPolicy;
        if (rec.caYppStatus) people[fullName].caYppStatus = rec.caYppStatus;

        people[fullName].shifts.push({
            role: rec.rolesAssigned,
            day: rec.day,
            startTime: rec.startTime,
            endTime: rec.endTime
        });
    });

    return people;
}

// ============================================================
// PARSE TRAINING & CERTIFICATIONS CSV
// Returns: Map<fullName, { courses: { courseName: {startedDate, completionDate} }, assignedRoles: [] }>
// ============================================================
function parseTrainingCerts({ records }) {
    const data = {};

    records.forEach(rec => {
        const firstName = toProperName(rec.preferredFirstName);
        const lastName = toProperName(rec.lastName);
        if (!firstName && !lastName) return;
        const fullName = `${firstName} ${lastName}`.trim();
        const role = rec.role;
        const assignmentStatus = rec.assignmentStatus;
        const courseName = rec.courseName;
        const startedDate = rec.startedDate;
        const completionDate = rec.completionDate;

        if (!data[fullName]) {
            data[fullName] = { courses: {}, assignedRoles: [] };
        }
        if (role && assignmentStatus.toLowerCase() === 'assigned' && !data[fullName].assignedRoles.includes(role)) {
            data[fullName].assignedRoles.push(role);
        }
        if (courseName) {
            data[fullName].courses[courseName] = { startedDate, completionDate };
        }
    });

    return data;
}

// ============================================================
// PARSE CONSENT & RELEASE CSV
// Returns: Map<fullName, { consentStatus }>
// ============================================================
function parseConsentRelease({ records }) {
    const data = {};

    records.forEach(rec => {
        const firstName = toProperName(rec.preferredFirstName);
        const lastName = toProperName(rec.lastName);
        if (!firstName && !lastName) return;
        const fullName = `${firstName} ${lastName}`.trim();
        data[fullName] = { consentStatus: rec.consentReleaseStatus };
    });

    return data;
}

// ============================================================
// STATUS FORMATTERS
// ============================================================
function formatYPP(raw) {
    if (!raw) return '';
    if (raw.toLowerCase().includes('meets youth protection policy requirements')) return '✅Meets Requirements';
    return '⚠️Log in to your Dashboard and complete screening';
}

function formatCAYPP(raw) {
    if (!raw || raw.trim() === '') return '✅N/A';
    const lower = raw.toLowerCase();
    if (lower.includes('meets youth protection policy requirements')) return '✅Meets Requirements';
    if (lower.includes('incomplete')) return '⚠️Incomplete. You may volunteer at this event as you are under 16 hours of direct contact with students, but must complete requirements before future events. See https://cafirst.org/new-ca-volunteer-requirements/ for more details.';
    return '✅N/A';
}

function formatConsent(raw) {
    if (!raw || raw.trim() === '') return 'Unknown status';
    if (raw.toLowerCase() === 'accepted') return '✅Meets Requirements';
    return '⚠️You must log in to your Dashboard and sign the form BEFORE the event';
}

// ============================================================
// TRAINING STATUS LOGIC
// ============================================================
function getTrainingStatus(role, tcPerson, program) {
    // Special role overrides
    if (role === 'Control System Advisor') {
        return '⚠️ See this webpage for training info: https://www.firstinspires.org/community/volunteers/roles/control-system-advisor';
    }
    if (role === 'Game Announcer' || role === 'Emcee') {
        return '⚠️ See this webpage for training info: https://www.firstinspires.org/resources/library/frc/emcee-ga-training';
    }
    if (role === 'FIRST Technical Advisor') {
        return '✅Trained by HQ';
    }
    if (role === 'Scorekeeper') {
        return '⚠️ See this webpage for training info: https://www.firstinspires.org/community/volunteers/roles/scorekeeper';
    }

    // Roles that require certification checking
    const CERT_REQUIRED_ROLES = new Set([
        'Judge', 'Judge - FIRST Leadership Award', 'Judge - FIRST Impact Award', 'Judge Advisor',
        'Head Referee', 'Referee', 'Lead Robot Inspector', 'Robot Inspector', 'Lead Queuer',
        'Safety Manager', 'Field Supervisor', 'Pit Administration Supervisor',
        'Accommodation Coordinator', 'FIRST Technical Advisor Assistant'
    ]);

    if (!CERT_REQUIRED_ROLES.has(role)) {
        return 'No advanced training required.';
    }

    // Look up required courses for this role in the program config
    const programConfig = PROGRAM_CONFIGS[program] || PROGRAM_CONFIGS['FRC'];

    // Find a matching config entry by checking requiredRoles
    let matchedConfig = null;
    for (const [configKey, config] of Object.entries(programConfig)) {
        if (config.requiredRoles.includes(role)) {
            matchedConfig = config;
            break;
        }
    }

    if (!matchedConfig) {
        // Role not in config for this program - no training required
        return 'No advanced training required.';
    }

    if (!tcPerson) {
        // Person not in training report at all
        const missing = matchedConfig.requiredCourses.join(', ');
        return `⚠️${missing} Missing. Proceed to FIRST Training to complete the course(s).`;
    }

    // Check each required course
    const missingCourses = [];
    for (const pattern of matchedConfig.requiredCourses) {
        const matchingCourse = Object.keys(tcPerson.courses).find(actual =>
            matchesCoursePattern(pattern, actual)
        );
        if (!matchingCourse) {
            missingCourses.push(pattern);
        } else {
            const status = determineCourseStatus(tcPerson.courses[matchingCourse]);
            if (status !== 'complete') {
                missingCourses.push(pattern);
            }
        }
    }

    if (missingCourses.length === 0) {
        return '✅Complete';
    }
    return `⚠️${missingCourses.join(', ')} Missing. Proceed to FIRST Training to complete the course(s).`;
}

// ============================================================
// CONFLICT OF INTEREST
// ============================================================
function getConflictOfInterest(role) {
    if (COI_ROLES.has(role)) {
        return '⚠️If you are affiliated with a team competing at this event, please complete and return this form: https://www.firstinspires.org/hubfs/web/volunteer/conflict-of-interest-and-disclosure-statement.pdf';
    }
    return '✅ Not required for your role.';
}

// ============================================================
// DAY NORMALIZATION
// Assigns Day 0, 1, 2 based on sorted unique day values
// ============================================================
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDayIndex(dayStr) {
    const abbrev = dayStr.trim().substring(0, 3);
    const idx = DAY_ORDER.indexOf(abbrev);
    return idx === -1 ? 99 : idx;
}

function buildDayMap(avPeople) {
    const daySet = new Set();
    Object.values(avPeople).forEach(p => {
        p.shifts.forEach(s => { if (s.day) daySet.add(s.day.trim()); });
    });
    const sortedDays = Array.from(daySet).sort((a, b) => getDayIndex(a) - getDayIndex(b));
    const dayMap = {};
    sortedDays.forEach((d, i) => { dayMap[d.trim()] = i; });
    return dayMap;
}

// ============================================================
// MAIN GENERATE FUNCTION
// ============================================================
function generate() {
    clearError();
    outputRows = [];

    if (!avData || !tcData) {
        showError('Please upload at least the Assigned Volunteers and Training & Certifications files.');
        return;
    }

    const avPeople = parseAssignedVolunteers(avData);
    if (!avPeople) return;

    const tcPeople = parseTrainingCerts(tcData);
    if (!tcPeople) return;

    const crPeople = crData ? parseConsentRelease(crData) : {};

    const program = detectProgram(tcData);
    const dayMap = buildDayMap(avPeople);

    // Build output rows
    Object.entries(avPeople).forEach(([fullName, person]) => {
        // Group shifts by day
        const byDay = {};  // dayIndex -> { roles: Set, startTimes: [], endTimes: [] }
        person.shifts.forEach(shift => {
            const dayLabel = (shift.day || '').trim();
            const dayIdx = dayMap[dayLabel];
            if (dayIdx === undefined) return;
            if (!byDay[dayIdx]) byDay[dayIdx] = { roles: new Set(), startTimes: [], endTimes: [], dayLabel };
            if (shift.role) byDay[dayIdx].roles.add(shift.role);
            if (shift.startTime) byDay[dayIdx].startTimes.push(shift.startTime);
            if (shift.endTime) byDay[dayIdx].endTimes.push(shift.endTime);
        });

        // Get all unique roles across all days
        const allRoles = new Set();
        Object.values(byDay).forEach(d => d.roles.forEach(r => allRoles.add(r)));

        // Build day columns
        const dayColumns = {};
        const numDays = Object.keys(dayMap).length;
        for (let d = 0; d < numDays; d++) {
            if (byDay[d]) {
                const info = byDay[d];
                const rolesStr = Array.from(info.roles).join(', ');
                const earliestStart = info.startTimes.sort(compareTimeStrings)[0] || '';
                const latestEnd = info.endTimes.sort((a, b) => compareTimeStrings(b, a))[0] || '';
                const scheduleStr = (earliestStart || latestEnd)
                    ? `${formatTime(earliestStart)} - ${formatTime(latestEnd)}`
                    : '';
                dayColumns[`day${d}role`] = rolesStr;
                dayColumns[`day${d}schedule`] = scheduleStr;
            } else {
                dayColumns[`day${d}role`] = '';
                dayColumns[`day${d}schedule`] = '';
            }
        }

        // YPP
        const yppStatus = formatYPP(person.yppStatus);
        const caYppStatus = formatCAYPP(person.caYppStatus);

        // Consent
        const crPerson = crPeople[fullName];
        const consentStatus = crPerson ? formatConsent(crPerson.consentStatus) : 'Unknown status';

        // Training — evaluate per role, then deduplicate/simplify
        const tcPerson = tcPeople[fullName] || null;
        const trainingByRole = [];
        const seenTrainingRoles = new Set();
        allRoles.forEach(role => {
            if (seenTrainingRoles.has(role)) return;
            seenTrainingRoles.add(role);
            trainingByRole.push({ role, status: getTrainingStatus(role, tcPerson, program) });
        });

        let trainingStatus;
        if (trainingByRole.length === 1) {
            // Single role: just show the status, no role label
            trainingStatus = trainingByRole[0].status;
        } else {
            // Multiple roles: check if all statuses are identical
            const uniqueStatuses = new Set(trainingByRole.map(r => r.status));
            if (uniqueStatuses.size === 1) {
                // All the same — just show it once
                trainingStatus = trainingByRole[0].status;
            } else {
                // Different statuses — show each with role label
                trainingStatus = trainingByRole.map(r => `[${r.role}] ${r.status}`).join(' | ');
            }
        }

        // Conflict of Interest — most restrictive status wins, no role labels
        const coiRequired = Array.from(allRoles).some(role => COI_ROLES.has(role));
        const coiStatus = coiRequired
            ? '⚠️If you are affiliated with a team competing at this event, please complete and return this form: https://www.firstinspires.org/hubfs/web/volunteer/conflict-of-interest-and-disclosure-statement.pdf'
            : '✅ Not required for your role.';

        const outputRow = {
            'Preferred First Name': person.firstName,
            'Last Name': person.lastName,
            'Email': person.email,
        };
        for (let d = 0; d < numDays; d++) {
            outputRow[`Day ${d} Role`] = dayColumns[`day${d}role`];
            outputRow[`Day ${d} Schedule`] = dayColumns[`day${d}schedule`];
        }
        outputRow['YPP Status'] = yppStatus;
        outputRow['CA AB 506 Status'] = caYppStatus;
        outputRow['Consent and Release Status'] = consentStatus;
        outputRow['Training'] = trainingStatus;
        outputRow['Conflict of Interest'] = coiStatus;
        outputRows.push(outputRow);
    });

    if (outputRows.length === 0) {
        showError('No data found after processing. Please check your files.');
        return;
    }

    renderPreview(outputRows);
    document.getElementById('downloadBtn').style.display = 'inline-block';
    document.getElementById('resultsInfo').textContent = `✓ ${outputRows.length} volunteers processed (Program detected: ${program})`;
}

// ============================================================
// PREVIEW TABLE
// ============================================================
function renderPreview(rows) {
    if (rows.length === 0) return;
    const columns = Object.keys(rows[0]);

    const thead = document.getElementById('previewHead');
    const tbody = document.getElementById('previewBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const trHead = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col] || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    document.getElementById('previewContainer').style.display = 'block';
}

// ============================================================
// CSV DOWNLOAD
// ============================================================
function downloadCSV() {
    if (outputRows.length === 0) return;
    const csv = Papa.unparse(outputRows);
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteer_email_prep.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
