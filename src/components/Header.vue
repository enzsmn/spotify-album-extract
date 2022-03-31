<template>
  <header :class="{ sticky }">
    <div class="container">
      <slot></slot>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      sticky: false,
    };
  },
  mounted() {
    window.onscroll = () => {
      this.sticky = window.scrollY > 0;
    };
  },
};
</script>
