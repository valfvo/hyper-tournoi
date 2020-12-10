<?php
session_start();

// include("header.html");
include("DBConnection.php");

$tournamentName = $_GET["tournament-name"];
$tournamentSport = $_GET["tournament-sport"];
$tournamentType = $_GET["tournament-type"];
$eventID = $_SESSION['currEventID'];
$dbh->query("INSERT INTO Tournoi (idEvenement, nom, typejeu, sport)
             VALUES ('$eventID', '$tournamentName', '$tournamentType', '$tournamentSport')");
$_SESSION['currTournamentID'] = $dbh->lastInsertId();
header("Location: https://project.fvostudio.com/HyperTournoi/tournamentDashboard.php");
// echo $dbh->errorInfo()[0];
// echo $dbh->errorInfo()[1];
// echo $dbh->errorInfo()[2];
?>
