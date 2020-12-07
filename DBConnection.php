<?php
$dbname = "hypertournoi";
$dsn = "pgsql:host=localhost;port=5432;dbname=$dbname;";
$username = "postgres";
$password = "hyper510";

try {
    $dbh = new PDO($dsn, $username, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
    // $dbh = null;
    // echo "<p>Hyper Tournoi est bientôt disponible.</p>";
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
