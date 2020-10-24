<template>
  <div v-if="done && user.id" class="no-overflow">

    <h2>Dernier ajout de {{user.username}} </h2>

    <hr>

    <!-- Affichage des articles -->
    <div class="card-deck">
      <article v-for="article in articles" :key="article.id" class="card" v-on:click="navigateArticle(article.id)">
        <div v-if="user.username==article.owner">
        <img :src="article.cover" alt="cover image" class="card-img-top" v-if=article.cover>
        <span class="card-img-top" v-else></span>
        <div class="card-body">
          <h2 class="card-title">{{article.title}} </h2>
          <h4 class="text-muted">{{article.chrono}} - {{article.game}}</h4>
          <pre class="card-text p">{{article.content}}</pre>
        </div>
        </div>

      </article>
    </div>
    <h4 v-if="articles.length === 0"> Pas d'article trouvé !</h4>

    <!-- Modal d'ajout d'article -->
    <button v-if="user.id==id" type="button" class="btn btn-primary" data-toggle="modal" data-target="#addArticleModal" data-whatever="@mdo">Ajouter une nouvelle run</button>

    <div class="modal fade" id="addArticleModal" tabindex="-1" role="dialog" aria-labelledby="addArticleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="addArticleModalLabel">Ajouter une nouvelle run</h2>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- Formulaire d'ajout / corps du modal -->
            <form @submit.prevent="addRun">
              <input class="h2" v-model="newRun.title" placeholder="Titre" type="text" required class="max_width">
              <div class="form-group">
                <input v-model="newRun.game" placeholder="Jeu" required type="text">
                <small class="text-muted h4">-</small>
                <input v-model="newRun.time" placeholder="Temps" required type="text">
              </div>
              <div class="form-group">
                <textarea v-model="newRun.content" required type="text" class="max_width"></textarea>
              </div>
              <div class="form-group">
                <input v-model="newRun.cover" type="url" required placeholder="Lien vers l'image de couverture" class="max_width">
              </div>
              <div class="form-group">
                <input v-model="newRun.video_link" type="url" required placeholder="Lien vers la preuve vidéo"  pattern=".*\.(youtube|twitch)\..*" title="L'URL doit être un lien youtube ou twitch." class="max_width">
              </div>
              <button class="btn btn-primary" type="submit">Ajouter</button>
              <button class="btn btn-danger" type="button" @click="reset()">Tout supprimer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
module.exports = {
  data () {
    return {
      id: this.$route.params.id,
      user: {
        id: null,
        email: null,
        username: null,
      },

      newRun: {
        video_link: '',
        cover: '',
        title: '',
        game: '',
        time: '',
        content: '',
      },
      done: false, // Permet au site de savoir quand les données ont fini d'être récupérées au chargement de la page
      offset: 0, // Permet de savoir le nombre d'articles déjà lus
      order_by: null, // Sélection du type de recherche
      selection_criteria: null, // Critère de recherche
      autocomplete_possibilities: [],
      autocomplete_timer: null,
      articles: [], // Articles à afficher
    }
  },
  async mounted() {
    try {
      await this.getUser()
    } catch (e) {
      this.login()
    }
    this.articles = await this.getArticles()
    this.done = true
  },
  methods: {

    addRun() {
      this.$emit('add-run', this.newRun, this.user.id)
    },
    async getUser() {

      const res = await axios.get('/api/me')
      this.user = res.data
    },
    login() {
      window.location.hash = "#/login"
    },

    async getArticles() {
      switch (this.order_by) {
        case 'game':
          return (await axios.get('/api/articles', {
            params: {
              offset: this.offset,
              order_by: "game",
              game: this.selection_criteria
            }
          })).data
        case 'user':
          return (await axios.get('/api/articles', {
            params: {
              offset: this.offset,
              order_by: "user",
              user: this.selection_criteria
            }
          })).data
        default:
          return (await axios.get('/api/articles', {params: {offset: this.offset}})).data
      }
    },
    async refreshArticles () {
      this.articles = await this.getArticles()
    },
    reset () {
      // Réinitialise les champs de l'ajout d'article
      if(confirm("Voulez-vous vraiment supprimer ?")){
        this.newRun = {
          video_link: '',
          cover: '',
          title: '',
          game: '',
          time: '',
          content: '',
        }
      }
    },
    navigateArticle (id) {
      router.replace({
        name: 'run', params: {id: id.toString()}
      })
    },
    async autocomplete (i) {
      // Remplace le champ "selection_criteria" d'entrée utilisateur par l'élément choisi dans la liste des suggestion.
      if(this.order_by === 'game') {
        this.selection_criteria = this.autocomplete_possibilities[i].name;
      } else if (this.order_by === 'user') {
        this.selection_criteria = this.autocomplete_possibilities[i].username;
      }
      // On recharge les articles avec le nouveau critère de sélection
      await this.refreshArticles();
      // On réinitialise les critères de recherche une fois celle-ci effectuée
      this.selection_criteria = '';
      this.autocomplete_possibilities = [];
    },




  },
  computed: {


  }
}
</script>

<style scoped>
.no-overflow {
  overflow-x: hidden
}

article {
  max-height: 35em;
  min-width: 20em;
  max-width: 45em;

}

article span {
  background: rgba(0, 0, 0, 0.125);
  height: 25em;
}


textarea {
  min-height: 20em;
}

.max_width {
  width: 100%;
}

.modal-dialog {
  max-width: 50%;
}


.autocomplete li {
  padding-left: -10px;
}

</style>
