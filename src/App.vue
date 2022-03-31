<template>
  <div id="app" :class="pageClass">
    <router-view />
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from "vue";
import Footer from "./components/Footer";
import SpotifyService from "./services/SpotifyService";

export default {
  name: "App",
  components: { Footer },
  computed: {
    pageClass() {
      return `page-${this.$route.name?.toLowerCase()}`;
    },
  },
  created() {
    Vue.prototype.$spotify = new SpotifyService();
  },
};
</script>
