<?php session_start();?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="images/favicon.ico" rel="icon">
    <link rel="preload" href="images/close-icon-hover.svg" as="image">

    <link href="header.css" rel="stylesheet">
    <link href="popup.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <script src="popup.js" defer></script>
</head>

<body>
    <?php
    include("header.html");
	include("DBConnection.php");
	$eventID = $_SESSION['currEventID'];
    $eventName = $dbh->query("SELECT nom FROM Evenement WHERE idEvenement = $eventID")->fetch()['nom'];

    echo "<div><a href='eventDashboard.php'><- {$eventName}</a></div><br>";
    ?>

</body>
</html>