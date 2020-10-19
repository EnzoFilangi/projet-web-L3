<template>
    <div v-if="done && user.id" class="no-overflow">
        <h2>Articles les plus récents</h2>
        <hr>
        <div class="card-deck">
            <article v-for="article in articles" :key="article.id" class="card">
                <img :src="article.cover" alt="cover image" class="image" v-if=article.cover>
                <span class="card-img-top" v-else></span>
                <div class="card-body">
                    <h2 class="card-title">{{article.title}} by {{article.owner}}</h2>
                    <h4 class="text-muted">{{article.chrono}} - {{article.game}}</h4>
                    <pre class="card-text p">{{article.content}}</pre>
                </div>
            </article>
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
