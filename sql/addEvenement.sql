INSERT INTO Organisateur (mail, motDePasse, nom, prenom)
VALUES ('hyper@tournoi.com', '414f27bb362295cb6aa405b118b4046d', 'hyper', 'tournoi');

INSERT INTO Evenement (nom, idOrganisateur, lieu, nbTerrains, dateDebut, dateFin)
VALUES ('FeteNat', 1, 'Montpellier', 2, '2020-07-14', '2020-07-14');

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
