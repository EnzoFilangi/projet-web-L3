<template>


    <div v-if="this.done">
        <h1 style="text-align: center;">
            {{ this.username }}
            <div v-if="this.user_page.admin">
                [admin]
            </div>
        </h1>

        <button v-if="this.username ==this.user.username" type="button" class="btn btn-secondary" data-toggle="modal"
                data-target="#editUser" data-whatever="@mdo">changer de mot de passe
        </button>

        iv class="modal-body">
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
                            <input v-model="Newpassword1" class="form-control" placeholder="nouveau mot de passe" required type="password">

                            <input v-model="Newpassword2" class="form-control"  placeholder="confirmez le mot de passe" required
                                   type="password">

                            <input v-model="password"  class="form-control"  placeholder="ancien mot de passe" required type="password">

                            <button class="btn btn-primary" type="submit">modifier</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <button v-if="this.username ==this.user.username" type="button" class="btn btn-danger" data-toggle="modal"
                data-target="#delUser" data-whatever="@mdo">suprimer utilisateur
        </button>
        <!-- modal pour suprimer l'utilisateur -->
        <div class="modal fade" id="delUser" tabindex="-1" role="dialog" aria-labelledby="delUserModalLabel"
             aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title" id="delModalLabel">suprimer l'utilsateur</h2>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="deleteUser">
                            <input v-model="password" class="form-control" placeholder="mot de passe" required type="password">

                            <button class="btn btn-danger" type="submit">suprimer l'utilisateur</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h1>
                voici les run de {{ this.username }}
            </h1>
            <div class="card-deck">
                <article v-for="article in articles" :key="article.id" class="card" v-bind:username="this.username"
                         v-on:click="navigateArticle(article.id)">
                    <div v-if="username==article.owner">
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
            }, async getUser() {
                const res = await axios.get('/api/me')
                this.user = res.data
            }, async getUserpage() {
                const res = await axios.get('/api/user', {
                    params: {
                        username: this.username,
                    }
                })
                return res.data
            }, editUser() {
                if (this.Newpassword2 != this.Newpassword1) {
                    alert("les deux mots de passe sont diférent")
                } else {
                    this.$emit('edit-user', this.username, this.password, this.Newpassword1)

                }


            },
            deleteUser() {
                console.log(this.password)
                var answer = window.confirm("voulez vous vraiment suprimer");
                if (answer) {
                    this.$emit('delete-user', this.username, this.password)
                }

            },
            async getArticles() {
                return result = (await axios.get('/api/articles')).data
            }, navigateArticle(id) {
                router.replace({
                    name: 'run', params: {id: id.toString()}
                })
            },
        }
    }
</script>

<style scoped>

    body {
        overflow: hidden; /* Hide scrollbars */
    }

    main {
        margin-right: 50%;

    }

    article {
        max-height: 50em;
        min-width: 30em;
        max-width: 60em;

    }

    article span {
        background: rgba(0, 0, 0, 0.125);
        height: 25em;
    }


    textarea {
        min-height: 20em;
    }


</style>
