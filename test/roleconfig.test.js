import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// `const` at the top of a classic script doesn't become a window property, so read it out.
const { PROGRAM_CONFIGS, BETA_PROGRAMS } = new Function(`${readFileSync('scripts/roleconfig.js', 'utf8')}; return { PROGRAM_CONFIGS, BETA_PROGRAMS };`)();

describe('role → training table', () => {
  it('covers FRC, FTC, and FLL', () => {
    expect(Object.keys(PROGRAM_CONFIGS).sort()).toEqual(['FLL', 'FRC', 'FTC']);
  });

  it('every role names VMS roles and at least one course', () => {
    for (const [program, roles] of Object.entries(PROGRAM_CONFIGS)) {
      for (const [name, cfg] of Object.entries(roles)) {
        expect(cfg.requiredRoles?.length, `${program} ${name}`).toBeGreaterThan(0);
        expect(cfg.requiredCourses?.length, `${program} ${name}`).toBeGreaterThan(0);
        for (const c of [...cfg.requiredRoles, ...cfg.requiredCourses]) expect(c.trim(), `${program} ${name}`).toBe(c);
      }
    }
  });

  it('marks FTC and FLL as beta, FRC as fully supported', () => {
    expect([...BETA_PROGRAMS].sort()).toEqual(['FLL', 'FTC']);
  });

  it('is the only copy', () => {
    for (const f of ['scripts/certification.js', 'scripts/emailprep.js']) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/const PROGRAM_CONFIGS\s*=/);
    }
  });
});
