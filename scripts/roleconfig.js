// Programs whose role lists are still being filled in. Tools label them Beta.
const BETA_PROGRAMS = new Set(['FTC', 'FLL']);

// Required training for each role, per program. Shared by the Certification Status
// Checker and Volunteer Email Prep, so a season update happens in one place.
//
// requiredRoles: role names as they appear in VMS reports.
// requiredCourses: course names (or the start of them) from the Training and Certifications report.
// A course name starting with "[Placeholder" never matches; use it for courses FIRST hasn't published yet.
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
