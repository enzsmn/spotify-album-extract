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

      <b-dropdown aria-role="list">
        <template #trigger>
          <b-button icon-right="dots-horizontal" type="is-text" />
        </template>
        <b-dropdown-item aria-role="listitem" @click="selectAll">
          Select all
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="deselectAll">
          Deselect all
        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown aria-role="list" class="is-hidden-tablet">
        <template #trigger>
          <b-button icon-left="content-save" type="is-primary">Save</b-button>
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
        :disabled="selectedAlbumIds.length === 0"
        class="is-hidden-mobile"
        @click="createPlaylist"
      >
        Create playlist
      </b-button>

      <b-button
        icon-left="playlist-plus"
        type="is-primary"
        :disabled="selectedAlbumIds.length === 0"
        class="is-hidden-mobile"
        @click="showSystemOwnerModal = true"
      >
        Add to playlist
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
    async createPlaylist() {
      this.loading = true;

      Bugsnag.leaveBreadcrumb("Save", {
        tracks: this.selectedAlbumIds.length,
      });

      window.pa.track({ name: "Save" });

      await this.$spotify.createPlaylistWithAlbums(
        this.playlist.name,
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
