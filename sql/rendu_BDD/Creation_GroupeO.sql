/*
Fichier : Creation_GroupeO.sql
Auteurs : 
    Paul Bunel 21803019
    Valentin Fontaine 21801957
Nom du groupe : O
*/

/*
Impossible de créer une DB puis de l'utiliser dans un même fichier postgreSQL.
Si vous voulez une DB pour les tests, il faut passer par la console:
> CREATE DATABASE test;
> \c test
*/

/**
 * Petite procédure pour afficher simplement un message à l'écran
 */
CREATE OR REPLACE PROCEDURE print_msg(msg TEXT) AS $$
BEGIN
    RAISE INFO E'\n\t%', msg;
END;
$$ LANGUAGE plpgsql;

CALL print_msg('===== Suppression des tables déjà existantes =====');

DROP FUNCTION IF EXISTS assert_joueurs_uniques;
DROP TABLE IF EXISTS Match;
DROP TABLE IF EXISTS Compose;
DROP TABLE IF EXISTS Poule;
DROP TABLE IF EXISTS Membre;
DROP TABLE IF EXISTS Joueur;
DROP TABLE IF EXISTS Inscription;
DROP TABLE IF EXISTS Equipe;
DROP TABLE IF EXISTS Tour;
DROP TABLE IF EXISTS CommenceApres;
DROP TABLE IF EXISTS Tournoi;
DROP TABLE IF EXISTS Evenement;
DROP TABLE IF EXISTS Organisateur;

-- Création des tables et relations
CALL print_msg('===== Création des tables et relations =====');

CREATE TABLE Organisateur (
    idOrganisateur SERIAL PRIMARY KEY,
    mail VARCHAR(64) NOT NULL UNIQUE,
    motDePasse VARCHAR(32) NOT NULL,
    nom VARCHAR(32),
    prenom VARCHAR(32)
);

CREATE TABLE Evenement (
    idEvenement SERIAL PRIMARY KEY,
    idOrganisateur INT NOT NULL,
    nom VARCHAR(50),
    lieu VARCHAR(50),
    nbTerrains INT,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    CONSTRAINT FK_Organisateur
        FOREIGN KEY(idOrganisateur) REFERENCES Organisateur(idOrganisateur),
    CONSTRAINT check_dates CHECK (dateDebut <= dateFin)
);

CREATE TABLE Tournoi (
    idTournoi SERIAL PRIMARY KEY,
    idEvenement INT NOT NULL,
    nom VARCHAR(50),
    sport VARCHAR(20),
    tailleEquipe INT CHECK (tailleEquipe >= 1),
    dateDebutInscription DATE NOT NULL,
    dateFinInscription DATE NOT NULL,
    CONSTRAINT FK_Evenement
        FOREIGN KEY(idEvenement) REFERENCES Evenement(idEvenement),
    CONSTRAINT check_dates CHECK (dateDebutInscription <= dateFinInscription)
);

CREATE TABLE CommenceApres (
    idTournoi INT NOT NULL,
    idTournoiSuivant INT NOT NULL,
    numTour INT NOT NULL,
    CONSTRAINT PK_CommenceApres
        PRIMARY KEY(idTournoi, idTournoiSuivant),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi),
    CONSTRAINT FK_TournoiSuivant
        FOREIGN KEY(idTournoiSuivant) REFERENCES Tournoi(idTournoi)
);

CREATE TABLE Tour (
    idTour SERIAL PRIMARY KEY,
    idTournoi INT NOT NULL,
    numero INT CHECK(numero >= 1) NOT NULL,
    composition VARCHAR(100),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi)
);

CREATE TABLE Equipe (
    idEquipe SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL
);

CREATE TABLE Inscription (
    idTournoi INT NOT NULL,
    idEquipe INT NOT NULL,
    dateInscription DATE NOT NULL,
    CONSTRAINT PK_Inscription
        PRIMARY KEY(idTournoi, idEquipe),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe)
);

