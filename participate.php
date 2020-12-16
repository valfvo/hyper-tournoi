<?php session_start(); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="images/favicon.ico" rel="icon">

    <link href="css/header.css" rel="stylesheet">
    <link href="css/popup.css" rel="stylesheet">
    <link href="css/form.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <script src="js/popup.js" defer></script>
    <script src="js/participate.js" defer></script>
    <!-- <script src="js/link.js" defer></script> -->
</head>
<body>
    <?php
    include("DBConnection.php");
    include("header.php");
    ?>

    <h2 class="small-header">Tournois à venir</h2>

    <?php
    echo '<ul class="participate-list">';
    foreach ($dbh->query("SELECT * FROM Tournoi") as $tournament) {
        $tournamentId = $tournament['idtournoi'];
        $name = $tournament['nom'];
        $sport = $tournament['sport'];
        $gameType = $tournament['typejeu'];

        echo "<li class=\"tournaments no-click\" id=\"tournament-$tournamentId\">"
             . "<span>$name</span><span>$sport</span><span>$gameType</span>"
             . "<button class=\"participate-button\""
             . " data-tournament-id=\"{$tournamentId}\""
             . " data-game-type=\"{$gameType}\">Participer</button></li>";
    }
    ?>
</body>
</html>