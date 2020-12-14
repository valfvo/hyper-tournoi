let groupMap = new Map();
let groupCreatedCount = 0;

class Group {
    constructor(number, fieldNumber, maxSize, xml = null) {
        this.id = groupCreatedCount;
        this.number = number;
        this.fieldNumber = fieldNumber;
        this.maxSize = maxSize;

        if (xml != null) {
            this.teams = Team.makeTeams(xml.querySelector('teams'));
        } else {
            this.teams = [];
        }

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

    onGroupDrop(event) {
        const team = event.source.getTeamFromDom(event.draggedTeam);
        if (team) {
            this.updateMaxSize(1);
            this.addTeam(team);
        }

        event.source.removeTeamDom(event.draggedTeam);
        event.source.updateMaxSize(-1);
    }

    updateMaxSize(increment) {
        if (increment < 0 && this.maxSize + increment < this.teams.length) {
            return;
        }
        this.maxSize += increment;

        const h3 = this.dom.querySelector('.container-header h3');
        h3.innerHTML = h3.innerHTML.replace(/<br>(\d+)/, '<br>' + this.maxSize);
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
    const targetGroupDom = this;
    const targetGroup = groupMap[targetGroupDom.dataset.groupId];

    const draggedId = event.dataTransfer.getData('text');
    const draggedTeam = document.querySelector(`#${draggedId}`);

    const sourceGroup = groupMap[draggedTeam.dataset.groupId];

    event.preventDefault();
    targetGroup.onGroupDrop(new GroupDropEvent(sourceGroup, draggedTeam));
}
