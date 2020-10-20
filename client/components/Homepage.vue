<template>
    <div v-if="done && user.id" class="no-overflow">
        <h2>Articles les plus récents </h2>
        <hr>
        <!-- Propositions de tri -->
        <div>
            <p style="display: inline">Trier par :</p>
            <select v-model="order_by" >
                <option value="date" selected>Date</option>
                <option value="game">Jeu</option>
                <option value="user">Utilisateur</option>
            </select>
            <div v-if="order_by === 'game' || order_by === 'user'" style="display: inline; position: relative">
                <input type="text" v-model="selection_criteria" @keydown.tab.prevent="autocomplete(0)" @input="autocompleteTimeOut">
                <table class="autocomplete">
                    <tbody>
                    <tr v-for="(auto, i) in autocomplete_possibilities" @click="autocomplete(i)">
                        <td v-if="order_by === 'game'">{{auto.display_name}}</td>
                        <td v-else-if="order_by === 'user'">{{auto.username}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <button @click="refreshArticles()" class="btn btn-secondary btn-sm">Rechercher</button>
        </div>
        <hr>
        <!-- Affichage des articles -->
        <div class="card-deck">
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
        <h4 v-if="articles.length === 0"> Pas d'article trouvé !</h4>

        <!-- Modal d'ajout d'article -->
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addArticleModal" data-whatever="@mdo">Ajouter une nouvelle run</button>

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
                autocomplete_possibilities: [],
                autocomplete_timer: null,
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
                if(this.order_by === 'game') {
                    this.selection_criteria = this.autocomplete_possibilities[i].name;
                } else if (this.order_by === 'user') {
                    this.selection_criteria = this.autocomplete_possibilities[i].username;
                }
                await this.refreshArticles();
                this.selection_criteria = '';
                this.autocomplete_possibilities = [];
            },
            autocompleteTimeOut() {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                this.timer = setTimeout(() => {
                    this.reloadAutocomplete()
                }, 300);
            },
            async reloadAutocomplete () {
                if (this.selection_criteria.length > 1){
                    this.autocomplete_possibilities = (await axios.get('/api/game', {
                        params: {
                            gameString: this.selection_criteria
                        }
                    })).data
                } else {
                    this.autocomplete_possibilities = [];
                }
            },
        },
        computed: {
            search_placeholder () {
                return 'Chercher un ' + (this.order_by === 'game' ? 'jeu' : 'utilisateur');
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

    textarea {
        min-height: 20em;
    }

    .max_width {
        width: 100%;
    }

    .modal-dialog {
        max-width: 50%;
    }

    .autocomplete {
        position: absolute;
        top: 2em;
        left: 0;
        z-index: 999999;
        background: gray;
        border: 1px solid black;
    }
</style>
