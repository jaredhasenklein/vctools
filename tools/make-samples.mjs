#!/usr/bin/env node
// Writes the sample VMS reports in samples/ that the "Try it with sample data" buttons load.
// Every name, email and phone number is invented. Run again after changing the roster below:
//   node tools/make-samples.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Papa from 'papaparse';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'samples');
mkdirSync(out, { recursive: true });

const EVENT = 'CA District Sample Event - FRC';
const LOCATION = 'Springfield, CA';
const DATES = 'March 12 - 14, 2027';
const SEASON = '2027 - BIOCOREâ„¢ presented by Haas'; // the export's own mis-encoding, kept on purpose
const COORDINATORS = ['Sam Example'];

// [first, last, pronouns, minor, [roles], days, languages, diet, shirt, years, trainingDone (0..1), consent]
const ROSTER = [
  ['Avery', 'Nakamura', 'she/her', 'No', ['Judge Advisor'], ['Thu', 'Fri', 'Sat'], 'English, Japanese', 'None', 'M', 12, 1, true],
  ['Marcus', 'Bell', 'he/him', 'No', ['Judge'], ['Fri', 'Sat'], 'English', 'Vegetarian', 'L', 6, 1, true],
  ['Priya', 'Raman', 'she/her', 'No', ['Judge - FIRST Impact Award'], ['Fri', 'Sat'], 'English, Tamil', 'Vegetarian', 'S', 8, 1, true],
  ['Diego', 'Flores', 'he/him', 'No', ['Judge'], ['Fri', 'Sat'], 'English, Spanish', 'None', 'L', 3, 0.5, true],
  ['Hannah', 'Okafor', 'she/her', 'No', ['Judge - FIRST Leadership Award'], ['Fri', 'Sat'], 'English', 'Gluten free', 'M', 4, 0, false],
  ['Tomás', 'Ruiz', 'he/him', 'No', ['Head Referee'], ['Thu', 'Fri', 'Sat'], 'English, Spanish', 'None', 'XL', 10, 1, true],
  ['Grace', 'Liu', 'she/her', 'No', ['Referee'], ['Fri', 'Sat'], 'English, Mandarin', 'None', 'S', 5, 1, true],
  ['Owen', 'Pryce', 'he/him', 'No', ['Referee'], ['Fri', 'Sat'], 'English', 'Nut allergy', 'L', 2, 0, true],
  ['Nadia', 'Haddad', 'she/her', 'No', ['Referee'], ['Sat'], 'English, Arabic', 'Halal', 'M', 1, 1, false],
  ['Ben', 'Carver', 'he/him', 'No', ['Lead Robot Inspector'], ['Thu', 'Fri'], 'English', 'None', 'XXL', 9, 1, true],
  ['Sofia', 'Marino', 'she/her', 'No', ['Robot Inspector'], ['Thu', 'Fri'], 'English, Italian', 'None', 'M', 3, 1, true],
  ['Kai', 'Morgan', 'they/them', 'No', ['Robot Inspector'], ['Thu', 'Fri'], 'English', 'Vegan', 'M', 2, 0.5, true],
  ['Ruth', 'Adeyemi', 'she/her', 'No', ['Field Supervisor'], ['Thu', 'Fri', 'Sat'], 'English, Yoruba', 'None', 'L', 7, 1, true],
  ['Leo', 'Grant', 'he/him', 'Yes', ['Field Reset'], ['Fri', 'Sat'], 'English', 'None', 'M', 1, 1, true],
  ['Maya', 'Singh', 'she/her', 'Yes', ['Field Reset'], ['Fri', 'Sat'], 'English, Punjabi', 'Vegetarian', 'S', 2, 1, false],
  ['Eli', 'Brooks', 'he/him', 'No', ['Lead Queuer'], ['Fri', 'Sat'], 'English', 'None', 'L', 4, 0, true],
  ['Zoe', 'Park', 'she/her', 'Yes', ['Queuer'], ['Fri', 'Sat'], 'English, Korean', 'None', 'S', 1, 1, true],
  ['Isaac', 'Thompson', 'he/him', 'No', ['Safety Manager'], ['Thu', 'Fri', 'Sat'], 'English', 'None', 'XL', 11, 1, true],
  ['Lena', 'Weber', 'she/her', 'No', ['Pit Administration Supervisor'], ['Thu', 'Fri', 'Sat'], 'English, German', 'None', 'M', 6, 1, true],
  ['Andre', 'Dubois', 'he/him', 'No', ['Pit Administration'], ['Fri', 'Sat'], 'English, French', 'Shellfish allergy', 'L', 2, 1, true],
  ['Chloe', 'Kim', 'she/her', 'Yes', ['Pit Administration'], ['Sat'], 'English, Korean', 'None', 'S', 1, 0, false],
  ['Victor', 'Osei', 'he/him', 'No', ['Scorekeeper'], ['Fri', 'Sat'], 'English', 'None', 'L', 5, 1, true],
  ['Ivy', 'Chen', 'she/her', 'No', ['Game Announcer'], ['Fri', 'Sat'], 'English, Cantonese', 'None', 'M', 3, 1, true],
  ['Sam', 'Example', 'Not Specified', 'No', ['Volunteer Coordinator'], ['Thu', 'Fri', 'Sat'], 'English', 'None', 'L', 8, 1, true],
];
const HOURS = { Thu: ['12:00 PM', '6:00 PM'], Fri: ['7:30 AM', '6:30 PM'], Sat: ['7:30 AM', '6:00 PM'] };