CREATE TABLE Joueur (
    idJoueur SERIAL PRIMARY KEY,
    nom VARCHAR(20) NOT NULL,
    prenom VARCHAR(20) NOT NULL,
    niveau VARCHAR(15),
    CONSTRAINT DOM_niveau
        CHECK(niveau IN ('loisir', 'departemental', 'regional', 'N3', 'N2', 'elite', 'pro'))
);

CREATE TABLE Membre (
    idEquipe INT NOT NULL,
    idJoueur INT NOT NULL,
    CONSTRAINT PK_Membre
        PRIMARY KEY(idEquipe, idJoueur),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Joueur
        FOREIGN KEY(idJoueur) REFERENCES Joueur(idJoueur)
);

CREATE TABLE Poule (
    idPoule SERIAL PRIMARY KEY,
    idTour INT NOT NULL,
    numero INT,
    numTerrain INT,
    CONSTRAINT FK_Tour
        FOREIGN KEY(idTour) REFERENCES Tour(idTour)
);

CREATE TABLE Compose (
    idPoule INT NOT NULL,
    idEquipe INT NOT NULL,
    CONSTRAINT PK_Compose
        PRIMARY KEY(idPoule, idEquipe),
    CONSTRAINT FK_Poule
        FOREIGN KEY(idPoule) REFERENCES Poule(idPoule)
        ON DELETE CASCADE,
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe)
        ON DELETE CASCADE
);

CREATE TABLE Match (
    idMatch SERIAL PRIMARY KEY,
    idEquipe1 INT NOT NULL,
    idEquipe2 INT NOT NULL,
    vainqueur INT,
    score VARCHAR(15),
    CONSTRAINT FK_Equipe1
        FOREIGN KEY(idEquipe1) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Equipe2
        FOREIGN KEY(idEquipe2) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Vainqueur
        FOREIGN KEY(vainqueur) REFERENCES Equipe(idEquipe),
    CONSTRAINT DOM_score
        CHECK (score SIMILAR TO '\d+-\d+(;\d+-\d+)*')
);


-- =============================================================================
-- ========================== Procédures et fonctions ==========================
-- =============================================================================

CALL print_msg('===== Définition des procédures et fonctions =====');

-- =========================== Fonction creer_equipe ===========================
/**
 * Fonction qui crée une équipe à partir d'un nom et d'un tableau de joueurs
 */
CREATE OR REPLACE PROCEDURE creer_equipe(IN nomEquipe TEXT, IN id_membres INT[])
AS $$
DECLARE
    id_equipe INT;
    id_membre INT;
BEGIN
    IF (id_membres IS NULL OR cardinality(id_membres) < 1) THEN
        RAISE EXCEPTION E'Impossible de créer un équipe sans membres\n';
    END IF;

    INSERT INTO Equipe (nom) VALUES (nomEquipe)
    RETURNING idEquipe INTO id_equipe;

    FOREACH id_membre IN ARRAY id_membres
    LOOP
        INSERT INTO Membre VALUES (id_equipe, id_membre);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- =================== Fonctions pour le niveau d'une équipe ===================
/**
 * Fonction auxiliaire pour récupérer le niveau d'un classification.
 * Par exemple classe_to_niveau('pro') = 1
 */
CREATE OR REPLACE FUNCTION classe_to_niveau(classe TEXT) RETURNS INT AS $$
DECLARE
    niveau INT;
BEGIN
    CASE LOWER(classe)
        WHEN 'pro' THEN niveau := 1;
        WHEN 'elite' THEN niveau := 2;
        WHEN 'n2' THEN niveau := 3;
        WHEN 'n3' THEN niveau := 4;
        WHEN 'regional' THEN niveau := 5;
        WHEN 'departemental' THEN niveau := 6;
        WHEN 'loisir' THEN niveau := 7;
        ELSE RAISE EXCEPTION E'Classe inconnue : %\n', classe;
    END CASE;

    RETURN niveau;
END;
$$ LANGUAGE plpgsql;

/**
 * Fonction auxiliaire pour récupérer la classification d'un niveau.
 * Par exemple niveau_to_classe(1) = 'pro'
 */
