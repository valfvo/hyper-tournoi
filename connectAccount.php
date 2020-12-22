<?php
session_start();

include("DBConnection.php");

$mailAddress = $_GET["mail-address"];
$password = md5($_GET["password"]);

$UIDQuery = "SELECT idOrganisateur FROM Organisateur
            WHERE mail = $mailAddress AND motDePasse = $password";

$organizerId = $dbh->query($UIDQuery)->fetch();

if ($organizerId) {
    $_SESSION['UID'] = $dbh->$organizerId['idorganisateur'];
}

header("Location: https://project.fvostudio.com/HyperTournoi/organize.php");
?>
