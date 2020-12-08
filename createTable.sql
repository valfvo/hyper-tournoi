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
        FOREIGN KEY(idPoule) REFERENCES Poule(idPoule),
    CONSTRAINT FK_Equipe
        FOREIGN KEY(idEquipe) REFERENCES Equipe(idEquipe)
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
    CONSTRAINT FK_Poule
        FOREIGN KEY(idPoule) REFERENCES Poule(idPoule),
    CONSTRAINT FK_Equipe1
        FOREIGN KEY(idEquipe1) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Equipe2
        FOREIGN KEY(idEquipe2) REFERENCES Equipe(idEquipe),
    CONSTRAINT FK_Vainqueur
        FOREIGN KEY(vainqueur) REFERENCES Equipe(idEquipe)
);

INSERT INTO Tournoi (idEvenement, nom, typejeu, sport)
VALUES (12, 'Tournoi de 3x3 du 10 decembre', '3x3', 'Petanque');