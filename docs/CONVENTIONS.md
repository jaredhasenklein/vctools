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