CREATE OR REPLACE FUNCTION niveau_to_classe(niveau INT) RETURNS TEXT AS $$
DECLARE
    classes TEXT[] := ARRAY[
        'pro', 'elite', 'N2', 'N3', 'regional', 'departemental', 'loisir'
    ];
BEGIN
    IF (niveau < 1 OR niveau > 7) THEN
        RAISE EXCEPTION E'Niveau inconnu: %\n', niveau;
    END IF;

    RETURN classes[ROUND(niveau)];
END;
$$ LANGUAGE plpgsql;

/**
 * Fonction qui renvoit le niveau d'une équipe.
 * Le niveau d'une équipe est la moyenne des niveaux des membres.
 */
CREATE OR REPLACE FUNCTION niveau_equipe(id_equipe INT)
RETURNS INT AS $$
DECLARE
    niveau_equipe INT;
BEGIN
    SELECT AVG(classe_to_niveau(niveau)) INTO niveau_equipe
    FROM joueur, membre
    WHERE membre.idEquipe = id_equipe
    AND membre.idJoueur = joueur.idJoueur;

    RETURN niveau_equipe;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- ================================= Triggers ==================================
-- =============================================================================

CALL print_msg('===== Définition des triggers =====');

-- ============================ Trigger sur Match ==============================
/**
 * Trigger sur Match pour remplacer si besoin le vainqueur d'un match,
 * en fonction du score. Pour rappel, les scores des différents sets
 * sont stockées comme cet exemple: '7-8;6-4;1-1'
 */
CREATE OR REPLACE FUNCTION vainqueur_valide() RETURNS TRIGGER AS $$
DECLARE
    nb_sets_gagnes_e1 INT := 0;
    nb_sets_gagnes_e2 INT := 0;
    sets_match TEXT[];
    set_match TEXT;
    score_set TEXT[];
BEGIN
    SELECT string_to_array(NEW.score, ';') INTO sets_match;

    FOREACH set_match IN ARRAY sets_match
    LOOP
        SELECT string_to_array(set_match, '-')::INT[] INTO score_set;
        IF (score_set[1] > score_set[2]) THEN
            nb_sets_gagnes_e1 := nb_sets_gagnes_e1 + 1;
        ELSIF (score_set[1] < score_set[2]) THEN
            nb_sets_gagnes_e2 := nb_sets_gagnes_e2 + 1;
        END IF;
    END LOOP;

    IF (
        nb_sets_gagnes_e1 > nb_sets_gagnes_e2
        AND NEW.vainqueur <> NEW.idEquipe1
    ) THEN
        RAISE NOTICE E'Mauvais vainqueur, celui-ci a été changé\n';
        NEW.vainqueur := NEW.idEquipe1;
    ELSIF (
        nb_sets_gagnes_e1 < nb_sets_gagnes_e2
        AND NEW.vainqueur <> NEW.idEquipe2
    ) THEN
        RAISE NOTICE E'Mauvais vainqueur, celui-ci a été changé\n';
        NEW.vainqueur := NEW.idEquipe2;
    ELSIF (
        nb_sets_gagnes_e1 = nb_sets_gagnes_e2
        AND NEW.vainqueur IS NOT NULL
    ) THEN
        RAISE NOTICE E'Egalité : pas de vainqueur (mis à NULL)\n';
        NEW.vainqueur := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vainqueur_valide_trigger ON Match;
CREATE TRIGGER vainqueur_valide_trigger
    BEFORE INSERT OR UPDATE OF vainqueur, score ON Match
    FOR EACH ROW
    EXECUTE PROCEDURE vainqueur_valide();

-- ========================== Trigger sur Inscription ==========================
/**
 * Fonction auxiliaire qui assure qu'aucun joueur ne soit inscrit deux fois
 * à un tournoi dans deux équipes différentes
 */
CREATE OR REPLACE FUNCTION assert_joueurs_uniques(inscr Inscription)
RETURNS VOID AS $$
DECLARE
    id_joueurs_deja_inscrits INT[];
