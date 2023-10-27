<template>
  <div></div>
</template>

<script>
import Bugsnag from "@bugsnag/js";

export default {
  name: "Callback",
  beforeCreate() {
    this.$spotify
      .requestToken(window.location.search)
      .then(() => {
        this.$router.push({ name: "Playlists" });
      })
      .catch((e) => {
        Bugsnag?.notify(e);

        this.$buefy.toast.open({
          message: "Something went wrong",
          type: "is-danger",
        });

        this.$spotify.logout();
      });
  },
};
</script>
