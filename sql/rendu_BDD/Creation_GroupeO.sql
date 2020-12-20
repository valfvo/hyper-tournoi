/*
Fichier : Creation_GroupeO.sql
Auteurs : 
Paul Bunel 21803019
Valentin Fontaine 21801957
Nom du groupe : O
*/

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

CREATE TABLE Organisateur (
    idOrganisateur SERIAL PRIMARY KEY,
    mail VARCHAR(64) UNIQUE,
    motDePasse VARCHAR(32),
    nom VARCHAR(32),
    prenom VARCHAR(32)
);

CREATE TABLE Evenement (
    idEvenement SERIAL PRIMARY KEY,
    idOrganisateur INT,
    nom VARCHAR(50),
    lieu VARCHAR(50),
    nbTerrains INT,
    dateDebut DATE,
    dateFin DATE,
    CONSTRAINT FK_Organisateur
        FOREIGN KEY(idOrganisateur) REFERENCES Organisateur(idOrganisateur),
    CONSTRAINT check_dates CHECK (dateDebut <= dateFin)
);

CREATE TABLE Tournoi (
    idTournoi SERIAL PRIMARY KEY,
    idEvenement INT,
    nom VARCHAR(50),
    sport VARCHAR(20),
    -- typeJeu VARCHAR(30) CHECK (typeJeu SIMILAR TO '\d+x\d+'),
    nbJoueursParEquipe INT CHECK (nbJoueursParEquipe >= 1),
    dateDebutInscription DATE,
    dateFinInscription DATE,
    CONSTRAINT FK_Evenement
        FOREIGN KEY(idEvenement) REFERENCES Evenement(idEvenement),
    CONSTRAINT check_dates CHECK (dateDebutInscription <= dateFinInscription)
);

CREATE TABLE CommenceApres (
    idTournoi INT,
    idTournoiSuivant INT,
    numTour INT,
    CONSTRAINT PK_CommenceApres
        PRIMARY KEY(idTournoi, idTournoiSuivant),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi),
    CONSTRAINT FK_TournoiSuivant
        FOREIGN KEY(idTournoiSuivant) REFERENCES Tournoi(idTournoi)
);

CREATE TABLE Tour (
    idTour SERIAL PRIMARY KEY,
    idTournoi INT,
    numero INT CHECK(numero >= 1),
    composition VARCHAR(100),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi)
);

CREATE TABLE Equipe (
    idEquipe SERIAL PRIMARY KEY,
    nom VARCHAR(30)
);

CREATE TABLE Inscription (
    idTournoi INT,
    idEquipe INT,
    dateInscription DATE,
    CONSTRAINT PK_Inscription
        PRIMARY KEY(idTournoi, idEquipe),
    CONSTRAINT FK_Tournoi
        FOREIGN KEY(idTournoi) REFERENCES Tournoi(idTournoi),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe)
);

CREATE TABLE Joueur (
    idJoueur SERIAL PRIMARY KEY,
    nom VARCHAR(20),
    prenom VARCHAR(20),
    niveau VARCHAR(15),
    CONSTRAINT DOM_niveau
        CHECK(niveau IN ('loisir', 'departemental', 'regional', 'N3', 'N2', 'elite', 'pro'))
);

CREATE TABLE Membre (
    idEquipe INT,
    idJoueur INT,
    CONSTRAINT PK_Membre
        PRIMARY KEY(idEquipe, idJoueur),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Joueur
        FOREIGN KEY(idJoueur) REFERENCES Joueur(idJoueur)
);

CREATE TABLE Poule (
    idPoule SERIAL PRIMARY KEY,
    idTour INT,
    numero INT,
    numTerrain INT,
    CONSTRAINT FK_Tour
        FOREIGN KEY(idTour) REFERENCES Tour(idTour)
);

