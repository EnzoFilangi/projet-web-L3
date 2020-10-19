<template>
    <div v-if="done && user.id" class="no-overflow">
        <h2>Articles les plus récents </h2>
        <hr>
        <div class="card-deck " >
            <article v-for="article in articles" :key="article.id" class="card" v-on:click="navigateArticle(article.id)">

                <img :src="article.cover" alt="cover image" class="image" v-if=article.cover>
                <span class="card-img-top" v-else></span>
                <div class="card-body">
                    <h2 class="card-title">{{article.title}} by {{article.owner}}</h2>
                    <h4 class="text-muted">{{article.chrono}} - {{article.game}}</h4>
                    <pre class="card-text p">{{article.content}}</pre>
                </div>

            </article>
        </div>


      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-whatever="@mdo">Ajouter une nouvelle run</button>


      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">



        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">New message</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addRun">
                <h2>Nouveau produit à ajouter</h2>
                <div class="form-group">
                  <input  v-model="newRun.title" placeholder="titre" required type="text">
                  <input  v-model="newRun.game" placeholder="jeux" required type="text">
                  <input  v-model="newRun.time" placeholder="time" required type="text">

                </div>
                <div class="form-group">
                  <textarea  v-model="newRun.content" required type="text"></textarea>
                </div>
                <div class="form-group">
                  <input v-model="newRun.cover" placeholder="Lien vers l'image de cover" type="text">
                  <input v-model="newRun.video_link" placeholder="Lien vers l'image la video de la run (twitch ou youtube)" type="text">
                </div>
                <button class="btn btn-primary"  type="submit">Ajouter</button>
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
                done: false,
                offset: 0,
                order_by: null,
                selection_criteria: null,
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
            this.done = true
        },
        methods: {
          addRun() {
            this.$emit('add-run', this.newRun, this.user.id)
          },
            async getUser () {
                const res = await axios.get('/api/me')
                this.user = res.data
            },
            login() {
                window.location.hash = "#/login"
            },
            async getArticles () {
                switch (this.order_by) {
                    case 'game':
                        return (await axios.get('/api/articles', {offset: this.offset, order_by: "game", game: this.selection_criteria})).data
                    case 'user':
                        return (await axios.get('/api/articles', {offset: this.offset, order_by: "user", user: this.selection_criteria})).data
                    default:
                        const result = await axios.get('/api/articles', {offset: this.offset})
                        return result.data
                }
            },
      navigateArticle(id) {
        router.replace({
          name: 'run', params: {id: id.toString()}
        })
        console.log("aaaaaaaaaa")
      }
        }
    }
</script>

<style scoped>
    .no-overflow {
        overflow-x: hidden
    }

    article {
        max-height: 50em;
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
