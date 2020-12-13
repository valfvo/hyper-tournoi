fetchTournamentData();

function removeOnClick() {
    this.remove();
}

let draggable = null;
let draggableID = 0;
let draggableMap = {};

function removePopup() {
    const group = draggableMap[this.parentNode.id];
    delete draggableMap[this.parentNode.id];

    group.classList.remove('dragged');
    group.firstElementChild.firstElementChild.style.display = 'inline';
    this.parentNode.remove();
}

let olX = 0, oldOffsetY = 0;
let x = 0, y = 0;

function dragMouseDown(event) {
    event.preventDefault();

    draggable = event.target;
    draggable.parentNode.appendChild(draggable);
    // draggable.classList.add('draggable-group');

    oldX = event.clientX;
    oldY = event.clientY;

    document.onmousemove = elementDrag;
    document.onmouseup = closeDragElement;
}

// function getBoundedWidth(element, width) {
//     const maxWidth = 
//         document.documentElement.clientWidth - element.offsetWidth - 0.1;

//     return Math.min(Math.max((element.offsetLeft - offsetX), 0), maxWidth);
// }


function elementDrag(event) {
    event.preventDefault();
    
    offsetX = oldX - event.clientX;
    offsetY = oldY - event.clientY;
    oldX = event.clientX;
    oldY = event.clientY;
    
    const maxWidth = document.documentElement.clientWidth - draggable.offsetWidth - 0.1;
    const maxHeight = document.documentElement.clientHeight - draggable.offsetHeight - 0.1;
    
    draggable.style.left = Math.min(Math.max((draggable.offsetLeft - offsetX), 0), maxWidth) + 'px';
    draggable.style.top = Math.min(Math.max((draggable.offsetTop - offsetY), 0), maxHeight) + 'px';
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}

function allowDrop(event) {
    if (event.target.classList.contains("group-stage")) {
        event.preventDefault();
    }
}

function dragTeam(event) {
        event.dataTransfer.setData('text', event.target.id);
}

function updateGroupSize(group, increment) {
    const header = group.querySelector('h3');
    group.dataset.size = parseInt(group.dataset.size, 10) + increment;

    header.innerHTML = 
        header.innerHTML.replace(/<br>(\d+)/, '<br>' + group.dataset.size);
}

function dropGroup(event) {
    if (event.target.classList.contains("group-stage")) {
        event.preventDefault();
        const idDragged = event.dataTransfer.getData('text');
        const dragged = document.querySelector(`#${idDragged}`);

        updateGroupSize(dragged.parentNode, -1);

        event.target.appendChild(document.querySelector(`#${idDragged}`));
        updateGroupSize(event.target, 1);
    }
}

function addGroup(size) {
    const group = document.createElement('div');
    group.dataset.size = size;
    group.classList.add('group-stage');
    group.ondrop = dropGroup;
    group.ondragover = allowDrop;

    addUtilityButtons(group);

    const header = document.createElement('div');
    const name = document.createElement('h3');

    const round = document.querySelector('#round-0');
    header.classList.add('container-header');
    name.innerHTML = `Poule ${round.childElementCount}<br>${size} équipes`;
    header.appendChild(name);
    group.appendChild(header);

    round.insertBefore(group, round.lastElementChild);
}

const addGroupButtons = document.querySelectorAll('.add-group-stage');

for (const button of addGroupButtons) {
    button.onclick = addGroup;
}

function addUtilityButtons(element) {
    const buttons = document.createElement('div');
    buttons.classList.add('group-icons');

    const maximizeButton = document.createElement('img');
    maximizeButton.src = 'images/maximize-icon.svg'
    maximizeButton.alt = 'maximize';
    maximizeButton.onclick = createPopup;
    
    const removeButton = document.createElement('img');
    removeButton.src = 'images/remove-icon.svg';
    removeButton.alt = 'close';
    removeButton.onclick = () => {
        for (const [popupID, group] of Object.entries(draggableMap)) {
            if (group === element) {
                const popup = document.querySelector(`#${popupID}`);
                popup.remove();
            }
        }
        element.remove();
    };
    
    buttons.appendChild(maximizeButton);
    buttons.appendChild(removeButton);
    element.appendChild(buttons);
};

const groups = document.querySelectorAll('.group-stage');

function createPopup() {
    this.style.display = 'none';
    
    const draggableGroup = document.createElement('div');
    draggableGroup.classList.add('draggable-group');
    draggableGroup.id = `draggable${draggableID}`;
    draggableGroup.onmousedown = dragMouseDown;
    
    document.body.appendChild(draggableGroup);
    
    const closeButton = document.createElement('img');
    closeButton.src = 'images/close-icon.svg';
    closeButton.alt = 'close';
    closeButton.classList.add('close-icon');
    closeButton.onmouseup = removePopup;

    draggableGroup.appendChild(closeButton);

    const group = this.parentNode.parentNode;

    const rect = group.getBoundingClientRect();
    draggableGroup.style.top = rect.top + 'px';
    draggableGroup.style.left = rect.left + 'px';

    // const maxLeft = document.documentElement.clientWidth - draggableGroup.offsetWidth - 0.1;
    // const maxTop = document.documentElement.clientHeight - draggableGroup.offsetHeight - 0.1;

    // draggableGroup.style.left = Math.min(rect.left, maxLeft) + 'px';
    // draggableGroup.style.top = Math.min(rect.top, maxTop) + 'px';
    
    group.classList.add('dragged');

    draggableMap[draggableGroup.id] = group;
    ++draggableID;
}

