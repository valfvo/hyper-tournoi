class Match {
    constructor(teams) {
        this.teams = teams;
        this.scores = [[10, 2]];
        this.ended = false;
        // TODO ajouter dans la BDD (?)
    }

    endSet(score) {
        if (this.ended) return;

        const winnerIndex = score.indexOf(Math.max(...score));
        const winner = this.teams[winnerIndex];
        const winnerScore = score[winnerIndex];

        const loserIndex = score.indexOf(Math.min(...score));
        const loser = this.teams[score.indexOf(Math.min(...score))];
        const loserScore = score[loserIndex];

        ++winner.matchHistory.wonSetCount;
        winner.matchHistory.wonPointCount += winnerScore;
        winner.matchHistory.lostPointCount += loserScore;

        ++loser.matchHistory.lostSetCount;
        loser.matchHistory.wonPointCount += loserScore;
        loser.matchHistory.lostPointCount += winnerScore;

        this.scores.push(score);
    }

    end() {
        const firstTeamWonSetCount = 
            this.scores.filter(score => score[0] >= score[1]).length;
        const secondTeamWonSetCount = 
            this.scores.filter(score => score[1] >= score[0]).length;

        if (firstTeamWonSetCount > secondTeamWonSetCount) {
            ++this.teams[0].matchHistory.wonMatchCount;
            ++this.teams[1].matchHistory.lostMatchCount;
        } else if (firstTeamWonSetCount < secondTeamWonSetCount) {
            ++this.teams[0].matchHistory.lostMatchCount;
            ++this.teams[1].matchHistory.wonMatchCount;
        } else {
            ++this.teams[0].matchHistory.drawMatchCount;
            ++this.teams[1].matchHistory.drawMatchCount;
        }

        this.ended = true;
    }
}
