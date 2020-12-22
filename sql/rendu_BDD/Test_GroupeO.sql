/*
Fichier : Test_GroupeO.sql
Auteurs : 
    Paul Bunel 21803019
    Valentin Fontaine 21801957
Nom du groupe : O
*/

-- Tests pour le trigger inscription_valide
CALL print_msg('===== Tests pour le trigger inscription_valide =====');

INSERT INTO Inscription VALUES (1, 7, '2020-06-14');
INSERT INTO Inscription VALUES (1, 4, '2020-01-01');
INSERT INTO Inscription VALUES (1, 4, '2021-01-01');
INSERT INTO Inscription VALUES (1, 5, '2020-06-14');
INSERT INTO Inscription VALUES (1, 6, '2020-06-14');

-- Tests pour le trigger vainqueur_valide
CALL print_msg('===== Tests pour le trigger vainqueur_valide =====');

INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 4, '4-3;4-5;1-4');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 5, '4-3;4-2;1-4');
INSERT INTO Match (idEquipe1, idEquipe2, vainqueur, score)
VALUES (4, 5, 4, '2-3;4-2');


-- Test pour le trigger poule_valide
CALL print_msg('===== Tests pour le trigger poule_valide =====');

INSERT INTO Compose VALUES (1, 1);

-- Test fonction niveau_equipe
CALL print_msg('===== Tests fonction niveau_equipe =====');

SELECT nom, niveau_to_classe(niveau_equipe(idEquipe)) AS classification
FROM equipe
ORDER BY niveau_equipe(idEquipe);


-- Test procédure creer_equipe
CALL print_msg('===== Tests procédure creer_equipe =====');

CALL creer_equipe('testEquipeVide', NULL);
CALL creer_equipe('testEquipeVide', ARRAY[]::int[]);

INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('dupont', 'testCreerEq', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('dupond', 'testCreerEq', 'loisir');
INSERT INTO Joueur (nom, prenom, niveau)
VALUES ('dupon', 'testCreerEq', 'loisir');

DO $$
DECLARE
    ids INT[];
BEGIN
    SELECT ARRAY_AGG(idJoueur) FROM Joueur WHERE prenom = 'testCreerEq' INTO ids;
    CALL creer_equipe('creerEquipe', ids);
END $$;

SELECT nom FROM Equipe WHERE nom = 'creerEquipe';

SELECT equipe.nom, joueur.nom, joueur.prenom FROM membre, equipe, joueur
WHERE membre.idEquipe = equipe.idEquipe
AND membre.idJoueur = joueur.idJoueur
AND equipe.nom = 'creerEquipe';
