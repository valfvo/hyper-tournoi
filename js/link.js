function post(path, params, method='post') {
    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];
    
            form.appendChild(hiddenField);
        }
    }
    
    document.body.appendChild(form);
    form.submit();
}

const linkEvents = document.querySelectorAll(".events");
for (const linkEvent of linkEvents) {
    linkEvent.onclick = function () {
        post('eventDashboard.php', {sessionEvent: linkEvent.id});
    }
}

const linkTournaments = document.querySelectorAll(".tournaments");
for (const linkTournament of linkTournaments) {
    linkTournament.onclick = function () {
        post('tournamentDashboard.php', {sessionTournament: linkTournament.id});
    }
}
