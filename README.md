# Prolog
# Projet IA – Enquête Policière en Prolog

## Description

Ce projet est un **système expert en Prolog** pour la gestion d’enquêtes criminelles.  
Il permet de déterminer si un suspect est coupable ou innocent en fonction de preuves, témoins, alibis et indices.  
Le projet inclut la **modélisation des faits**, des règles de culpabilité, des exceptions (alibis, faux positifs, témoins non fiables), et une interface utilisateur interactive.

---

## Fonctionnalités

- Vérifier si un suspect est coupable d’un type de crime (`vol`, `assassinat`, `escroquerie`).
- Lister tous les suspects coupables d’un type de crime.
- Gestion des **cas spéciaux** :
  - Alibis
  - Faux positifs (empreintes anciennes)
  - Fiabilité des témoins
- Explication des preuves à charge pour chaque suspect.

---

## Technologies

- **Langage** : Prolog (SWI-Prolog recommandé)
- **Paradigme** : Logique déclarative, système expert
- **Module principal** : `enquete_policiere`

---

## Structure du projet

