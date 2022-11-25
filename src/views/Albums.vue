<template>
  <div>
    <Header v-if="playlist">
      <b-button
        icon-left="angle-left"
        tag="router-link"
        :to="{ name: 'Playlists' }"
        type="is-text"
      ></b-button>

      <h1>{{ playlist.name }}</h1>

      <b-dropdown aria-role="list">
        <template #trigger>
          <b-button icon-right="ellipsis-h" type="is-text" />
        </template>
        <b-dropdown-item aria-role="listitem" @click="selectAll">
          Select all
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="deselectAll">
          Deselect all
        </b-dropdown-item>
      </b-dropdown>

      <b-button
        icon-left="plus"
        type="is-primary"
        class="create-playlist"
        :disabled="selectedAlbumIds.length === 0"
        @click="save"
      >
        Create playlist
      </b-button>
    </Header>

    <main class="container">
      <b-loading :active="loading"></b-loading>

      <p v-if="albums.length > 0" class="muted small">
        Selected {{ selectedAlbumsTracksCount }} tracks
        <span v-if="selectedAlbumIds.length > 0">
          in {{ selectedAlbumIds.length }}
          {{ selectedAlbumIds.length === 1 ? "album" : "albums" }}
        </span>
      </p>

      <div v-if="albums.length > 0" class="albums">
        <Album
          v-for="album in albums"
          :key="album.id"
          :album="album"
          :selected-albums-ids="selectedAlbumIds"
          @clicked="selectOrDeselectAlbum"
        ></Album>
      </div>

      <p v-if="!loading && albums.length === 0" class="feedback">
        Empty playlist.
      </p>
    </main>
  </div>
</template>

<script>
import Bugsnag from "@bugsnag/js";
import Album from "../components/Album";
import Header from "../components/Header";

export default {
  name: "Albums",
  components: { Header, Album },
  props: {
    playlistId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      playlist: null,
      albums: [],
      selectedAlbumIds: [],
    };
  },
  computed: {
    selectedAlbumsTracksCount() {
      let count = 0;
      this.albums
        .filter((a) => this.selectedAlbumIds.includes(a.id))
        .forEach((a) => {
          count += a.total_tracks;
        });
      return count;
    },
  },
  watch: {
    selectedAlbumsTracksCount(val) {
      if (val >= 10000) {
        this.$buefy.toast.open({
          message:
            "Spotify playlists have a 10000 tracks limit, some tracks might not be added",
          type: "is-warning",
        });
      }
    },
  },
  mounted() {
    if (!this.$spotify.getToken()) {
      this.$spotify.logout();
      return;
    }

    window.scrollTo(0, 0);

    this.$spotify.getPlaylist(this.playlistId).then((playlist) => {
      this.playlist = playlist;
      this.$spotify.getPlaylistTracks(this.playlistId).then((items) => {
        items.forEach((item) => {
          // Don't add albums twice (can happen if a playlists contains multiple track from the same album)
          if (this.albums.find((a) => a.id === item.track.album.id)) {
            return;
          }
          this.albums.push(item.track.album);
          this.selectedAlbumIds.push(item.track.album.id);
        });

        this.loading = false;
      });
    });
  },
  methods: {
    selectOrDeselectAlbum(album) {
      const index = this.selectedAlbumIds.indexOf(album.id);
      if (index > -1) {
        this.selectedAlbumIds.splice(index, 1);
        return;
      }
      this.selectedAlbumIds.push(album.id);
    },
    selectAll() {
      this.selectedAlbumIds = this.albums.map((a) => a.id);
    },
    deselectAll() {
      this.selectedAlbumIds = [];
    },
    async save() {
      this.loading = true;

      Bugsnag.leaveBreadcrumb("Save", {
        tracks: this.selectedAlbumIds.length,
      });

      window.pa.track({ name: "Save" });

      await this.$spotify.createPlaylistWithAlbums(
        this.playlist,
        this.selectedAlbumIds
      );

      this.loading = false;

      this.$buefy.toast.open({
        message: "Playlist created",
        type: "is-primary",
      });
    },
  },
};
</script>
