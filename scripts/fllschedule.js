// FLL Schedule Generator page. Scheduling logic lives in lib/fll/schedule.js.
import { buildSchedule, parseTeams, parseClock, formatClock } from '../lib/fll/schedule.js';

const $ = (id) => document.getElementById(id);
const num = (id) => Number($(id).value);

function showDialog(id) {
  const d = $(id);
  if (d.showModal) d.showModal();
  else d.setAttribute('open', '');
}

$('pitNumbers').addEventListener('click', () => {
  $('numTeams').value = '';
  showDialog('pitNumberModal');
  $('numTeams').focus();
});
$('cancelPitNumbers').addEventListener('click', () => $('pitNumberModal').close());
$('confirmPitNumbers').addEventListener('click', (event) => {
  event.preventDefault();
  const n = Number($('numTeams').value);
  if (!Number.isInteger(n) || n < 1) {
    $('pitError').textContent = 'Enter a whole number of teams.';
    return;
  }
  $('pitError').textContent = '';
  $('teams').value = Array.from({ length: n }, (_, i) => i + 1).join(',');
  $('pitNumberModal').close();
});

let pending = null;

$('schedulerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();
  try {
    pending = buildSchedule({
      teams: parseTeams($('teams').value),
      gameTime: num('gameTime'),
      resetTime: num('resetTime'),
      judgingTime: num('judgingTime'),
      deliberationTime: num('deliberationTime'),
      judgingRooms: num('judgingRooms'),
      gameTables: num('gameTables'),
      robotRounds: num('robotRounds'),
      minGap: num('minTime'),
      start: parseClock($('startTime').value),
      lunchStart: parseClock($('lunchStart').value),
      lunchEnd: parseClock($('lunchEnd').value),
      judgingDuringLunch: !$('pauseJudging').checked,
    });
  } catch (err) {
    showError(err.message);
    return;
  }
  $('judgingEndTime').textContent = `Judging ends: ${formatClock(pending.judgingEnd)}`;
  $('robotEndTime').textContent = `Robot games end: ${formatClock(pending.robotEnd)}`;
  showDialog('confirmationModal');
});

$('editButton').addEventListener('click', () => $('confirmationModal').close());
$('proceedButton').addEventListener('click', () => {
  $('confirmationModal').close();
  if (pending) downloadWorkbook(pending);
});

function downloadWorkbook({ judging, robot, teamActivities }) {
  const wb = XLSX.utils.book_new();
  const slotRows = (slots, label) => slots.map((slot) => {
    const row = { 'Start Time': formatClock(slot.start) };
    slot.teams.forEach((team, i) => { row[`${label} ${i + 1}`] = team ?? ''; });
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(slotRows(judging, 'Room')), 'Judging Schedule');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(slotRows(robot, 'Table')), 'Robot Games');
  const teamRows = [...teamActivities.keys()].sort((a, b) => a - b).map((team) => {
    const row = { Team: team };
    for (const a of teamActivities.get(team)) row[a.type] = `${formatClock(a.start)} - ${a.location}`;
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamRows), 'Team Schedule');
  XLSX.writeFile(wb, 'competition_schedule.xlsx');
}
