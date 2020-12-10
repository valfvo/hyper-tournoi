<?php
session_start();

function getMin($a, $b, $c) {
    if ($a < 2 * ($b - $c)) {
        return $a - $b + $c;
    } else {
        return $b - $c;
    }
}

function getOptimalGroupDistribution($a, $b, $c) {
    if (getMin($a, $b, $c) < getMin($b, $a, $c)) {
        return [$a, $b, $c];
    } else {
        return [$b, $a, $c];
    }
}

function getTeamDistribution($count) { // Liste des distributions
    $a = ceil(sqrt($count));
    $b = floor($count / ceil(sqrt($count)));
    $c = $count - $a * $b;
    // if ($c == 1) {
        // return "$a x $b + $c";
    // }
    [$a, $b, $c] = getOptimalGroupDistribution($a, $b, $c);

    $nbPoule1 = $a - $b + $c + 1;
    $nbPoule2 = $b - $c;
    $typePoule1 = $nbPoule1 . "x" . $b;
    $typePoule2 = $nbPoule2 . "x" . ($b - 1);

    if ($nbPoule1 >= $nbPoule2) {
        return $typePoule1 . " + " . $typePoule1;
    } else {
        return $typePoule2 . " + " . $typePoule1;
    }
    /**
     * 7 equipes:
     * 1x7 X
     * 7x1 V 
     * 
     * 24 equipes
     * 2x12
     * 3x8
     * 4x6
     * 6x4
     * 8x3
     * 12x2
     * 24x1
     * 
     * 17 * 15 + 4
     * a * b + c
     * 
     * (a - b + c + 1) x b
     * (b - c) x (b - 1)
     * 
     * a < 2 * (b - c) => b < 2 * (a - c)
     * 
     * 
     * 
     * 
     * if (getMin(a, b, c) < getMin(b, a, c)) {
     *   return a * b + c;
     * } else {
     *   return b * a + c;
     * }
     * 
     * sqrt(259) = 16.1
     * floor(259/17) = 15
     * 17*15 (= 255) + 4 (~ 11)
     * 
     * 16*15 (= 250) + 19 (~ 4)
     * 
     * 13*16 + 3*17
     * 
     * sqrt(24) = 4.9
     * 4,9 => 4x5
     * floor(24/ceil(sqrt(24)))
     * (int(sqrt($count)) x ceil(sqrt($count)) + reste
     * 5x4 + 4
     * 7x3 + 3
     * 9x2 + 6
     * 10
     * 
     * 4x5 + 4x1
     */
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="images/favicon.ico" rel="icon">
    <link rel="preload" href="images/close-icon-hover.svg" as="image">

    <link href="css/header.css" rel="stylesheet">
    <link href="css/popup.css" rel="stylesheet">
    <link href="css/tournament.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <script src="js/popup.js" defer></script>
    <script src="js/tournament.js" defer></script>
</head>

<body>
    <?php
    include("header.html");
    include("DBConnection.php");

    $_SESSION['currEventID'] = 1;
    $_SESSION['currTournamentID'] = 1;
    $eventID = $_SESSION['currEventID'];
    $tournamentID = $_SESSION['currTournamentID'];
    $eventName = $dbh->query("SELECT nom FROM Evenement WHERE idEvenement = $eventID")->fetch()['nom'];
    $tournamentName = $dbh->query("SELECT nom FROM Tournoi WHERE idTournoi = $tournamentID")->fetch()['nom'];

    echo '<div><a href="eventDashboard.php"><- $eventName</a></div><br>';
    echo "<h2>$tournamentName</h2>";
    echo "optimal : " . getTeamDistribution(7);
    ?>

    <div class="round-section">
        <div class="round-header">
            <h2>Tour 1</h2>
        </div>
        <div>
            <?php
            $teamCount = $dbh->query(
                "SELECT COUNT(*) AS nbequipes FROM Equipe E, Inscription I
                WHERE E.idEquipe = I.idEquipe AND idTournoi = $tournamentID"
            )->fetch()['nbequipes'];
            echo "<p>Nombre d'équipes : $teamCount</p>";
            ?>
            <form action="" method="get" class="form-organize">
                <label for="distribution">Distribution des équipes :</label>
                <select name="distribution" id="distribution">
                    <option value="">choisir</option>
                    <?php
                    
                    ?>
                </select>
            </form>
        </div>
        <div class="round">
            <div class="group-stage"></div>
            <button class="add-group-stage">&plus;</button>
        </div>
    </div>
</body>
</html>