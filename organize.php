<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="favicon.ico" rel="icon">
    <link href="header.css" rel="stylesheet">
</head>

<body>
    <?php
    include("header.html");
    include("DBConnection.php");
    ?>

    <!-- Liste de nos evenements -->
    <h2>Mes évènements à venir</h2>
    <h2>Créer un nouvel évènement</h2>
    <?php
    // todo: get user id
    foreach ($dbh->query("SELECT * FROM Evenement") as $event) {
        echo "<p>{$event['nom']} {$event['lieu']} du {$event['datedebut']} " .
             "au {$event['datefin']}</p>";
    }
    ?>

    <!-- Bouton "Organiser un evenenement" qui ouvre une pop-up -->
    <div class="popup">
        <form action="createEvent.php" method="get" class="form-organize">
            <label for="event-name">Nom: </label>
            <input type="text" name="event-name" id="event-name" required>

            <label for="event-location">Lieu: </label>
            <input type="text" name="event-location" id="event-location" required>

            <label for="event-start-date1">Date : du </label>
            <input type="date" name="event-start-date" id="event-start-date" required>

            <label for="event-end-date"> au </label>
            <input type="date" name="event-end-date" id="event-end-date" required>

            <input type="submit" value="organiser">
        </form>
    </div>
</body>
</html>
