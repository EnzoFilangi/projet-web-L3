<template>
    <div v-if="done && user.id" class="no-overflow">
        <div class="centered" style="max-width: 80%">
            <h2>{{this.title}}</h2>
            <hr>
            <!-- Propositions de tri -->
            <div>
                <p style="display: inline">Trier par :</p>
                <select v-model="order_by" >
                    <option value="date" selected>Date</option>
                    <option value="game">Jeu</option>
                    <option value="user">Utilisateur</option>
                </select>
                <!-- Autocomplétion -->
                <div v-if="order_by === 'game' || order_by === 'user'" style="display: inline; position: relative">
                    <input type="text" v-model="selection_criteria" @keydown.tab.prevent="autocomplete(0)" @input="autocompleteTimeOut">
                    <ul class="autocomplete not-centered" v-if="autocomplete_possibilities.length > 0">
                        <li v-for="(auto, i) in autocomplete_possibilities" @click="autocomplete(i)">
                            <td v-if="order_by === 'game'">{{auto.display_name}}</td>
                            <td v-else-if="order_by === 'user'">{{auto.username}}</td>
                        </li>
                    </ul>
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
                        <p class="card-text p">{{formatContentPreview(article.content)}}</p>
                    </div>
                </article>
            </div>
            <hr>

            <!-- Page suivante / précédente -->
            <div class="btn-group" role="group" aria-label="Boutons de navigation d'articles">
                <button class="btn btn-secondary" :disabled="isOffsetZero" @click="changePage(-20)">Page précédente</button>
                <button class="btn btn-secondary" @click="changePage(20)">Page suivante</button>
            </div>
            <p>Page {{this.offset/20 + 1}}</p>
            <hr>

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
                                    <input v-model="newRun.video_link" type="url" required placeholder="Lien vers la preuve vidéo"  pattern=".*\.(youtube)\..*" title="L'URL doit être un lien youtube." class="max_width">
                                </div>
                                <button class="btn btn-primary" type="submit">Ajouter</button>
                                <button class="btn btn-danger" type="button" @click="reset()">Tout supprimer</button>
                            </form>
                        </div>
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
                done: false, // Permet au site de savoir quand les données ont fini d'être récupérées au chargement de la page
                offset: 0, // Permet de savoir le nombre d'articles déjà lus
                order_by: null, // Sélection du type de recherche
                selection_criteria: null, // Critère de recherche
                autocomplete_possibilities: [],
                autocomplete_timer: null,
                articles: [], // Articles à afficher
                title: "", // Titre de la page, mis à jours lors de la récupération des articles
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
                        try {
                            const game = (await axios.get('/api/search', {params: {orderBy: 'game', searchString: this.selection_criteria}})).data[0].display_name;
                            this.title = "Articles sur le jeu " + game;
                        } catch (e) {}
                        return (await axios.get('/api/articles', {
                            params: {
                                offset: this.offset,
                                order_by: "game",
                                game: this.selection_criteria
                            }
                        })).data
                    case 'user':
                        this.title = "Articles par " + this.selection_criteria;
                        return (await axios.get('/api/articles', {
                            params: {
                                offset: this.offset,
                                order_by: "user",
                                user: this.selection_criteria
                            }
                        })).data
                    default:
                        this.title = "Articles les plus récents";
                        return (await axios.get('/api/articles', {params: {offset: this.offset}})).data
                }
            },
            async refreshArticles () {
                this.articles = await this.getArticles()
                if (this.articles.length === 0) {
                    this.title = "Pas d'article trouvé !";
                }
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
                window.location.hash = "#/run/"+id.toString()
            },
            async autocomplete (i) {
                // Remplace le champ "selection_criteria" d'entrée utilisateur par l'élément choisi dans la liste des suggestion.
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                await this.reloadAutocomplete();

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
            autocompleteTimeOut() {
                // Pour éviter les appels excessifs à l'API on ne va chercher les résultats que si l'utilisateur n'a rien tapé durant les 300 dernières millisecondes
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                this.timer = setTimeout(() => {
                    this.reloadAutocomplete()
                }, 300);
            },
            async reloadAutocomplete () {
                // Recharge les résultats d'autocomplétion depuis le serveur
                if (this.selection_criteria.length > 1){ // L'utilisateur doit avoir entré au moins 2 caractères pour que la recherche s'effectue
                    this.autocomplete_possibilities = (await axios.get('/api/search', {
                        params: {
                            orderBy: this.order_by,
                            searchString: this.selection_criteria
                        }
                    })).data
                } else {
                    this.autocomplete_possibilities = [];
                }
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
            async changePage (offset_delta) {
                this.offset += offset_delta;
                const max = parseInt((await axios.get('/api/articleQuantity')).data.count)
                if (this.offset < 0) this.offset = 0;
                else if (this.offset > max) this.offset = Math.floor(max/20)*20; // On ramène au multiple de 20 le plus proche en dessous de la valeur maximale
                await this.refreshArticles();
            }
        },
        computed: {
            search_placeholder () {
                return 'Chercher un ' + (this.order_by === 'game' ? 'jeu' : 'utilisateur');
            },
            isOffsetZero () {
                return this.offset === 0;
            }
        }
    }
</script>

<style scoped>
    .no-overflow {
        overflow-x: hidden
    }

    .centered {
        margin: 0 auto;
        text-align: center;
    }

    .not-centered {
        text-align: left;
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
        background: lightskyblue;
        border: 1px solid black;
        max-height: 10em;
        overflow: auto;
        padding-left: 20px;
    }

    .autocomplete li {
        padding-left: -10px;
    }

    .btn-group .btn {
        width: 10em;
    }
</style>
