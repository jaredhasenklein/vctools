// Parses every site and extension script so a syntax error fails CI before it ships.
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dirs = ['scripts', 'browser_extension', 'lib/vms', 'lib/fll', 'lib/badges'];
let failed = 0;
for (const dir of dirs) {
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    try {
      execFileSync(process.execPath, ['--check', join(dir, f)], { stdio: 'pipe' });
    } catch (e) {
      failed++;
      console.error(`${join(dir, f)}\n${e.stderr}`);
    }
  }
}
if (failed) process.exit(1);
console.log('All scripts parse.');
