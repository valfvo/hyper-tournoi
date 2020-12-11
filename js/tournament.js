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
    if(event.target.classList.contains("group-stage")) {
        event.preventDefault();
    }
}

function dragTeam(event) {
        event.dataTransfer.setData('text', event.target.id);
}

function dropGroup(event) {
    if(event.target.classList.contains("group-stage")) {
        event.preventDefault();
        let data = event.dataTransfer.getData('text');
        event.target.appendChild(document.querySelector(`#${data}`));
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
    const round = document.querySelector('#round1');
    
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
    let changeDir = false;

    while (iTeam < nTeam) {
        console.log(iGroup);
        // console.log("nGroup: ", nGroup);
        let group = round.children[iGroup];
        // console.log("group : ", group);
        let size = parseInt(group.dataset.size);
        let team = document.createElement('div');
        team.classList.add('draggable-item');
        team.id = "team" + teams.children[iTeam].getAttribute('id');
        // console.log("classification : ", teams.children[iTeam].getAttribute('classification'));
        team.innerText = teams.children[iTeam].getAttribute('name') + " niveau : " +
                         teams.children[iTeam].getAttribute('classification');
        team.draggable = true;
        team.ondragstart = dragTeam;
        group.appendChild(team);

        iGroup += direction;

        if (iGroup === 0 || iGroup === nGroup - 1) {
            direction = -direction;
            changeDir = true;
        } else if (changeDir) {
            iGroup -= direction;
            changeDir = false;
        }
        ++iTeam;
    }
}

const teamDistribution = document.querySelector("#team-distribution");

teamDistribution.onchange = (event) => {
    let distribution = event.target.value;
    let re = /^(\d+)x(\d+)( \+ (\d+)x(\d+))?$/;
    let matches = re.exec(distribution);
    if (matches) {
        if (teamDistribution.firstElementChild.value === 'none') {
            teamDistribution.firstElementChild.remove();
        }
        let values = matches.map(e => {
            let res = parseInt(e, 10);
            return isNaN(res) ? 0 : res;
        });
        let [group1, team1] = values.slice(1, 3);
        let [group2, team2] = values.slice(4);

        const round = document.querySelector('#round1');
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
        xmlRequest.open('GET','tournamentData.php?data=teams');
        xmlRequest.send();
    }
};
