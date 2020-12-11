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

function getTeamDistributions($count) { // Liste des distributions
    // if ($c == 1) {
        // return "$a x $b + $c";
    // }
    // [$a, $b, $c] = getOptimalGroupDistribution($a, $b, $c);

    // $nbPoule1 = $a - $b + $c + 1;
    // $nbPoule2 = $b - $c;
    // $typePoule1 = $nbPoule1 . "x" . $b;
    // $typePoule2 = $nbPoule2 . "x" . ($b - 1);
    $distributions = array();

    $maxI = (int) sqrt($count);
    for ($i = 2; $i <= $maxI; ++$i) {
        if ($count % $i == 0) {
            $distributions[] = "{$i}x". ($count / $i);
        }
    }

    $a = ceil(sqrt($count));
    $b = floor($count / $a);
    $c = $count - $a * $b;

    $typePoule1 = $a - $c . "x" . $b;
    $typePoule2 = $c . "x" . ($b + 1);
    if ($a - $c >= $c) {
        $distributions[] = $typePoule1 . " + " . $typePoule2;
    } else {
        $distributions[] = $typePoule2 . " + " . $typePoule1;
    }
    $typePoule1 = $b - $c . "x" . $a;
    $typePoule2 = $c . "x" . ($a + 1);
    if ($b - $c >= $c) {
        $distributions[] = $typePoule1 . " + " . $typePoule2;
    } else {
        $distributions[] = $typePoule2 . " + " . $typePoule1;
    }

    return $distributions;
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

    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Quicksand&display=swap" rel="stylesheet">

    <!-- <script src="js/popup.js" defer></script> -->
    <script src="js/tournament.js" defer></script>
</head>

<body>
    <?php
    include("header.html");
    include("DBConnection.php");

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

    <div class="round-section">
        <div class="container-header">
            <h2>Tour 1</h2>
        </div>
        <div class="round-info">
            <?php
            $teamCount = $dbh->query(
                "SELECT COUNT(*) AS nbequipes FROM Equipe E, Inscription I
                WHERE E.idEquipe = I.idEquipe AND idTournoi = $tournamentID"
            )->fetch()['nbequipes'];
            echo "<p>Nombre d'équipes : $teamCount</p>";
            ?>
            <label for="team-distribution">Répartition des équipes :</label>
            <select name="distribution" id="team-distribution">
                <option value="none" class="placeholder">choisir</option>
                <?php
                $distributions = getTeamDistributions($teamCount);
                foreach ($distributions as $distribution) {
                    echo "<option value=\"$distribution\">$distribution</option>";
                }
                ?>
            </select>
            <!-- Bouton choisir taille poule -->
        </div>
        <div class="round" id="round1">
            <button class="add-group-stage">&plus;</button>
        </div>
    </div>
</body>
</html>
