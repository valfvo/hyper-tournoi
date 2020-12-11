<?php
session_start();
include("DBConnection.php");
header("Content-type: text/xml");
$tournamentId = $_SESSION["currTournamentID"];

$sqlTeams = "SELECT * FROM Equipe E, Inscription I
             WHERE E.idEquipe = I.idEquipe AND idTournoi = $tournamentId";

$levelMap = array(
    "loisir" => 7,
    "departemental" => 6,
    "regional" => 5,
    "N3" => 4,
    "N2" => 3,
    "elite" => 2,
    "pro" => 1
);

$sqlPlayerLevels = "SELECT niveau FROM Joueur J, Membre M
                    WHERE J.idJoueur = M.idJoueur AND idEquipe = ?";
$sqlLevels = $dbh->prepare($sqlPlayerLevels);

echo '<?xml version="1.0" encoding="utf-8"?>';
echo '<teams>';

foreach ($dbh->query($sqlTeams) as $team) {
    $sqlLevels->execute(array($team['idequipe']));

    $levels = $sqlLevels->fetchAll();
    $levels = array_map(function ($e) { 
        return $GLOBALS['levelMap'][$e['niveau']];
    }, $levels);

    $avgLevel = round(array_sum($levels) / count($levels));
    $classification = array_search($avgLevel, $levelMap);

    echo "<team id=\"{$team['idequipe']}\" name=\"{$team['nom']}\" level=\"$avgLevel\" "
         . "classification=\"$classification\"/>";
}

echo '</teams>';
?>
