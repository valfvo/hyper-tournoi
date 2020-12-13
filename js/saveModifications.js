function saveModifications() {
    let query = '';
    let setCount = 0;
    const rounds = document.querySelectorAll('.round');

    for (const [iRound, round] of rounds.entries()) {
        let currSet = `set${setCount++}`;
        const distribution =
            document.querySelector(`#team-distribution-${iRound}`).value;
        query += `${currSet}=round&${currSet}-number=${iRound+1}`
               + `&${currSet}-composition=${distribution}&`;

        let nGroup = round.childElementCount - 1;
        for (let i = 0; i < nGroup; ++i) {
            let group = round.children[i];
            if (group.childElementCount === 2) {  // only icons and header
                continue;
            }

            currSet = `set${setCount++}`;
            query += `${currSet}=group&${currSet}-number=${i+1}&${currSet}-teams=`;

            let nTeam = parseInt(group.dataset.size);
            for (let j = 0; j < nTeam-1; ++j) {
                let team = group.children[j+2];  // +2: icons and header
                query += `${team.id.slice(5)},`;  // id is like team-#
            }

            let lastTeam = group.lastElementChild;
            query += `${lastTeam.id.slice(5)}&${currSet}-round=${iRound+1}&`;
        }
    }

    query = query.slice(0, -1);
    const uri = 'tournamentData.php?' + query;

    console.log(uri);

    xmlRequest = new XMLHttpRequest();
    xmlRequest.open('GET', encodeURI(uri.replaceAll(' + ', ' ')));
    xmlRequest.send();
}

const saveButton = document.querySelector('#save-button');
saveButton.onclick = saveModifications;

/**
 *  tour 1:
 *    composition: 1x3 + 1x4
 *    poule:
 *      numero: 1,
 *      equipe: g, d, c (by id)
 *    poule:
 *      numero: 2,
 *      equipe: b, e, f, a (by id)
 *
 *  url: *.php?set=round&set-num=1&set-comp=1x3 + 1x4
 *             set1=group&set1-number=1&teams1=1,2,3&round1=1
 *             set2=group&num2=2&teams=4,5,6,7&round2=2
 *
 *  url: *.php?set=round&num=1&comp=1x3 + 1x4
 *             set1=group&num1=1&teams1=1,2,3&round1=1
 *             set2=group&num2=2&teams2=4,5,6,7&round2=2
 *             ...
 *             set11=group&num11=1&teams11=1,2,3&round11=1
 */
