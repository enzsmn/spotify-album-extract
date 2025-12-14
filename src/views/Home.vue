<template>
  <main>
    <img src="/logo.png" />

    <h1>Spotify album extract</h1>

    <p>Turn your playlists into collections of complete releases!</p>

    <b-button type="is-primary is-rounded" @click="auth">
      Load your playlists
    </b-button>
  </main>
</template>

<script>
export default {
  name: "Home",
  methods: {
    auth() {
      window.pa?.track({ name: "Authorize" });

      this.$spotify.authenticate();
    },
  },
};
</script>
