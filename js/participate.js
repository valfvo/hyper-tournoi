const participateButtons = 
    document.body.querySelectorAll('.participate-button');

for (const participateButton of participateButtons) {
    participateButton.onclick = addParticipateForm;
}

function makeLabelAndInput(id, labelText, name) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.name = name;

    return [label, input];
}

function addParticipateForm(event) {
    event.target.onclick = null;
    const tournamentId = event.target.dataset.tournamentId;
    const form = document.createElement('form');
    form.method = 'get';
    form.action = 'inscription.php';

    const gameType = event.target.dataset.gameType;
    const playersCount = gameType;
    const hiddenPlayerCount = document.createElement('input');
    hiddenPlayerCount.name = 'players-count';
    hiddenPlayerCount.value = playersCount;
    hiddenPlayerCount.hidden = true;
    const hiddenTournamentId = document.createElement('input');
    hiddenTournamentId.name = 'tournament-id';
    hiddenTournamentId.value = tournamentId;
    hiddenTournamentId.hidden = true;

    form.appendChild(hiddenPlayerCount);
    form.appendChild(hiddenTournamentId);

    form.classList.add('standard-form', 'row-form');

    let [label, input] = makeLabelAndInput(
        `#team-name-input-${tournamentId}`,
        "Nom de l'équipe",
        'team-name'
    );
    label.classList.add('player-team-label');
    input.classList.add('player-team-input');

    const teamNameInput = document.createElement('div');
    teamNameInput.classList.add('team-name-input');

    teamNameInput.appendChild(label);
    teamNameInput.appendChild(input);
    form.appendChild(teamNameInput);

    for (let i = 0; i < playersCount; ++i) {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player-info');

        [label, input] = makeLabelAndInput(
            `#last-name-input-${tournamentId}-${i}`,
            `Nom joueur ${i+1}`,
            `player-last-name-${i}`
        );
        playerDiv.appendChild(label);
        playerDiv.appendChild(input);

        [label, input] = makeLabelAndInput(
            `#first-name-input-${tournamentId}-${i}`,
            `Prénom joueur ${i+1}`,
            `player-first-name-${i}`
        );
        playerDiv.appendChild(label);
        playerDiv.appendChild(input);

        const playerLevelLabel = document.createElement('label');
        playerLevelLabel.setAttribute('for', `level-${tournamentId}-${i}`);
        playerLevelLabel.textContent = `Niveau joueur ${i+1}`;

        const playerLevelSelect = document.createElement('select');
        playerLevelSelect.name = `player-level-${i}`;
        playerLevelSelect.id = `level-${tournamentId}-${i}`;

        const options = makeSelectOptions();
        options.forEach(option => playerLevelSelect.add(option));
        
        playerDiv.appendChild(playerLevelLabel);
        playerDiv.appendChild(playerLevelSelect);
        form.appendChild(playerDiv);
    }

    const submit = document.createElement('input');
    submit.classList.add('validate-participation');
    submit.type = 'submit';
    submit.value = 'Valider';
    form.appendChild(submit);

    const tournament = document.body.querySelector('#tournament-' + tournamentId);
    tournament.parentNode.insertBefore(form, tournament.nextSibling);
}

function makeSelectOption(value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;

    return option;
}

function makeSelectOptions() {
    return [
        makeSelectOption('loisir'),
        makeSelectOption('departemental'),
        makeSelectOption('regional'),
        makeSelectOption('N3'),
        makeSelectOption('N2'),
        makeSelectOption('elite'),
        makeSelectOption('pro')
    ];
}
