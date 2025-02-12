document.getElementById('pitNumbers').addEventListener('click', () => {
        document.getElementById('pitNumberModal').style.display = 'block';
        document.getElementById('numTeams').focus();
    });

    document.getElementById('cancelPitNumbers').addEventListener('click', () => {
        document.getElementById('pitNumberModal').style.display = 'none';
        document.getElementById('numTeams').value = '';
    });

document.getElementById('confirmPitNumbers').addEventListener('click', (event) => {
    event.preventDefault(); // Stop any unintended form submission

    const numTeams = parseInt(document.getElementById('numTeams').value);
    if (numTeams > 0) {
        const teams = Array.from({ length: numTeams }, (_, i) => i + 1).join(',');
        document.getElementById('teams').value = teams;
        document.getElementById('pitNumberModal').style.display = 'none';
        document.getElementById('numTeams').value = '';
    } else {
        alert('Please enter a valid number of teams');
    }
});


        function parseTime(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        }

        function formatTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = Math.floor(minutes % 60);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${mins.toString().padStart(2, '0')}${period}`;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function checkTimeOverlap(time1Start, time1End, time2Start, time2End) {
            return !(time1End <= time2Start || time1Start >= time2End);
        }

async function generateSchedule(event) {
        event.preventDefault();

        // Get form values
        const teams = document.getElementById('teams').value.split(',').map(Number);
        const gameTime = parseFloat(document.getElementById('gameTime').value);
        const resetTime = parseFloat(document.getElementById('resetTime').value);
        const judgingTime = parseInt(document.getElementById('judgingTime').value);
        const deliberationTime = parseInt(document.getElementById('deliberationTime').value);
        const judgingRooms = parseInt(document.getElementById('judgingRooms').value);
        const gameTables = parseInt(document.getElementById('gameTables').value);
        const startTimeStr = document.getElementById('startTime').value;
        const robotRounds = parseInt(document.getElementById('robotRounds').value);
        const minTime = parseInt(document.getElementById('minTime').value);
        const lunchStart = parseTime(document.getElementById('lunchStart').value);
        const lunchEnd = parseTime(document.getElementById('lunchEnd').value);

        // Calculate round duration up front
        const roundDuration = gameTime + resetTime;

        // Initialize schedule data
        let startTime = parseTime(startTimeStr);
        const judgingSchedule = [];
        const robotSchedule = [];
        const teamSchedule = new Map();
        const teamRoundCounts = new Map();
        teams.forEach(team => teamRoundCounts.set(team, 0));

        // Schedule judging sessions
        const judgingRoundsNeeded = Math.ceil(teams.length / judgingRooms);
        let currentTime = startTime;
        let judgingEndTime = currentTime;
        
        // Create array of unscheduled teams for judging
        let unscheduledJudgingTeams = [...teams];
        
        for (let round = 0; round < judgingRoundsNeeded; round++) {
            const sessionTeams = new Array(judgingRooms).fill(null);
            
            // Randomly assign teams to available rooms
            shuffleArray(unscheduledJudgingTeams);
            for (let i = 0; i < Math.min(judgingRooms, unscheduledJudgingTeams.length); i++) {
                const team = unscheduledJudgingTeams[i];
                sessionTeams[i] = team;
                
                const teamActivities = [];
                teamActivities.push({
                    type: 'Judging',
                    start: currentTime,
                    end: currentTime + judgingTime,
                    location: `Room ${i + 1}`
                });
                teamSchedule.set(team, teamActivities);
            }
            
            // Remove scheduled teams from unscheduled list
            unscheduledJudgingTeams = unscheduledJudgingTeams.slice(judgingRooms);

            judgingSchedule.push({
                startTime: formatTime(currentTime),
                teams: sessionTeams
            });

            currentTime += judgingTime + deliberationTime;
            judgingEndTime = currentTime;
        }

        // Reset current time for robot games
        currentTime = startTime;
        let robotEndTime = currentTime;
        let maxAttempts = 1000;
        let attempts = 0;

        // Track table usage per team
        const teamTableUsage = new Map();
        teams.forEach(team => teamTableUsage.set(team, new Map()));

        // Schedule each round sequentially for all teams
        for (let currentRound = 1; currentRound <= robotRounds; currentRound++) {
            let teamsNeedingThisRound = new Set(teams);

            while (teamsNeedingThisRound.size > 0 && attempts < maxAttempts) {
                attempts++;
                
                if (currentTime >= lunchStart && currentTime < lunchEnd) {
                    currentTime = lunchEnd;
                }

                const roundTeams = new Array(gameTables).fill(null);
                const availableTeams = [...teamsNeedingThisRound].filter(team => {
                    const teamActivities = teamSchedule.get(team) || [];
                    const roundEnd = currentTime + roundDuration;
                    
                    return !teamActivities.some(activity => 
                        checkTimeOverlap(
                            currentTime - minTime,
                            roundEnd + minTime,
                            activity.start,
                            activity.end
                        )
                    );
                });

                if (availableTeams.length === 0) {
                    currentTime += roundDuration;
                    continue;
                }

                // Shuffle available teams to maintain randomization
                shuffleArray(availableTeams);

                // Assign teams to tables with preference for less-used tables
                for (const team of availableTeams.slice(0, gameTables)) {
                    // Find least used table for this team
                    let tableUsage = teamTableUsage.get(team);
                    let availableTables = Array.from({length: gameTables}, (_, i) => i)
                        .filter(i => roundTeams[i] === null)
                        .sort((a, b) => (tableUsage.get(a) || 0) - (tableUsage.get(b) || 0));
                    
                    if (availableTables.length > 0) {
                        let tableIndex = availableTables[0];
                        roundTeams[tableIndex] = team;
                        
                        const teamActivities = teamSchedule.get(team) || [];
                        teamActivities.push({
                            type: `Robot Round ${currentRound}`,
                            start: currentTime,
                            end: currentTime + roundDuration,
                            location: `Table ${tableIndex + 1}`
                        });
                        
                        // Update table usage
                        tableUsage.set(tableIndex, (tableUsage.get(tableIndex) || 0) + 1);
                        teamTableUsage.set(team, tableUsage);
                        
                        teamSchedule.set(team, teamActivities);
                        teamRoundCounts.set(team, currentRound);
                        teamsNeedingThisRound.delete(team);
                    }
                }

                robotSchedule.push({
                    startTime: formatTime(currentTime),
                    teams: roundTeams
                });

                currentTime += roundDuration;
                robotEndTime = currentTime;
            }

            // Check if we failed to schedule all teams for this round
            if (teamsNeedingThisRound.size > 0) {
                alert(`Unable to schedule round ${currentRound} for teams: ${[...teamsNeedingThisRound].join(', ')}`);
                return;
            }
        }

        const incompleteTeams = [...teamRoundCounts.entries()]
            .filter(([team, count]) => count !== robotRounds)
            .map(([team]) => team);

        if (incompleteTeams.length > 0) {
            alert(`Unable to schedule all rounds. The following teams do not have ${robotRounds} rounds: ${incompleteTeams.join(', ')}`);
            return;
        }

        // Show confirmation modal
        const modal = document.getElementById('confirmationModal');
        document.getElementById('judgingEndTime').textContent = `Judging End Time: ${formatTime(judgingEndTime)}`;
        document.getElementById('robotEndTime').textContent = `Robot Game End Time: ${formatTime(robotEndTime)}`;
        modal.style.display = 'block';

            // Handle modal buttons
            return new Promise((resolve, reject) => {
                document.getElementById('proceedButton').onclick = () => {
                    modal.style.display = 'none';
                    resolve(true);
                };
                document.getElementById('editButton').onclick = () => {
                    modal.style.display = 'none';
                    resolve(false);
                };
            }).then(shouldProceed => {
                if (!shouldProceed) return;

                // Generate Excel file
                const wb = XLSX.utils.book_new();
                
                // Judging Schedule
                const judgingWS = XLSX.utils.json_to_sheet(judgingSchedule.map(session => {
                    const row = { 'Start Time': session.startTime };
                    session.teams.forEach((team, idx) => {
                        row[`Room ${idx + 1}`] = team || '';
                    });
                    return row;
                }));
                XLSX.utils.book_append_sheet(wb, judgingWS, 'Judging Schedule');

                // Robot Game Schedule
                const robotWS = XLSX.utils.json_to_sheet(robotSchedule.map(round => {
                    const row = { 'Start Time': round.startTime };
                    round.teams.forEach((team, idx) => {
                        row[`Table ${idx + 1}`] = team || '';
                    });
                    return row;
                }));
                XLSX.utils.book_append_sheet(wb, robotWS, 'Robot Games');

                // Team Schedule
                const teamScheduleData = [];
                teams.sort((a, b) => a - b).forEach(team => {
                    const activities = teamSchedule.get(team) || [];
                    const row = { 'Team': team };
                    activities.forEach(activity => {
                        row[activity.type] = `${formatTime(activity.start)} - ${activity.location}`;
                    });
                    teamScheduleData.push(row);
                });
                const teamWS = XLSX.utils.json_to_sheet(teamScheduleData);
                XLSX.utils.book_append_sheet(wb, teamWS, 'Team Schedule');

                // Save file
                XLSX.writeFile(wb, 'competition_schedule.xlsx');
            });
        }

        document.getElementById('schedulerForm').addEventListener('submit', generateSchedule);
