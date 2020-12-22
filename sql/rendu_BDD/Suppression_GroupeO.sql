/*
Fichier : Suppression_GroupeO.sql
Auteurs : 
    Paul Bunel 21803019
    Valentin Fontaine 21801957
Nom du groupe : O
*/

/*
décommentez la ligne si vos tests sont dans la DB test
(il faut également être dans une autre DB pour la supprimer)
*/
-- DROP DATABASE IF EXISTS test;

DROP TRIGGER IF EXISTS poule_valide_trigger ON Compose;
DROP TRIGGER IF EXISTS inscription_valide_trigger ON Inscription;
DROP TRIGGER IF EXISTS vainqueur_valide_trigger ON Match;

DROP FUNCTION IF EXISTS poule_valide;
DROP FUNCTION IF EXISTS inscription_valide;
DROP FUNCTION IF EXISTS assert_joueurs_uniques;
DROP FUNCTION IF EXISTS vainqueur_valide;

DROP FUNCTION IF EXISTS niveau_equipe;
DROP FUNCTION IF EXISTS niveau_to_classe;
DROP FUNCTION IF EXISTS classe_to_niveau;

DROP PROCEDURE IF EXISTS creer_equipe;

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
