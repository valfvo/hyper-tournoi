<?php
session_start();

include("DBConnection.php");

$lastName = $_POST["last-name"];
$firstName = $_POST["first-name"];
$mailAddress = $_POST["mail-address"];
$password = md5($_POST["password"]);

$dbh->query("INSERT INTO Organisateur (mail, motDePasse, nom, prenom)
             VALUES ('$mailAddress', '$password', '$lastName', '$firstName')");

$_SESSION['UID'] = $dbh->lastInsertId();
$_SESSION['first-name'] = $firstName;
header("Location: https://project.fvostudio.com/HyperTournoi/organize.php");
?>
