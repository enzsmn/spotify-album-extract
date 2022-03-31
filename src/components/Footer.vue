<template>
  <footer>
    <a href="https://nozem.space" target="_blank" class="muted small">
      &copy;
      {{ year }} Nozem
    </a>
    <a
      v-if="$route.meta.authenticated"
      class="logout muted small"
      @click="logout"
    >
      Logout
    </a>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      year: new Date().getFullYear(),
    };
  },
  methods: {
    logout() {
      window.pa.track({ name: "Logout" });

      this.$spotify.logout();
    },
  },
};
</script>
