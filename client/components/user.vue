<template>
  <div v-if="this.done" class="no-overflow">
    <div class="centered" style="max-width: 80%">
      <h1 style="text-align: center;">
        Profil de {{ this.username }}
        <span v-if="this.user_page.admin">[admin]</span>
      </h1>

      <button v-if="this.username === this.user.username" type="button" class="btn btn-secondary" data-toggle="modal" data-target="#editUser" data-whatever="@mdo">Changer de mot de passe</button>

      <!-- modal de changement de mot de passe -->
      <div class="modal fade" id="editUser" tabindex="-1" role="dialog" aria-labelledby="editUserModalLabel"
           aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="addArticleModalLabel">Changer de mot de passe</h2>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <!-- Formulaire  corps du modal -->
              <form @submit.prevent="editUser">
                <input v-model="Newpassword1" class="form-control" placeholder="nouveau mot de passe" required
                       type="password">

                <input v-model="Newpassword2" class="form-control" placeholder="confirmez le mot de passe" required
                       type="password">

                <input v-model="password" class="form-control" placeholder="ancien mot de passe" required
                       type="password">

                <button class="btn btn-primary" type="submit">modifier</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <button v-if="this.username === this.user.username" type="button" class="btn btn-danger" data-toggle="modal" data-target="#delUser" data-whatever="@mdo">Supprimer le compte</button>
      <!-- modal pour suprimer l'utilisateur -->
      <div class="modal fade" id="delUser" tabindex="-1" role="dialog" aria-labelledby="delUserModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="delModalLabel">Suprimer l'utilisateur</h2>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="deleteUser">
                <label for="verifPassword">Veuillez retaper votre mot de passe</label>
                <input id="verifPassword" v-model="password" class="form-control" placeholder="mot de passe" required type="password">
                <button class="btn btn-danger" type="submit">Suprimer l'utilisateur</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Affichage des runs -->
      <div>
        <div class="card-deck">
          <article v-for="article in articles" :key="article.id" class="card" v-bind:username="this.username" v-on:click="navigateArticle(article.id)">
            <img :src="article.cover" alt="cover image" class="image" v-if=article.cover>
            <span class="card-img-top" v-else></span>
            <div class="card-body">
              <h2 class="card-title">{{ article.title }} </h2>
              <h4 class="text-muted">{{ article.chrono }} - {{ article.game }}</h4>
              <p class="card-text p">{{formatContentPreview(article.content)}}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {

  data() {
    return {
      username: this.$route.params.username,
      password: null,
      Newpassword2: null,
      Newpassword1: null,
      user: {
        id: null,
        email: null,
        username: null,
        admin: null,
      },
      user_page: {
        username: this.username,
        id: null,
        admin: null,
      },
      done: false,
      articles: [],

    }
  },
  async mounted() {
    try {
      await this.getUser()
    } catch (e) {
      this.login()
    }
    this.articles = await this.getArticles()
    try {
      this.user_page = await this.getUserpage()
    } catch (e) {
      window.location.hash = "#/"
    }

    this.done = true
  },
  methods: {
    login() {
      window.location.hash = "#/login"
    },
    async getUser() {
      const res = await axios.get('/api/me')
      this.user = res.data
    },
    async getUserpage() {
      const res = await axios.get('/api/user', {
        params: {
          username: this.username,
        }
      })
      return res.data
    },
    editUser() {
      if (this.Newpassword2 !== this.Newpassword1) {
        alert("les deux mots de passe sont diférent")
      } else {
        this.$emit('edit-user', this.username, this.password, this.Newpassword1)

      }
    },
    deleteUser() {
      if (window.confirm("Voulez vous vraiment suprimer ce compte ?")) {
        this.$emit('delete-user', this.username, this.password)
      }

    },
    async getArticles() {
      return (await axios.get('/api/articles/byuser', {params: {username: this.username}})).data
    },
    navigateArticle(id) {
      router.replace({
        name: 'run', params: {id: id.toString()}
      })
    },
    formatContentPreview (content) {
      content = content.split("\n")[0];
      const max_char = 150;
      if (content.length < max_char) {
        return content
      } else {
        return content.slice(0, max_char) + "...";
      }
    },
  },
  watch: {
    $route: function () {
      //Rechargement de la page lorsque le profil change
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.no-overflow {
  overflow-x: hidden
}

main {
  margin-right: 50%;

}

textarea {
  min-height: 20em;
}

.centered {
  margin: 0 auto;
  text-align: center;
}

.card {
  margin-bottom: 30px;
}

article {
  max-height: 50em;
  min-width: 30em;
  max-width: 60em;
}

.image {
  object-fit: cover;
  max-height: 25em;
}

article span {
  background: rgba(0, 0, 0, 0.125);
  height: 25em;
}


</style>
