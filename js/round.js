let roundMap = new Map();
let roundCreatedCount = 0;

class Round {
    constructor(number, distribution, winnersPerGroup, teams, xml = null) {
        this.id = roundCreatedCount;
        this.number = number;
        this.distribution = distribution;
        this.winnersPerGroup = winnersPerGroup;

        this.teams = teams;
        this.teams.sort((a, b) => {
            if (a.level < b.level) {
                return -1;
            } else if (a.level > b.level) {
                return 1;
            } else {
                return 0;
            }
        });
        this.teams.forEach(team => team.clearMatchHistory());
        this.leaderboard = [];

        this.groups = [];
        this.dom = this.makeDom(xml);
        this.groups.forEach(group => group.round = this);
        this.updateMaxWinnersPerGroup();

        roundMap[this.id] = this;
        ++roundCreatedCount;
    }

    static makeFirstRound(callback) {
        xmlRequest = new XMLHttpRequest();
        xmlRequest.onreadystatechange = function() {
            if (
                this.readyState === XMLHttpRequest.DONE
                && this.status === 200
            ) {
                const xml = this.responseXML;
                const teamsXML = xml.querySelector('teams');
                const teams = Team.makeTeams(teamsXML);
                const firstRound = new Round(1, 'none', 1, teams);

                if (typeof callback === 'function') {
                    callback(firstRound);
                }
            }
        };
        xmlRequest.open('GET', 'tournamentData.php?get=teams');
        xmlRequest.send();
    }
    
    static makeRounds(xml) {
        let rounds = [];
        for (const roundXML of xml.children) {
            rounds.push(
                new Round(
                    parseInt(roundXML.getAttribute('number'), 10),
                    roundXML.getAttribute('distribution'),
                    parseInt(roundXML.getAttribute('winners-per-group'), 10),
                    Team.makeTeams(roundXML.querySelectorAll('team')),
                    roundXML
                )
            );
        }
        return rounds;
    }

    makeDom(xml = null) {
        const section = document.createElement('div');
        section.dataset.roundId = this.id;
        section.id = 'round-section-' + this.id;
        section.classList.add('round-section');

        section.appendChild(this.makeHeader());
        section.appendChild(this.makeInfo());
        section.appendChild(this.makeList(xml));

        return section;
    }

    makeHeader() {
        const header = document.createElement('div');
        header.classList.add('container-header', 'round-header');
        header.innerHTML = `<h2>Tour ${this.number}</h2>`;

        const startButton = document.createElement('button');
        startButton.dataset.roundId = this.id;
        startButton.classList.add('start-round-button');
        startButton.textContent = 'Commencer le tour';
        startButton.onclick = onRoundStarted;

        if (this.distribution === 'none') {
            startButton.style.display = 'none';
        }

        header.appendChild(startButton);

        return header;
    }

    makeInfo() {
        const info = document.createElement('div');
        info.classList.add('round-info');
        info.innerHTML = `<p>Nombre d'équipes : ${this.teams.length}</p>`;

        const distributionLabel = document.createElement('label');
        distributionLabel.setAttribute('for', `team-distribution-${this.id}`);
        distributionLabel.textContent = 'Répartition des équipes : ';

        const distributionSelect = document.createElement('select');
        distributionSelect.dataset.roundId = this.id;
        distributionSelect.id = `team-distribution-${this.id}`;
        distributionSelect.innerHTML =
            '<option value="none" class="placeholder">choisir</option>';

        const distributions = Team.getTeamDistributions(this.teams.length);
        for (const distribution of distributions) {
            const option = document.createElement('option');
            option.value = distribution;
            option.textContent = distribution;
            option.selected = distribution === this.distribution;

            distributionSelect.add(option);
        }
        distributionSelect.onchange = onDistributionChange;

        const winnersLabel = document.createElement('label');
        winnersLabel.setAttribute('for', `winners-input-${this.id}`);
        winnersLabel.textContent = 'Vainqueurs par poule : ';

        const winnersInput =  document.createElement('input');
        winnersInput.dataset.roundId = this.id;
        winnersInput.classList.add('small-input-number');
        winnersInput.id = `winners-input-${this.id}`;
        winnersInput.type = 'number';
        winnersInput.min = 1;
        winnersInput.value = 1;
        winnersInput.onchange = onWinnersPerGroupChange;
        winnersInput.onkeypress = () => { return false; };
        if (this.distribution === 'none') {
            winnersInput.disabled = true;
        }

        info.appendChild(distributionLabel);
        info.appendChild(distributionSelect);
        info.appendChild(document.createElement('br'));
        info.appendChild(winnersLabel);
        info.appendChild(winnersInput);

        return info;
    }