for (const group of groups) {
    addUtilityButtons(group);
}

function distributeTeams(teams, round) {
    // Méthode du serpentin
    [...teams.children]
        .sort((a, b) => {
            const levelA = a.getAttribute('level');
            const levelB = b.getAttribute('level');
            if (levelA < levelB) {
                return -1;
            } else if (levelA > levelB) {
                return 1;
            } else {
                return 0;
            }
        })
        .forEach(team => teams.appendChild(team));

    let iTeam = 0;
    let nTeam = teams.childElementCount;
    let iGroup = 0;
    let nGroup = round.children.length - 1;
    let direction = 1;

    while (iTeam < nTeam) {
        let group = round.children[iGroup];
        let size = parseInt(group.dataset.size, 10);

        if (group.childElementCount < size + 2) {
            let team = document.createElement('div');
            team.classList.add('draggable-item');
            team.id = 'team-' + teams.children[iTeam].getAttribute('id');

            team.innerText = 
                teams.children[iTeam].getAttribute('name') + " niveau : "
                + teams.children[iTeam].getAttribute('classification');

            team.draggable = true;
            team.ondragstart = dragTeam;

            group.appendChild(team);
            ++iTeam;
        }

        iGroup += direction;

        if (iGroup < 0 || iGroup > nGroup - 1) {
            direction = -direction;
            iGroup += direction;
        }
    }
}

// const teamDistribution = document.querySelector("#team-distribution-0");

function changeSelect(event) {
    // teamDistribution.onchange = (event) => {
        let distribution = event.target.value;
        let re = /^(\d+)x(\d+)( \+ (\d+)x(\d+))?$/;
        let matches = re.exec(distribution);
        if (matches) {
            let values = matches.map(e => {
                let res = parseInt(e, 10);
                return isNaN(res) ? 0 : res;
            });
            let [group1, team1] = values.slice(1, 3);
            let [group2, team2] = values.slice(4);

            const round = document.querySelector('#round-0');
            const addButton = round.lastElementChild;
            round.textContent = '';
            round.appendChild(addButton);

            for (let i = 0; i < group1; ++i) {
                addGroup(team1);
            }
            for (let i = 0; i < group2; ++i) {
                addGroup(team2);
            }

            xmlRequest = new XMLHttpRequest();
            xmlRequest.onreadystatechange = function() {
                if (
                    this.readyState === XMLHttpRequest.DONE
                    && this.status === 200
                ) {
                    const xml = this.responseXML;
                    const teams = xml.querySelector('teams');
                    distributeTeams(teams, round);
                }
            };
            xmlRequest.open('GET', 'tournamentData.php?get=teams');
            xmlRequest.send();
        }
    };
// }


function getTeamDistributions(count) { // Liste des distributions
    let distributions = [];

    const maxI = Math.floor(Math.sqrt(count));
    for (let i = 2; i <= maxI; ++i) {
        if (count % i === 0) {
            distributions.push(i + 'x' + (count / i));
        }
    }

    const a = Math.ceil(Math.sqrt(count));
    const b = Math.floor(count / a);
    const c = count - a * b;

    let firstDistribution = (a - c) + 'x' + b;
    let secondDistribution = c + 'x' + (b + 1);

    if (a - c >= c) {
        distributions.push(firstDistribution + ' + ' + secondDistribution);
    } else {
        distributions.push(firstDistribution + ' + ' + secondDistribution);
    }

    firstDistribution = (b - c) + 'x' + a;
    secondDistribution = c + 'x' + (a + 1);

    if (b - c >= c) {
        distributions.push(firstDistribution + ' + ' + secondDistribution);
    } else {
        distributions.push(firstDistribution + ' + ' + secondDistribution);
    }

    return distributions;
}

function createTeam(team) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('draggable-item');
    teamDiv.id = 'team-' + team.id;

    teamDiv.innerText = team.name + " niveau : " + team.classification;

    teamDiv.draggable = true;
    teamDiv.ondragstart = dragTeam;

    return teamDiv;
}

function createTeams(teamsXML) {
    const teams = [];
    for (const teamXML of teamsXML.children) {
        const team = {
            xml: teamXML,
            id: parseInt(teamXML.getAttribute('id'), 10),
            name: teamXML.getAttribute('name'),
            level: parseInt(teamXML.getAttribute('level'), 10),
            classification: teamXML.getAttribute('classification'),
        };
        teams.push(createTeam(team));
    }
    return teams;
}

