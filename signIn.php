<?php
if (isset($_POST["mail-address"]) && isset($_POST["password"])) {
    $mailAddress = $_POST["mail-address"];
    $password = md5($_POST["password"]);

    $UIDQuery = "SELECT idOrganisateur, prenom FROM Organisateur
                 WHERE mail = '$mailAddress' AND motDePasse = '$password'";

    $organizer = $dbh->query($UIDQuery)->fetch();

    if (isset($organizer['idorganisateur'])) {
        $_SESSION['UID'] = $organizer['idorganisateur'];
        $_SESSION['first-name'] = $organizer['prenom'];
    } else {
        $_SESSION['UID'] = -1;
    }
}

if (!isset($_SESSION['UID'])
    || (isset($_SESSION['UID']) && $_SESSION['UID'] == -1)
) {
    if (!isset($_SESSION['UID'])) {
        echo '<div class="popup login-popup">';
    } else {
        echo '<div class="popup login-popup" data-wrong-credentials="true">';
    }
?>
    <div class="popup-content">
        <img src="images/close-icon.svg" alt="close" class="close-icon">
        <form method="post" class="form-organize" autocomplete>
            <ul>
                <?php
                if ((isset($_SESSION['UID']) && $_SESSION['UID'] == -1)) {
                    echo '<li class="wrong-credentials">Identifiants invalides</li>';
                }
                ?>
                <li><label for="mail-address">Adresse mail</label><br>
                <input type="email" name="mail-address" id="mail-address" class="text-input" required autocomplete></li>

                <li><label for="password">Mot de passe</label><br>
                <input type="password" name="password" id="password" class="text-input" required autocomplete></li>

                <li><input type="submit" value="Se connecter" class="submit-button"></li>
            </ul>
        </form>
    </div>
</div>
<?php } ?>
