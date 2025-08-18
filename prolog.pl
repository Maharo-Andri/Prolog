% ============================================================
%  Projet IA – Enquête policière en PROLOG (Phase 2 : Modélisation)
%  Fichier unique : faits + règles + cas spéciaux + utilitaires
%  SWI-Prolog recommandé (swipl)
% ============================================================

:- module(enquete_policiere, [
    % Requêtes principales
    is_guilty/2,
    innocent/2,
    explain_guilt/3,
    find_all_guilty/2
]).

/* -----------------------------------------------------------
   DÉCLARATIONS DYNAMIQUES (facultatif : permet d’ajoutersupprimer à chaud)
----------------------------------------------------------- */
:- discontiguous has_motive/2.
:- discontiguous was_near_crime_scene/2.
:- discontiguous has_fingerprint_on_weapon/2.
:- discontiguous temoin/2.
:- discontiguous eyewitness_identification/2.
:- discontiguous fiable/1.
:- discontiguous non_fiable/1.
:- discontiguous utilise_avant_crime/2.
:- discontiguous arme_du_crime/2.
:- discontiguous alibi/3.
:- discontiguous crime/3.

:- dynamic suspect/1.
:- dynamic crime_type/1.
:- dynamic has_motive/2.
:- dynamic was_near_crime_scene/2.
:- dynamic has_fingerprint_on_weapon/2.
:- dynamic has_bank_transaction/2.
:- dynamic owns_fake_identity/2.
:- dynamic temoin/2.
:- dynamic eyewitness_identification/2.
:- dynamic fiable/1.
:- dynamic non_fiable/1.
:- dynamic utilise_avant_crime/2.
:- dynamic arme_du_crime/2.
:- dynamic alibi/3.
:- dynamic crime/3.

/* -----------------------------------------------------------
   FAITS (dataset fourni)
----------------------------------------------------------- */

% Types de crimes
crime_type(assassinat).
crime_type(vol).
crime_type(escroquerie).

% Suspects
suspect(john).
suspect(mary).
suspect(alice).
suspect(bruno).
suspect(sophie).

% Indices (faits)
% VOL – John
has_motive(john, vol).
was_near_crime_scene(john, vol).
has_fingerprint_on_weapon(john, vol).

% ASSASSINAT – Mary
has_motive(mary, assassinat).
was_near_crime_scene(mary, assassinat).
has_fingerprint_on_weapon(mary, assassinat).

% ESCROQUERIE – Alice / Bruno / Sophie
has_motive(alice, escroquerie).
has_bank_transaction(alice, escroquerie).

has_bank_transaction(bruno, escroquerie).
owns_fake_identity(sophie, escroquerie).

% Cas spéciaux – Témoins
temoin(paul, assassinat).
eyewitness_identification(mary, assassinat).   % Paul dit avoir vu Mary
fiable(paul).

temoin(julie, vol).
eyewitness_identification(john, vol).
non_fiable(julie).

% Faux positifs (empreintes présentes avant le crime)
utilise_avant_crime(john, couteau).
arme_du_crime(couteau, assassinat).

% Alibi & contexte du crime (exemple pour illustrer la règle d’innocence)
alibi(alice, restaurant, '20:00').
crime(escroquerie, '20:00', bureau).

/* -----------------------------------------------------------
   AIDES LOGIQUES (qualité du témoin, faux positifs)
----------------------------------------------------------- */

% Un témoin "valide" est un témoin déclaré fiable pour un type de crime
temoin_valide(T, Type) :-
    temoin(T, Type),
    fiable(T).

% Faux positif : empreinte sur l’arme mais laissée avant le crime
faux_positif(Suspect, CrimeType) :-
    has_fingerprint_on_weapon(Suspect, CrimeType),
    utilise_avant_crime(Suspect, Arme),
    arme_du_crime(Arme, CrimeType).

/* -----------------------------------------------------------
   INNOCENCE (alibi simple basé sur lieu/heure du crime)
----------------------------------------------------------- */

% Règle d’innocence : si, à l’heure du crime (Type, Heure, Lieu),
% le suspect a un alibi dans un autre lieu, il est innocent.
innocent(Suspect, CrimeType) :-
    crime(CrimeType, Heure, LieuCrime),
    alibi(Suspect, LieuAlibi, Heure),
    LieuAlibi \= LieuCrime.

/* -----------------------------------------------------------
   CULPABILITÉ (règles par type de crime)
----------------------------------------------------------- */

% VOL : mobile + présence + (empreinte OU témoin fiable) + pas d’innocence + pas de faux positif
is_guilty(Suspect, vol) :-
    has_motive(Suspect, vol),
    was_near_crime_scene(Suspect, vol),
    ( has_fingerprint_on_weapon(Suspect, vol)
    ; ( eyewitness_identification(Suspect, vol),
        temoin_valide(_, vol)  % au moins un témoin fiable pour ce type
      )
    ),
    \+ innocent(Suspect, vol),
    \+ faux_positif(Suspect, vol).

