DROP TABLE IF EXISTS Match;
DROP TABLE IF EXISTS Compose;
DROP TABLE IF EXISTS Poule;
DROP TABLE IF EXISTS Membre;
DROP TABLE IF EXISTS Joueur;
DROP TABLE IF EXISTS Inscription;
DROP TABLE IF EXISTS Equipe;
DROP TABLE IF EXISTS Dispose;
DROP TABLE IF EXISTS Terrain;
DROP TABLE IF EXISTS Tournoi;
DROP TABLE IF EXISTS Evenement;

CREATE TABLE Evenement (
    idEvenement SERIAL PRIMARY KEY,
    nom VARCHAR(50),
    lieu VARCHAR(50),
    dateDebut DATE,
    dateFin DATE
);

CREATE TABLE Tournoi (
    idTournoi SERIAL PRIMARY KEY,
    idEvenement INT,
    nom VARCHAR(50),
    typeJeu VARCHAR(30),
    sport VARCHAR(20),
    CONSTRAINT FK_Evenement
        FOREIGN KEY(idEvenement) REFERENCES Evenement(idEvenement)
);

CREATE TABLE Terrain (
    idTerrain SERIAL PRIMARY KEY,
    numTerrain INT
);

CREATE TABLE Dispose (
    idEvenement INT,
    idTerrain INT,
    CONSTRAINT PK_Dispose
        PRIMARY KEY(idEvenement, idTerrain),
    CONSTRAINT FK_Evenement
        FOREIGN KEY(idEvenement) REFERENCES Evenement(idEvenement),
    CONSTRAINT FK_Terrain
        FOREIGN KEY(idTerrain) REFERENCES Terrain(idTerrain)
);

CREATE TABLE Equipe (
    idEquipe SERIAL PRIMARY KEY,
    nomEquipe VARCHAR(30)
);

CREATE TABLE Inscription (
    idTournoi INT,
    idEquipe INT,
    etat VARCHAR(10)
    CONSTRAINT DOM_etat
        CHECK(etat IN ('inscrit', 'preinscrit')),
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
    idTerrain INT,
    CONSTRAINT FK_Terrain
        FOREIGN KEY(idTerrain) REFERENCES Terrain(idTerrain)
);

CREATE TABLE Compose (
    idPoule INT,
    idEquipe INT,
    CONSTRAINT PK_Compose
        PRIMARY KEY(idPoule, idEquipe),
    CONSTRAINT FK_Poule
        FOREIGN KEY(idPoule) REFERENCES Poule(idPoule),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe)
);

CREATE TABLE Match (
    idMatch SERIAL PRIMARY KEY,
    idPoule INT,
    idEquipe1 INT,
    idEquipe2 INT,
    vainqueur INT,
    score VARCHAR(15),
    numTour INT,
    code VARCHAR(10),
    dateDebut DATE,
    dateFin DATE,
    CONSTRAINT FK_Poule
        FOREIGN KEY(idPoule) REFERENCES Poule(idPoule),
    CONSTRAINT FK_Equipe1
        FOREIGN KEY(idEquipe1) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Equipe2
        FOREIGN KEY(idEquipe2) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Vainqueur
        FOREIGN KEY(vainqueur) REFERENCES Equipe(idEquipe)
);
