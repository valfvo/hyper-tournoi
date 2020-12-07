<?php
include("header.html");
include("DBConnection.php");
// $res = $dbh->query("INSERT INTO Evenement (nom, lieu, dateDebut, dateFin) VALUES ('test', 'test', '2020-12-04', '2020-12-03')");

$eventName = $_GET["event-name"];
$eventLocation = $_GET["event-location"];
$eventStartDate = $_GET["event-start-date"];
$eventEndDate = $_GET["event-end-date"];
$dbh->query("INSERT INTO Evenement (nom, lieu, dateDebut, dateFin) VALUES ('$eventName', '$eventLocation', '$eventStartDate', '$eventEndDate')");
header("Location: https://project.fvostudio.com/HyperTournoi/eventConfirmation.php");
// echo $dbh->errorInfo()[0];
// echo $dbh->errorInfo()[1];
// echo $dbh->errorInfo()[2];
?>