    makeList(xml = null) {
        const list = document.createElement('div');
        list.id = 'groups-' + this.id;
        list.classList.add('groups');

        if (xml != null) {
            this.groups = Group.makeGroups(xml.querySelector('groups'));
            for (const group of this.groups) {
                list.appendChild(group.dom);
            }
        }

        list.insertAdjacentHTML(
            'beforeend', '<button class="add-group">&plus;</button>'
        );

        return list;
    }

    onDistributionChange(event) {
        const re = /^(\d+)x(\d+)( \+ (\d+)x(\d+))?$/;
        const matches = re.exec(event.distribution);

        if (matches) {
            if (this.distribution === 'none') {
                const startRoundButton = this.dom.querySelector('.start-round-button');
                startRoundButton.style.display = 'inline-block';

                const winnersInput = this.dom.querySelector(`#winners-input-${this.id}`);
                winnersInput.disabled = false;
            }

            this.distribution = event.distribution;

            let parsedMatches = matches.map(e => {
                let result = parseInt(e, 10);
                return isNaN(result) ? 0 : result;
            });
            let [groupCount1, teamsPerGroup1] = parsedMatches.slice(1, 3);
            let [groupCount2, teamsPerGroup2] = parsedMatches.slice(4);

            for (const group of this.groups) {
                group.remove();
            }
            this.groups = [];

            for (let i = 0; i < groupCount1; ++i) {
                this.addGroup(new Group(i + 1, 1, teamsPerGroup1));
            }
            for (let i = 0; i < groupCount2; ++i) {
                this.addGroup(new Group(i + 1 + groupCount1, 1, teamsPerGroup2));
            }

            this.distributeTeams();
        }
    }

    onWinnersPerGroupChange(event) {
        this.winnersPerGroup = event.target.value;
    }

    onRoundEnded() {
        let losersLeaderboard = [];
        let winnersLeaderboard = [];

        this.groups.forEach(group => {
            losersLeaderboard = losersLeaderboard.concat(
                group.leaderboard.slice(this.winnersPerGroup)
            );
            winnersLeaderboard = winnersLeaderboard.concat(
                group.leaderboard.slice(0, this.winnersPerGroup)
            );
        });
        losersLeaderboard.sort(Team.compare);
        winnersLeaderboard.sort(Team.compare);
        this.leaderboard = losersLeaderboard.concat(winnersLeaderboard);

        if (this.isLosersRound()) return;

        const winnerCount = this.winnersPerGroup * this.groups.length;
        const loserCount = this.teams.length - winnerCount;

        let organize = null;
        if (loserCount > 1 || winnerCount > 1) {
            organize = document.createElement('div');
            organize.classList.add('organize-next-rounds');
            organize.dataset.roundId = this.id;
        }

        let organizeLosersRound = null;
        if (loserCount > 1) {
            organizeLosersRound = document.createElement('button');
            organizeLosersRound.classList.add('next-round-button', 'losers');
            organizeLosersRound.textContent = 'Organiser le tour des perdants';
            organizeLosersRound.onclick = onRoundOrganized;

            organize.appendChild(organizeLosersRound);
        }

        let organizeWinnersRound = null;
        if (winnerCount > 1) {
            organizeWinnersRound = document.createElement('button');
            organizeWinnersRound.classList.add('next-round-button', 'winners');
            organizeWinnersRound.textContent = 'Organiser le tour des gagnants';
            organizeWinnersRound.onclick = onRoundOrganized;

            organize.appendChild(organizeWinnersRound);
        } else {
            const endTournament = document.createElement('button');
            endTournament.dataset.roundId = this.id;
            endTournament.classList.add('end-tournament-button');
            endTournament.textContent = 'Terminer le tournoi';
            endTournament.onclick = onTournamentEnded;

            this.dom.parentNode.insertBefore(endTournament, this.dom.nextSibling)
        }

        if (organize != null) {
            this.dom.parentNode.insertBefore(organize, this.dom.nextSibling);
        }
    }

