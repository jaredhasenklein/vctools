// Define global variables to hold latest end times and schedule
let latestJudgingEndTime = '00:00';
let latestRobotEndTime = '00:00';
let schedule = []; // Declare schedule globally

// Event listener for form submission
document.getElementById("schedulerForm").addEventListener("submit", function(event) {
  event.preventDefault();
  showScheduleConfirmation();
});

function generateSchedule() {
  // Clear previous schedule data
  schedule = [];

  const teamList = document.getElementById("teamList").value.split(",").map(team => team.trim());
  const numJudgingSessions = parseInt(document.getElementById("numJudgingSessions").value);
  const numRobotRounds = parseInt(document.getElementById("numRobotRounds").value);
  const numJudgingRooms = parseInt(document.getElementById("numJudgingRooms").value);
  const numRobotTables = parseInt(document.getElementById("numRobotTables").value);
  const startTime = document.getElementById("startTime").value;
  const judgingSessionDuration = parseInt(document.getElementById("judgingSessionDuration").value);
  const robotGameDuration = parseFloat(document.getElementById("robotGameDuration").value);
  const timeBetweenJudgingSessions = parseInt(document.getElementById("timeBetweenJudgingSessions").value);
  const minTimeBetweenRobotRounds = parseInt(document.getElementById("minTimeBetweenRobotRounds").value);
  const teamTimeBetweenActivities = parseInt(document.getElementById("teamTimeBetweenActivities").value);

  // Helper function to add minutes to a time string in HH:mm format
  function addMinutes(time, minsToAdd) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + minsToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  // Initialize current time
  let currentTime = startTime;

  // Calculate initial start times for judging rooms and robot tables
  let judgingRoomStartTimes = [];
  let robotTableStartTimes = [];
  for (let i = 0; i < numJudgingRooms; i++) {
    judgingRoomStartTimes.push(startTime); // All judging rooms start at the event start time initially
  }
  for (let i = 0; i < numRobotTables; i++) {
    robotTableStartTimes.push(startTime); // All robot tables start at the event start time initially
  }

  // Track which teams are currently scheduled for judging and robot rounds
  let teamsScheduledForJudging = new Set();
  let teamsScheduledForRobotRounds = new Set();

  // Schedule Judging Sessions
  for (let round = 0; round < numJudgingSessions; round++) {
    for (let i = 0; i < teamList.length; i++) {
      const team = teamList[i];
      
      // Check if the team is already scheduled for judging or robot round
      if (teamsScheduledForJudging.has(team) || teamsScheduledForRobotRounds.has(team)) {
        continue; // Skip this team if already scheduled
      }

      const roomIndex = i % numJudgingRooms;
      const room = `Room ${roomIndex + 1}`;
      const activity = numJudgingSessions > 1 ? `Judging Round ${round + 1}` : "Judging";

      // Assign start time for this room's judging session
      const startTimeForRoom = judgingRoomStartTimes[roomIndex];
      const endTime = addMinutes(startTimeForRoom, judgingSessionDuration);

      schedule.push([team, activity, formatTime(startTimeForRoom), room]);

      // Update start time for next team in this room
      judgingRoomStartTimes[roomIndex] = addMinutes(endTime, timeBetweenJudgingSessions);

      // Mark this team as scheduled for judging
      teamsScheduledForJudging.add(team);

      // Move current time to time between activities
      currentTime = addMinutes(currentTime, teamTimeBetweenActivities);
    }
  }

  // Schedule Robot Rounds
  for (let round = 0; round < numRobotRounds; round++) {
    for (let i = 0; i < teamList.length; i++) {
      const team = teamList[i];

      // Check if the team is already scheduled for a robot round or judging
      if (teamsScheduledForRobotRounds.has(team) || teamsScheduledForJudging.has(team)) {
        continue; // Skip this team if already scheduled
      }

      const tableIndex = i % numRobotTables;
      const table = `Table ${tableIndex + 1}`;
      const activity = numRobotRounds > 1 ? `Robot Game Round ${round + 1}` : "Robot Game";

      // Assign start time for this table's robot round
      const startTimeForTable = robotTableStartTimes[tableIndex];
      const endTime = addMinutes(startTimeForTable, robotGameDuration);

      schedule.push([team, activity, formatTime(startTimeForTable), table]);

      // Update start time for next team at this table
      robotTableStartTimes[tableIndex] = addMinutes(endTime, minTimeBetweenRobotRounds);

      // Mark this team as scheduled for robot round
      teamsScheduledForRobotRounds.add(team);

      // Move current time to time between activities
      currentTime = addMinutes(currentTime, teamTimeBetweenActivities);
    }
  }

  // After generating schedule, you may perform additional tasks like creating Excel sheets (removed for brevity)
}




