/*
Fichier : Test_GroupeO.sql
Auteurs : 
Paul Bunel 21803019
Valentin Fontaine 21801957
Nom du groupe : O
*/

-- Tests pour le trigger inscription_valide

INSERT INTO Inscription VALUES (1, 4, '2020-01-01');
INSERT INTO Inscription VALUES (1, 4, '2021-01-01');
INSERT INTO Inscription VALUES (1, 5, '2020-06-14');
INSERT INTO Inscription VALUES (1, 6, '2020-06-14');

-- Tests pour le trigger vainqueur_valide

INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 4, '4-3;4-5;1-4');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 5, '4-3;4-2;1-4');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 4, '2-3;4-2');
