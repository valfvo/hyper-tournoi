let groupMap = new Map();
let groupCreatedCount = 0;

class Group {
    constructor(number, fieldNumber, maxSize, xml = null) {
        this.id = groupCreatedCount;
        this.number = number;
        this.fieldNumber = fieldNumber;
        this.maxSize = maxSize;
        this.round = null;

        if (xml != null) {
            this.teams = Team.makeTeams(xml.querySelector('teams'));
        } else {
            this.teams = [];
        }

        this.matches = [];
        this.onAllMatchesEndedCallback = null;
        this.leaderboard = [];

        this.dom = this.makeDom(xml);

        groupMap[this.id] = this;
        ++groupCreatedCount;
    }

    static makeGroups(xml) {
        let groups = [];
        for (const groupXML of xml.children) {
            groups.push(
                new Group(
                    parseInt(groupXML.getAttribute('number'), 10),                    
                    parseInt(groupXML.getAttribute('field-number'), 10),
                    groupXML.querySelector('teams').childElementCount,
                    groupXML
                )
            );
        }
        return groups;
    }

    makeDom(xml = null) {
        const dom = document.createElement('div');
        dom.classList.add('group');
        dom.id = 'group-' + this.id;
        dom.dataset.groupId = this.id;
        dom.ondrop = onGroupDrop;
        dom.ondragover = allowDrop;

        // addUtilityButtons(dom);  // TODO

        const header = document.createElement('div');
        header.classList.add('container-header');

        const name = document.createElement('h3');
        name.innerHTML = `Poule ${this.number}<br>${this.maxSize} équipes`;

        header.appendChild(name);
        dom.appendChild(header);

        const dropZone = document.createElement('div');
        dropZone.dataset.groupId = this.id;
        dropZone.classList.add('drop-zone');

        if (xml != null) {
            for (const team of this.teams) {
                dropZone.appendChild(this.makeDraggableTeam(team));
            }
        }

        dom.appendChild(dropZone);

        return dom;
    }

    makeDraggableTeam(team) {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('draggable-item');
        teamDiv.dataset.groupId = this.id;
        teamDiv.id = 'team-' + team.id;

        teamDiv.innerText = team.name + ' niveau : ' + team.classification;

        teamDiv.draggable = true;
        teamDiv.ondragstart = dragTeam;

        return teamDiv;
    }

    makeStartMatch() {
        const match = document.createElement('div');
        match.classList.add('match');
        // match.id = `match-${roundId}-${matchCount}`;

        const firstSelect = this.makeMatchSelection();
        const secondSelect = this.makeMatchSelection(firstSelect);

        const score1 = this.makeMatchScore();
        score1.style.display = 'none';

        const score2 = this.makeMatchScore();
        score2.style.display = 'none';

        match.appendChild(firstSelect);
        match.appendChild(score1);

        const versus = document.createElement('span');
        versus.textContent = 'VS';
        match.appendChild(versus);

        match.appendChild(score2);
        match.appendChild(secondSelect);

        // const setCount = document.createElement('input');
        // setCount.textContent = 'Commencer';

        const startMatchButton = document.createElement('button');
        startMatchButton.textContent = 'Commencer';
        // startMatchButton.dataset.matchId = match.id;
        startMatchButton.dataset.groupId = this.id;
        startMatchButton.onclick = onMatchStarted;  // TODO

        match.appendChild(startMatchButton);

        return match;
        // ++matchCount;
    }

    makeMatchSelection(previousSelection = null) {
        let hasRemainingMatches = null;

        if (previousSelection != null) {
            const otherTeam = 
                this.teams.find(team => team.id == previousSelection.value);

            hasRemainingMatches = this.getTeamsNotMet(otherTeam);
            if (hasRemainingMatches.length > 0) {
                const defaultTeam = hasRemainingMatches[0];
                for (const option of previousSelection.children) {
                    if (option.value == defaultTeam.id) {
                        option.remove();
                        break;
                    }
                }
            }
        } else {
            hasRemainingMatches = this.getTeamsWithRemainingMatches();
            if (hasRemainingMatches.length === 0) {
                return null;
            }
        }

        const select = document.createElement('select');
        select.classList.add('match-team-selection');
        select.dataset.groupId = this.id;
        select.onchange = onMatchSelectionChange;

        for (const team of hasRemainingMatches) {
            select.add(this.makeMatchSelectionOption(team));
        }

        return select;
    }

    makeMatchSelectionOption(team) {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;

        return option;
    }

    makeMatchScore() {
        const score = document.createElement('input');
        score.classList.add('match-score');
        // score.name = 'score1';
        score.type = 'number';
        score.min = 0;
        score.value = 0;

        return score;
    }

    addTeam(team) {
        if (this.teams.length === this.maxSize) {
            return false;
        }
        const dropZone = this.dom.querySelector('.drop-zone');
        const draggable = this.makeDraggableTeam(team);
        dropZone.appendChild(draggable);

        this.teams.push(team);
        return true;
    }

    removeTeamDom(teamDom) {
        const teamId = parseInt(teamDom.id.slice(5), 10);
        const index = this.teams.findIndex(e => e.id === teamId);
        if (index > -1) {
            this.teams.splice(index, 1);
            teamDom.remove();
        }
    }

    getTeamFromDom(teamDom) {
        const teamId = parseInt(teamDom.id.slice(5), 10);
        return this.teams.find(e => e.id === teamId);
    }

    getTeamsWithRemainingMatches(idsToFilter = []) {
        const teamsWithRemainingMatches = this.teams.filter(team => {
            if (idsToFilter.includes(team.id)) {
                return false;
            }
            let matchCount = 0;
            for (const match of this.matches) {
                if (match.teams.includes(team)) {
                    ++matchCount;
                }
            }
            return matchCount !== this.teams.length - 1;
        });

        return teamsWithRemainingMatches;
    }