// Courses each role needs, from the site's own role table.
const roleSrc = readFileSync(join(root, 'scripts', 'roleconfig.js'), 'utf8');
const PROGRAM_CONFIGS = new Function(`${roleSrc}; return PROGRAM_CONFIGS;`)();
const coursesFor = (role) => {
  const cfg = Object.values(PROGRAM_CONFIGS.FRC).find((c) => c.requiredRoles.includes(role));
  const list = cfg ? cfg.requiredCourses.filter((c) => !c.startsWith('[Placeholder')) : [];
  // "The Gracious Volunteer" and its "- Event Volunteer" variant are alternatives; take one.
  return list.filter((c) => c !== 'The Gracious Volunteer - Event Volunteer');
};

const people = ROSTER.map(([first, last, pronouns, minor, roles, days, languages, diet, shirt, years, done, consent], i) => ({
  first, last, legalFirst: first, pronouns, minor, roles, days, languages, diet, shirt, years, done, consent,
  email: `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase()}@example.com`,
  phone: `555-01${String(i).padStart(2, '0')}`,
}));

function preamble(report) {
  return [
    `Report: ${report}`, 'Date: 2/20/2027', '',
    `Event: ${EVENT}`, `Location: ${LOCATION}`, `Event Dates: ${DATES}`, `Season: ${SEASON}`, '',
    'Volunteer Coordinator(s)', ...COORDINATORS, '',
    'WARNING: This file contains personal data (L1 - PII).',
    'This is invented sample data for trying out VC Tools. None of these people are real.',
    '', '', '', '', '',
  ].join('\n');
}
function write(file, report, rows) {
  writeFileSync(join(out, file), `${preamble(report)}\n${Papa.unparse(rows)}\n`);
}

const shifts = people.flatMap((p) => p.days.flatMap((day) => p.roles.map((role) => ({ p, day, role }))));
const ypp = (p) => (p.done > 0 ? 'Meets Youth Protection Policy Requirements' : 'Incomplete');

write('assigned-volunteers.csv', 'Assigned Volunteers', shifts.map(({ p, day, role }) => ({
  Minor: p.minor, 'Legal First Name': p.legalFirst, 'Preferred First Name': p.first, 'Last Name': p.last,
  'Personal Pronouns': p.pronouns, Email: p.email, Phone: p.phone, 'Roles Assigned': role, 'Languages Spoken': p.languages,
  Day: day, 'Start Time': HOURS[day][0], 'End Time': HOURS[day][1],
  'FIRST Youth Protection Policy': ypp(p), 'Overall CA YPP Status': ypp(p), 'Overall PA YPP Status': '',
})));

write('attendance-and-event-planning.csv', 'Attendance & Event Planning', shifts.map(({ p, day, role }) => ({
  Minor: p.minor, 'Preferred First Name': p.first, 'Last Name': p.last, Email: p.email, 'Roles Assigned': role,
  Day: day, 'Start Time': HOURS[day][0], 'End Time': HOURS[day][1], 'Dietary Restrictions/Allergies': p.diet,
  'Shirt Size': p.shirt, 'Years of Service': p.years, 'Consent & Release Status': p.consent ? 'Accepted' : 'Incomplete',
})));

write('name-badges.csv', 'Name Badges', people.map((p) => ({
  Minor: p.minor, 'Preferred First Name': p.first, 'Last Name': p.last, 'Personal Pronouns': p.pronouns,
  'Roles Assigned': p.roles.join(', '), 'Languages Spoken': p.languages,
})));

write('consent-and-release-status.csv', 'Consent And Release Status', people.map((p) => ({
  Minor: p.minor, 'Preferred First Name': p.first, 'Last Name': p.last, 'Consent & Release Status': p.consent ? 'Accepted' : 'Incomplete',
  'Date Accepted': p.consent ? '1/15/2027' : '', Email: p.email, Phone: p.phone, 'Assignment Status': 'Assigned',
})));

const training = [];
for (const p of people) {
  const courses = [...new Set(p.roles.flatMap(coursesFor))];
  courses.forEach((course, i) => {
    const complete = i < Math.round(courses.length * p.done);
    training.push({
      Minor: p.minor, 'Preferred First Name': p.first, 'Last Name': p.last, Email: p.email, Phone: p.phone,
      Role: p.roles.join(', '), 'Assignment Status': 'Assigned', 'Course Name': course,
      'Enrollment Date': '1/10/2027', 'Started Date': complete || p.done > 0 ? '1/12/2027' : '',
      'Completion Date': complete ? '1/20/2027' : '', 'Required?': 'Yes',
    });
  });
}
write('training-and-certifications.csv', 'Training and Certifications', training);

console.log(`Wrote ${shifts.length} shifts for ${people.length} invented volunteers to samples/`);
