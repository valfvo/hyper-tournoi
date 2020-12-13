function createTeamOption(teamId, teamName) {
    const option = document.createElement('option');
    option.id = teamId;
    option.value = teamId;
    option.textContent = teamName;

    return option;
}

/**
 * Commence un tour
 * - bloque menu repartition
 * - clear le drag & drop des poules
 * - menu deroulant pour choisir le match
 * - bouton pour commencer le match
 *   -> bloque les choix d'equipes
 *   -> bouton modif scores
 *   -> terminer le match
 * - creer les match dans la bdd
 */
function startRound(event) {
    const roundId = event.target.dataset.roundId;
    event.target.remove();

    // const roundSection = document.querySelector(`round-section-${roundId}`);
    const groups = document.querySelector(`#round-${roundId}`);

    const select = document.querySelector(`#team-distribution-${roundId}`);
    select.disabled = true;

    let matchCount = 0;
    for (const group of groups.children) {
        if (group.classList.contains('group-stage')) {
            const match = document.createElement('div');
            match.classList.add('match');
            match.id = `match-${roundId}-${matchCount}`;

            const leftSelect = document.createElement('select');
            const rightSelect = document.createElement('select');

            for (let i = group.children.length - 1; i >= 0 ; --i) {
                const team = group.children[i];
                if (team.id.includes('team')) {
                    team.remove();

                    const teamName = team.textContent.split(' niveau :')[0];
                    leftSelect.add(createTeamOption(team.id, teamName));
                    rightSelect.add(createTeamOption(team.id, teamName));
                }
            }

            const score1 = document.createElement('input');
            const score2 = document.createElement('input');
            score1.type = 'number';
            score1.name = 'score1';
            score1.min = 0;
            score1.value = 0;
            score1.style.display = 'none';

            score2.type = 'number';
            score2.name = 'score1';
            score2.min = 0;
            score2.value = 0;
            score2.style.display = 'none';

            match.appendChild(leftSelect);
            match.appendChild(score1);

            const versus = document.createElement('span');
            versus.textContent = 'VS';
            match.appendChild(versus);

            match.appendChild(score2);
            match.appendChild(rightSelect);

            // c
            const setCount = document.createElement('input');
            setCount.textContent = 'Commencer';

            const startMatchButton = document.createElement('button');
            startMatchButton.textContent = 'Commencer';
            startMatchButton.dataset.matchId = match.id;
            startMatchButton.onclick = startMatch;

            match.appendChild(startMatchButton);

            group.appendChild(match);
            ++matchCount;
        }
    }
}

function startMatch(event) {
    console.log("oui");
    const matchId = event.target.dataset.matchId;
    console.log(matchId);
    const match = document.querySelector(`#${matchId}`);
    const selects = match.querySelectorAll('select');
    const scores = match.querySelectorAll('input');
    const startMatchButton = match.querySelector('button');
    const endMatchButton = document.createElement('button');
    endMatchButton.textContent = 'Fin du match';
    endMatchButton.matchId = matchId;
    // endMatchButton.onclick = endMatch;

    selects[0].disabled = true;
    selects[1].disabled = true;

    scores[0].style.display = 'inline';
    scores[1].style.display = 'inline';

    startMatchButton.remove();

    match.appendChild(endMatchButton);
}