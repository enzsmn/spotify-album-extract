<template>
  <article class="playlist">
    <a @click="$emit('select', playlist)">
      <img :src="image" :alt="playlist.name" />
      <div>
        <strong>{{ playlist.name }}</strong>
        <span v-if="userId && userId !== playlist.owner.id">
          {{ playlist.owner.display_name }}
        </span>
        <span class="small muted">
          {{ playlist.tracks.total }}
          {{ playlist.tracks.total === 1 ? "track" : "tracks" }}
        </span>
      </div>
    </a>
  </article>
</template>

<script>
export default {
  props: {
    playlist: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      image: null,
    };
  },
  computed: {
    userId() {
      return this.$spotify.userId;
    },
  },
  mounted() {
    if (this.playlist.images.length > 0) {
      this.image = this.playlist.images[0].url;
    } else {
      this.image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAABCAQAAACC0sM2AAAADElEQVR42mNkGCYAAAGSAAIVQ4IOAAAAAElFTkSuQmCC";
    }
  },
};
</script>
