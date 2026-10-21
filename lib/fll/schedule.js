// FLL Challenge tournament scheduler: judging sessions and robot game rounds.
// Pure functions, no DOM, so it can be tested. Times are minutes after midnight.

/** "08:30" -> 510 */
export function parseClock(text) {
  const m = String(text ?? '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) throw new Error(`"${text}" is not a time.`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 510 -> "8:30AM" */
export function formatClock(minutes) {
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(mins).padStart(2, '0')}${period}`;
}

/** "1, 2,3" -> [1, 2, 3]. Rejects blanks, non-numbers, and duplicates. */
export function parseTeams(text) {
  const parts = String(text ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error('Enter at least one team number.');
  const teams = parts.map((p) => {
    if (!/^\d+$/.test(p)) throw new Error(`"${p}" is not a team number.`);
    return Number(p);
  });
  const dupes = teams.filter((t, i) => teams.indexOf(t) !== i);
  if (dupes.length) throw new Error(`Team ${dupes[0]} is listed more than once.`);
  return teams;
}

function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

/** First start time >= `start` where [start, start + duration) does not touch lunch. */
function skipLunch(start, duration, lunchStart, lunchEnd) {
  return overlaps(start, start + duration, lunchStart, lunchEnd) ? lunchEnd : start;
}

const END_OF_DAY = 24 * 60;

/**
 * Build a schedule.
 * @param {object} o
 * @param {number[]} o.teams
 * @param {number} o.gameTime, o.resetTime, o.judgingTime, o.deliberationTime, o.minGap  minutes
 * @param {number} o.judgingRooms, o.gameTables, o.robotRounds
 * @param {number} o.start, o.lunchStart, o.lunchEnd  minutes after midnight
 * @param {() => number} [o.random]  for tests; defaults to Math.random
 * @returns {{ judging, robot, teamActivities: Map, judgingEnd: number, robotEnd: number }}
 * @throws {Error} with a message for the user when inputs are invalid or it doesn't fit in a day
 */
export function buildSchedule(o) {
  const random = o.random ?? Math.random;
  const positive = { gameTime: 'Robot game duration', judgingTime: 'Judging session duration', judgingRooms: 'Number of judging rooms', gameTables: 'Number of robot game tables', robotRounds: 'Number of robot rounds' };
  for (const [key, label] of Object.entries(positive)) {
    if (!(o[key] > 0)) throw new Error(`${label} must be more than 0.`);
  }
  for (const [key, label] of Object.entries({ resetTime: 'Reset duration', deliberationTime: 'Deliberation', minGap: 'Minimum time between activities' })) {
    if (!(o[key] >= 0)) throw new Error(`${label} can't be negative.`);
  }
  for (const key of ['judgingRooms', 'gameTables', 'robotRounds']) {
    if (!Number.isInteger(o[key])) throw new Error('Rooms, tables, and rounds must be whole numbers.');
  }
  if (o.lunchEnd <= o.lunchStart) throw new Error('Lunch must end after it starts.');

  const teams = [...o.teams];
  const roundDuration = o.gameTime + o.resetTime;
  const teamActivities = new Map(teams.map((t) => [t, []]));

  // Judging: rooms run in parallel; each session is followed by deliberation.
  const judging = [];
  let time = o.start;
  const waiting = shuffle([...teams], random);
  while (waiting.length) {
    time = skipLunch(time, o.judgingTime, o.lunchStart, o.lunchEnd);
    const rooms = new Array(o.judgingRooms).fill(null);
    waiting.splice(0, o.judgingRooms).forEach((team, i) => {
      rooms[i] = team;
      teamActivities.get(team).push({ type: 'Judging', start: time, end: time + o.judgingTime, location: `Room ${i + 1}` });
    });
    judging.push({ start: time, teams: rooms });
    time += o.judgingTime + o.deliberationTime;
  }
  const judgingEnd = time;

  // Robot games: rounds in order; a team plays round N+1 only after round N.
  const robot = [];
  const tableUse = new Map(teams.map((t) => [t, new Array(o.gameTables).fill(0)]));
  time = o.start;
  for (let round = 1; round <= o.robotRounds; round++) {
    const needed = new Set(teams);
    while (needed.size) {
      time = skipLunch(time, roundDuration, o.lunchStart, o.lunchEnd);
      if (time + roundDuration > END_OF_DAY) {
        throw new Error(`Round ${round} doesn't fit in one day. Add tables, shorten games, or reduce rounds.`);
      }
      const end = time + roundDuration;
      const free = [...needed].filter((team) =>
        !teamActivities.get(team).some((a) => overlaps(time - o.minGap, end + o.minGap, a.start, a.end)));
      if (free.length) {
        const tables = new Array(o.gameTables).fill(null);
        for (const team of shuffle(free, random).slice(0, o.gameTables)) {
          const use = tableUse.get(team);
          const table = tables
            .map((_, i) => i)
            .filter((i) => tables[i] === null)
            .sort((a, b) => use[a] - use[b])[0];
          tables[table] = team;
          use[table]++;
          teamActivities.get(team).push({ type: `Robot Round ${round}`, start: time, end, location: `Table ${table + 1}` });
          needed.delete(team);
        }
        robot.push({ start: time, round, teams: tables });
      }
      time = end;
    }
  }
  const robotEnd = time;

  return { judging, robot, teamActivities, judgingEnd, robotEnd };
}