    onRoundOrganized(event) {
        const organize = event.target.parentNode;

        let teams = [];
        const isWinnersRound = event.target.classList.contains('winners');
        if (isWinnersRound) {
            for (const group of this.groups) {  // get winner teams
                teams = teams.concat(group.leaderboard.slice(0, this.winnersPerGroup));
            }
        } else {
            for (const group of this.groups) {  // get loser teams
                teams = teams.concat(group.leaderboard.slice(this.winnersPerGroup));
            }
        }

        if (teams.length > 1) {
            const round = new Round(this.number + 1, 'none', 1, teams);

            // organize <afterOrganize> nextSibling
            let afterOrganize = organize.nextSibling;
            if (isWinnersRound) {
                //  if loser round has already been created
                if (organize.childElementCount < 2) {
                    // organize loserRound <afterOrganize> nextSibling
                    afterOrganize = afterOrganize.nextSibling;
                }
            } else {
                const h2 = round.dom.querySelector('.container-header h2');
                h2.textContent += ' des perdants';
            }

            organize.parentNode.insertBefore(round.dom, afterOrganize);
        }

        if (organize.childElementCount > 1) {
            event.target.remove();
        } else {
            organize.remove();
        }
    }

    addGroup(group) {
        const groupsDiv = this.dom.querySelector(`#groups-${this.id}`);
        const addButton = groupsDiv.querySelector('.add-group');
        groupsDiv.insertBefore(group.dom, addButton);

        this.groups.push(group);
        group.round = this;
    }

    updateMaxWinnersPerGroup() {
        if (this.groups.length === 0) return;

        let minGroupSize = this.groups[0].teams.length;
        for (const group of this.groups) {
            if (group.teams.length < minGroupSize) {
                minGroupSize = group.teams.length;
            } 
        }
        const maxWinnersPerGroup = Math.max(minGroupSize - 1, 1);

        const winnersInput = this.dom.querySelector(`#winners-input-${this.id}`);
        winnersInput.max = maxWinnersPerGroup;
        if (winnersInput.value > maxWinnersPerGroup) {
            winnersInput.value = maxWinnersPerGroup;
        }
    }

    distributeTeams() {
        // "Serpentin" method
        let iTeam = 0;
        let iGroup = 0;
        let nGroup = this.groups.length;
        let direction = 1;

        while (iTeam < this.teams.length) {
            let group = this.groups[iGroup];

            if (group.addTeam(this.teams[iTeam])) {
                ++iTeam;
            }

            iGroup += direction;
    
            if (iGroup < 0 || iGroup > nGroup - 1) {
                direction = -direction;
                iGroup += direction;
            }
        }
    }

    start(event) {
        for (const group of this.groups) {
            if (group.teams.length < 2) return;
        }
        // const roundId = event.target.dataset.roundId;
        event.target.remove();  // remove startButton

        // const roundSection = document.querySelector(`round-section-${roundId}`);
        const groups = this.dom.querySelector(`#groups-${this.id}`);

        const select = this.dom.querySelector(`#team-distribution-${this.id}`);
        select.disabled = true;

        const winnersInput = this.dom.querySelector(`#winners-input-${this.id}`);
        winnersInput.disabled = true;

        let groupsOver = 0;
        this.groups.forEach(group => group.startMatches(() => {
            ++groupsOver;
            if (groupsOver === this.groups.length) {
                this.onRoundEnded();
            }
        }));
    }

