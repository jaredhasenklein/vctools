// Smoke test: the shared page chrome (top bar, footer, theme) builds without errors.
import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeEach } from 'vitest';

const src = readFileSync('scripts/commonscripts.js', 'utf8');

describe('commonscripts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<main></main>';
    window.history.replaceState({}, '', '/badge.html');
    // jsdom has no matchMedia; the theme toggle reads the OS preference through it.
    window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  });

  it('adds the top bar, footer, and dark mode stylesheet', async () => {
    window.eval(src);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.getElementById('top-bar')).not.toBeNull();
    expect(document.querySelector('.footer')).not.toBeNull();
    expect(document.querySelector('link[href="style/darkmode.css"]')).not.toBeNull();
  });
});
