const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { Client } = require('pg')

const dotenv = require('dotenv')
dotenv.config()

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE
})

client.connect()

router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu
  next()
})

/**
 * Cette route permet de récupérer une liste d'articles
 * Le body doit contenir d'éventuels paramètres de recherche, ainsi que l'offset de lecture des articles
 */
router.get('/articles', async (req, res) => {
  let offset = 0;
  try {
    offset = req.query.offset;
  } catch (e) {} //Si aucun offset n'est spécifié dans la requête, on va générer une erreur que l'on ignore
  let result;
  let sql = "SELECT id, " +
            "(SELECT username FROM users WHERE id = articles.owner) as owner," +
            " title, " +
            "(SELECT display_name FROM games WHERE id = articles.game) as game," +
            " content, chrono, cover FROM articles "
  switch (req.query.order_by) {
    case 'game':
      const game = sanitizeGameName(req.query.game);
      sql += "WHERE game = (SELECT id FROM games WHERE name = $1 LIMIT 1) ORDER by id DESC LIMIT 20 OFFSET $2";
      result = (await client.query({
        text: sql,
        values: [game, offset]
      })).rows
      break;
    case 'user':
      const user = req.query.user;
      sql += "WHERE owner = (SELECT id FROM users WHERE username = $1 LIMIT 1) ORDER by id DESC LIMIT 20 OFFSET $2";
      result = (await client.query({
        text: sql,
        values: [user, offset]
      })).rows
      break;
    default:
      sql += "ORDER by id DESC LIMIT 20 OFFSET $1";
      result = (await client.query({
        text: sql,
        values: [offset]
      })).rows
  }
  res.status(200).json(result)
})


/**
 * Cette route retourne le nombre total d'articles dans la base de données affichables selon les critères de recherche
 * Elle doit recevoir deux paramètres :
 * orderBy: 'game'|'user' ; défini quelle table rechercher (facultatif)
 * searchString: string ; défini le critère de recherche (ignoré si orderBy n'est pas présent)
 */
router.get('/articleQuantity', async (req, res) => {
  let result;
  switch (req.query.orderBy) {
    case 'game':
      const game = sanitizeGameName(req.query.searchString);
      result = ( await client.query({
        text: "SELECT COUNT(*) FROM articles WHERE game = (SELECT id FROM games WHERE name = $1 LIMIT 1)",
        values: [game]
      })).rows[0]
      res.status(200).json(result)
      break;
    case 'user':
      result = ( await client.query({
        text: "SELECT COUNT(*) FROM articles WHERE owner = (SELECT id FROM users WHERE username = $1)",
        values: [req.query.searchString]
      })).rows[0]
      res.status(200).json(result)
      break;
    default:
      result = ( await client.query({
        text: "SELECT COUNT(*) FROM articles"
      })).rows[0]
      res.status(200).json(result)
  }
})

/**
 * Cette route retourne le nom d'affichage d'un jeu ou d'un utilisateur basé sur une partie seulement de son nom
 * Elle doit recevoir deux paramètres :
 * orderBy: 'game'|'user' ; défini quelle table rechercher
 * searchString: string ; défini le critère de recherche
 */
router.get('/searchName', async (req, res) => {
  const order_by = req.query.orderBy;
  if (order_by === 'game') {
    const game = "%" + sanitizeGameName(req.query.searchString) + "%";
    const result = (await client.query({
      text: "SELECT name, display_name FROM games WHERE name LIKE $1",
      values: [game]
    })).rows;
    res.status(200).json(result);
  } else {
    const user = "%" + req.query.searchString + "%";
    const result = (await client.query({
      text: "SELECT username FROM users WHERE username LIKE $1",
      values: [user]
    })).rows;
    res.status(200).json(result);
  }

})


/**
 * Cette route permet d'ajouter un nouvel article/ run
 * Le body doit contenir l'id de l'utilisateur, le titre de la run, le jeu, le contenue, le temps, une image de couverture et le liens vers la video
 */
router.post('/addrun', async (req, res) => {
  const new_run = req.body;
  const sql_insert = "INSERT INTO articles (owner, title, game, content, chrono, cover, run_link) VALUES ($1, $2, (SELECT id FROM games WHERE display_name = $3 LIMIT 1), $4, $5, $6, $7)"
  try {
    await client.query({
      text: sql_insert,
      values: [
          new_run.id_user,
          new_run.title_run,
          new_run.game,
          new_run.content_text,
          new_run.chrono,
          new_run.cover,
          new_run.run_link
      ]
    });
    res.status(200).json({message: "ok"})
  } catch (e) {
    res.status(400).json({message: "bad request"});
  }
})

