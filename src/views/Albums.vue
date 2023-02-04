<template>
  <div>
    <Header v-if="playlist">
      <b-button
        icon-left="arrow-left"
        tag="router-link"
        :to="{ name: 'Playlists' }"
        type="is-text"
      ></b-button>

      <h1>{{ playlist.name }}</h1>

      <p v-if="albums.length > 0" class="muted small is-hidden-touch">
        Selected {{ selectedAlbumsTracksCount }} tracks
        <span v-if="selectedAlbumIds.length > 0">
          in {{ selectedAlbumIds.length }}
          {{ selectedAlbumIds.length === 1 ? "album" : "albums" }}
        </span>
      </p>

      <b-button
        v-if="!loading && selectedAlbumIds.length === albums.length"
        icon-left="checkbox-marked-outline"
        type="is-text"
        @click="deselectAll"
      ></b-button>
      <b-button
        v-else-if="!loading && selectedAlbumIds.length !== 0"
        icon-left="minus-box-outline"
        type="is-text"
        @click="deselectAll"
      ></b-button>
      <b-button
        v-else-if="!loading && selectedAlbumIds.length === 0"
        icon-left="checkbox-blank-outline"
        type="is-text"
        @click="selectAll"
      ></b-button>

      <b-dropdown aria-role="list" class="is-hidden-tablet">
        <template #trigger>
          <b-button
            icon-left="content-save"
            type="is-primary"
            :loading="submitting"
          >
            Save
          </b-button>
        </template>
        <b-dropdown-item
          aria-role="listitem"
          :disabled="selectedAlbumIds.length === 0"
          @click="createPlaylist"
        >
          Create playlist
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          :disabled="selectedAlbumIds.length === 0"
          @click="showSystemOwnerModal = true"
        >
          Add to playlist
        </b-dropdown-item>
      </b-dropdown>

      <b-button
        icon-left="pencil-plus"
        type="is-primary"
        class="is-hidden-mobile"
        :disabled="submitting || selectedAlbumIds.length === 0"
        :loading="submitting"
        @click="createPlaylist"
      >
        Create playlist
      </b-button>

      <b-button
        icon-left="playlist-plus"
        type="is-primary"
        class="is-hidden-mobile"
        :disabled="selectedAlbumIds.length === 0"
        @click="showSystemOwnerModal = true"
      >
        Add to playlist
      </b-button>
    </Header>

    <main class="container">
      <b-loading :active="loading"></b-loading>

      <div v-if="albums.length > 0" class="albums">
        <Album
          v-for="album in albums"
          :key="album.id"
          :album="album"
          :selected-album-ids="selectedAlbumIds"
          @clicked="selectOrDeselectAlbum"
        ></Album>
      </div>

      <p v-if="!loading && albums.length === 0" class="feedback">
        Empty playlist.
      </p>
    </main>

    <b-modal v-model="showSystemOwnerModal" :width="320" scroll="keep">
      <PlaylistModal :selected-album-ids="selectedAlbumIds"></PlaylistModal>
    </b-modal>
  </div>
</template>

<script>
import Bugsnag from "@bugsnag/js";
import Album from "../components/Album";
import Header from "../components/Header";
import PlaylistModal from "../components/PlaylistModal";

export default {
  name: "Albums",
  components: { Album, Header, PlaylistModal },
  props: {
    playlistId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      submitting: false,
      showSystemOwnerModal: false,
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
    selectedAlbumsTracksCount(value) {
      if (value >= 10000) {
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

      this.$spotify.getPlaylistAlbums(this.playlistId).then((albums) => {
        this.albums = albums;
        this.selectedAlbumIds = albums.map((album) => album.id);

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
    async createPlaylist() {
      this.submitting = true;

      Bugsnag.leaveBreadcrumb("Save", {
        tracks: this.selectedAlbumIds.length,
      });

      window.pa.track({ name: "Save" });

      await this.$spotify.createPlaylistWithAlbums(
        this.playlist.name,
        this.selectedAlbumIds
      );

      this.submitting = false;

      this.$buefy.toast.open({
        message: "Playlist created",
        type: "is-primary",
      });
    },
  },
};
</script>
