class Team {
    constructor(id, name, level, classification) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.classification = classification;
    }

    static makeTeams(data) {
        let teams = [];
        const iterable = NodeList.prototype.isPrototypeOf(data)
            ? data
            : data.children;

        for (const teamXML of iterable) {
            teams.push(
                new Team(
                    parseInt(teamXML.getAttribute('id'), 10),
                    teamXML.getAttribute('name'),
                    parseInt(teamXML.getAttribute('level'), 10),
                    teamXML.getAttribute('classification'),
                )
            );
        }
        return teams;
    }

    static getTeamDistributions(teamCount) {
        let distributions = [];
    
        const maxI = Math.floor(Math.sqrt(teamCount));
        for (let i = 2; i <= maxI; ++i) {
            if (teamCount % i === 0) {
                distributions.push(i + 'x' + (teamCount / i));
            }
        }
    
        const a = Math.ceil(Math.sqrt(teamCount));
        const b = Math.floor(teamCount / a);
        const c = teamCount - a * b;
    
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
}
