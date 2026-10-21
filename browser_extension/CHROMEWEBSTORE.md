# Chrome Web Store Listing — VC Tools Integration

> Last Updated: 2026-10-21
> Not packaged with the extension. Copy fields from here into the Chrome Web Store Developer Dashboard.

## Store Listing

**Extension Name**
VC Tools Integration

**Short Description** (132 max; matches manifest)
Adds buttons to open VMS reports in VC Tools or Google Sheets, and improves VMS styling

**Detailed Description**
Open FIRST VMS reports in VC Tools or Google Sheets with one click, without downloading and re-uploading files.

On every VMS report page, the extension adds two buttons next to Export:
Open in VC Tools: sends the report straight to the matching VC Tools page (Name Badges, Training and Certifications, Assigned Volunteers, Attendance & Event Planning). Any other report opens on the VC Tools home page, which shows every tool that can use it, including a searchable report viewer.
Open in Google Sheets: copies the report and opens a new Google Sheet, ready to paste into cell A1. Commas, quotes, and multi-line comments stay in one cell.

It also offers an optional cleaner style for VMS pages and marks reports on the event page that have a VC Tools tool.

How to use:
1. Open your event in VMS and click All Reports.
2. Open any report.
3. Click Open in VC Tools or Open in Google Sheets.

Privacy: reports go straight from the VMS tab to the VC Tools tab in your browser and are deleted as soon as the tool reads them. The extension collects nothing and sends nothing to any server. VC Tools processes reports entirely in your browser.

VC Tools is a volunteer project and is not affiliated with or endorsed by FIRST. Questions and feedback: https://github.com/jaredhasenklein/vctools/issues

**Category**
Productivity

**Single Purpose**
Sends a FIRST VMS report to VC Tools or Google Sheets with one click from the report page.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | icon128.png |
| Screenshot 1 | 1280×800 | 🟡 Needs update (new site header and home page) | VMS report with the two buttons |
| Screenshot 2 | 1280×800 | 🟡 Needs update | VC Tools home page after Open in VC Tools on a Judges report |
| Small Promo Tile | 440×280 | ⬜ Optional | |

### Screenshot Notes
Use a test event or blur volunteer names and emails. Screenshots must not show real volunteer PII.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| storage | permissions | Holds the report the user chose to send, between the moment they click "Open in VC Tools" on the VMS tab and the moment the VC Tools tab opens and reads it. Deleted immediately after. Also remembers the user's on/off choice for the optional VMS styling. |
| clipboardWrite | permissions | "Open in Google Sheets" copies the report to the clipboard so the user can paste it into the new sheet. Write only; the extension never reads the clipboard. |
| https://my.firstinspires.org/VMS/* | content script match | Adds the "Open in VC Tools" and "Open in Google Sheets" buttons to VMS report pages, marks reports that have a tool on the event page, and applies the optional styling. Requests the report export from the page the user is on, the same request VMS's own Export button makes. |
| https://volunteer.systems/* | content script match | Puts the report the user just sent into the VC Tools page's file upload so it loads automatically. |
| https://docs.google.com/spreadsheets/* | content script match | Shows a short "click A1 and paste" tip in the new Google Sheet after "Open in Google Sheets". Reads nothing from the sheet. |

No `host_permissions`, `tabs`, `scripting`, or remote code.

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** No.
The extension handles website content (VMS report contents, which include volunteer names and contact details) only to move it between the user's own tabs on their own computer. Nothing is collected, stored beyond the hand-off, or transmitted off the device by the extension.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No (handled locally only) | No | Moves the user's report to VC Tools in their browser | No |
| Website content | No (handled locally only) | No | Same | No |
| All other categories | No | No | | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy
**Privacy Policy URL**: https://volunteer.systems/privacy

## Distribution
**Visibility**: Public
**Regions**: All regions

## Developer Info
**Publisher Name**: Jared Hasen-Klein
**Contact Email**: tools@jaredhk.com
**Support URL**: https://github.com/jaredhasenklein/vctools/issues
**Homepage URL**: https://volunteer.systems

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.3 | 2026-10-21 | Open in VC Tools on every report (others open on the home page). Reports keep accented names and symbols. Google Sheets keeps commas, quotes, and line breaks in one cell. Removed broad firstinspires.org access and an unused background script. Correct icon sizes. | Draft |
| 1.2 | | Previous store version | Published |

## Review Notes

### Known Issues / Limitations
- The manifest includes `browser_specific_settings` (a Firefox add-on id). Chrome ignores it and shows "Unrecognized manifest key" on chrome://extensions; it does not affect the store.
- VMS can change its page layout; if the Export button's id changes, the buttons won't appear.

### Rejection History
None.
