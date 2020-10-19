const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')

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
  // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})

/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get('/panier', (req, res) => {
  res.json(req.session.panier);
})

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post('/panier', (req, res) => {
  //On vérifie qu'on a bien reçu des nombres. De plus, on converti tout float éventuel en int
  const id = parseInt(req.body.id, 10);
  const quantity = parseInt(req.body.quantity, 10);

  if (!id || id < 1) { //Si l'id n'existe pas, ou n'est pas un entier positif
    res.status(400).json({message: 'bad request - id needs to be positive integer.'});
  }
  if (!quantity || quantity < 1){ //Si la quantité n'existe pas, ou n'est pas un entier positif
    res.status(400).json({message: 'bad request - quantity needs to be positive integer.'});
  }
  if (articles.find(o => o.id === id)) { //Si l'article est pas dans la liste des articles
    if (req.session.panier.articles.find(o => o.id === id)) { //Si l'article est déjà dans le panier
      res.status(400).json({message: 'bad request - article already present.'});
    } else { //On a fait toutes les vérifications et on ajoute l'article
      req.session.panier.articles.push({'id': id, 'quantity': quantity});
      res.json(req.session.panier)
    }
  } else {
    res.status(400).json({message: `bad request - no article found with id ${id}.`});
  }
})

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post('/panier/pay', (req, res) => {
  const name = req.body.name;
  const surname = req.body.surname;

  if (name && surname) {
    req.session.destroy();
    res.json({message: `Merci ${name} ${surname} pour votre achat.`});
  } else {
    res.status(400).json({message: 'bad request - need name and surname to checkout.'})
  }
})

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put('/panier/:articleId', (req, res) => {
  //On vérifie qu'on a bien reçu des nombres. De plus, on converti tout float éventuel en int
  const articleId = parseInt(req.params.articleId, 10);
  const quantity = parseInt(req.body.quantity, 10);

  if (!quantity || quantity < 1){ //Si la quantité n'existe pas, ou n'est pas un entier positif
    res.status(400).json({message: 'bad request - quantity needs to be positive integer.'});
    return;
  }

  //On récupère l'article a éditer
  let article = req.session.panier.articles.find(o => o.id === articleId);
  if(article){
    article.quantity = quantity;
    res.json(req.session.panier);
  } else {
    res.status(400).json({message: `bad request - no article with id ${articleId} found.`})
  }
})

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete('/panier/:articleId', (req, res) => {
  //On vérifie qu'on a bien reçu des nombres. De plus, on converti tout float éventuel en int
  const articleId = parseInt(req.params.articleId, 10);
  const article = req.session.panier.articles.find(o => o.id === articleId);

  if(article){
    //On trouve la position de l'article, et on supprime l'élément à cette position
    const index = req.session.panier.articles.indexOf(article);
    req.session.panier.articles.splice(index, 1)
    res.json(req.session.panier);
  } else {
    res.status(400).json({message: `bad request - no article with id ${articleId} found.`})
  }
})


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', (req, res) => {
  res.json(articles)
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)

  // vérification de la validité des données d'entrée
  if (typeof name !== 'string' || name === '' ||
      typeof description !== 'string' || description === '' ||
      typeof image !== 'string' || image === '' ||
      isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const article = {
    id: articles.length + 1,
    name: name,
    description: description,
    image: image,
    price: price
  }
  articles.push(article)
  // on envoie l'article ajouté à l'utilisateur
  res.json(article)
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
function parseArticle (req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const article = articles.find(a => a.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article
  next()
}

router.route('/article/:articleId')
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, (req, res) => {
    // req.article existe grâce au middleware parseArticle
    res.json(req.article)
  })

  /**
   * Cette route modifie un article.
   * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
   * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
   *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
   */
  .put(parseArticle, (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price
    res.send()
  })

  .delete(parseArticle, (req, res) => {
    const index = articles.findIndex(a => a.id === req.articleId)

    articles.splice(index, 1) // remove the article from the array
    res.send()
  })

module.exports = router
