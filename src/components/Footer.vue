<template>
  <footer>
    <a v-if="$route.meta.authenticated" class="small" @click="logout">
      Logout
    </a>
    <a href="https://nozem.space" target="_blank" class="muted small">
      Made by <strong>Nozem</strong>
    </a>
  </footer>
</template>

<script>
export default {
  methods: {
    logout() {
      window.pa?.track({ name: "Logout" });

      this.$spotify.logout();
    },
  },
};
</script>
