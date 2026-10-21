// Email Prep is a classic page script; load it into jsdom and call its functions.
import { readFileSync } from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  window.eval(readFileSync('scripts/emailprep.js', 'utf8'));
});

describe('times', () => {
  it('sorts 24-hour and AM/PM times by clock, not text', () => {
    const times = ['10:00:00', '8:00:00', '13:30:00', '7:30 AM', '12:00 PM'];
    expect(times.sort(window.compareTimeStrings)).toEqual(['7:30 AM', '8:00:00', '10:00:00', '12:00 PM', '13:30:00']);
    expect(['', '9:00', 'junk'].sort(window.compareTimeStrings)).toEqual(['9:00', '', 'junk']);
  });
  it('formats times for people', () => {
    expect(window.formatTime('08:00:00')).toBe('8:00 AM');
    expect(window.formatTime('13:05:00')).toBe('1:05 PM');
    expect(window.formatTime('12:00 AM')).toBe('12:00 AM');
    expect(window.formatTime('TBD')).toBe('TBD');
  });
});

describe('people across reports', () => {
  it('keeps two volunteers with the same name apart when emails differ', () => {
    const av = window.parseAssignedVolunteers({ records: [
      { preferredFirstName: 'Sam', lastName: 'Lee', email: 'a@example.com', rolesAssigned: 'Judge', day: 'Sat' },
      { preferredFirstName: 'Sam', lastName: 'Lee', email: 'b@example.com', rolesAssigned: 'Referee', day: 'Sat' },
    ] });
    expect(Object.keys(av)).toHaveLength(2);
  });
  it('finds training by email, falling back to name', () => {
    const tc = window.parseTrainingCerts({ records: [
      { preferredFirstName: 'Sam', lastName: 'Lee', email: 'B@example.com', role: 'Referee', assignmentStatus: 'Assigned', courseName: 'Ref', startedDate: '1', completionDate: '2' },
    ] });
    expect(window.findPerson(tc, 'b@example.com', 'Sam Lee').courses.Ref).toBeTruthy();
    expect(window.findPerson(tc, '', 'Sam Lee')).toBeTruthy();
    expect(window.findPerson(tc, 'other@example.com', 'Pat Doe')).toBeNull();
  });
  it('splits multi-role cells', () => {
    expect(window.splitRoles('Field Reset, Queuer')).toEqual(['Field Reset', 'Queuer']);
    expect(window.splitRoles('')).toEqual([]);
  });
});
