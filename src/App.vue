<template>
  <div id="app" class="container">
    <router-view></router-view>
    <a href="https://nozem.space" target="_blank" class="copyright muted small">
      &copy; {{ year }} nozem
    </a>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "App",
  computed: {
    year() {
      return moment().format("Y");
    }
  }
};
</script>

<style lang="sass">
@import 'assets/app';
</style>
