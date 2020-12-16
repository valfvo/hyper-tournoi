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
    <link href="css/form.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <script src="js/popup.js" defer></script>
    <script src="js/link.js" defer></script>
</head>

<body>
    <?php
    include("header.php");
    include("DBConnection.php");
    ?>

    <div><a href="organize.php"><- Mes événements</a></div><br>
    <button class="popup-button">Créer un nouveau tournoi</button>

    <?php
    if(isset($_POST["sessionEvent"])) {
        $_SESSION['currEventID'] = $_POST["sessionEvent"];
    }
    $eventID = $_SESSION['currEventID'];
    $eventName = $dbh->query("SELECT nom FROM Evenement WHERE idEvenement = $eventID")->fetch()['nom'];
    echo "<h2>{$eventName}</h2>";

    foreach ($dbh->query("SELECT * FROM Tournoi WHERE idEvenement = $eventID") as $tournament) {
        echo "<p class=\"tournaments\" id=\"{$tournament['idtournoi']}\">".
        "{$tournament['nom']} {$tournament['sport']} {$tournament['typejeu']}</p>";
    }
    ?>

    <div class="popup">
        <div class="popup-content">
            <img src="images/close-icon.svg" alt="close" class="close-icon">
            <form action="createTournament.php" method="get" class="form-organize">
                <ul>
                    <li><label for="tournament-name">Nom</label><br>
                    <input type="text" name="tournament-name" id="tournament-name" class="text-input" required></li>

                    <li><label for="tournament-sport">Sport</label><br>
                    <input type="text" name="tournament-sport" id="tournament-sport" class="text-input" required></li>

                    <li><label for="tournament-type">Type de jeu</label><br>
                    <input type="text" name="tournament-type" id="tournament-type" class="text-input" required></li>

                    <li><input type="submit" value="Créer" class="submit-button"></li>
                </ul>
            </form>
        </div>
    </div>
</body>
</html>
