# Chrome Web Store Listing — VC Tools Integration

> Last Updated: 2026-10-21 (privacy disclosure corrected)
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
**What user data does the extension handle?** Check **Personally identifiable information** and **Website content** only.

The Chrome Web Store requires disclosing data the extension handles even when it never leaves the device ("Extensions are required to disclose how they handle user data, even when data is processed or stored locally on a user's device", [User Data FAQ](https://developer.chrome.com/docs/webstore/user_data/)). VMS reports contain volunteer names, emails, phone numbers, and addresses, and the extension moves that report between the user's own tabs and onto their clipboard.

| Data Type | Check it? | Transmitted Off-Device? | Why |
|-----------|-----------|------------------------|-----|
| Personally identifiable information | ✅ Yes | No | VMS report contents (volunteer names, emails, phones, addresses) passed from the VMS tab to VC Tools or the clipboard at the user's request |
| Website content | ✅ Yes | No | The VMS report export itself |
| Health information | No | | Not handled. Reports can include self-reported dietary or accommodation notes, but the extension only passes the report through and never reads or uses those fields. |
| Financial and payment information | No | | |
| Authentication information | No | | |
| Personal communications | No | | |
| Location | No | | Addresses are in the report, covered under PII |
| Web history | No | | Runs only on its three pages; records nothing about browsing |
| User activity | No | | Responds to clicks on its own buttons; logs nothing |

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
