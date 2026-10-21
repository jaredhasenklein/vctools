#!/bin/bash
# Builds the Chrome Web Store upload zip from browser_extension/.
# Usage (from the repo root): bash tools/package-extension.sh
# Output: dist/vc-tools-integration-v<version>.zip
set -euo pipefail
cd "$(dirname "$0")/../browser_extension"
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
OUT="../dist/vc-tools-integration-v${VERSION}.zip"
mkdir -p ../dist
rm -f "$OUT"
# Ship only what Chrome runs: no docs, store notes, or OS clutter.
zip -qr "$OUT" . -x "README.md" "CHROMEWEBSTORE.md" ".DS_Store" "*/.DS_Store" "Thumbs.db"
echo "Packaged $OUT"
unzip -l "$OUT"
