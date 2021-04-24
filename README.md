# <img src="./myappfront/public/assets/logo.png" width="30" height="30"/> Météo 77

### Auteurs :

- Felix Quinton (sonde)

- Gaspard Cothias Faure (centrale)

## Centrale ([myappfront](./myappfront/))

La centrale est une application Vue CLI 3.

#### Code source

Le code source de cette application est disponible dans [myappfront](./myappfront/).

Dans le code source, pour définir les différentes API que la centrale doit afficher, il existe un fichier de configuration [**stations.json**](./myappfront/public/stations.json) disponible dans ```myappfront/public/```.

Ce code source peut être visualisé avec `npm run serve` dans ```myappfront/```.

#### Code *buildé*

Le code *buildé* est disponible dans ```myappfront/dist/```.

Dans le code *buildé*, pour définir les différentes API que la centrale doit afficher, il existe un fichier de configuration [**stations.json**](./myappfront/dist/stations.json) disponible dans ```myappfront/dist/```.

Ce code source peut être visualisé avec `serve -s dist` dans ```myappfront/```.

#### Application deployée

Pour pouvoir développer puis deployer la centrale, nous avons décidé de créer deux API de sondes factices 027 et 030 exposées sur le web, qui alimentent en données la centrale déployée.

> Le code source de ces deux API est disponible ici : https://github.com/GaspardCothiasFaure/fakeAPI4meteo77
>
> Ces deux API peuvent être appelés aux adresses https://fakeapimeteoprojet027.herokuapp.com/ et https://fakeapimeteoprojet030.herokuapp.com/
>
> Dans un souci de simplicité, ces deux API ne gèrent pas les dates, donc les données seront identiques quelle que soit la période selectionnée.

*********

##### Le rendu de l'application (*buildée*) déployée est disponible ici : **https://meteo77.netlify.app/**

*********

> Le code déployé via Netlify est disponible ici : https://github.com/GaspardCothiasFaure/meteo77

Ce sont les deux API qui alimentent en données l'application déployée, 3 autres API sont définies (URL des Raspberry) dans le fichier de configuration **stations.json** mais ne sont pas accessibles.

:warning: **Attention :** Pour une raison inconnue, le premier chargement du site peut ne pas être en capacité de récupérer les données des deux API. Pour y remédier, rechargez la page en vidant le cache.

> Les données seront identiques quelle que soit la période selectionnée.

## Sonde ([myapp](./myapp/))

#### Code source

Le code source de cette application est disponible dans [myapp](./myapp/).

Il doit être déployé sur le server afin de pouvoir communiquer avec la partie front.

### Creation d'une base de donnée Mongo

Les données utilisées par l'Api sont stockées dans une base de données mongo. Avant toute chose, il faut donc créer une base de données mongo nommée meteo exposant ses données sur le port 27017.

Mongo peut s'installer soit via docker: https://hub.docker.com/_/mongo
puis en lancant la commande: *docker run -d --name meteoproject -p 27017:27017 mongo*

Soit via le Mongodb community server: https://www.mongodb.com/try#community


### Package.json

Le fichier contenant les différentes dépendances nécessaires au bon fonctionnement de l'Api se nomme package.json, pour installer ces dépendances, il suffit simplement de lances la commande: *npm install* dans le répertoire ./myapp. 

### Ajout à la base de données

Le fichier stock.js contenue dans le répertoire ./bin permet l'ajout de données à la base de données mongo. Dès que l'un des fichiers surveillés sera mis à jour, on va alors aller chercher le fichier en question et l'ajouté à la base de données mongo dans la table correspondant au fichier.
Pour cela, on lancera simplement la commande: *npm run stock* dans le répertoire ./myapp

### Communication avec le front

La seconde partie de l'Api permet de récuperer une requête venue du côté front et de renvoyé les données demandées par l'utilisateur. Le fichier permettant cela est contenue dans le répertoire ./routes et se nomme data.js
Pour cela il suffit donc de lancer la commande: *npm start* dans le répertoire ./myapp. 

Les données sont exposées sur le port 80, il peut donc être necessaire de lancer la commande *sudo setcap 'cap_net_bind_service=+ep'/usr/local/bin/node* pour pouvoir lancer la commande précedente.

