document.getElementById('schedulerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    let teamList = document.getElementById('teamList').value.split(',').map(t => t.trim());
    let numJudgingRooms = parseInt(document.getElementById('numJudgingRooms').value);
    let numRobotTables = parseInt(document.getElementById('numRobotTables').value);
    let startTime = document.getElementById('startTime').value;
    let timeBetweenJudgingSessions = parseInt(document.getElementById('timeBetweenJudgingSessions').value);
    let minTimeBetweenRobotRounds = parseInt(document.getElementById('minTimeBetweenRobotRounds').value);
    let lunchBreakStartTime = document.getElementById('lunchBreakStartTime').value;
    let lunchBreakEndTime = document.getElementById('lunchBreakEndTime').value;
    let teamTimeBetweenActivities = parseInt(document.getElementById('teamTimeBetweenActivities').value);

    // Calculate necessary variables
    let numTeams = teamList.length;
    let judgingSessionDuration = 30; // disabled input, assuming default value
    let robotGameDuration = 2.5; // disabled input, assuming default value
    let numJudgingSessions = Math.ceil(numTeams / numJudgingRooms);
    let numRobotRounds = 4; // disabled input, assuming default value

    // Generate schedules
    let judgingSchedule = generateJudgingSchedule();
    let robotSchedule = generateRobotSchedule();
    resolveConflicts(judgingSchedule, robotSchedule);

    // Get last session times
    let lastJudgingTime = judgingSchedule[judgingSchedule.length - 1].end;
    let lastRobotTime = robotSchedule[robotSchedule.length - 1].end;

    // Show confirmation dialog
    document.getElementById('lastJudgingSession').textContent = `Last Judging Session: ${formatTime(lastJudgingTime)}`;
    document.getElementById('lastRobotRound').textContent = `Last Robot Round: ${formatTime(lastRobotTime)}`;
    $('#confirmationModal').modal('show');

    // Download schedule on confirmation
    document.getElementById('downloadSchedule').addEventListener('click', function() {
        exportScheduleToExcel(judgingSchedule, robotSchedule, teamList);
    });

    // Helper functions
    function generateJudgingSchedule() {
        let schedule = [];
        let currentTime = parseTime(startTime);
        let lunchStart = parseTime(lunchBreakStartTime);
        let lunchEnd = parseTime(lunchBreakEndTime);

        for (let i = 0; i < numJudgingSessions; i++) {
            for (let room = 1; room <= numJudgingRooms; room++) {
                if (i * numJudgingRooms + room - 1 >= numTeams) break;
                if (currentTime >= lunchStart && currentTime < lunchEnd) {
                    currentTime = new Date(lunchEnd);
                }
                let endTime = new Date(currentTime.getTime() + judgingSessionDuration * 60000);
                schedule.push({
                    team: teamList[i * numJudgingRooms + room - 1],
                    start: new Date(currentTime),
                    end: endTime,
                    activity: numJudgingSessions > 1 ? `Judging ${i + 1}` : 'Judging',
                    location: `Room ${room}`
                });
            }
            currentTime = new Date(currentTime.getTime() + judgingSessionDuration * 60000 + timeBetweenJudgingSessions * 60000);
        }
        return schedule;
    }

    function generateRobotSchedule() {
        let schedule = [];
        let currentTime = parseTime(startTime);
        let lunchStart = parseTime(lunchBreakStartTime);
        let lunchEnd = parseTime(lunchBreakEndTime);
        let durationOffset = [Math.floor(robotGameDuration * 60), Math.ceil(robotGameDuration * 60)];
        let roundCounter = 0;

        while (roundCounter < numRobotRounds) {
            for (let table = 1; table <= numRobotTables; table++) {
                for (let teamIdx = 0; teamIdx < numTeams; teamIdx++) {
                    let team = teamList[teamIdx];
                    if (currentTime >= lunchStart && currentTime < lunchEnd) {
                        currentTime = new Date(lunchEnd);
                    }
                    let endTime = new Date(currentTime.getTime() + durationOffset[roundCounter % 2] * 60000);
                    schedule.push({
                        team: team,
                        start: new Date(currentTime),
                        end: endTime,
                        activity: numRobotRounds > 1 ? `Robot Game ${roundCounter + 1}` : 'Robot Game',
                        location: `Table ${table}`
                    });
                    currentTime = new Date(currentTime.getTime() + durationOffset[roundCounter % 2] * 60000 + minTimeBetweenRobotRounds * 60000);
                }
            }
            roundCounter++;
        }
        return schedule;
    }

    function resolveConflicts(judgingSchedule, robotSchedule) {
        let schedules = [...judgingSchedule, ...robotSchedule];
        schedules.sort((a, b) => a.start - b.start);

        for (let i = 0; i < schedules.length - 1; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                if (schedules[i].team === schedules[j].team &&
                    schedules[i].end > schedules[j].start) {
                    schedules[j].start = new Date(schedules[i].end.getTime() + teamTimeBetweenActivities * 60000);
                    schedules[j].end = new Date(schedules[j].start.getTime() + (schedules[j].activity.includes('Judging') ? judgingSessionDuration : Math.ceil(robotGameDuration * 60)) * 60000);
                }
            }
        }

        judgingSchedule.length = 0;
        robotSchedule.length = 0;
        schedules.forEach(item => {
            if (item.activity.includes('Judging')) judgingSchedule.push(item);
            else robotSchedule.push(item);
        });
    }

    function exportScheduleToExcel(judgingSchedule, robotSchedule, teamList) {
        let workbook = XLSX.utils.book_new();

        let mainSchedule = judgingSchedule.concat(robotSchedule).sort((a, b) => a.start - b.start || teamList.indexOf(a.team) - teamList.indexOf(b.team));
        let mainData = [['Team', 'Start Time', 'End Time', 'Activity', 'Location']];
        mainSchedule.forEach(item => {
            mainData.push([item.team, formatTime(item.start), formatTime(item.end), item.activity, item.location]);
        });
        let mainSheet = XLSX.utils.aoa_to_sheet(mainData);
        XLSX.utils.book_append_sheet(workbook, mainSheet, 'Main Schedule');

        let teamData = [['Team', ...Array.from({length: numJudgingSessions + numRobotRounds}, (_, i) => i < numJudgingSessions ? `Judging ${i + 1}` : `Robot Game ${i - numJudgingSessions + 1}`)]];
        teamList.forEach(team => {
            let row = [team];
            mainSchedule.forEach(item => {
                if (item.team === team) {
                    row.push(`${item.location} @ ${formatTime(item.start)}`);
                }
            });
            teamData.push(row);
        });
        let teamSheet = XLSX.utils.aoa_to_sheet(teamData);
        XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team Schedule');

        let judgingData = [['Start Time', 'End Time', ...Array.from({length: numJudgingRooms}, (_, i) => `Room ${i + 1}`)]];
        let uniqueJudgingTimes = [...new Set(judgingSchedule.map(item => formatTime(item.start) + ' - ' + formatTime(item.end)))];
        uniqueJudgingTimes.forEach(time => {
            let [start, end] = time.split(' - ');
            let row = [start, end];
            for (let room = 1; room <= numJudgingRooms; room++) {
                let team = judgingSchedule.find(item => formatTime(item.start) === start && item.location === `Room ${room}`);
                row.push(team ? team.team : '');
            }
            judgingData.push(row);
        });
        let judgingSheet = XLSX.utils.aoa_to_sheet(judgingData);
        XLSX.utils.book_append_sheet(workbook, judgingSheet, 'Judging Schedule');

        let robotData = [['Start Time', ...Array.from({length: numRobotTables}, (_, i) => `Table ${i + 1}`)]];
        let uniqueRobotTimes = [...new Set(robotSchedule.map(item => formatTime(item.start)))];
        uniqueRobotTimes.forEach(time => {
            let row = [time];
            for (let table = 1; table <= numRobotTables; table++) {
                let team = robotSchedule.find(item => formatTime(item.start) === time && item.location === `Table ${table}`);
                row.push(team ? team.team : '');
            }
            robotData.push(row);
        });
        let robotSheet = XLSX.utils.aoa_to_sheet(robotData);
        XLSX.utils.book_append_sheet(workbook, robotSheet, 'Robot Game Schedule');

        XLSX.writeFile(workbook, 'Tournament_Schedule.xlsx');
    }

    function parseTime(timeStr) {
        let [hours, minutes] = timeStr.split(':').map(Number);
        let date = new Date(1970, 0, 1, hours, minutes);
        return date;
    }

    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
