// Which VC Tools page reads which VMS report. Pages take their `accepts` lists from
// here, and the home page uses it to suggest a tool for a dropped file.
//
// `inputId` is the page's file input. `listed: false` keeps a tool off the home page.

export const TOOLS = [
  {
    page: 'badge',
    name: 'Name Badge Generator',
    inputs: [{ key: 'main', inputId: 'fileInput', accepts: ['Name Badges', 'Assigned Volunteers'] }],
  },
  {
    page: 'parse',
    name: 'Volunteer List Parser',
    inputs: [{ key: 'main', inputId: 'csvFile', accepts: ['Assigned Volunteers'] }],
  },
  {
    page: 'certification',
    name: 'Certification Status Checker',
    inputs: [
      { key: 'main', inputId: 'fileInput', accepts: ['Training and Certifications'] },
      { key: 'assigned', inputId: 'assignedVolunteersInput', accepts: ['Assigned Volunteers'], optional: true },
    ],
  },
  {
    page: 'eventplanning',
    name: 'Event Planning Reporter',
    inputs: [{ key: 'main', inputId: 'csvFile', accepts: ['Attendance & Event Planning'] }],
  },
  {
    page: 'emailprep',
    name: 'Volunteer Email Prep',
    listed: false,
    inputs: [
      { key: 'av', inputId: 'avInput', accepts: ['Assigned Volunteers'] },
      { key: 'tc', inputId: 'tcInput', accepts: ['Training and Certifications'] },
      { key: 'cr', inputId: 'crInput', accepts: ['Consent And Release Status'] },
    ],
  },
];

/** Report names a page's input accepts, e.g. acceptsFor('badge') or acceptsFor('emailprep', 'tc'). */
export function acceptsFor(page, key = 'main') {
  const input = TOOLS.find((t) => t.page === page)?.inputs.find((i) => i.key === key);
  if (!input) throw new Error(`No input "${key}" for tool "${page}" in lib/vms/tools.js`);
  return input.accepts;
}
