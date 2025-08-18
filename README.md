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

ia-enquete-policiere/
│
├─ prolog.pl # Faits, règles, cas spéciaux, moteur principal
├─ README.md # Ce fichier


---

## Installation

1. Installer [SWI-Prolog](https://www.swi-prolog.org/download/stable) sur votre machine.
2. Cloner le projet :

```bash
git clone https://github.com/Maharo-Andri/Prolog.git
```

3. Se rendre dans le dossier du projet :
```
cd ia-enquete-policiere
```

## Exécution

1. Lancer SWI-Prolog :

```
swipl
```
2. Charger le fichier Prolog :

```
?- [prolog].
```

3. Lancer le menu interactif :

```
?- enquete_policiere:main.
```

## Exemple de requêtes directes

Pour tester directement la culpabilité ou obtenir les preuves :
```
?- enquete_policiere:is_guilty(john, vol).
?- enquete_policiere:explain_guilt(john, vol, Evidence).
?- enquete_policiere:find_all_guilty(vol, Suspects).
```