function createGroup(group) {
    const teamsXML = group.xml.querySelector('teams');
    const size = teamsXML.childElementCount;

    const groupDiv = document.createElement('div');
    groupDiv.dataset.size = size;
    groupDiv.classList.add('group-stage');
    groupDiv.ondrop = dropGroup;
    groupDiv.ondragover = allowDrop;

    addUtilityButtons(groupDiv);

    const header = document.createElement('div');
    header.classList.add('container-header');

    const name = document.createElement('h3');
    name.innerHTML = `Poule ${group.number}<br>${size} équipes`;

    header.appendChild(name);
    groupDiv.appendChild(header);

    for (const team of createTeams(teamsXML)) {
        groupDiv.appendChild(team);
    }
    // document.body.appendChild(groupDiv);

    return groupDiv;
}

function createGroups(groupsXML) {
    let groups = [];
    for (const groupXML of groupsXML.children) {
        const group = {
            xml: groupXML,
            number: parseInt(groupXML.getAttribute('number'), 10),
            fieldNumber: parseInt(groupXML.getAttribute('field-number'), 10)
        };
        groups.push(createGroup(group));
    }
    return groups;
}

function createRoundHeader(round) {
    const header = document.createElement('div');
    header.classList.add('container-header');
    header.innerHTML = `<h2>Tour ${round.number}</h2>`;
    const startRoundButton = document.createElement('button');
    // startRoundButton.id = `start-round${round.number}`;
    startRoundButton.dataset.roundId = round.id;
    startRoundButton.textContent = 'Commencer le tour';
    header.appendChild(startRoundButton);
    startRoundButton.onclick = startRound;

    return header;
}

function createRoundInfo(round) {
    const info = document.createElement('div');
    info.classList.add('round-info');
    info.innerHTML = `<p>Nombre d'équipes : ${round.teamCount}</p>`;

    const label = document.createElement('label');
    label.setAttribute('for', `team-distribution-${round.id}`);
    label.textContent = 'Répartition des équipes :';  

    const select = document.createElement('select');
    select.id = `team-distribution-${round.id}`;
    select.innerHTML = 
        '<option value="none" class="placeholder">choisir</option>';

    const distributions = getTeamDistributions(round.teamCount);
    for (const distribution of distributions) {
        const option = document.createElement('option');
        option.value = distribution;
        option.textContent = distribution;
        option.selected = distribution === round.distribution;

        select.add(option);
    }
    select.onchange = changeSelect;

    info.appendChild(label);
    info.appendChild(select);
    
    return info;
}

function createRoundList(round) {
    const list = document.createElement('div');
    list.id = 'round-' + round.id;
    list.classList.add('round');

    for (const group of createGroups(round.xml.querySelector('groups'))) {
        list.appendChild(group);
    }
    
    // console.log(list.querySelector('.group-stage').ondrop);
    // console.log(list.innerHTML);
    list.insertAdjacentHTML('beforeend',
                            '<button class="add-group-stage">&plus;</button>');
    // console.log(list.querySelector('.group-stage').ondrop);
    // console.log(list);
    return list;
}

function createRound(round) {
    const roundSection = document.createElement('div');
    roundSection.id = 'round-section-' + round.id;
    roundSection.classList.add('round-section');

    roundSection.appendChild(createRoundHeader(round));
    roundSection.appendChild(createRoundInfo(round));
    roundSection.appendChild(createRoundList(round));

    return roundSection;
}

function createRounds(roundsXML) {
    const rounds = [];
    for (const roundXML of roundsXML.children) {
        const round = {
            xml: roundXML,
            id: document.querySelectorAll('.round-section').length,
            number: parseInt(roundXML.getAttribute('number'), 10),
            distribution: roundXML.getAttribute('distribution'),
            winnersPerGroup: parseInt(roundXML.getAttribute('winners-per-group'), 10),
            teamCount: parseInt(roundXML.getAttribute('team-count'), 10)
        };
        rounds.push(createRound(round));
    }
    return rounds;
}

function fetchTournamentData() {
    xmlRequest = new XMLHttpRequest();
    xmlRequest.onreadystatechange = function() {
        if (
            this.readyState === XMLHttpRequest.DONE
            && this.status === 200
        ) {
            const xml = this.responseXML;
            const roundsXML = xml.querySelector('rounds');
            for (const round of createRounds(roundsXML)) {
                document.body.appendChild(round);
            }
            // TODO with rounds
        }
    };
    xmlRequest.open('GET', 'tournamentData.php?get=rounds');
    xmlRequest.send();
    /**
     * Récupérer dans la BDD la composition du tour + les poules + les composes
     * query = "php?get=rounds";
     *  <rounds>
     *    <round number="1" composition="repartition|nbGagnants">
     *      <group number="1">
     *        <team name="" level="" classification=""/>
     *      </group>
     *    </round>
     *  </rounds>
     */
}
