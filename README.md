# VC Tools

**VC Tools** is a  suite of tools for *FIRST* Volunteer Coordinators and event organizers to make event management easier and more efficient. This project is created by the community and isn't officially connected to *FIRST*. Everything here is provided as-is, without any warranty. The tooling is designed to complement the official Volunteer Management System (VMS). If you are not yet a VMS user, these may not be the tools for you -- contact your Program Delivery Partner for more info.


## Table of Contents

- [Purpose](#purpose)
- [Disclaimer](#disclaimer)
- [Contribution Guidelines](#contribution-guidelines)
- [Libraries](#libraries)

## Purpose

The main goal of VC Tools is to make life easier for *FIRST* event organizers and volunteer coordinators. From scheduling to coordination, these tools aim to streamline various tasks.

## Disclaimer

This tool is unofficial and not approved by *FIRST*. It is not governed by, and is not necessarily compliant with, *FIRST*'s privacy policy or terms of use. Use these tools at your own risk.

## Contribution Guidelines

Contributions are welcome! Here are a few things to keep in mind:

- **Pull Requests:** Submit pull requests to add your contributions.
- **Issues:** Feel free to document bugs or request features using the Issues tab.
- **Privacy:** Personal Identifiable Information (PII) should only be processed client-side (like with JavaScript). This project will not send PII to any servers.
- **AI and External Tools:** Using AI and other tools is welcome. Just make sure to cite any tools used that aren't already mentioned.

## Development

The site is static files served by GitHub Pages; open any `.html` file through a local server (for example `python3 -m http.server`). Checks and tests need Node 22:

```
npm ci
npm run check
npm test
```

## Libraries

VC Tools is made better with the help of:

- [Bootstrap](https://getbootstrap.com/docs/)
- [jspdf](https://parall.ax/products/jspdf)
