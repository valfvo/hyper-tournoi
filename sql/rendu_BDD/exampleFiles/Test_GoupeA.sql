/*
FIchier : Test_GroupeA.sql
Auteurs : 
Pierre Dupont 2019334455
Paul Dupond 2019335629
Nom du groupe : A
*/


/* Test des triggers */

/* Insertion d'un pilote avec un salaire égal à 0*/
INSERT INTO PILOTE VALUES (4, "DUJARDIN","LYON",0);

/* Affichage pour vérifier que l'erreur a bien été sauvegardé dans le log */

SELECT * FROM LOGERROR ;

/* Insertion d'un pilote avec un salaire égal différent de 0*/

INSERT INTO PILOTE VALUES (4, "DUJARDIN","LYON",10);

SELECT * FROM PILOTE;

/* Insertion d'un vol avec un avion non localisé dans ville de départ du vol */
INSERT INTO VOL VALUES (12, 1, 100, "LYON", "MONTPELLIER",13,14);

/* Affichage pour vérifier que l'erreur a bien été sauvegardé dans le log */

SELECT * FROM LOGERROR ;

/* Insertion d'un vol avec un avion  localisé dans ville de départ du vol */
INSERT INTO VOL VALUES (12,1,100,"PARIS","MARSEILLE",22,23);


SELECT * FROM VOL;


/* Test fonction */

SELECT NUMPIL, NOMPIL, SAL,NIVEAU_SALAIRE(SAL)
FROM PILOTE
ORDER BY NOMPIL;