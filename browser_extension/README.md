# VC Tools browser extension

Adds two buttons next to **Export** on every VMS report page:

- **✨ Open in VC Tools**: sends the report straight to the matching tool (Name Badges, Training and Certifications, Assigned Volunteers, Attendance & Event Planning). Any other report opens on the VC Tools home page, which shows every tool that can use it, including the Report Viewer.
- **📊 Open in Google Sheets**: copies the report and opens a new Google Sheet to paste it into.

It also adds an optional cleaner style for VMS pages and marks reports that have a VC Tools tool with ✨.

The report goes from the VMS tab to the VC Tools tab through the extension's own storage on your computer, and is deleted as soon as the tool reads it. Nothing is sent anywhere else.

## Install

### Chrome, Edge, Brave, and other Chromium browsers (recommended)
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/vc-tools-integration/bgndacoknekjiadmlogmnechjnabggjf). It updates itself.

### Chromium browsers, by hand
Use this to try a version before it reaches the store.
1. On the [repository page](https://github.com/jaredhasenklein/vctools), click **Code → Download ZIP** and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `browser_extension` folder.
4. To update later, download again and click the reload arrow on the extension's card.

### Firefox, by hand
The extension isn't published for Firefox. You can load it yourself, but Firefox removes extensions loaded this way when it quits, so you'll repeat these steps each time you start Firefox.
1. Download and unzip the repository as in step 1 above.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and choose `browser_extension/manifest.json`.
4. Open `about:addons`, click **VC Tools Integration → Permissions**, and allow access to `firstinspires.org`, `volunteer.systems`, and `docs.google.com`. Firefox doesn't grant these by default, and without them the buttons won't appear.

Firefox 128 or newer is required.

## Files
| File | Runs on | Does |
|---|---|---|
| `vms-content.js` | VMS report pages | Adds the two buttons; fetches the export |
| `vctools-content.js` | volunteer.systems | Puts a handed-off report into the page's file input |
| `reports-content.js` | VMS event page | Marks reports that have a tool |
| `vms-style-toggle.js` | VMS pages | Optional cleaner VMS styling |
| `google-sheets-content.js` | Google Sheets | Shows "click A1 and paste" after a Sheets export |

## Publishing a Chrome Web Store update
1. Bump `version` in `manifest.json`.
2. Zip the **contents** of this folder (not the folder itself), leaving out `README.md`.
3. Upload the zip in the Chrome Web Store Developer Dashboard.

Don't commit the zip; GitHub keeps the history.
