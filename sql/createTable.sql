DROP TABLE IF EXISTS Match CASCADE;
DROP TABLE IF EXISTS Compose CASCADE;
DROP TABLE IF EXISTS Poule CASCADE;
DROP TABLE IF EXISTS Membre CASCADE;
DROP TABLE IF EXISTS Joueur CASCADE;
DROP TABLE IF EXISTS Inscription CASCADE;
DROP TABLE IF EXISTS Equipe CASCADE;
DROP TABLE IF EXISTS Tour CASCADE;
DROP TABLE IF EXISTS CommenceApres CASCADE;
DROP TABLE IF EXISTS Tournoi CASCADE;
DROP TABLE IF EXISTS Evenement CASCADE;

CREATE TABLE Evenement (
    idEvenement SERIAL PRIMARY KEY,
    nom VARCHAR(50),
    lieu VARCHAR(50),
    nbTerrains INT,
    dateDebut DATE,
    dateFin DATE
);

CREATE TABLE Tournoi (
    idTournoi SERIAL PRIMARY KEY,
    idEvenement INT,
    nom VARCHAR(50),
    sport VARCHAR(20),
    typeJeu VARCHAR(30),
    dateDebutInscription DATE,
    dateFinInscription DATE,
    CONSTRAINT FK_Evenement
        FOREIGN KEY(idEvenement) REFERENCES Evenement(idEvenement)
);

CREATE TABLE CommenceApres (
    idTournoi INT,
    idTournoiSuivant INT,
    numTour INT,
    sousTournoi BOOLEAN,
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
    idEquipe1 INT,
    idEquipe2 INT,
    vainqueur INT,
    score VARCHAR(15),
    code VARCHAR(10),
    dateDebut DATE,
    dateFin DATE,
    CONSTRAINT FK_Equipe1
        FOREIGN KEY(idEquipe1) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Equipe2
        FOREIGN KEY(idEquipe2) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Vainqueur
        FOREIGN KEY(vainqueur) REFERENCES Equipe(idEquipe)
);

INSERT INTO Evenement (nom, lieu, nbTerrains, dateDebut, dateFin)
VALUES ('FeteNat', 'Montpellier', 2, '2020-07-14', '2020-07-14');

INSERT INTO Tournoi (idEvenement, nom, sport, typeJeu, dateDebutInscription, dateFinInscription)
VALUES (1, 'Principal', 'Volley', '3x3', '2020-05-14', '2020-07-01');

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

-- equipe d
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('d', 'J1', 'regional');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('d', 'J2', 'N3');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('d', 'J3', 'N2');

INSERT INTO Equipe (nom) VALUES ('d');
INSERT INTO Membre VALUES (4, 10);
INSERT INTO Membre VALUES (4, 11);
INSERT INTO Membre VALUES (4, 12);
INSERT INTO Inscription VALUES (1, 4, '2020-06-14');

-- equipe e
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('e', 'J1', 'elite');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('e', 'J2', 'pro');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('e', 'J3', 'loisir');

INSERT INTO Equipe (nom) VALUES ('e');
INSERT INTO Membre VALUES (5, 13);
INSERT INTO Membre VALUES (5, 14);
INSERT INTO Membre VALUES (5, 15);
INSERT INTO Inscription VALUES (1, 5, '2020-06-14');

-- equipe f
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('f', 'J1', 'departemental');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('f', 'J2', 'regional');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('f', 'J3', 'N3');

INSERT INTO Equipe (nom) VALUES ('f');
INSERT INTO Membre VALUES (6, 16);
INSERT INTO Membre VALUES (6, 17);
INSERT INTO Membre VALUES (6, 18);
INSERT INTO Inscription VALUES (1, 6, '2020-06-14');

-- equipe g
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('g', 'J1', 'N2');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('g', 'J2', 'elite');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('g', 'J3', 'pro');

INSERT INTO Equipe (nom) VALUES ('g');
INSERT INTO Membre VALUES (7, 19);
INSERT INTO Membre VALUES (7, 20);
INSERT INTO Membre VALUES (7, 21);
INSERT INTO Inscription VALUES (1, 7, '2020-06-14');
