<?php
if(!isset($_SESSION['UID']) || $_SESSION['UID'] == -1) {
    include("signIn.php");
}
?>
<header>
    <h1><a href="https://project.fvostudio.com/HyperTournoi/">Hyper Tournoi</a></h1>
    <nav>
        <ul>
            <li><a href="organize.php">Organiser</a></li>
            <li><a href="participate.php">Participer</a></li>
            <?php if(!isset($_SESSION['UID']) || $_SESSION['UID'] == -1) { ?>
                <li class="log-first log"><a href="signUp.php">S'inscrire</a></li>
                <li class="log popup-button"><a href="#">Se connecter</a></li>
            <?php
            } else {
                echo "<li class=\"hello-user\">Bonjour, {$_SESSION['first-name']}</li>";
            ?>
                <li class="log"><a href="deconnection.php">Se déconnecter</a></li>
            <?php } ?>
        </ul>
    </nav>
</header>
