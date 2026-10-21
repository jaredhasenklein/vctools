# Conventions

## Delivery
- One branch and one pull request per logical change. CI (`.github/workflows/ci.yml`) must pass.
- Every PR targets `main`. Never stack a PR on another PR's branch: merging the lower one does not move the upper one to `main` unless that branch is deleted, so the upper PR merges into a dead branch and never deploys. When work depends on an unmerged PR, wait for the merge, then branch from the updated `main`.
- Commit messages: imperative summary line, short body explaining why.
- Every PR description ends with an "After deploy, check" section: a numbered list of what to try on the live site once it merges, or "Nothing" with the reason.

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
import { loadReport, isCancelled } from './lib/vms/index.js';

const { report, records } = await loadReport(file, {
  preferredFirstName: { required: true },
  email: { required: true },
  shirtSize: {},                                    // optional: '' when absent or skipped
}, { accepts: ['Assigned Volunteers'] });           // reports this tool is built for
// records: [{ preferredFirstName, email, shirtSize, _raw }]
```
- `report.meta` has `report`, `event`, `program` (FRC/FTC/FLL), `season`, `location`, `eventDates`, `coordinators`.
- Field keys come from `lib/vms/fields.js`. When FIRST renames a column, add the new header as an alias there.
- A tool must keep working when an optional field's column is `null`: hide or disable the feature that needs it.
- Classic (non-module) scripts can use `window.VMS` after the page loads `<script type="module" src="lib/vms/index.js">`.
- Required fields that are missing always prompt. Optional fields prompt only when the report also has new, unrecognized columns (a likely rename); otherwise they are left blank.
- Catch errors and skip the message when `VMS.isCancelled(err)` (the user closed the mapping dialog).

## One row per what?
Reports differ in what a row is: one per person (Name Badges), per shift (Assigned Volunteers, Attendance & Event Planning), or per course (Training and Certifications).
- Every tool passes `accepts` with the reports it was built for. A different report is refused with a message naming the right one, before any mapping dialog.
- A tool that produces one output per person (badges, emails, rosters) must group rows by person itself when it accepts a per-shift or per-course report.

## Page layout
- `scripts/commonscripts.js` adds the site header (VC Tools home link, extension link, light/dark switch) and footer to every page. Don't add home buttons or footers in page HTML.
- Tool pages open with the same pattern (see any tool page):
  - `.tool-head`: `<h1>` plus a one-sentence `.tool-lede`. The `<h1>` matches the tool's home page card.
  - `.tool-start`: upload box(es), `#error`, and a `.privacy-note` on the left; `<details class="tool-howto" open>` with short numbered steps on the right. On narrow screens they stack, upload first.
- Home page: hero with the "drop any report" box, then `.tool-grid` cards. Keep it fitting on a 1280x720 screen without scrolling.

## Upload boxes
Every file upload uses the shared drop zone in `scripts/commonscripts.js`:
```html
<input type="file" id="csvFile" accept=".csv" hidden>
<div id="dropzone" class="vms-drop" data-title="Assigned Volunteers report"></div>   <!-- add data-optional for optional files -->
```
- Wire it with `setupDragAndDrop(zone, input, handler)`. After a file loads, call `setDropzoneLoaded(zone, { fileName, detail: describeReport(report, '42 volunteers') })`.
- Don't style drop zones per page or write into them with `innerHTML`.

## Tools and reports
`lib/vms/tools.js` lists each tool page, its file inputs, and the reports each input accepts.
- Pages get their `accepts` from it: `VMS.acceptsFor('badge')`, `VMS.acceptsFor('emailprep', 'tc')`.
- The home page drop zone uses it to suggest tools. Add a new tool there, or it won't be suggested. `listed: false` keeps a tool out of suggestions.
- `accepts: ['*']` takes any report (the Report Viewer). Such tools are suggested after the specific ones.
- `beta: true` marks a less-tested tool. Also put `<span class="beta-tag">Beta</span>` in its home tile and page heading.
- Examples shown on a page are HTML, not screenshots, so they follow the theme. Use invented names in examples.

## Role training table
- `scripts/roleconfig.js` (`PROGRAM_CONFIGS`) lists the required training for each role, per program. Certification and Email Prep both load it; update it once per season.
- `BETA_PROGRAMS` in the same file marks programs whose role lists are incomplete (FTC and FLL today). Both tools label results for those programs Beta. Remove a program from it once its list is complete.

## Badge templates
- `lib/badges/template.js` lays out a badge from a template (text blocks with `{variables}`). `drawBadge()` draws through a surface: jsPDF for the PDF, canvas for the editor preview. Keep both on that one function so the preview matches the printout.
- Built-in templates are in `BUILT_IN_TEMPLATES`. User templates live in localStorage and export as `.json`; `normalizeTemplate()` cleans anything loaded or imported.
- To add a variable, add it to `VARIABLES` and fill it in `badgeVariables()`. To offer it as a one-click item in the editor, add it to `BLOCK_PRESETS`.
- Items can wrap (`wrap`, `maxLines`); text shrinks until it fits the box in that many lines.
- Role combining and the "Insert Common Abbreviations" rules live in `lib/badges/roles.js`.
- The editor UI says "design" and "item" (not template/block) and shows variables by their friendly labels.

## Browser extension
- Lives in `browser_extension/` (see its README). It hands reports to the site through `chrome.storage.local` (`csvData`, `csvFileName`, `targetTool`); `vctools-content.js` puts the file in the page's first CSV file input and fires `change`, so pages need no extension-specific code.
- Reports without a dedicated tool go to the home page (`targetTool: 'index'`).
- Bump `version` in `manifest.json` for every store upload, and keep `browser_extension/CHROMEWEBSTORE.md` (listing, permission justifications, privacy answers, version history) and `privacy.html` in step with the manifest.
- Follow Manifest V3 and the Chrome team's extension guidance (`npx modern-web-guidance`, skill `chrome-extensions`): only the permissions the code uses, no `host_permissions` unless a feature needs cross-origin access, async/await for `chrome.*` calls, icons at their stated sizes, no remote code. `test/extension.test.js` checks the manifest.
