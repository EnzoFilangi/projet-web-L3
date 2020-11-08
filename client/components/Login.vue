<template>
  <div class="no-overflow centered">
    <h2>Connexion</h2>
    <form @submit.prevent="login">
      <div class="form-row">
        <input class="centered-text form-control col" type="email" v-model="email" placeholder="Email" required>
        <input class="centered-text form-control col" type="password" v-model="password" placeholder="Mot de passe" required>
      </div>
      <button class="btn btn-primary take-width" type="submit">Se connecter</button>
      <button type="button" @click="register" class="btn btn-secondary take-width" style="margin-top: 1%">Pas de compte ? S'inscrire</button>
    </form>
  </div>
</template>

<script>
module.exports = {
  data () {
    return {
      email: "",
      password: "",
    }
  },
  methods: {
    login () {
      this.$emit('log-user', this.email, this.password)
    },
    register() {
      window.location.hash = "#/register"
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
    max-width: 500px;
    text-align: center;
  }

  .centered-text {
    text-align: center;
  }

  .take-width {
    width: 100%;
  }

  .form-row {
    padding: 5px;
  }

</style>
