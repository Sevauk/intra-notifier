Intra-notifier
====

Ce script notifie les gens via slack de l'ouverture de modules, ou de notifications sur l'intranet d'epitech (https://intra.epitech.eu).

Comment utiliser ?
----

1. Créer un bot slack (https://storit.slack.com/apps/A0F7YS25R-bots)
2. Renseigner le token et le nom du bot dans index.js (environ ligne 23)
3. Renseigner les channels utilisés par le bot (dans le code c'est réglé sur "urgence" et "general")
4. Lancer le script tout les x minutes/heures avec un Cron job par exemple.
