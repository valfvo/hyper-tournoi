<?php
session_start();

include("header.html");
include("DBConnection.php");

$eventName = $_GET["event-name"];
$eventLocation = $_GET["event-location"];
$eventStartDate = $_GET["event-start-date"];
$eventEndDate = $_GET["event-end-date"];
$dbh->query("INSERT INTO Evenement (nom, lieu, dateDebut, dateFin)
             VALUES ('$eventName', '$eventLocation', '$eventStartDate', '$eventEndDate')");
$_SESSION['currEventID'] = $dbh->lastInsertId();
header("Location: https://project.fvostudio.com/HyperTournoi/eventDashboard.php");
// echo $dbh->errorInfo()[0];
// echo $dbh->errorInfo()[1];
// echo $dbh->errorInfo()[2];
?>