    isLosersRound() {
        const h2 = this.dom.querySelector('.container-header h2');
        return h2.textContent.includes('perdants');
    }

    static getTournamentLeaderboard() {
        let leaderboard = [];

        const rounds = document.body.querySelectorAll('.round-section');
        for (const [index, roundDom] of rounds.entries()) {
            const round = roundMap[roundDom.dataset.roundId];
    
            if (!round.isLosersRound()) {
                const nextRound = rounds[index + 1]
                    ? roundMap[rounds[index + 1].dataset.roundId]
                    : undefined;
    
                if (nextRound && nextRound.isLosersRound()) {
                    leaderboard = leaderboard.concat(nextRound.leaderboard);
                } else {
                    const lastLoser = 
                        round.teams.length - round.winnersPerGroup * round.groups.length;
                    leaderboard = leaderboard.concat(round.leaderboard.slice(0, lastLoser));
                }
            }
        }

        const lastRound = roundMap[rounds[rounds.length - 1].dataset.roundId];
        const lastIsFinalRound = !lastRound.isLosersRound();
        const finalRound = lastIsFinalRound
            ? lastRound
            : roundMap[rounds[rounds.length - 2].dataset.roundId];

        leaderboard.push(finalRound.leaderboard[finalRound.leaderboard.length - 1]);

        return leaderboard.reverse();
    }
}

class DistributionChangeEvent {
    constructor(target, distribution) {
        this.target = target;
        this.distribution = distribution;
    }
}

function onDistributionChange(event) {
    const round = roundMap[event.target.dataset.roundId];
    const distributionChangeEvent = 
        new DistributionChangeEvent(event.target, event.target.value);

    round.onDistributionChange(distributionChangeEvent);
}

function onWinnersPerGroupChange(event) {
    const round = roundMap[event.target.dataset.roundId];
    round.onWinnersPerGroupChange(event);
}

function onRoundStarted(event) {
    const round = roundMap[event.target.dataset.roundId];
    round.start(event);
}

function onRoundOrganized(event) {
    const round = roundMap[event.target.parentNode.dataset.roundId];
    round.onRoundOrganized(event);
}

function onTournamentEnded(event) {
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.classList.add('tournament-leaderboard');

    const header = document.createElement('h2');
    header.classList.add('tournament-leaderboard-header', 'leaderboard-header');
    header.textContent = 'Classement';

    const leaderboard = Round.getTournamentLeaderboard();

    const ol = document.createElement('ol');
    ol.classList.add('leaderboard-ol');
    for (const team of leaderboard) {
        const li = document.createElement('li');
        li.textContent = team.name;
        ol.appendChild(li);
    }

    leaderboardDiv.appendChild(header);
    leaderboardDiv.appendChild(ol);

    const firstRound = document.body.querySelector('#round-section-0');
    document.body.insertBefore(leaderboardDiv, firstRound);

    const organizeDivs = document.body.querySelectorAll('.organize-next-rounds');
    for (const organizeDiv of organizeDivs) {
        organizeDiv.remove();
    }

    event.target.remove();

    window.scroll({
        left: 0,
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * round1, round2perdant, round2, round3perdant
 * 
 * round2perdant, round1, round3perdant, round2
 * 
 * classement final = []
 * Tour 1 [g, e, b, d] + [c, a, f] 
 * -> tour2perdant existe
 *     ? classement += tour2perdant
 *     : classement += tour1[perdants]
 * Tour 2 Perdants [f, a, c] //
 * Tour 2 [g, e] + [b, d]
 * -> tour3perdant existe
 *     ? classement += tour3perdant
 *     : classement += tour2[perdants] 
 * Tour 3 Perdants [d, b] //
 * Tour 3 [g] + [e] -> tour4perdant existe
 *     ? classement += tour4perdant
 *     : classement += tour3[perdants]
 * ->
 * classement += tour3[gagnants]
 */
