<?php
session_start();
$currUID = $_SESSION['UID'];
if (!isset($currUID) || $currUID == -1) {
    header("Location: https://project.fvostudio.com/HyperTournoi/");
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="images/favicon.ico" rel="icon">

    <link href="css/header.css" rel="stylesheet">
    <link href="css/popup.css" rel="stylesheet">
    <link href="css/tournament.css" rel="stylesheet">
    <link href="css/form.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <script src="js/popup.js" defer></script>
    <script src="js/team.js" defer></script>
    <script src="js/match.js" defer></script>
    <script src="js/group.js" defer></script>
    <script src="js/round.js" defer></script>
    <script src="js/tournament.js" defer></script>
    <script src="js/saveModifications.js" defer></script>
</head>

<body>
    <?php
    include("DBConnection.php");
    include("header.php");

    if(isset($_POST["sessionTournament"])) {
        $_SESSION['currTournamentID'] = $_POST["sessionTournament"];
    }
    $eventID = $_SESSION['currEventID'];
    $tournamentID = $_SESSION['currTournamentID'];
    $eventName = $dbh->query("SELECT nom FROM Evenement WHERE idEvenement = $eventID")->fetch()['nom'];
    $tournamentName = $dbh->query("SELECT nom FROM Tournoi WHERE idTournoi = $tournamentID")->fetch()['nom'];

    echo "<div><a href=\"eventDashboard.php\"><- $eventName</a></div><br>";
    echo "<h2>{$tournamentName}</h2>";
    ?>
    <button id="save-button">Enregistrer les modifications</button>
    <footer class="tournament-footer"></footer>
</body>
</html>