// Function to format time in AM/PM and round up to nearest whole minute
function formatTime(time) {
  let [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.ceil(totalMinutes);
  hours = Math.floor(roundedMinutes / 60) % 24;
  minutes = roundedMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

// Helper function to parse time string into total minutes for sorting
function parseTime(time) {
  let [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Function to update modal content with latest judging and robot end times
function showScheduleConfirmation() {
  // Generate the schedule to get accurate end times
  generateSchedule();

  // Display confirmation modal
  $('#confirmationModal').modal('show');

  // Update modal content with extracted end times in AM/PM format and rounded up to nearest whole minute
  document.getElementById('judgingEndTime').textContent = formatTime(latestJudgingEndTime);
  document.getElementById('robotEndTime').textContent = formatTime(latestRobotEndTime);

  // Attach click handler to export button within the modal
  $('#exportButton').off('click').on('click', function(event) {
    console.log("Export button clicked");
    exportSchedule();
  });
}

// Function to export schedule
function exportSchedule() {
  console.log("Starting export schedule");

  // Generate the schedule again to ensure latest data
  generateSchedule();

  // Create the Excel workbook
  const workbook = XLSX.utils.book_new();

  // Add the main schedule as the first sheet, sorted by time
  const sortedSchedule = schedule.slice().sort((a, b) => parseTime(a[2]) - parseTime(b[2]));
  const mainWorksheet = XLSX.utils.aoa_to_sheet([
    ["Team", "Activity", "Time", "Location"],
    ...sortedSchedule
  ]);
  XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Main Schedule");

  // Generate and add multiple versions of the schedule as different sheets
  const sheetsData = generateAllScheduleVariants();
  sheetsData.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  // Write the workbook to a file and trigger download
  XLSX.writeFile(workbook, "schedule.xlsx");

  // Optionally, you can display a success message or perform additional actions after export
  console.log("Schedule exported successfully");
}

// Function to generate all schedule variants (original logic)
function generateAllScheduleVariants() {
  const teamList = document.getElementById("teamList").value.split(",").map(team => team.trim()).sort();
  const numJudgingRooms = parseInt(document.getElementById("numJudgingRooms").value);
  const numRobotTables = parseInt(document.getElementById("numRobotTables").value);

  const sheetsData = [];

  // Team Schedule
  const teamSchedule = [["Team", ...new Set(schedule.map(row => row[1]))]];
  teamList.forEach(team => {
    const row = [team];
    teamSchedule[0].slice(1).forEach(activity => {
      const found = schedule.find(item => item[0] === team && item[1] === activity);
      row.push(found ? found[2] : '');
    });
    teamSchedule.push(row);
  });
  sheetsData.push({ name: "Team Schedule", data: teamSchedule });

  // Judging Schedule
  const judgingSchedule = [["Time", ...Array.from({ length: numJudgingRooms }, (_, i) => `Room ${i + 1}`)]];
  const judgingTimes = [...new Set(schedule.filter(row => row[1].includes("Judging")).map(row => row[2]))].sort((a, b) => parseTime(a) - parseTime(b));
  judgingTimes.forEach(time => {
    const row = [time];
    for (let i = 1; i <= numJudgingRooms; i++) {
      const found = schedule.find(item => item[2] === time && item[3] === `Room ${i}`);
      row.push(found ? found[0] : '');
    }
    judgingSchedule.push(row);
  });
  sheetsData.push({ name: "Judging Schedule", data: judgingSchedule });

  // Robot Game Schedule
  const robotGameSchedule = [["Time", ...Array.from({ length: numRobotTables }, (_, i) => `Table ${i + 1}`)]];
  const robotGameTimes = [...new Set(schedule.filter(row => row[1].includes("Robot Game")).map(row => row[2]))].sort((a, b) => parseTime(a) - parseTime(b));
  robotGameTimes.forEach(time => {
    const row = [time];
    for (let i = 1; i <= numRobotTables; i++) {
      const found = schedule.find(item => item[2] === time && item[3] === `Table ${i}`);
      row.push(found ? found[0] : '');
    }
    robotGameSchedule.push(row);
  });
  sheetsData.push({ name: "Robot Game Schedule", data: robotGameSchedule });

  return sheetsData;
}