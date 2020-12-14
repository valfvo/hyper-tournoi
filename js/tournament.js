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

// function allowDrop(event) {
//     if (event.target.classList.contains("group")) {
//         event.preventDefault();
//     }
// }

// function dragTeam(event) {
//         event.dataTransfer.setData('text', event.target.id);
// }

// function updateGroupSize(group, increment) {
//     const header = group.querySelector('h3');
//     group.dataset.size = parseInt(group.dataset.size, 10) + increment;

//     header.innerHTML = 
//         header.innerHTML.replace(/<br>(\d+)/, '<br>' + group.dataset.size);
// }

// function dropGroup(event) {
//     if (event.target.classList.contains("group")) {
//         event.preventDefault();
//         const idDragged = event.dataTransfer.getData('text');
//         const dragged = document.querySelector(`#${idDragged}`);

//         updateGroupSize(dragged.parentNode, -1);

//         event.target.appendChild(document.querySelector(`#${idDragged}`));
//         updateGroupSize(event.target, 1);
//     }
// }

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


function fetchTournamentData() {
    xmlRequest = new XMLHttpRequest();
    xmlRequest.onreadystatechange = function() {
        if (
            this.readyState === XMLHttpRequest.DONE
            && this.status === 200
        ) {
            const xml = this.responseXML;
            const roundsXML = xml.querySelector('rounds');
            for (const round of Round.makeRounds(roundsXML)) {
                document.body.appendChild(round.dom);
            }
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
