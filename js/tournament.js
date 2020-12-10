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
    console.log(group.firstElementChild.firstElementChild);
    group.firstElementChild.firstElementChild.style.display = 'inline';
    this.parentNode.remove();
}

let olX = 0, oldOffsetY = 0;
let x = 0, y = 0;

function dragMouseDown(event) {
    // console.log(event.target);
    event.preventDefault();
    // event.stopPropagation();

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

const addGroupButtons = document.querySelectorAll('.add-group-stage');

for (const button of addGroupButtons) {
    button.onclick = function () {
        const group = document.createElement('div');
        group.classList.add('group-stage');
        addUtilityButtons(group);
        // group.onclick = removeOnClick;
        this.parentNode.insertBefore(group, this);
    }
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