CREATE TABLE Compose (
    idPoule INT,
    idEquipe INT,
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


-- Définition des procédures et fonctions
/*
idées :
- calculer le niveau d'une équipe à partir de celui de ses joueurs
- procédures utiles aux triggers
*/


-- Définition des triggers

/* Trigger procedure pour remplacer si besoin le vainqueur d'un match, en
fonction du score
les scores des différents sets sont stockées comme cet exemple: '7-8;6-4;1-1'
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
            SELECT string_to_array(set_match, '-')::int[] INTO score_set;
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
            RAISE NOTICE 'Mauvais vainqueur, celui-ci a été changé';
            NEW.vainqueur := NEW.idEquipe1;
        ELSIF (
            nb_sets_gagnes_e1 < nb_sets_gagnes_e2
            AND NEW.vainqueur <> NEW.idEquipe2
        ) THEN
            RAISE NOTICE 'Mauvais vainqueur, celui-ci a été changé';
            NEW.vainqueur := NEW.idEquipe2;
        ELSIF (
            nb_sets_gagnes_e1 = nb_sets_gagnes_e2
            AND NEW.vainqueur IS NOT NULL
        ) THEN
            RAISE NOTICE 'Egalité : pas de vainqueur (mis à NULL)';
            NEW.vainqueur := NULL;
        END IF;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vainqueur_valide_trigger ON Match;
CREATE TRIGGER vainqueur_valide_trigger
    BEFORE INSERT OR UPDATE ON Match
    FOR EACH ROW
    EXECUTE PROCEDURE vainqueur_valide();


/* Trigger procedure pour vérifier que l'inscription d'une équipe à un tournoi
est valide */

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
        SELECT dateDebutInscription, dateFinInscription
        INTO date_debut, date_fin
        FROM tournoi WHERE tournoi.idTournoi = NEW.idTournoi;

        SELECT nbJoueursParEquipe
        INTO nb_joueurs_par_equipe
        FROM tournoi WHERE tournoi.idTournoi = NEW.idTournoi;

        SELECT COUNT(*) INTO nb_joueurs_equipe
        FROM membre WHERE membre.idEquipe = NEW.idEquipe;

        SELECT nom INTO new_nom_equipe FROM Equipe
        WHERE NEW.idEquipe = Equipe.idEquipe;

        OPEN nom_equipe_cursor;
        FETCH nom_equipe_cursor INTO nom_deja_pris;
        IF (FOUND) THEN
            RAISE EXCEPTION 'Nom d''équipe déjà pris : %', nom_deja_pris;
        END IF;

        IF (NEW.dateInscription < date_debut) THEN
            RAISE EXCEPTION 'Inscriptions au tournoi non commencées';
        ELSIF (NEW.dateInscription > date_fin) THEN
            RAISE EXCEPTION 'Inscriptions au tournoi closes';
        ELSIF (nb_joueurs_equipe <> nb_joueurs_par_equipe) THEN
            RAISE EXCEPTION 'Nombre de joueurs dans l''équipe invalide : % au lieu de %',
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


-- Insertions

INSERT INTO Organisateur (mail, motDePasse, nom, prenom)
VALUES ('hyper@tournoi.com', '414f27bb362295cb6aa405b118b4046d', 'hyper', 'tournoi');

INSERT INTO Evenement (nom, idOrganisateur, lieu, nbTerrains, dateDebut, dateFin)
VALUES ('FeteNat', 1, 'Montpellier', 2, '2020-07-14', '2020-07-14');

INSERT INTO Tournoi (idEvenement, nom, sport, nbJoueursParEquipe, dateDebutInscription, dateFinInscription)
VALUES (1, 'Principal', 'Volley', 3, '2020-05-14', '2020-07-01');

-- equipe a
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J1', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J2', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('a', 'J3', 'regional');

INSERT INTO Equipe (nom) VALUES ('a');
INSERT INTO Membre VALUES (1, 1);
INSERT INTO Membre VALUES (1, 2);
INSERT INTO Membre VALUES (1, 3);
INSERT INTO Inscription VALUES (1, 1, '2020-06-14');

-- equipe b
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J1', 'N3');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J2', 'N2');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('b', 'J3', 'elite');

INSERT INTO Equipe (nom) VALUES ('b');
INSERT INTO Membre VALUES (2, 4);
INSERT INTO Membre VALUES (2, 5);
INSERT INTO Membre VALUES (2, 6);
INSERT INTO Inscription VALUES (1, 2, '2020-06-14');

-- equipe c
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J1', 'pro');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J2', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('c', 'J3', 'departemental');

INSERT INTO Equipe (nom) VALUES ('c');
INSERT INTO Membre VALUES (3, 7);
INSERT INTO Membre VALUES (3, 8);
INSERT INTO Membre VALUES (3, 9);
INSERT INTO Inscription VALUES (1, 3, '2020-06-14');


INSERT INTO Tour (idTournoi, numero, composition)
VALUES (1, 1, '1x3|1');

INSERT INTO Poule (idTour, numero, numTerrain)
VALUES (1, 1, 1);


INSERT INTO Compose VALUES (1, 1);
INSERT INTO Compose VALUES (1, 2);
INSERT INTO Compose VALUES (1, 3);

INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score) -- , dateDebut, dateFin)
VALUES (1, 2, 1, '5-3;2-3;2-1');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score) -- , dateDebut, dateFin)
VALUES (1, 3, 3, '4-6;3-5');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score) -- , dateDebut, dateFin)
VALUES (3, 2, 2, '1-2;1-1');

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


-- Insertion utiles pour tester les triggers dans Test_GroupeO.sql

INSERT INTO Equipe (nom) VALUES ('testTrigger');

INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');

INSERT INTO Membre VALUES (4, 10);
INSERT INTO Membre VALUES (4, 11);
INSERT INTO Membre VALUES (4, 12);


INSERT INTO Equipe (nom) VALUES ('a');

INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');

INSERT INTO Membre VALUES (5, 13);
INSERT INTO Membre VALUES (5, 14);
INSERT INTO Membre VALUES (5, 15);


INSERT INTO Equipe (nom) VALUES ('testTriggerNbJ');

INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j1Test', 'j1Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j2Test', 'j2Test', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j3Test', 'j3Test', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('j4Test', 'j4Test', 'loisir');

INSERT INTO Membre VALUES (6, 16);
INSERT INTO Membre VALUES (6, 17);
INSERT INTO Membre VALUES (6, 18);
INSERT INTO Membre VALUES (6, 19);
