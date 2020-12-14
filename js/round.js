let roundMap = new Map();

class Round {
    constructor(id, number, distribution, winnersPerGroup, teams, xml = null) {
        this.id = id;
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

        this.groups = null;
        this.dom = this.makeDom(xml);

        roundMap[this.id] = this;
    }

    static makeRounds(xml) {
        let rounds = [];
        for (const roundXML of xml.children) {
            rounds.push(
                new Round(
                    document.querySelectorAll('.round-section').length,
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

        const beginButton = document.createElement('button');
        beginButton.dataset.roundId = this.id;
        beginButton.textContent = 'Commencer le tour';
        // beginButton.onclick = startRound;  // TODO

        header.appendChild(beginButton);

        return header;
    }

    makeInfo() {
        const info = document.createElement('div');
        info.classList.add('round-info');
        info.innerHTML = `<p>Nombre d'équipes : ${this.teams.length}</p>`;

        const label = document.createElement('label');
        label.setAttribute('for', `team-distribution-${this.id}`);
        label.textContent = 'Répartition des équipes :';

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

    addGroup(group) {
        const groupsDiv = this.dom.querySelector(`#groups-${this.id}`);
        const addButton = groupsDiv.querySelector('.add-group');
        groupsDiv.insertBefore(group.dom, addButton);

        this.groups.push(group);
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
