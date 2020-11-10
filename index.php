<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyper Tournoi</title>
    <link href="favicon.ico" rel="icon">
    <link href="style2.css" rel="stylesheet">
</head>
<body>
    <?php
    $dbname = "hypertournoi";
    $dsn = "pgsql:host=localhost;port=5432;dbname=$dbname;";
    $username = "postgres";
    $password = "hyper510";

    try {
        $dbh = new PDO($dsn, $username, $password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
        $dbh = null;
        // echo "<p>Hyper Tournoi est bientôt disponible.</p>";
    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    ?>
    <header>
        <h1>Hyper Tournoi</h1>
        <nav>
            <ul>
                <li><a href="#">Organiser</a></li>
                <li><a href="#">Tournois</a></li>
                <li class="log-first log"><a href="#">S'inscrire</a></li>
                <li class="log"><a href="#">Se connecter</a></li>
            </ul>
        </nav>
            <!-- <ul class="log">
                <li><a href="#">Organiser</a></li>
                <li><a href="#">Tournois</a></li>
            </ul> -->
    </header>
</body>
</html>
