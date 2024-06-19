document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scheduleForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        generateSchedule();
    });

    function generateSchedule() {
        const teamList = document.getElementById('teamList').value.split(',').map(team => team.trim());
        const numJudgingRooms = parseInt(document.getElementById('numJudgingRooms').value);
        const numRobotTables = parseInt(document.getElementById('numRobotTables').value);
        const numRobotRounds = 4; // Assuming 4 robot rounds based on requirements
        const startTime = document.getElementById('startTime').value;
        const timeBetweenJudgingSessions = parseInt(document.getElementById('timeBetweenJudgingSessions').value);
        const minTimeBetweenRobotRounds = parseInt(document.getElementById('minTimeBetweenRobotRounds').value);
        const lunchBreakStartTime = document.getElementById('lunchBreakStartTime').value;
        const lunchBreakEndTime = document.getElementById('lunchBreakEndTime').value;
        const teamTimeBetweenActivities = parseInt(document.getElementById('teamTimeBetweenActivities').value);

        // Initialize schedule arrays
        let judgingSchedule = [];
        let robotSchedule = [];
        let teamSchedules = {};

        // Convert time strings to Date objects
        const start = new Date(`1970-01-01T${startTime}:00`);
        const lunchStart = new Date(`1970-01-01T${lunchBreakStartTime}:00`);
        const lunchEnd = new Date(`1970-01-01T${lunchBreakEndTime}:00`);

        // Calculate judging sessions
        let currentJudgingTime = new Date(start);
        while (judgingSchedule.length < Math.ceil(teamList.length / numJudgingRooms)) {
            if (currentJudgingTime < lunchStart || currentJudgingTime >= lunchEnd) {
                let endJudgingTime = new Date(currentJudgingTime.getTime() + 30 * 60000); // 30 minutes per session
                judgingSchedule.push({ start: new Date(currentJudgingTime), end: endJudgingTime });
                currentJudgingTime = new Date(endJudgingTime.getTime() + timeBetweenJudgingSessions * 60000);
            } else {
                currentJudgingTime = new Date(lunchEnd);
            }
        }

        // Calculate robot rounds
        let currentRobotTime = new Date(start);
        let isAlt = false;

        while (robotSchedule.length < Math.ceil(teamList.length / numRobotTables) * numRobotRounds) {
            if (currentRobotTime < lunchStart || currentRobotTime >= lunchEnd) {
                let duration = isAlt ? Math.ceil(2.5 * 60000) : Math.floor(2.5 * 60000);
                let endRobotTime = new Date(currentRobotTime.getTime() + duration);
                robotSchedule.push({ start: new Date(currentRobotTime), end: endRobotTime });
                currentRobotTime = new Date(endRobotTime.getTime() + minTimeBetweenRobotRounds * 60000);
                isAlt = !isAlt;
            } else {
                currentRobotTime = new Date(lunchEnd);
            }
        }

        // Initialize team schedules
        teamList.forEach(team => {
            teamSchedules[team] = {
                judging: [],
                robot: []
            };
        });

        // Assign teams to judging sessions
        for (let i = 0; i < judgingSchedule.length; i++) {
            for (let j = 0; j < numJudgingRooms; j++) {
                let teamIndex = i * numJudgingRooms + j;
                if (teamIndex < teamList.length) {
                    let team = teamList[teamIndex];
                    teamSchedules[team].judging.push({
                        start: judgingSchedule[i].start,
                        end: judgingSchedule[i].end,
                        location: `Room ${j + 1}`
                    });
                }
            }
        }

        // Assign teams to robot rounds while respecting constraints
        let assignedPairs = new Set();
        let assignedTables = {};

        teamList.forEach(team => assignedTables[team] = new Set());

        for (let round = 0; round < numRobotRounds; round++) {
            for (let i = 0; i < teamList.length; i += numRobotTables) {
                for (let j = 0; j < numRobotTables; j++) {
                    let teamIndex = i + j;
                    if (teamIndex < teamList.length) {
                        let team = teamList[teamIndex];

                        // Ensure no overlap with judging sessions and respect time between activities
                        let validSlot = false;
                        let attempt = 0;
                        let robotRoundIndex = round * (robotSchedule.length / numRobotRounds) + (i / numRobotTables);

                        while (!validSlot && attempt < robotSchedule.length) {
                            let slot = robotSchedule[robotRoundIndex];
                            let lastActivity = teamSchedules[team].robot.length > 0 ? teamSchedules[team].robot[teamSchedules[team].robot.length - 1] : null;

                            if (!lastActivity || (slot.start - lastActivity.end) >= teamTimeBetweenActivities * 60000) {
                                if (!teamSchedules[team].judging.some(j => (j.start <= slot.start && j.end > slot.start))) {
                                    let pairValid = true;
                                    teamSchedules[team].robot.forEach(r => {
                                        let pair = `${team} - ${r.opponent}`;
                                        if (assignedPairs.has(pair)) {
                                            pairValid = false;
                                        }
                                    });

                                    if (pairValid && !assignedTables[team].has(`Table ${j + 1}`)) {
                                        validSlot = true;
                                        teamSchedules[team].robot.push({
                                            start: slot.start,
                                            end: slot.end,
                                            location: `Table ${j + 1}`,
                                            round: round,
                                            opponent: teamList[teamIndex + 1] || teamList[teamIndex - 1] // Simplified opponent assignment
                                        });

                                        assignedTables[team].add(`Table ${j + 1}`);
                                        assignedPairs.add(`${team} - ${teamList[teamIndex + 1]}`);
                                    }
                                }
                            }

                            if (!validSlot) {
                                robotRoundIndex = (robotRoundIndex + 1) % robotSchedule.length;
                                attempt++;
                            }
                        }
                    }
                }
            }
        }

        // Sort the main schedule by time and then team
        let mainSchedule = [];
        for (let team in teamSchedules) {
            teamSchedules[team].judging.forEach(j => {
                mainSchedule.push({
                    team: team,
                    start: j.start,
                    end: j.end,
                    activity: `Judging`,
                    location: j.location
                });
            });
            teamSchedules[team].robot.forEach(r => {
                mainSchedule.push({
                    team: team,
                    start: r.start,
                    end: r.end,
                    activity: `Robot Game ${r.round}`,
                    location: r.location
                });
            });
        }

        mainSchedule.sort((a, b) => a.start - b.start || a.team.localeCompare(b.team));

        // Prepare data for export
        let judgingScheduleExport = [];
        judgingSchedule.forEach((j, index) => {
            let session = { start: formatTime(j.start), end: formatTime(j.end) };
            for (let room = 1; room <= numJudgingRooms; room++) {
                let teamIndex = index * numJudgingRooms + room - 1;
                if (teamIndex < teamList.length) {
                    session[`Room ${room}`] = teamList[teamIndex];
                }
            }
            judgingScheduleExport.push(session);
        });

        let robotScheduleExport = [];
        for (let round = 0; round < numRobotRounds; round++) {
            for (let i = 0; i < robotSchedule.length / numRobotRounds; i++) {
                let session = { start: formatTime(robotSchedule[i + round * (robotSchedule.length / numRobotRounds)].start) };
                for (let table = 1; table <= numRobotTables; table++) {
                    let teamIndex = i * numRobotTables + table - 1;
                    if (teamIndex < teamList.length) {
                        session[`Table ${table}`] = teamList[teamIndex];
                    }
                }
                robotScheduleExport.push(session);
            }
        }

        let teamScheduleExport = teamList.map(team => {
            let teamSchedule = { Team: team };
            teamSchedules[team].judging.forEach((j, index) => {
                teamSchedule[`Judging ${index}`] = `Room ${index + 1} @ ${formatTime(j.start)} - ${formatTime(j.end)}`;
            });
            teamSchedules[team].robot.forEach((r, index) => {
                teamSchedule[`Robot Game ${r.round}`] = `${r.location} @ ${formatTime(r.start)}`;
            });
            return teamSchedule;
        });

        // Display the dialog box
        let lastJudgingTime = judgingSchedule[judgingSchedule.length - 1].end;
        let lastRobotTime = robotSchedule[robotSchedule.length - 1].end;
        if (confirm(`Last judging session ends at ${formatTime(lastJudgingTime)}.\nLast robot game ends at ${formatTime(lastRobotTime)}.\nDo you want to proceed to download the schedule?`)) {
            downloadSchedule(mainSchedule, teamScheduleExport, judgingScheduleExport, robotScheduleExport);
        }
    }

    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function downloadSchedule(mainSchedule, teamScheduleExport, judgingScheduleExport, robotScheduleExport) {
        let wb = XLSX.utils.book_new();

        let wsMain = XLSX.utils.json_to_sheet(mainSchedule);
        XLSX.utils.book_append_sheet(wb, wsMain, 'Main Schedule');

        let wsTeams = XLSX.utils.json_to_sheet(teamScheduleExport);
        XLSX.utils.book_append_sheet(wb, wsTeams, 'Team Schedules');

        let wsJudging = XLSX.utils.json_to_sheet(judgingScheduleExport);
        XLSX.utils.book_append_sheet(wb, wsJudging, 'Judging Schedule');

        let wsRobot = XLSX.utils.json_to_sheet(robotScheduleExport);
        XLSX.utils.book_append_sheet(wb, wsRobot, 'Robot Schedule');

        XLSX.writeFile(wb, 'schedule.xlsx');
    }
});
