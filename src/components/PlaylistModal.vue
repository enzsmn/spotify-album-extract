<template>
  <div class="card">
    <div class="card-content">
      <b-loading :active="loading" :is-full-page="false"></b-loading>

      <b-select
        v-model="selectedPlaylistId"
        placeholder="Select a playlist"
        expanded
      >
        <option
          v-for="playlist in playlists"
          :key="playlist.id"
          :value="playlist.id"
        >
          {{ playlist.name }}
        </option>
      </b-select>
      <b-button
        type="is-primary"
        :disabled="!selectedPlaylistId"
        :loading="submitting"
        @click="addToPlaylist"
      >
        Add to playlist
      </b-button>
    </div>
  </div>
</template>

<script>
import Bugsnag from "@bugsnag/js";

export default {
  name: "PlaylistModal",
  props: {
    selectedAlbumIds: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      submitting: false,
      playlists: [],
      selectedPlaylistId: null,
    };
  },
  mounted() {
    this.loadPlaylists();
  },
  methods: {
    loadPlaylists() {
      this.$spotify.getPlaylists().then((items) => {
        this.playlists = items.filter(
          (item) => item.owner.id === this.$spotify.userId
        );

        this.loading = false;
      });
    },
    async addToPlaylist() {
      Bugsnag.leaveBreadcrumb("Add to playlist", {
        tracks: this.selectedAlbumIds.length,
      });

      window.pa?.track({ name: "Add to playlist" });

      this.submitting = true;

      this.$spotify
        .addAlbumsToPlaylist(this.selectedPlaylistId, this.selectedAlbumIds)
        .then(() => {
          this.$buefy.toast.open({
            message: "Added to playlist",
            type: "is-primary",
          });

          this.$parent.close();
        })
        .finally(() => {
          this.submitting = false;
        });
    },
  },
};
</script>
