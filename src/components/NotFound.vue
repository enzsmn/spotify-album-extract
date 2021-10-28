<template>
  <div class="page-404">
    <h1>404</h1>

    <p>Page not found.</p>

    <b-button
      type="is-primary is-rounded"
      @click="$router.push({ name: 'Home' })"
      >Back</b-button
    >
  </div>
</template>
