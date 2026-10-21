# VC Tools

Browser tools for *FIRST* Volunteer Coordinators, live at https://volunteer.systems (GitHub Pages, served from the repo root of `main`). Read `docs/CONVENTIONS.md` before changing anything.

## Non-negotiables
- Volunteer data (PII) is processed in the browser only. Never add code that sends report contents, file names, or row data to any server, analytics included.
- Every change ships as a branch + pull request. Never push to `main`.
- Never post comments, reviews, or replies on other people's PRs or issues on Jared's behalf. Draft the text in the conversation for him to post.
- The site must keep running as plain static files from the repo root. No build step is required to serve it.

## Layout
- `*.html` at the root: one page per tool. `index.html` is the landing page.
- `scripts/`: page scripts. `commonscripts.js` adds the shared top bar, footer, and theme to every page.
- `style/`: page styles. `darkmode.css` holds the dark theme.
- `browser_extension/`: the browser extension, published on the Chrome Web Store. See its README for loading it by hand in Chrome or Firefox.
- `tools/`, `test/`: dev-only checks and Vitest tests. Run `npm test` and `npm run check`.