BEGIN
    SELECT ARRAY_AGG(idJoueur) INTO id_joueurs_deja_inscrits
    FROM Inscription, Membre
    WHERE Inscription.idEquipe = Membre.idEquipe
    AND idTournoi = inscr.idTournoi
    AND idJoueur IN (SELECT m2.idJoueur FROM Membre m2
                     WHERE m2.idEquipe = inscr.idEquipe);

    IF (id_joueurs_deja_inscrits IS NOT NULL) THEN
        RAISE EXCEPTION E'Certains joueurs sont déjà inscrits : %\n',
                        id_joueurs_deja_inscrits;
    END IF;
END;
$$ LANGUAGE plpgsql;

/**
 * Trigger sur Inscription pour vérifier que l'inscription d'une équipe
 * à un tournoi est valide
 */
CREATE OR REPLACE FUNCTION inscription_valide() RETURNS TRIGGER AS $$
DECLARE
    date_debut DATE;
    date_fin DATE;
    nb_joueurs_par_equipe INT;
    nb_joueurs_equipe INT;
    new_nom_equipe equipe.nom%TYPE;
    nom_deja_pris equipe.nom%TYPE;

    nom_equipe_cursor CURSOR FOR
        SELECT nom FROM equipe, inscription
        WHERE equipe.idEquipe = inscription.idEquipe
        AND inscription.idTournoi = NEW.idTournoi
        AND equipe.nom = new_nom_equipe;
BEGIN
    PERFORM assert_joueurs_uniques(NEW);

    SELECT dateDebutInscription, dateFinInscription
    INTO date_debut, date_fin
    FROM tournoi WHERE tournoi.idTournoi = NEW.idTournoi;

    SELECT tailleEquipe
    INTO nb_joueurs_par_equipe
    FROM tournoi WHERE tournoi.idTournoi = NEW.idTournoi;

    SELECT COUNT(*) INTO nb_joueurs_equipe
    FROM membre WHERE membre.idEquipe = NEW.idEquipe;

    SELECT nom INTO new_nom_equipe FROM Equipe
    WHERE NEW.idEquipe = Equipe.idEquipe;

    OPEN nom_equipe_cursor;
    FETCH nom_equipe_cursor INTO nom_deja_pris;
    IF (FOUND) THEN
        RAISE EXCEPTION E'Nom d''équipe déjà pris : %\n', nom_deja_pris;
    END IF;

    IF (NEW.dateInscription < date_debut) THEN
        RAISE EXCEPTION E'Inscriptions au tournoi non commencées\n';
    ELSIF (NEW.dateInscription > date_fin) THEN
        RAISE EXCEPTION E'Inscriptions au tournoi closes\n';
    ELSIF (nb_joueurs_equipe <> nb_joueurs_par_equipe) THEN
        RAISE EXCEPTION
            E'Nombre de joueurs dans l''équipe invalide : % au lieu de %\n',
            nb_joueurs_equipe, nb_joueurs_par_equipe;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inscription_valide_trigger ON Inscription;
CREATE TRIGGER inscription_valide_trigger
    BEFORE INSERT OR UPDATE ON Inscription
    FOR EACH ROW
    EXECUTE PROCEDURE inscription_valide();

-- ============================ Trigger sur Compose ============================
/**
 * Trigger sur Compose pour vérifier qu'une équipe d'une poule
 * n'est pas dans une autre poule du même tour
 */
CREATE OR REPLACE FUNCTION poule_valide() RETURNS TRIGGER AS $$
DECLARE
    id_equipe_deja_presente INT;
BEGIN
    SELECT idEquipe INTO id_equipe_deja_presente
    FROM Poule, Compose
    WHERE Poule.idPoule = Compose.idPoule
    AND idTour = (SELECT p2.idTour FROM Poule p2 WHERE p2.idPoule = NEW.idPoule)
    AND idEquipe = NEW.idEquipe;

    IF (FOUND) THEN
        RAISE EXCEPTION E'L''équipe % est déjà dans une autre poule du même tour\n',
                        id_equipe_deja_presente;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS poule_valide_trigger ON Compose;
