# Conventions

## Delivery
- One branch and one pull request per logical change. CI (`.github/workflows/ci.yml`) must pass.
- Commit messages: imperative summary line, short body explaining why.

## Code
- Plain JavaScript, no framework. New shared code goes in ES modules; page scripts may stay classic scripts until they are ported.
- Styles live in `style/*.css`, not in JS template strings.
- Use PapaParse for all CSV reading. Do not split CSV text on commas or newlines by hand.
- Read report columns by header name through the shared parser, never by position or fixed row number.

## VMS reports
All VMS report exports share one shape:
- Rows 1 to 18: a preamble. `Report:` (report name), `Date:`, `Event:` (name ending in `- FRC`, `- FTC`, or `- FLL`), `Location:`, `Event Dates:`, `Season:`, the Volunteer Coordinator list, and a PII warning block.
- Row 19: column headers. Row 20 onward: data.
- FIRST adds, renames, and removes columns and may change the preamble length. Code must locate the header row by content and tolerate those changes.
- Exports can contain mis-encoded characters (for example `â„¢` for `™`). Normalize when displaying preamble text.
- The authoritative field reference is FIRST's VMS data dictionary: https://info.firstinspires.org/hubfs/web/volunteer/vms-data-dictionary.pdf

## Testing
- `npm run check` parses every script; `npm test` runs Vitest in jsdom.
- Never commit real report exports. Test fixtures must be synthetic.

## Reading a report (lib/vms)
```js
import { readReportFile, resolveWithUser, toRecords } from './lib/vms/index.js';

const report = await readReportFile(file);          // finds the header row, reads the preamble
const columns = await resolveWithUser(report, {     // asks the user only about missing fields
  preferredFirstName: { required: true },
  email: { required: true },
  shirtSize: {},                                    // optional: null if skipped
});
const people = toRecords(report, columns);          // [{ preferredFirstName, email, shirtSize, _raw }]
```
- `report.meta` has `report`, `event`, `program` (FRC/FTC/FLL), `season`, `location`, `eventDates`, `coordinators`.
- Field keys come from `lib/vms/fields.js`. When FIRST renames a column, add the new header as an alias there.
- A tool must keep working when an optional field's column is `null`: hide or disable the feature that needs it.
- Classic (non-module) scripts can use `window.VMS` after the page loads `<script type="module" src="lib/vms/index.js">`.
