<?php
session_start();

include("DBConnection.php");

$playerCount = $_GET['players-count'];
$teamName = $_GET['team-name'];

$dbh->query("INSERT INTO Equipe (nom) VALUES ('$teamName')");
$teamId = $dbh->lastInsertId();

$sqlInsertPlayer = "INSERT INTO Joueur (nom, prenom, niveau)
                    VALUES (?, ?, ?)";
$sqlPrepareInsertPlayer = $dbh->prepare($sqlInsertPlayer);

$sqlInsertMember = "INSERT INTO Membre VALUES ($teamId, ?)";
$sqlPrepareInsertMember = $dbh->prepare($sqlInsertMember);

for ($i = 0; $i < $playerCount; ++$i) {
    $lastName = $_GET["player-last-name-$i"];
    $firstName = $_GET["player-first-name-$i"];
    $level = $_GET["player-level-$i"];

    $sqlPrepareInsertPlayer->execute(array($lastName, $firstName, $level));
    $playerId = $dbh->lastInsertId();
    $sqlPrepareInsertMember->execute(array($playerId));
}

$tournamentId = $_GET['tournament-id'];
$dbh->query("INSERT INTO INSCRIPTION VALUES ($tournamentId, $teamId, '2020-01-01')");

header("Location: https://project.fvostudio.com/HyperTournoi/participate.php");
?>
