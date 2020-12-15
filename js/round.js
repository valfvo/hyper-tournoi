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

        this.groups = [];
        this.dom = this.makeDom(xml);
        this.groups.forEach(group => group.round = this);

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
        section.id = 'round-section-' + this.id;
        section.classList.add('round-section');

        section.appendChild(this.makeHeader());
        section.appendChild(this.makeInfo());
        section.appendChild(this.makeList(xml));

        return section;
    }

    makeHeader() {
        const header = document.createElement('div');
        header.classList.add('container-header');
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

        const label = document.createElement('label');
        label.setAttribute('for', `team-distribution-${this.id}`);
        label.textContent = 'Répartition des équipes : ';

        const select = document.createElement('select');
        select.dataset.roundId = this.id;
        select.id = `team-distribution-${this.id}`;
        select.innerHTML =
            '<option value="none" class="placeholder">choisir</option>';

        const distributions = Team.getTeamDistributions(this.teams.length);
        for (const distribution of distributions) {
            const option = document.createElement('option');
            option.value = distribution;
            option.textContent = distribution;
            option.selected = distribution === this.distribution;

            select.add(option);
        }
        select.onchange = onDistributionChange;

        info.appendChild(label);
        info.appendChild(select);

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

    onRoundEnded() {
        const organize = document.createElement('div');
        organize.classList.add('organize-next-rounds');
        organize.dataset.roundId = this.id;

        const organizeLosersRound = document.createElement('button');
        organizeLosersRound.classList.add('next-round-button');
        organizeLosersRound.classList.add('losers');
        organizeLosersRound.textContent = 'Organiser le tour des perdants';
        organizeLosersRound.onclick = onRoundOrganized;

        const organizeWinnersRound = document.createElement('button');
        organizeWinnersRound.classList.add('next-round-button');
        organizeWinnersRound.classList.add('winners');
        organizeWinnersRound.textContent = 'Organiser le tour des gagnants';
        organizeWinnersRound.onclick = onRoundOrganized;
        /**
         *  On récupère toutes les teams gagnantes dans un tableau
         *  On a le nombre d'equipe du tour
         *  On appelle Team.getTeamDistributions(teamCount)
         *  new Round(...);
         */

        organize.appendChild(organizeLosersRound);
        organize.appendChild(organizeWinnersRound);

        this.dom.parentNode.insertBefore(organize, this.dom.nextSibling);
        // todo nouveaux tours pour les gagnants et perdants
        /**
         * Tour 2 gagnants -> il reste des gagnants
         * Tour 2 perdants -> il reste des perdants
         */
    }

    onRoundOrganized(event) {
        const organize = event.target.parentNode;
        if (organize.childElementCount > 1) {
            event.target.remove();
        } else {
            organize.remove();
        }

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

        const round = new Round(this.number + 1, 'none', 1, teams);

        if (!isWinnersRound) {
            const h2 = round.dom.querySelector('.container-header h2');
            h2.textContent += ' des perdants';
        }

        this.dom.parentNode.appendChild(round.dom);
    }

    addGroup(group) {
        const groupsDiv = this.dom.querySelector(`#groups-${this.id}`);
        const addButton = groupsDiv.querySelector('.add-group');
        groupsDiv.insertBefore(group.dom, addButton);

        this.groups.push(group);
        group.round = this;
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
        // const roundId = event.target.dataset.roundId;
        event.target.remove();  // remove startButton

        // const roundSection = document.querySelector(`round-section-${roundId}`);
        const groups = this.dom.querySelector(`#groups-${this.id}`);

        const select = this.dom.querySelector(`#team-distribution-${this.id}`);
        select.disabled = true;

        let groupsOver = 0;
        this.groups.forEach(group => group.startMatches(() => {
            ++groupsOver;
            if (groupsOver === this.groups.length) {
                this.onRoundEnded();
            }
        }));
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

function onRoundStarted(event) {
    const round = roundMap[event.target.dataset.roundId];
    round.start(event);
}

function onRoundOrganized(event) {
    const round = roundMap[event.target.parentNode.dataset.roundId];
    round.onRoundOrganized(event);
}