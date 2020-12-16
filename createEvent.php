<?php
session_start();
$currUID = $_SESSION['UID'];
if (!isset($currUID) || $currUID == -1) {
    header("Location: https://project.fvostudio.com/HyperTournoi/");
}

include("header.php");
include("DBConnection.php");

$eventName = $_GET["event-name"];
$eventLocation = $_GET["event-location"];
$eventStartDate = $_GET["event-start-date"];
$eventEndDate = $_GET["event-end-date"];

$dbh->query("INSERT INTO Evenement (nom, idOrganisateur, lieu, dateDebut, dateFin)
             VALUES ('$eventName', $currUID, '$eventLocation', '$eventStartDate', '$eventEndDate')");
$_SESSION['currEventID'] = $dbh->lastInsertId();
header("Location: https://project.fvostudio.com/HyperTournoi/eventDashboard.php");
// echo $dbh->errorInfo()[0];
// echo $dbh->errorInfo()[1];
// echo $dbh->errorInfo()[2];
?>
