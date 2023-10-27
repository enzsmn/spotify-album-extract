<template>
  <div>
    <Header :class="{ search: showSearch }">
      <h1>Select a playlist</h1>

      <b-button
        v-if="!showSearch"
        icon-left="magnify"
        type="is-text"
        @click="toggleSearch(true)"
      ></b-button>

      <b-input
        v-if="showSearch"
        ref="search"
        v-model="searchQuery"
        type="text"
        placeholder="Search…"
      ></b-input>

      <b-button
        v-if="showSearch"
        icon-left="close"
        type="is-text"
        @click="toggleSearch(false)"
      ></b-button>
    </Header>

    <main class="container">
      <b-loading :active="loading"></b-loading>

      <div v-if="playlists.length > 0" class="playlists">
        <Playlist
          v-for="playlist in filteredPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          @select="selectPlaylist"
        ></Playlist>
      </div>

      <p v-if="!loading && filteredPlaylists.length === 0" class="feedback">
        No playlists found matching your search.
      </p>
    </main>
  </div>
</template>

<script>
import Bugsnag from "@bugsnag/js";
import Header from "../components/Header";
import Playlist from "../components/Playlist";

export default {
  name: "Playlists",
  components: { Header, Playlist },
  data() {
    return {
      loading: true,
      showSearch: false,
      searchQuery: null,
      playlists: [],
    };
  },
  computed: {
    filteredPlaylists() {
      if (!this.searchQuery) {
        return this.playlists;
      }

      return this.playlists.filter((p) =>
        p.name.toLowerCase().includes(this.searchQuery.trim().toLowerCase())
      );
    },
  },
  mounted() {
    if (!this.$spotify.getToken()) {
      this.$spotify.logout();
      return;
    }

    window.scrollTo(0, 0);

    this.loadPlaylists();
  },
  methods: {
    loadPlaylists() {
      this.$spotify.getPlaylists().then((items) => {
        this.playlists = items;
        this.loading = false;
      });
    },
    toggleSearch(enabled) {
      this.showSearch = enabled;
      if (!enabled) {
        this.searchQuery = null;
        return;
      }

      this.$nextTick(() => {
        this.$refs.search.focus();
      });
    },
    selectPlaylist(playlist) {
      Bugsnag?.leaveBreadcrumb("Selected playlist", {
        tracks: playlist.tracks.total,
      });

      this.$router.push({
        name: "Albums",
        params: { playlistId: playlist.id },
      });
    },
  },
};
</script>
