<template>
  <article class="album" :class="{ selected }">
    <a @click="$emit('clicked', album)">
      <img :src="image" :alt="album.name" />
      <div>
        <strong>{{ album.name }}</strong>
        <span>{{ album.artists.map((a) => a.name).join(", ") }}</span>
        <span class="small muted">
          {{ album.total_tracks }}
          {{ album.total_tracks === 1 ? "track" : "tracks" }}
        </span>
      </div>
      <div>
        <b-icon icon="check" size="is-small" />
      </div>
    </a>
  </article>
</template>

<script>
export default {
  props: {
    album: {
      type: Object,
      required: true,
    },
    selectedAlbumIds: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      image: null,
    };
  },
  computed: {
    selected() {
      return this.selectedAlbumIds.includes(this.album.id);
    },
  },
  mounted() {
    if (this.album.images.length > 0) {
      this.image = this.album.images[0].url;
    } else {
      this.image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAABCAQAAACC0sM2AAAADElEQVR42mNkGCYAAAGSAAIVQ4IOAAAAAElFTkSuQmCC";
    }
  },
};
</script>
