import { describe, it, expect } from 'vitest';
import { formatRole, suggestAbbreviation } from '../lib/badges/roles.js';

describe('badge roles', () => {
  it('combines roles and drops Field Assembly unless alone', () => {
    expect(formatRole(['Judge', 'Field Assembly'])).toBe('JUDGE');
    expect(formatRole(['Field Assembly'])).toBe('FIELD ASSEMBLY');
    expect(formatRole(['Volunteer Coordinator', ' Judge Advisor '])).toBe('VOLUNTEER COORDINATOR / JUDGE ADVISOR');
  });
  it('uses initials when a badge has several roles', () => {
    expect(suggestAbbreviation('VOLUNTEER COORDINATOR / JUDGE ADVISOR')).toBe('VC / JA');
    expect(suggestAbbreviation('FIELD RESET / QUEUER')).toBe('FR / QUEUER');
    expect(suggestAbbreviation('JUDGE - FIRST IMPACT AWARD / REFEREE')).toBe('JFIA / REFEREE');
  });
  it('swaps long words in a single role', () => {
    expect(suggestAbbreviation('JUDGE ADVISOR')).toBe('JUDGE ADVSR.');
    expect(suggestAbbreviation('PIT ADMINISTRATION SUPERVISOR')).toBe('PIT ADMINISTRATION SUP.');
    expect(suggestAbbreviation('JUDGE - FIRST IMPACT AWARD')).toBe('JUDGE');
    expect(suggestAbbreviation('REFEREE')).toBe('REFEREE');
  });
});
