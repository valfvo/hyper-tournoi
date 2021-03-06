<?php
session_start();
$currUID = $_SESSION['UID'];
if (!isset($currUID) || $currID == -1) {
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
    include("DBConnection.php");
    include("header.php");
    ?>

    <!-- Liste de nos evenements -->
    <h2>Mes évènements à venir</h2>
    <button class="popup-button">Créer un nouvel évènement</button>

    <?php
    // todo: get user id
    $sqlEvents = "SELECT * FROM Evenement WHERE idOrganisateur = $currUID";
    foreach ($dbh->query($sqlEvents) as $event) {
        echo "<p class=\"events\" id=\"{$event['idevenement']}\">{$event['nom']}".
         "{$event['lieu']} du {$event['datedebut']} au {$event['datefin']}</p>";
        // $_SESSION['currEvents']['event1'] = $event['idEvenement'];
    }
    ?>

    <!-- let event = querySelector("#event1");
    event.onlick = function () { ... }
    while (event.nextSibling) {
        event = event.nextSibling;
        event.onclick = function () { ... }
    } -->

    <div class="popup">
        <div class="popup-content">
            <img src="images/close-icon.svg" alt="close" class="close-icon">
            <form action="createEvent.php" method="get" class="form-organize">
                <ul>
                    <li><label for="event-name">Nom</label><br>
                    <input type="text" name="event-name" id="event-name" class="text-input" required></li>

                    <li><label for="event-location">Lieu</label><br>
                    <input type="text" name="event-location" id="event-location" class="text-input" required></li>

                    <li><label for="event-start-date">Date</label><br>
                    <input type="date" name="event-start-date" id="event-start-date" required>
                    <label for="event-end-date"> &minus; </label>
                    <input type="date" name="event-end-date" id="event-end-date" required></li>

                    <li><input type="submit" value="Créer" class="submit-button"></li>
                </ul>
            </form>
        </div>
    </div>
</body>
</html>
