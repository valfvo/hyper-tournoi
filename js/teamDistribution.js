function addGroup() {
    const group = document.createElement('div');
    group.classList.add('group-stage');
    addUtilityButtons(group);

    const round = document.querySelector('#round1');
    round.insertBefore(group, this);

}

const teamDistribution = document.querySelector("#team-distribution");
teamDistribution.onchange = (event) => {
    let distribution = teamDistribution.value;
};

// mettre distribution dans la bdd (composition tour)
