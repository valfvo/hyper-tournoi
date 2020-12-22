<?php session_start()?>
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
</head>

<body>
    <?php
    include("DBConnection.php");
    include("header.php");
    ?>

    <form action="createAccount.php" method="post" class="standard-form" autocomplete>
        <ul>
            <li><label for="last-name">Nom</label><br>
            <input type="text" name="last-name" id="last-name" class="text-input" required></li>

            <li><label for="first-name">Prénom</label><br>
            <input type="text" name="first-name" id="first-name" class="text-input" required></li>

            <li><label for="mail-address-su">Adresse mail</label><br>
            <input type="email" name="mail-address" id="mail-address-su" class="text-input" required></li>

            <li><label for="password-su">Mot de passe</label><br>
            <input type="password" name="password" id="password-su" class="text-input" required autocomplete></li>

            <li><label for="password-confirmation-su">Confirmer le mot de passe</label><br>
            <input type="password" name="password-confirmation" id="password-confirmation-su" class="text-input" required autocomplete></li>

            <li><input type="submit" value="Créer un compte" class="submit-button"></li>
        </ul>
    </form>
</body>
</html>
