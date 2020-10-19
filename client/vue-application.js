const Register = window.httpVueLoader('./components/Register.vue')
const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  { path: '/', component: Login },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    user: {
      id: null,
      email: null,
      username: null,
    },
    done: false
  },
  async mounted () {
    try {
      await this.getUser()
    } catch (e) {}
    this.done = true
  },
  methods: {
    async registerUser (email, password, username) {
      try{
        const res = await axios.post('/api/register', {email: email, password: password, username: username})
        alert("Vous êtes désormais enregistré !")
        window.location.hash = "#/" //On renvoie l'utilisateur sur la page d'accueil
      } catch (e) { //Gestion des erreurs de l'API
        if (e.response.status === 400) {
          if (e.response.data.message.includes("request must include email and password")) {
            alert("Merci de compléter tous les champs.")
          } else if (e.response.data.message.includes("bad request - user already exists")) {
            alert("Cet utilisateur existe déjà.")
          } else if (e.response.data.message.includes("bad request - username must be shorter than 30 characters")) {
            alert("Veuillez utiliser un nom d'utilisateur de moins de 30 caractères.") //Ne devrait pas se déclencher car vérifié auparavant part le component
          }
        } else {
          alert("Une erreur est survenue.")
        }
      }
    },
    async logUser (email, password) {
      try {
        const res = await axios.post('/api/login', {email: email, password: password})
        await this.getUser();
        alert("Vous êtes désormais connecté !")
        window.location.hash = "#/" //On renvoie l'utilisateur sur la page d'accueil
      } catch (e) { //Gestion des erreurs de l'API
        if (e.response.status === 400) {
          if (e.response.data.message.includes("request must include email and password")) {
            alert("Merci de compléter tous les champs.")
          } else if (e.response.data.message.includes("bad request - invalid password")) {
            alert("Mot de passe incorrect.")
          } else if (e.response.data.message.includes("bad request - invalid user")) {
            alert("Aucun utilisateur trouvé.")
          }
        } else if (e.response.status === 401) {
          alert("Vous êtes déjà connecté.")
        } else {
          alert("Une erreur est survenue")
        }
      }
    },
    async getUser () {
      const res = await axios.get('/api/me')
      this.user = res.data
    }
  }
})
