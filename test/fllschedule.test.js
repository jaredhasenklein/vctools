import { describe, it, expect } from 'vitest';
import { buildSchedule, parseTeams, parseClock, formatClock } from '../lib/fll/schedule.js';

// Deterministic "random" so failures are reproducible.
function seeded(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
const base = {
  gameTime: 2.5, resetTime: 7.5, judgingTime: 30, deliberationTime: 10, minGap: 15,
  judgingRooms: 4, gameTables: 4, robotRounds: 3,
  start: parseClock('08:30'), lunchStart: parseClock('12:00'), lunchEnd: parseClock('13:00'),
};
const teams = (n) => Array.from({ length: n }, (_, i) => i + 1);

describe('inputs', () => {
  it('parses team lists and rejects bad ones', () => {
    expect(parseTeams(' 1, 2,30 ')).toEqual([1, 2, 30]);
    expect(() => parseTeams('1,,x')).toThrow('"x" is not a team number.');
    expect(() => parseTeams('4,5,4')).toThrow('Team 4 is listed more than once.');
    expect(() => parseTeams('')).toThrow(/at least one/);
  });
  it('formats clock times', () => {
    expect(formatClock(parseClock('08:30'))).toBe('8:30AM');
    expect(formatClock(parseClock('12:05'))).toBe('12:05PM');
    expect(formatClock(13 * 60 + 2.5)).toBe('1:03PM');
  });
  it('rejects zero rooms, NaN, and backwards lunch', () => {
    expect(() => buildSchedule({ ...base, teams: teams(4), judgingRooms: 0 })).toThrow(/judging rooms/);
    expect(() => buildSchedule({ ...base, teams: teams(4), gameTime: NaN })).toThrow(/Robot game duration/);
    expect(() => buildSchedule({ ...base, teams: teams(4), lunchEnd: base.lunchStart })).toThrow(/Lunch/);
  });
});

describe('buildSchedule', () => {
  for (const n of [5, 12, 24, 48]) {
    it(`schedules ${n} teams with every rule satisfied`, () => {
      const s = buildSchedule({ ...base, teams: teams(n), random: seeded(n) });
      for (const [team, acts] of s.teamActivities) {
        expect(acts.filter((a) => a.type === 'Judging')).toHaveLength(1);
        const games = acts.filter((a) => a.type.startsWith('Robot'));
        expect(games.map((a) => a.type)).toEqual(['Robot Round 1', 'Robot Round 2', 'Robot Round 3']);
        for (let i = 1; i < games.length; i++) expect(games[i].start).toBeGreaterThanOrEqual(games[i - 1].end);
        for (const a of acts) {
          // Robot games never touch lunch (judging may; see the toggle tests).
          if (a.type !== 'Judging') expect(a.end <= base.lunchStart || a.start >= base.lunchEnd).toBe(true);
          // Minimum gap between a team's activities.
          for (const b of acts) if (a !== b) expect(a.end + base.minGap <= b.start || b.end + base.minGap <= a.start, `team ${team}`).toBe(true);
        }
      }
      // No table or room is double-booked.
      for (const slot of [...s.judging, ...s.robot]) {
        const used = slot.teams.filter((t) => t !== null);
        expect(new Set(used).size).toBe(used.length);
      }
    });
  }

  it('judges through lunch by default, and pauses when asked', () => {
    // 4 rooms x 40-minute slots from 10:40 puts sessions across noon.
    const opts = { ...base, teams: teams(24), start: parseClock('10:40'), random: seeded(2) };
    const inLunch = (s) => [...s.teamActivities.values()].flat()
      .some((a) => a.type === 'Judging' && a.start < base.lunchEnd && a.end > base.lunchStart);
    expect(inLunch(buildSchedule(opts))).toBe(true);
    expect(inLunch(buildSchedule({ ...opts, judgingDuringLunch: false }))).toBe(false);
  });

  it('handles a large event that the old shared retry limit could not', () => {
    const s = buildSchedule({ ...base, teams: teams(60), gameTables: 6, judgingRooms: 6, robotRounds: 4, lunchEnd: parseClock('12:30'), random: seeded(7) });
    expect(s.robot.length).toBeGreaterThan(0);
  });

  it('says so when the event does not fit in a day', () => {
    expect(() => buildSchedule({ ...base, teams: teams(200), gameTables: 1, random: seeded(3) })).toThrow(/doesn't fit in one day/);
  });
});