% ASSASSINAT : mobile + présence + (empreinte OU témoin fiable) + pas d’innocence + pas de faux positif
is_guilty(Suspect, assassinat) :-
    has_motive(Suspect, assassinat),
    was_near_crime_scene(Suspect, assassinat),
    ( has_fingerprint_on_weapon(Suspect, assassinat)
    ; ( eyewitness_identification(Suspect, assassinat),
        temoin_valide(_, assassinat)
      )
    ),
    \+ innocent(Suspect, assassinat),
    \+ faux_positif(Suspect, assassinat).

% ESCROQUERIE : mobile (optionnel) + (transaction OU fausse identité) + pas d’innocence
% NB : on peut exiger le mobile selon le niveau de sévérité voulu.
is_guilty(Suspect, escroquerie) :-
    ( has_bank_transaction(Suspect, escroquerie)
    ; owns_fake_identity(Suspect, escroquerie)
    ),
    \+ innocent(Suspect, escroquerie).

/* -----------------------------------------------------------
   EXPLICATIONS (justifications des décisions)
----------------------------------------------------------- */

% explain_guilt(S, Type, Evidence) : liste les éléments à charge retenus
explain_guilt(S, Type, Evidence) :-
    findall(E, evidence_true(S, Type, E), EvList),
    sort(EvList, Evidence).

% Énumération des étiquettes d’indices "vrais"
evidence_true(S, T, motive)           :- has_motive(S, T).
evidence_true(S, T, near_scene)       :- was_near_crime_scene(S, T).
evidence_true(S, T, fingerprint_wpn)  :- has_fingerprint_on_weapon(S, T).
evidence_true(S, T, bank_txn)         :- has_bank_transaction(S, T).
evidence_true(S, T, fake_identity)    :- owns_fake_identity(S, T).
evidence_true(S, T, eyewitness)       :- eyewitness_identification(S, T), temoin_valide(_, T).
evidence_true(S, T, no_innocence)     :- \+ innocent(S, T).
evidence_true(S, T, no_false_positive):- \+ faux_positif(S, T).

/* -----------------------------------------------------------
   OUTIL : liste des coupables par type
----------------------------------------------------------- */

% find_all_guilty(Type, Suspects) : renvoie tous les suspects jugés coupables
find_all_guilty(Type, Suspects) :-
    crime_type(Type),
    findall(S, (suspect(S), is_guilty(S, Type)), L),
    sort(L, Suspects).

/* -----------------------------------------------------------
   EXEMPLES D’UTILISATION (dans le REPL SWI-Prolog)
-----------------------------------------------------------

?- is_guilty(john, vol).
?- is_guilty(mary, assassinat).
?- is_guilty(alice, escroquerie).
?- is_guilty(bruno, escroquerie).
?- is_guilty(sophie, escroquerie).

?- explain_guilt(john, vol, Ev).
?- find_all_guilty(vol, L).

Remarques :
- Le témoin "julie" est non fiable → son témoignage ne renforce pas John.
- Le faux positif ne s’applique pas sur l’assassinat de Mary (il cible John + couteau).
- L’alibi d’Alice à 20:00 au restaurant l’innocente si le crime d’escroquerie
  s’est produit à 20:00 au bureau (cf. faits "crime/3" et "alibi/3").

============================================================ */

/* -----------------------------------------------------------
   PROGRAMME PRINCIPAL – INTERFACE UTILISATEUR
----------------------------------------------------------- */

% main/0 : menu interactif
main :-
    writeln("=== Systeme Expert : Enquete Policiere ==="),
    writeln("1. Vérifier si un suspect est coupable d'un crime"),
    writeln("2. Lister tous les suspects coupables d'un type de crime"),
    writeln("3. Quitter"),
    writeln("Entrez votre choix (1/2/3) : "),
    read(Choice),
    handle_choice(Choice).

% Gestion des choix
handle_choice(1) :-
    writeln("Entrez le suspect (ex: john.) : "),
    read(Suspect),
    writeln("Entrez le type de crime (ex: vol.) : "),
    read(Type),
    ( is_guilty(Suspect, Type) ->
        format("✅ ~w est coupable de ~w.~n", [Suspect, Type])
    ;   format("❌ ~w n'est pas coupable de ~w.~n", [Suspect, Type])
    ),
    nl, main.

handle_choice(2) :-
    writeln("Entrez le type de crime (ex: vol.) : "),
    read(Type),
    writeln("=== Liste des coupables ==="),
    find_all_guilty(Type, Suspects),
    ( Suspects = [] -> writeln("Aucun suspect trouvé.")
    ;   print_suspects(Suspects)
    ),
    nl, main.

handle_choice(3) :-
    writeln("Au revoir !"), !.

handle_choice(_) :-
    writeln("Choix invalide, réessayez."), nl,
    main.

% Affichage des suspects
print_suspects([]).
print_suspects([H|T]) :-
    writeln(H),
    print_suspects(T).