    getTeamsNotMet(team) {
        const teamMetIds = [team.id];

        for (const match of this.matches) {
            const index = match.teams.indexOf(team);
            if (index >= 0) {
                const otherIndex = match.teams.length - 1 - index;
                teamMetIds.push(match.teams[otherIndex].id)
            }
        }

        return this.getTeamsWithRemainingMatches(teamMetIds);
    }

    onGroupDrop(event) {
        const team = event.source.getTeamFromDom(event.draggedTeam);
        if (team) {
            this.updateMaxSize(1);
            this.addTeam(team);
        }

        event.source.removeTeamDom(event.draggedTeam);
        event.source.updateMaxSize(-1);
    }

    onMatchSelectionChange(event) {
        let [targetSelect, otherSelect] = 
            this.dom.querySelectorAll('.match-team-selection');

        if (!targetSelect.isSameNode(event.target)) {
            otherSelect = targetSelect;
            targetSelect = event.target;
        }

        const targetTeam = this.teams.find(team => team.id == targetSelect.value);
        const hasRemainingMatches = 
            this.getTeamsNotMet(targetTeam);

        const otherSelectedTeamId = otherSelect.value;
        otherSelect.textContent = '';

        for (const team of hasRemainingMatches) {
            const option = this.makeMatchSelectionOption(team);
            if (team.id == otherSelectedTeamId) {
                option.selected = true;
            }
            otherSelect.add(option);
        }
    }

    onMatchStarted(event) {
        const opponents = [];
        const teamSelections = this.dom.querySelectorAll('.match-team-selection');
        for (const selection of teamSelections) {
            opponents.push(this.teams.find(team => team.id == selection.value));
            selection.disabled = true;
        }

        const scores = this.dom.querySelectorAll('.match-score');
        for (const score of scores) {
            score.style.display = 'inline';
        }

        event.target.textContent = 'Fin du match';
        event.target.onclick = onMatchEnded;

        this.matches.push(new Match(opponents));
    }

    onMatchEnded(event) {
        const matchDiv = this.dom.querySelector('.match');

        const points = [];
        const scores = matchDiv.querySelectorAll('.match-score');
        for (const score of scores) {
            points.push(parseInt(score.value, 10));
            score.style.display = 'none';
            score.value = 0;
        }

        const lastMatch = this.matches[this.matches.length - 1];
        lastMatch.endSet(points);
        lastMatch.end();

        const teamSelections = matchDiv.querySelectorAll('.match-team-selection');

        const firstSelection = this.makeMatchSelection();
        if (firstSelection != null) {
            const secondSelection = this.makeMatchSelection(firstSelection);
            matchDiv.insertBefore(firstSelection, teamSelections[0]);
            matchDiv.insertBefore(secondSelection, teamSelections[1]);
            event.target.textContent = 'Commencer';
            event.target.onclick = onMatchStarted;
        } else {
            this.onAllMatchesEnded();
        }

        for (const selection of teamSelections) {
            selection.remove();
        }
    }

    onAllMatchesEnded() {
        this.dom.querySelector('.match').remove();

        const matchEnded = document.createElement('div');
        matchEnded.classList.add('match-ended');

        const matchEndedMessage = document.createElement('span');
        matchEndedMessage.textContent = 'Tout les matchs ont été joués';

        matchEnded.appendChild(matchEndedMessage);
        this.dom.appendChild(matchEnded);

        this.leaderboard = [...this.teams].sort(Team.compare).reverse();

        if (typeof this.onAllMatchesEndedCallback === 'function') {
            this.onAllMatchesEndedCallback();
        }
    }

    updateMaxSize(increment) {
        if (increment < 0 && this.maxSize + increment < this.teams.length) {
            return;
        }
        this.maxSize += increment;

        const h3 = this.dom.querySelector('.container-header h3');
        h3.innerHTML = h3.innerHTML.replace(/<br>(\d+)/, '<br>' + this.maxSize);
    }

    startMatches(callback) {
        this.dom.querySelector('.drop-zone').remove();
        this.dom.appendChild(this.makeStartMatch());

        if (typeof callback === 'function') {
            this.onAllMatchesEndedCallback = callback;
        }
    }

    remove() {
        groupMap.delete(this.id);
        this.dom.remove();
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function dragTeam(event) {
    event.dataTransfer.setData('text', event.target.id);
}

class GroupDropEvent {
    constructor(source, draggedTeam) {
        this.source = source;
        this.draggedTeam = draggedTeam;
    }
}

function onGroupDrop(event) {
    const draggedId = event.dataTransfer.getData('text');
    if (typeof draggedId !== 'string' || !draggedId.includes('team-')) {
        return;
    }
    const draggedTeam = document.querySelector(`#${draggedId}`);

    const targetGroupDom = this;
    const targetGroup = groupMap[targetGroupDom.dataset.groupId];

    const sourceGroup = groupMap[draggedTeam.dataset.groupId];

    if (targetGroup.round !== sourceGroup.round) {
        return;
    }

    event.preventDefault();
    targetGroup.onGroupDrop(new GroupDropEvent(sourceGroup, draggedTeam));
}

function onMatchSelectionChange(event) {
    const group = groupMap[event.target.dataset.groupId];
    group.onMatchSelectionChange(event);
}

function onMatchStarted(event) {
    const group = groupMap[event.target.dataset.groupId];
    group.onMatchStarted(event);
}

function onMatchEnded(event) {
    const group = groupMap[event.target.dataset.groupId];
    group.onMatchEnded(event);
}
