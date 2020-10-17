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

class Panier {
  constructor () {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
  }
}

/**
 * Dans ce fichier, vous trouverez des exemples de requêtes GET, POST, PUT et DELETE
 * Ces requêtes concernent l'ajout ou la suppression d'articles sur le site
 * Votre objectif est, en apprenant des exemples de ce fichier, de créer l'API pour le panier de l'utilisateur
 *
 * Notre site ne contient pas d'authentification, ce qui n'est pas DU TOUT recommandé.
 * De même, les informations sont réinitialisées à chaque redémarrage du serveur, car nous n'avons pas de système de base de données pour faire persister les données
 */

/**
 * Notre mécanisme de sauvegarde des paniers des utilisateurs sera de simplement leur attribuer un panier grâce à req.session, sans authentification particulière
 */
router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu
  next()
})

/*
 * Cette route permet d'ajouter un nouvel utilisateur
 * Le body doit contenir l'email et le mot de passe de l'utilisateur
 */
router.post('/register', async (req, res) => {
  const email = req.body.email;
  if(!(email && req.body.password)){
    res.status(400).json({message: "bad request - request must include email and password"});
    return;
  }
  const password = await bcrypt.hash(req.body.password, 10);

  const sql_select = "SELECT * FROM users WHERE email=$1"
  const query = await client.query({
    text: sql_select,
    values: [email]
  })

  if (query.rows.length > 0) {
    res.status(400).json({message: "bad request - user already exists"})
  } else {
    const sql_insert = "INSERT INTO users (email, password) VALUES ($1, $2)"
    await client.query({
      text: sql_insert,
      values: [email, password]
    });
    res.status(200).json({message: "ok"});
  }
})

/*
 * Cette router permet d'authentifier un utilisateur
 * Le body doit contenir l'email et le password de l'utilisateur
 */
router.post('/login', async (req, res) => {
  if (req.session.userId){
    res.status(401).json({message: "already logged in"})
    return;
  }
  const email = req.body.email;
  const password = req.body.password
  if(!(email && password)){
    res.status(400).json({message: "bad request - request must include email and password"});
    return;
  }

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
})

/*
 * Cette route retourne l'utilisateur actuellement connecté
 */
router.get('/me', async (req, res) => {
  if(req.session.userId){
    const sql = "SELECT id, email FROM users WHERE id=$1" //On ne sélectionne pas le champ password
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
