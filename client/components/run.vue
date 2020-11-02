<template>

  <div v-if="done" id="main">

    <!-- on change l'affichage si on est en mode edition-->

    <div v-if="editingArticle.ver">
      <div class="card card-style">
        <form @submit.prevent="sendEditArticle">
          <h3 class="card-header text-center">Modification</h3>
          <div class="card-body">
            <div class="text-center">
                <div class="form-group">
                  <input class="card-title h2" v-model="editingArticle.title" placeholder="Titre" required>
                </div>
                <div class="form-group">
                  <input class="card-subtitle mb-2" v-model="editingArticle.chrono" placeholder="Temps" pattern="[0-9]+:[0-9][0-9]:[0-9][0-9]" title="La durée doit être au format hh:mm:ss" maxlength="20" required>
                  <span>- {{editingArticle.game}}</span>
                </div>
                <div class="form-group">
                  <textarea  class="card-text form-control" v-model="editingArticle.content" rows="10" required></textarea>
                </div>
                <div class="form-group">
                  <input class="width-20" v-model="editingArticle.run_link" required>
                </div>
            </div>
          </div>
          <div class="buttonlist text-center card-footer">
            <button type="submit" class="btn btn-success width-20">Valider</button>
            <button type="button" v-on:click="abortEditArticle" class="btn btn-danger width-20">Annuler</button>
          </div>
        </form>
      </div>
    </div>
    <div v-else>
      <div class="card card-style">
        <h3 class="card-header text-center">{{ article.title }}</h3>
        <div class="card-body">
          <div class="text-center">
            <h4 class="card-subtitle mb-2 text-muted">{{article.chrono}} - {{article.game}}</h4>
            <button type="button" v-on:click="navigateuser(article.owner)" class="btn btn-link"> par {{ article.owner }}</button>
            <h5 class="card-text"> {{article.content}} </h5>
          </div>
        </div>
        <div class="card" style="width: 40%; margin-left: 30%; ">
          <div class="embed-responsive embed-responsive-16by9" >
            <iframe width="200" height="200" class="embed-responsive-item" v-bind:src="article.run_link" allowfullscreen></iframe>
          </div>
        </div>
        <!-- le bouton n'est accessible que si l'utilisateur est un admin ou le createur de la page-->
        <button v-if="!editingArticle.ver && (user.admin || user.id === article.owner)" type="button" @click="editArticle()" class="btn btn-secondary">Editer</button>
        <button v-if="!editingArticle.ver && (user.admin || user.id === article.owner)" type="button" @click="deleteArt()" class="btn btn-danger">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {

  data() {
    return {
      id: this.$route.params.id,
      user: {
        id: null,
        email: null,
        username: null,
        admin: null,
      },

      done: false,
      article: null,
      editingArticle: {
        ver: false,
        run_link: '',
        cover: '',
        title: '',
        game: '',
        chrono: '',
        content: '',
        owner: '',
      }
    }
  },
  async mounted() {
    try {
      await this.getUser()
    } catch (e) {
      this.login()
    }
    this.article = await this.getArticle()

    this.done = true
  },
  methods: {
    login() {
      window.location.hash = "#/login"
    },
    async getUser () {
        const res = await axios.get('/api/me')
        this.user = res.data
    },
    async getArticle () {
        return (await axios.get('/api/articles/byid', {params: {id: this.id}})).data[0]
    },
    deleteArt() {
      var answer = window.confirm("Voulez vous vraiment supprimer l'article");
      if (answer) {
        this.$emit('delete-article', this.id)
      }

    },
    editArticle () {
      this.editingArticle.ver= true;
      for (let key of Object.keys(this.article)) {
        if(this.editingArticle.hasOwnProperty(key)) {
          this.editingArticle[key] = this.article[key]
        }
      }
    },
    sendEditArticle () {
      this.$emit('update-run', this.editingArticle, this.user.id, this.id)
    },
    navigateuser (id) {
        window.location.hash = "#/user/"+id
        window.location.reload()
    },
    abortEditArticle() {
      if(confirm("Voulez-vous vraiment annuler vos modifications ?")) {
        this.editingArticle = {
          ver: false,
          run_link: '',
          cover: '',
          title: '',
          game: '',
          chrono: '',
          content: '',
        }
      }
    },
  }
}
</script>

<style scoped>

  body {
    overflow: hidden; /* Hide scrollbars */
  }

  main{
    margin-right: 50%;
  }

  textarea {
    min-height: 5em;
  }

  .card-style {
    width: 75%; margin-left: 12.5%; min-height: 75%
  }

  .width-20 {
    width: 20%;
  }

</style>
