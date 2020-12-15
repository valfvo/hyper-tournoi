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
        if (teamCount <= 1) return [];
        let distributions = ['1x' + teamCount];

        const maxI = Math.floor(Math.sqrt(teamCount));
        for (let i = 2; i <= maxI; ++i) {
            if (teamCount % i === 0) {
                const rest = teamCount / i;
                distributions.push(i + 'x' + rest);
                if (rest != i) distributions.push(rest + 'x' + i);
            }
        }

        // on distribue les équipes de telle sorte que les tailles des poules
        // ont 1 d'écart maximum
        // ex: 24 équipes -> 5x4 + 1x4
        const a = Math.ceil(Math.sqrt(teamCount));
        const b = Math.floor(teamCount / a);
        const c = teamCount - a * b;

        if (c !== 0) {
            const first = Team.getAlmostUniformDistribution(a, b, c);
            if (first) {
                distributions.push(first);
            }

            const second = Team.getAlmostUniformDistribution(b, a, c);
            if (second && second != first) {
                distributions.push(second);
            }
        }

        if (teamCount % 2 == 1  && teamCount > 3) {
            const evenTeamCount = Math.floor(teamCount / 2) - 1;
            const even = evenTeamCount + 'x2';
            const odd = '1x3';
            if (
                !(distributions.includes(even + ' + ' + odd)
                || distributions.includes(odd + ' + ' + even))
            ) {
                distributions.push(even + ' + ' + odd);
            }
        }
        return distributions;
    }

    static getAlmostUniformDistribution(a, b, c) {
        if (b > 1 && c > 1 && Math.abs(b - c) === 1) {
            return a + 'x' + b + ' + 1x' + c;
        } else {
            const first = (a - c) + 'x' + b; 
            const second = c + 'x' + (b + 1);

            if (a - c > 0 && c > 0 && b > 1) {
                if (a - c >= c) {
                    return first + ' + ' + second;
                } else {
                    return second + ' + ' + first;
                }
            }

            return '';
        }
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
