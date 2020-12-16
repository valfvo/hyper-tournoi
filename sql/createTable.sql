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
DROP TABLE IF EXISTS Organisateur CASCADE;

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
        FOREIGN KEY(idOrganisateur) REFERENCES Organisateur(idOrganisateur)
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