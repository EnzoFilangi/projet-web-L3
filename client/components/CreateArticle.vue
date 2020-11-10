<template>
  <div class="centered" style="max-width: 80%">
    <div>
      <h2>Ajouter une nouvelle run</h2>
    </div>
    <hr style="max-width: 60%">
    <div class="body centered">
      <!-- Formulaire d'ajout -->
      <form @submit.prevent="addRun">
        <input v-model="newRun.title" placeholder="Titre" type="text" required class="h2 max_width centered_text">
        <div class="form-group">
          <!-- Autocomplétion du jeu -->
          <div style="display: inline; position: relative">
            <input type="text" v-model="newRun.game" placeholder="Jeu" required class="centered_text" @keydown.tab.prevent="autocomplete(0)" @input="autocompleteTimeOut" v-on:blur="hideAutocomplete()">
            <ul class="autocomplete left-aligned-text" v-if="autocomplete_possibilities.length > 0 && display_autocomplete">
              <li v-for="(auto, i) in autocomplete_possibilities" @click="autocomplete(i)">{{auto.display_name}}</li>
            </ul>
          </div>
          <small class="text-muted h4">-</small>
          <input v-model="newRun.time" placeholder="Temps" required type="text" class="centered_text" pattern="[0-9]+:[0-9][0-9]:[0-9][0-9]" title="La durée doit être au format hh:mm:ss" maxlength="20">
        </div>
        <div class="form-group">
          <textarea v-model="newRun.content" required placeholder="Décrivez votre run ou commentez la" class="max_width" rows="10"></textarea>
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
</template>

<script>
  module.exports = {
    data() {
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
        autocomplete_possibilities: [],
        autocomplete_timer: null,
        display_autocomplete: false
      }
    },
    async mounted() {
      try {
        await this.getUser()
      } catch (e) {
        this.login()
      }
      this.done = true
    },
    methods: {
      async getUser() {
        const res = await axios.get('/api/me')
        this.user = res.data
      },
      login() {
        window.location.hash = "#/login"
      },
      addRun() {
        this.$emit('add-run', this.newRun, this.user.id)
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
      async autocomplete (i) {
        // Remplace le champ "this.newRun.game" d'entrée utilisateur par l'élément choisi dans la liste des suggestion.
        if (this.autocomplete_timer) {
          clearTimeout(this.autocomplete_timer);
          this.autocomplete_timer = null;
        }
        await this.reloadAutocomplete();
        try{
          this.newRun.game = this.autocomplete_possibilities[i].display_name;
          // On réinitialise les critères de recherche une fois celle-ci effectuée
          this.autocomplete_possibilities = [];
        } catch (e) {}
      },
      autocompleteTimeOut() {
        // Pour éviter les appels excessifs à l'API on ne va chercher les résultats que si l'utilisateur n'a rien tapé durant les 300 dernières millisecondes
        if (this.autocomplete_timer) {
          clearTimeout(this.autocomplete_timer);
          this.autocomplete_timer = null;
        }
        this.autocomplete_timer = setTimeout(() => {
          this.reloadAutocomplete()
        }, 300);
      },
      async reloadAutocomplete () {
        // Recharge les résultats d'autocomplétion depuis le serveur
        if (this.newRun.game.length > 1){ // L'utilisateur doit avoir entré au moins 2 caractères pour que la recherche s'effectue
          this.autocomplete_possibilities = (await axios.get('/api/searchName', {
            params: {
              orderBy: "game",
              searchString: this.newRun.game,
            }
          })).data
          this.display_autocomplete = true;
        } else {
          this.autocomplete_possibilities = [];
          this.display_autocomplete = false;
        }
      },
      hideAutocomplete () {
        this.display_autocomplete = false;
      }
    }
  }
</script>

<style scoped>
  .centered {
    margin: 0 auto;
    text-align: center;
  }

  .centered_text {
    text-align: center;
  }

  .left-aligned-text {
    text-align: left;
  }

  .max_width {
    width: 100%;
  }

  .body {
    max-width: 700px;
    min-width: 300px;
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
</style>