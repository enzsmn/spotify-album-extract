<template>
  <div></div>
</template>

<script>
import lscache from "lscache";

export default {
  mounted() {
    const parsedHash = new URLSearchParams(window.location.hash.substr(1));

    if (!parsedHash.get("access_token") || !parsedHash.get("expires_in")) {
      alert("Something went wrong");
      this.$router.push({ name: "Home" });
      return;
    }

    const validity = parseInt(parsedHash.get("expires_in")) / 60;
    lscache.set("spotify_auth_code", parsedHash.get("access_token"), validity);

    this.$router.push({ name: "Playlists" });
  }
};
</script>
