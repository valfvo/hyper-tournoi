<?php
session_start();
include("DBConnection.php");
header("Content-type: text/xml");
$tournamentId = $_SESSION["currTournamentID"];

echo '<?xml version="1.0" encoding="utf-8"?>';

class DatabaseModel {    
    private static $dbh;
    private static $currTournamentId;

    public static $playerLevelMap;

    public static function init() {
        self::$dbh = $GLOBALS["dbh"];
        self::$currTournamentId = $_SESSION["currTournamentID"];

        self::$playerLevelMap = array(
            "loisir" => 7,
            "departemental" => 6,
            "regional" => 5,
            "N3" => 4,
            "N2" => 3,
            "elite" => 2,
            "pro" => 1
        );
    }

    public static function getRounds() {
        $roundsQuery = "SELECT * FROM Tour
                        WHERE idTournoi = " . self::$currTournamentId;

        $sqlTeamCount = "SELECT COUNT(*) AS team_count FROM Equipe E, Inscription I
                         WHERE E.idEquipe = I.idEquipe
                         AND idTournoi = " . self::$currTournamentId;
        $teamCount = self::$dbh->query($sqlTeamCount)->fetch()['team_count'];

        echo "<rounds>";
        foreach (self::$dbh->query($roundsQuery) as $round) {
            [$distribution, $winnersPerGroup] = 
                explode("|", $round['composition']);
            $distribution = str_replace(" ", " + ", $distribution);

            echo "<round number=\"{$round['numero']}\""
                 . " distribution=\"$distribution\""
                 . " winners-per-group=\"$winnersPerGroup\""
                 . " team-count=\"$teamCount\">";
            self::getGroups($round['idtour']);
            echo "</round>";
        }
        echo "</rounds>";
    }

    public static function getGroups($numRound) {
        $sqlGetGroups = "SELECT * FROM Poule WHERE idTour = $numRound";
        echo "<groups>";

        foreach (self::$dbh->query($sqlGetGroups) as $group) {
            echo "<group number=\"{$group['numero']}\""
                 . " field-number=\"{$group['numterrain']}\">";
            self::getTeams($group['idpoule']);
            echo "</group>";
        }

        echo "</groups>";
    }

    public static function getTeams($groupId = null) {
        $sqlTeams = "SELECT * FROM Equipe E, Inscription I
                     WHERE E.idEquipe = I.idEquipe
                     AND idTournoi = " . self::$currTournamentId;
        if (isset($groupId)) {
            $sqlTeams = "SELECT * FROM Equipe E, Compose C
                         WHERE E.idEquipe = C.idEquipe
                         AND C.idPoule = $groupId";
        }    

        $sqlPlayerLevels = "SELECT niveau FROM Joueur J, Membre M
                        WHERE J.idJoueur = M.idJoueur AND idEquipe = ?";
        $sqlLevels = self::$dbh->prepare($sqlPlayerLevels);

        echo '<teams>';

        foreach (self::$dbh->query($sqlTeams) as $team) {
            $sqlLevels->execute(array($team['idequipe']));

            $levels = $sqlLevels->fetchAll();
            $levels = array_map(function ($e) { 
                return DatabaseModel::$playerLevelMap[$e['niveau']];
            }, $levels);

            $avgLevel = round(array_sum($levels) / count($levels));
            $classification = array_search($avgLevel, self::$playerLevelMap);

            echo "<team id=\"{$team['idequipe']}\" name=\"{$team['nom']}\" "
                 . "level=\"$avgLevel\" classification=\"$classification\"/>";
        }

        echo '</teams>';
    }

    public static function updateRound($currSet) {
        $number = $_GET[$currSet . '-number'];
        $composition = $_GET[$currSet . '-composition'] . "|1";

        $sqlTest = "SELECT idTour FROM Tour"
                 . " WHERE idTournoi = " . self::$currTournamentId
                 . " AND numero = $number";
        $roundId = self::$dbh->query($sqlTest)->fetch()['idtour'];

        $sqlQuery = "";
        if (isset($roundId)) {
            $sqlQuery = "UPDATE Tour SET composition = '$composition'
                         WHERE idTour = $roundId";
            self::$dbh->query("DELETE FROM Poule WHERE idTour = $roundId");
        } else {
            $sqlQuery = "INSERT INTO Tour (idTournoi, numero, composition)"
                      . " VALUES (" . self::$currTournamentId
                                    . ", $number, '$composition')";
        }
        self::$dbh->query($sqlQuery);
    }

    public static function updateGroup($currSet) {
        $number = $_GET[$currSet . '-number'];
        $round = $_GET[$currSet . '-round'];
        $rawTeams = $_GET[$currSet . '-teams'];
        $teams = explode(",", $rawTeams);

        $roundQuery = "SELECT idTour FROM Tour"
                    . " WHERE idTournoi = " . self::$currTournamentId
                    . " AND numero = $round";
        $roundId = self::$dbh->query($roundQuery)->fetch()['idtour'];

        if (!isset($roundId)) {
            return;
        }

        $groupQuery = "SELECT idPoule FROM Poule
                       WHERE idTour = $roundId AND numero = $number";
        $groupId = self::$dbh->query($groupQuery)->fetch()['idpoule'];

        if (isset($groupId)) {
            $sqlQuery = "UPDATE Poule SET numero = '$number', numTerrain = 1
                         WHERE idPoule = $groupId";
            self::$dbh->query($sqlQuery);
        } else {
            $sqlQuery = "INSERT INTO Poule (idTour, numero, numTerrain)
                         VALUES ($roundId, $number, 1)";
            self::$dbh->query($sqlQuery);
            $groupId = self::$dbh->lastInsertId();
        }

        self::$dbh->query("DELETE FROM Compose WHERE idPoule = $groupId");
        foreach ($teams as $team) {
            self::$dbh->query("INSERT INTO Compose VALUES ($groupId, $team)");
        }
    }
}

DatabaseModel::init();

if (isset($_GET['get'])) {
    $methodName = 'get' . ucfirst(strtolower($_GET['get']));

    if (method_exists('DatabaseModel', $methodName)) {
        DatabaseModel::$methodName();
    }
}

$currSet = 'set0';
while (isset($_GET[$currSet])) {
    $methodName = 'update' . ucfirst(strtolower($_GET[$currSet]));

    if (method_exists('DatabaseModel', $methodName)) {
        DatabaseModel::$methodName($currSet);
    }

    $currSet = 'set' . (substr($currSet, -1) + 1);
}

?>
