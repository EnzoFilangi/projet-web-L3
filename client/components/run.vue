<template>
  <div v-if="articles !== []" id="main">

    <div v-for="i in [articles.find(a => a.id === parseInt(this.id))]" v-if="i !== undefined" id="article" class="card  " style="width: 75%; margin-left: 12.5%; min-height: 75%">

        <h3 class="card-header text-center" v-if="!editingArticle.ver">{{ i.title }}</h3>
        <h3 class="card-header text-center" v-if="editingArticle.ver">Modification</h3>


      <div class="card-body">

        <div class="text-center">
          <input class="card-title " v-if="editingArticle.ver" v-model="editingArticle.title">
          <br v-if="editingArticle.ver">

        <h4 class="card-subtitle mb-2 text-muted" v-if="!editingArticle.ver">{{i.chrono}} - {{i.game}}</h4>
          <input v-else class="card-subtitle mb-2 text-muted" v-model="editingArticle.chrono">
          -
          <input v-if="editingArticle.ver" class="card-subtitle mb-2 text-muted" v-model="editingArticle.game">

          <br v-if="editingArticle.ver">

        <h5  v-if="!editingArticle.ver" class="card-text"> {{i.content}}</h5>
          <div v-else class="form-group">
          <textarea  class="card-text form-control" v-model="editingArticle.content" rows="10"></textarea>


</div>   <input v-if="editingArticle.ver"   style="width: 20% "v-model="editingArticle.run_link">
        </div>

        </div>

      <div class="card" style="width: 40%; margin-left: 30%; ">
        <div class="embed-responsive embed-responsive-16by9" >
          <iframe  width="200" height="200"  class="embed-responsive-item"  v-bind:src=i.run_link allowfullscreen></iframe>

        </div>

      </div>


      <button v-if="!editingArticle.ver && (user.admin || user.id == i.owner)" type="button" @click="editArticle(i)" class="btn btn-secondary">Editer</button>
      <div class="buttonlist text-center card-footer" v-if="editingArticle.ver">
        <button type="button" v-on:click="sendEditArticle"  style="width: 20%;" class="btn btn-success">Valider</button>
        <button type="button" v-on:click="abortEditArticle" style="width: 20%;"  class="btn btn-danger">Annuler</button>

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
      articles: [],
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
    this.articles = await this.getArticles()

    this.done = true
  },
  methods: {
    login() {
      window.location.hash = "#/login"
    },async getUser () {
        const res = await axios.get('/api/me')
        this.user = res.data
    },async getArticles () {
        return result = (await axios.get('/api/articles')).data
      console.log(result)
    },editArticle(article) {
      this.editingArticle.ver= true;
      this.editingArticle.run_link = article.run_link
      console.log(article)
      console.log(article.run_link)
      this.editingArticle.cover = article.cover
      this.editingArticle.title = article.title
      this.editingArticle.game = article.game
      this.editingArticle.chrono = article.chrono
      this.editingArticle.content = article.content
    },sendEditArticle() {
      this.$emit('update-run', this.editingArticle,this.user.id, this.id)
      window.location.reload()

    },
    abortEditArticle() {
      this.editingArticle = {
        ver: false,
        run_link: '',
        cover: '',
        title: '',
        game: '',
        chrono: '',
        content: '',
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

</style>
