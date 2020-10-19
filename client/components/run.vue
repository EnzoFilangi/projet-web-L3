<template>
  <div v-if="articles !== []" id="main">

    <div v-for="i in [articles.find(a => a.id === parseInt(this.id))]" v-if="i !== undefined" id="article">
      <h2 >{{i.title}} </h2>
      <h4 >{{i.chrono}} - {{i.game}}</h4>
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
      },
      done: false,
      offset: 0,
      order_by: null,
      selection_criteria: null,
      articles: [],
      article: [],


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

      const result = await axios.get('/api/articles', {offset: this.offset})
      return result.data

    },

  }
}
</script>

<style scoped>

</style>
