<?php
$dbname = "hypertournoi";
$dsn = "pgsql:host=localhost;port=5432;dbname=$dbname;";
$username = "postgres";
$password = "hyper510";

try {
    $dbh = new PDO($dsn, $username, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
} catch(PDOException $e) {
    echo $e->getMessage();
}

// echo $dbh->errorInfo()[0];
// echo $dbh->errorInfo()[1];
// echo $dbh->errorInfo()[2];

?>
