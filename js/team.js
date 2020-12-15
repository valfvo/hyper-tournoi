class MatchHistory {
    constructor() {
        this.wonMatchCount = 0,
        this.lostMatchCount = 0,
        this.drawMatchCount = 0,

        this.wonSetCount = 0,
        this.lostSetCount = 0,

        this.wonPointCount = 0,
        this.lostPointCount = 0
    }
}

class Team {
    constructor(id, name, level, classification) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.classification = classification;

        this.matchHistory = new MatchHistory();
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
        // 3: 1x1 + 1x2, 0x2 + 1x3
        // 4: 2x2 + 0x3
        let distributions = [];

        const maxI = Math.floor(Math.sqrt(teamCount));
        for (let i = 1; i <= maxI; ++i) {
            if (teamCount % i === 0) {
                distributions.push(i + 'x' + (teamCount / i));
            }
        }

        // on distribue les équipes de telle sorte que les tailles des poules
        // ont 1 d'écart maximum
        // ex: 24 équipes -> 5x4 + 1x4
        const a = Math.ceil(Math.sqrt(teamCount));
        const b = Math.floor(teamCount / a);
        const c = teamCount - a * b;

        let firstDistribution = (a - c) + 'x' + b; 
        let secondDistribution = c + 'x' + (b + 1);
        
        if (a - c > 0 && c > 0 && b > 1) {
            if (a - c >= c) {
                distributions.push(firstDistribution + ' + ' + secondDistribution);
            } else {
                distributions.push(secondDistribution + ' + ' + firstDistribution);
            }
        }

        firstDistribution = (b - c) + 'x' + a;
        secondDistribution = c + 'x' + (a + 1);

        if (b - c > 0 && c > 0 && a > 1) {
            if (b - c >= c) {
                distributions.push(firstDistribution + ' + ' + secondDistribution);
            } else {
                distributions.push(secondDistribution + ' + ' + firstDistribution);
            }
        }

        return distributions;
    }

    static compare(teamA, teamB) {
        const historyA = teamA.matchHistory;
        const historyB = teamB.matchHistory;

        if (historyA.wonMatchCount > historyB.wonMatchCount) {
            return 1;
        } else if (historyA.wonMatchCount < historyB.wonMatchCount) {
            return -1;
        } else {
            let quotientA = historyA.wonSetCount / historyA.lostSetCount;
            let quotientB = historyB.wonSetCount / historyB.lostSetCount;

            if (quotientA > quotientB) {
                return 1;
            } else if (quotientA < quotientB) {
                return -1;
            } else {
                quotientA = historyA.wonPointCount / historyA.lostPointCount;
                quotientB = historyB.wonPointCount / historyB.lostPointCount;

                if (quotientA > quotientB) {
                    return 1;
                } else if (quotientA < quotientB) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }

    clearMatchHistory() {
        this.matchHistory = new MatchHistory();
    }
}
