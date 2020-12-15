function saveModifications() {
    let query = '';
    let setCount = 0;

    for (const round of Object.values(roundMap)) {
        let currSet = `set${setCount++}`;
        query += `${currSet}=round&${currSet}-number=${round.number}`
               + `&${currSet}-composition=${round.distribution}&`;

        for (const group of round.groups) {
            if (group.teams.length === 0) {
                continue;
            }

            currSet = `set${setCount++}`;
            query += `${currSet}=group&${currSet}-number=${group.number}&${currSet}-teams=`;

            for (const team of group.teams) {
                query += `${team.id},`;
            }
            query = query.slice(0, -1);
            
            query += `&${currSet}-round=${round.number}&`;
        }
    }

    query = query.slice(0, -1);
    const uri = 'tournamentData.php?' + query;

    // console.log(uri);

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
 * 
 * tournamentData.php?set0=round&set0-number=1&set0-composition=1x3 + 1x4&
 *                    set1=group&set1-number=1&set1-teams=7,4,6,1,3,5&set1-round=1&
 *                    set2=group&set2-number=2&set2-teams=2&set2-round=1
 */