/**
 * Cette route permet de modifier article/ run
 * Le body doit contenir l'id de l'utilisateur, le titre de la run, le jeu, le contenue, le temps, une image de couverture et le liens vers la video
 */
router.patch('/runmodif', async (req, res) => {
  const id_user = req.body.id_user;
  let title_run = req.body.title_run;
  let game = req.body.game;
  let content_text = req.body.content_text;
  let chrono = req.body.chrono;
  let cover = req.body.cover;
  let run_link = req.body.run_link
  const id_article = req.body.id_article
  if(!id_user){
    res.status(400).json({message: "bad request - request must contain an id"});
  }
  else{

    const sql = "SELECT * FROM users WHERE id=$1";
    const result = (await client.query({
      text: sql,
      values: [id_user]
    })).rows

    const sql2 = "SELECT * FROM articles WHERE id=$1";
    const result2 = (await client.query({
      text: sql2,
      values: [id_article]
    })).rows

  console.log("1")
    if (result.length === 1 && result2.length === 1 && (result[0].admin || parseInt(result2[0].owner) === parseInt(id_user))) {
      console.log("12")
      if(!title_run){
        title_run=result2[0].title
      }if(!game){
        game=result2[0].game
      }if(!content_text){
        content_text=result2[0].content
      }if(!chrono){
        chrono=result2[0].chrono
      }if(!cover){
        cover=result2[0].cover
      }if(!run_link){
        run_link=result2[0].run_link
      }

      console.log("13")
      const sql_update = "UPDATE articles set title = $1, game  = $2, content = $3, chrono = $4, cover = $5, run_link = $6  WHERE  id=$7 "
      await client.query({
        text: sql_update,
        values: [ title_run,game, content_text,chrono,cover,run_link,id_article ]
      });
      console.log("14")
      res.status(200).json({message: "ok"});
    } else {
      res.status(400).json({message: "bad request -  invalid request"});
    }
  }

})

/**
 * Cette route permet d'ajouter un nouvel utilisateur
 * Le body doit contenir l'email et le mot de passe de l'utilisateur
 */
router.post('/register', async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  if(!(email && username && req.body.password)){
    res.status(400).json({message: "bad request - request must include email and password"});
  } else if (username.length > 30) { //Vérifié par le component coté client, mais on revérifie ici car on ne peux pas faire confiance au client pour la validation de données
    res.status(400).json({message: "bad request - username must be shorter than 30 characters"})
  } else {
    const password = await bcrypt.hash(req.body.password, 10);

    const sql_select = "SELECT * FROM users WHERE email=$1 OR username=$2"
    const query = await client.query({
      text: sql_select,
      values: [email, username]
    })

    if (query.rows.length > 0) {
      res.status(400).json({message: "bad request - user already exists"})
    } else {
      const sql_insert = "INSERT INTO users (email, password, username, admin) VALUES ($1, $2, $3, FALSE)"
      await client.query({
        text: sql_insert,
        values: [email, password, username]
      });
      res.status(200).json({message: "ok"});
    }
  }
})

/**
 * Cette router permet d'authentifier un utilisateur
 * Le body doit contenir l'email et le password de l'utilisateur
 */
router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (req.session.userId){
    res.status(401).json({message: "already logged in"})
  } else if(!(email && password)){
    res.status(400).json({message: "bad request - request must include email and password"});
  } else {
    const sql = "SELECT * FROM users WHERE email=$1";
    const result = (await client.query({
      text: sql,
      values: [email]
    })).rows
    if (result.length === 1) {
      if (await bcrypt.compare(password, result[0].password)) {
        req.session.userId = result[0].id;
        res.status(200).json({message: "ok"})
      } else {
        res.status(400).json({message: "bad request - invalid password"});
      }
    } else {
      res.status(400).json({message: "bad request - invalid user"});
    }
  }
})

/**
 * Cette route retourne l'utilisateur actuellement connecté
 */
router.get('/me', async (req, res) => {
  if(req.session.userId){
    const sql = "SELECT id, email, username FROM users WHERE id=$1"
    const result = (await client.query({
      text: sql,
      values: [req.session.userId]
    })).rows
    if(result){
      res.status(200).json(result[0])
    } else {
      res.status(500)
    }
  } else {
    res.status(401).json({message: "no user logged in."});
  }
})

module.exports = router

function sanitizeGameName(game) {
  const regex_void = /[#_%.*/='"]/g;
  const regex_space = /[\-]/g;
  return game.toLowerCase().replace(regex_void,'').replace(regex_space, ' ')
}
