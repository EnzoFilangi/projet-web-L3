<template>
  <div class="no-overflow centered">
    <h2>Création de compte</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <input class="take-width centered-text" type="email" v-model="email" placeholder="e-mail" required>
      </div>
      <div class="form-group">
        <input class="centered-text" type="password" v-model="password" placeholder="Mot de passe" required>
        <input class="centered-text" type="password" v-model="password_verif" placeholder="Validation du mot de passe" required v-bind:class="{different: password !== password_verif}">
      </div>
      <p v-if="password !== password_verif" class="different-text">Attention les deux mots de passe sont différents</p>
      <button class="btn take-width" type="submit" v-bind:class="[(password === password_verif && email) ? 'btn-primary' : 'btn-secondary disabled']">Ajouter</button>
    </form>
  </div>
</template>

<script>
module.exports = {
  data () {
    return {
      email: "",
      password: "",
      password_verif: ""
    }
  },
  methods: {
    register () {
      if(this.password === this.password_verif){
        this.$emit('register-user', this.email, this.password)
      }
    }
  }
}
</script>

<style scoped>
  .no-overflow {
    overflow-x: hidden
  }

  .centered {
    margin: 0px auto;
    justify-content: center;
    display: flex;
    flex-wrap: wrap;
    max-width: 500px;
  }

  .take-width {
    width: 100%;
  }

  .different {
    border: 2px red solid;
  }

  .different-text {
    color: red;
  }

  .disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  .centered-text {
    text-align: center;
  }
</style>