CREATE TRIGGER poule_valide_trigger
    BEFORE INSERT OR UPDATE ON Compose
    FOR EACH ROW
    EXECUTE PROCEDURE poule_valide();


-- =============================================================================
-- ================================ Insertions =================================
-- =============================================================================

-- ================ Insertions Organisateur, Evenement, Tournoi ================
CALL print_msg('===== Insertions Organisateur, Evenement, Tournoi =====');

INSERT INTO Organisateur (mail, motDePasse, nom, prenom)
VALUES ('hyper@tournoi.com', '414f27bb362295cb6aa405b118b4046d', 'hyper', 'tournoi');

INSERT INTO Evenement (nom, idOrganisateur, lieu, nbTerrains, dateDebut, dateFin)
VALUES ('FeteNat', 1, 'Montpellier', 2, '2020-07-14', '2020-07-14');

INSERT INTO Tournoi (idEvenement, nom, sport, tailleEquipe,
                     dateDebutInscription, dateFinInscription)
VALUES (1, 'Principal', 'Volley', 3, '2020-05-14', '2020-07-01');

INSERT INTO Tournoi (idEvenement, nom, sport, tailleEquipe,
                     dateDebutInscription, dateFinInscription)
VALUES (1, 'Principal - Consolante', 'Volley', 3, '2020-07-02', '2020-07-02');

INSERT INTO CommenceApres VALUES (1, 2, 1);
-- ========================== Insertions des équipes ===========================
CALL print_msg('===== Insertions des équipes =====');

-- Équipe a
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J1', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J2', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J3', 'regional');

CALL creer_equipe('a', ARRAY[1, 2, 3]);
INSERT INTO Inscription VALUES (1, 1, '2020-06-14');

-- Équipe b
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J1', 'N3');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J2', 'N2');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J3', 'elite');

CALL creer_equipe('b', ARRAY[4, 5, 6]);
INSERT INTO Inscription VALUES (1, 2, '2020-06-14');

-- Équipe c
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J1', 'pro');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J2', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J3', 'departemental');

CALL creer_equipe('c', ARRAY[7, 8, 9]);
INSERT INTO Inscription VALUES (1, 3, '2020-06-14');

-- ====================== Insertions Tour, Poule, Compose ======================
CALL print_msg('===== Insertions Tour, Poule, Compose =====');

INSERT INTO Tour (idTournoi, numero, composition)
VALUES (1, 1, '1x3|1');

INSERT INTO Poule (idTour, numero, numTerrain)
VALUES (1, 1, 1);

INSERT INTO Compose VALUES (1, 1);
INSERT INTO Compose VALUES (1, 2);
INSERT INTO Compose VALUES (1, 3);

-- =========================== Insertions des matchs ===========================
CALL print_msg('===== Insertions des matchs =====');

INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (1, 2, 1, '5-3;2-3;2-1');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (1, 3, 3, '4-6;3-5');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (3, 2, 2, '1-2;1-1');


-- =============================================================================
-- =========================== Affichage des tables ============================
-- =============================================================================

CALL print_msg('===== Affichage des tables =====');

SELECT * FROM organisateur;
SELECT * FROM evenement;
SELECT * FROM tournoi;
SELECT * FROM commenceApres;

SELECT * FROM tour;
SELECT * FROM compose;
SELECT * FROM poule;

SELECT * FROM inscription;
SELECT * FROM equipe;
SELECT * FROM membre;
SELECT * FROM joueur;

SELECT * FROM match;


-- =============================================================================
-- ========================= Insertions pour les tests =========================
-- =============================================================================

CALL print_msg('===== Insertion utiles pour les tests de Test_GroupeO.sql =====');


INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');

CALL creer_equipe('testTrigger', ARRAY[10, 11, 12]);


INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');

CALL creer_equipe('a', ARRAY[13, 14, 15]);


INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j4Test', 'j4Test', 'loisir');

CALL creer_equipe('testTriggerNbj', ARRAY[16, 17, 18, 19]);

CALL creer_equipe('testJoueursUniques', ARRAY[6, 3]);
