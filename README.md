# Installation

- Extraire le projet
- Créer une base de données Postgresql
- Restaurer la base de données avec le backup sql fournit ([tutoriel](https://youtu.be/S108Rh6XxPs?t=240))
- Créer un fichier .env à la racine du projet (voir la table de contenu ci-dessous)
- Ouvrir powershell à la racine du projet et éxecuter `npm install`

### Architecture du fichier .env
Champ|Contenu
:---:|:---:
SECRET|Chaîne de caractère aléatoire
DATABASE|Nom de la base de données postgresql
DB_PASSWORD|Mot de passe de la base de données

###### Exemple :
```
SECRET="fjnjgs15sfzef15zEAzdad"
DATABASE="projet_web_l3"
DB_PASSWORD="superMotDePasse"
```
# Exécution

- Ouvrir powershell à la racine du projet et exécuter `npm start`
- Consulter http://localhost:3000
