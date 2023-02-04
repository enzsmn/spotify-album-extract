<template>
  <main>
    <img src="/logo.png" />

    <h1>Spotify album extract</h1>

    <p>Select a playlist and get the full album from each track.</p>

    <b-button type="is-primary is-rounded" @click="auth">
      Authorize and load playlists
    </b-button>
  </main>
</template>

<script>
export default {
  name: "Home",
  methods: {
    auth() {
      window.pa.track({ name: "Authorize" });

      this.$spotify.authenticate();
    },
  },
};
</script>
