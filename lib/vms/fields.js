// Canonical VMS report fields, from FIRST's VMS data dictionary (revised July 2026):
// https://info.firstinspires.org/hubfs/web/volunteer/vms-data-dictionary.pdf
//
// Each key is the stable name code uses. `label` is the header as the dictionary
// names it; `aliases` are other headers FIRST has used or may use for the same field.
// When FIRST renames a column, add the new header to `aliases` here and nothing else
// needs to change.

export const FIELDS = {
  address: { label: 'Address' },
  affiliatedOrganizations: { label: 'Affiliated Organizations', aliases: ['Affiliations'] },
  age: { label: 'Age' },
  alumniStatus: { label: 'Alumni Status', aliases: ['Alumni'] },
  applicationComments: { label: 'Application Comments' },
  assignmentStatus: { label: 'Assignment Status' },
  city: { label: 'City' },
  completionDate: { label: 'Completion Date' },
  consentReleaseStatus: {
    label: 'Consent & Release Status',
    aliases: ['Consent and Release Status', 'Consent & Release', 'Consent Status'],
  },
  country: { label: 'Country' },
  courseName: { label: 'Course Name', aliases: ['Course'] },
  dateAccepted: { label: 'Date Accepted' },
  dateApplied: { label: 'Date Applied', aliases: ['Application Date'] },
  day: { label: 'Day' },
  daysAssigned: { label: 'Days Assigned' },
  daysAvailable: { label: 'Days Available' },
  daysTentativelyAssigned: { label: 'Days Tentatively Assigned' },
  dietaryRestrictions: {
    label: 'Dietary Restrictions/Allergies',
    aliases: ['Dietary Restrictions / Allergies', 'Dietary Restrictions', 'Dietary Restriction', 'Allergies'],
  },
  email: { label: 'Email', aliases: ['Email Address', 'E-mail'] },
  emergencyContact: { label: 'Emergency Contact', aliases: ['Emergency Contact Name'] },
  emergencyContactPhone: { label: 'Emergency Contact Phone Number', aliases: ['Emergency Contact Phone'] },
  employer: { label: 'Employer' },
  endTime: { label: 'End Time' },
  enrollmentDate: { label: 'Enrollment Date' },
  expertise: { label: 'Expertise' },
  youthProtectionPolicy: { label: 'FIRST Youth Protection Policy', aliases: ['Youth Protection Policy', 'YPP Status'] },
  gender: { label: 'Gender' },
  invitationStatus: { label: 'Invitation Status' },
  languagesSpoken: { label: 'Languages Spoken', aliases: ['Languages'] },
  lastName: { label: 'Last Name' },
  legalFirstName: { label: 'Legal First Name' },
  minor: { label: 'Minor' },
  numberOfEvents: { label: 'Number of Events' },
  caYppStatus: { label: 'Overall CA YPP Status' },
  paYppStatus: { label: 'Overall PA YPP Status' },
  personalPronouns: { label: 'Personal Pronouns', aliases: ['Pronouns'] },
  phone: { label: 'Phone', aliases: ['Phone Number'] },
  postalCode: { label: 'Postal Code', aliases: ['Zip Code', 'Zip'] },
  preference: { label: 'Preference' },
  preferredFirstName: { label: 'Preferred First Name', aliases: ['First Name'] },
  required: { label: 'Required?', aliases: ['Required'] },
  role: { label: 'Role' },
  rolesApplied: { label: 'Roles Applied' },
  rolesAssigned: { label: 'Roles Assigned', aliases: ['Assigned Roles'] },
  accommodations: {
    label: 'Self-Reported Accommodations',
    aliases: ['Self Reported Accommodations', 'Accommodations', 'Accommodation'],
  },
  shadowTrainee: { label: 'Shadow/Trainee', aliases: ['Shadow / Trainee', 'Shadow'] },
  shirtSize: { label: 'Shirt Size', aliases: ['T-Shirt Size', 'Shirt'] },
  startTime: { label: 'Start Time' },
  startedDate: { label: 'Started Date', aliases: ['Start Date'] },
  stateProvince: { label: 'State/ Province', aliases: ['State/Province', 'State / Province', 'State'] },
  teamAffiliation: { label: 'Team Affiliation', aliases: ['Team'] },
  timesInRole: { label: 'Times in Role' },
  yearsOfService: { label: 'Years of Service' },
};

/** Lowercase and drop everything but letters and digits, so "Shadow / Trainee" matches "shadow/trainee". */
export function normalizeHeader(text) {
  return String(text ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// normalized header -> field key, built once.
const LOOKUP = new Map();
for (const [key, def] of Object.entries(FIELDS)) {
  for (const name of [def.label, ...(def.aliases ?? [])]) {
    const norm = normalizeHeader(name);
    if (LOOKUP.has(norm) && LOOKUP.get(norm) !== key) {
      throw new Error(`Header alias "${name}" is claimed by both ${LOOKUP.get(norm)} and ${key}`);
    }
    LOOKUP.set(norm, key);
  }
}

/** Field key for a header cell, or null if it is not a known field. Exact match only, never partial. */
export function fieldForHeader(header) {
  return LOOKUP.get(normalizeHeader(header)) ?? null;
}
