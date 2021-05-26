<template>
    <div class="page-playlists">

        <div class="buttons">
            <h1><a href="/">Spotify <span>album extract</span></a></h1>
            <b-button
                v-if="selectedPlaylist"
                type="is-primary is-rounded"
                class="is-pulled-right button-save-playlist"
                @click="save"
                :disabled="!selectedAlbums.length"
            >
                Save to new playlist
            </b-button>
        </div>

        <a class="logout muted small" @click="logout">Logout</a>

        <div class="panels">

            <div v-if="playlists.length > 0" class="panel playlists" :class="{ 'playlist-selected': selectedPlaylist }">
                <div class="panel-title">
                    <h2 class="muted">Select playlist</h2>
                    <p class="muted small">Found {{ playlists.length }} playlists</p>
                </div>
                <b-field v-if="!selectedPlaylist">
                    <b-input
                        v-model="filter"
                        type="search"
                        placeholder="Search..."
                    >
                    </b-input>
                </b-field>
                <a
                    v-for="playlist in filteredPlaylists"
                    :key="playlist.id"
                    class="item"
                    :class="{ 'selected': playlist === selectedPlaylist }"
                    @click="selectPlaylist(playlist)"
                >
                    <img :src="playlist.images.length ? playlist.images[0].url : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAABCAQAAACC0sM2AAAADElEQVR42mNkGCYAAAGSAAIVQ4IOAAAAAElFTkSuQmCC'">
                    <h3 class="item-title">
                        <span>{{ playlist.name }}</span><br/>
                        <span v-if="playlist.owner.id !== authorization.user_id" class="muted">
                          {{ playlist.owner.display_name }}
                        </span>
                        <span class="small muted">
                          {{ playlist.tracks.total }} {{ playlist.tracks.total > 1 ? 'tracks' : 'track' }}
                        </span>
                    </h3>
                    <b-button type="is-primary is-rounded is-outlined" class="button-clear" @click.stop="deselectPlaylist">&times;</b-button>
                </a>
            </div>

            <div v-if="selectedPlaylist && albums.length > 0" class="panel albums">
                <div class="panel-title">
                    <h2 class="muted">Select albums</h2>
                    <p class="muted small">
                      Selected
                      <span v-if="selectedAlbumsTracksCount > 0">
                        {{ selectedAlbumsTracksCount }} tracks in
                      </span>
                      {{ selectedAlbums.length }} albums
                    </p>
                </div>
                <div class="select-buttons">
                    <b-button type="is-primary is-rounded is-outlined is-small" @click="selectedAllAlbums">Select all</b-button>
                    <b-button type="is-primary is-rounded is-outlined is-small" @click="deselectedAllAlbums">Deselect all</b-button>
                </div>
                <a
                    v-for="album in albums"
                    :key="album.id"
                    class="item"
                    :class="{ 'selected': album.selected }"
                    @click="selectAlbum(album)"
                >
                    <img :src="album.images.length ? album.images[0].url : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAABCAQAAACC0sM2AAAADElEQVR42mNkGCYAAAGSAAIVQ4IOAAAAAElFTkSuQmCC'">
                    <h3 class="item-title">
                        <strong>{{ album.name }}</strong><br>
                        <span>{{ album.artists.map(a => a.name).join(', ') }}</span><br/>
                        <span class="small muted">{{ album.total_tracks }} {{ album.total_tracks > 1 ? 'tracks' : 'track' }}</span>
                    </h3>
                    <b-checkbox v-model="album.selected" disabled />
                </a>
            </div>

        </div>

    </div>
</template>

<script>
    import axios from 'axios';
    import lscache from 'lscache';
    import SpotifyService from '../services/SpotifyService';

    export default {
        data() {
            return {
                authorization: {},
                playlists: [],
                filter: null,
                albums: [],
                selectedPlaylist: null,
                tracksToAdd: [],
                newPlaylistId: null,
            }
        },
        computed: {
            filteredPlaylists() {
                const filterCleaned = (this.filter && this.filter.trim()) ? this.filter.trim() : null;
                if (filterCleaned) {
                    return this.playlists.filter(p => p.name.toLowerCase().includes(filterCleaned.toLowerCase()));
                }

                return this.playlists;
            },
            selectedAlbums() {
                return this.albums.filter(a => a.selected);
            },
            selectedAlbumsTracksCount() {
                let count = 0;
                this.selectedAlbums.forEach(a => {
                    count += a.total_tracks;
                });
                return count;
            },
        },
        watch: {
            selectedAlbumsTracksCount(val) {
                if (val >= 10000) {
                    this.$buefy.snackbar.open({
                        type: 'is-primary',
                        message: 'Spotify playlists have a 10000 tracks limit, some tracks might not be added',
                        position: 'is-top',
                    });
                }
            },
        },
        mounted() {
            this.authorization.code = lscache.get('spotify_auth_code');
            this.authorization.access_token = lscache.get('spotify_access_token');
            this.authorization.user_id = lscache.get('spotify_user_id');

            this.setupAxios();

            this.loadPlaylists();
        },
        methods: {
            setupAxios() {
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.authorization.access_token;
                axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

                axios.interceptors.response.use(response => {
                    return response;
                }, error => {
                    this.$buefy.snackbar.open({
                        type: 'is-primary',
                        message: 'Something went wrong',
                        position: 'is-top',
                        actionText: 'Retry',
                        onAction: () => {
                            window.location = '/';
                        }
                    });

                    return error;
                });
            },
            loadPlaylists() {
                // Get user's playlists
                SpotifyService.getPlaylists().then((items) => {
                    this.playlists = items;
                });
            },
            selectPlaylist(playlist) {
                if (this.selectedPlaylist === playlist) {
                    return false;
                }

                this.selectedPlaylist = playlist;

                // Get selected playlist's tracks
                SpotifyService.getPlaylistTracks(playlist.id).then((items) => {
                    this.albums = [];

                    items.forEach((item) => {
                        if (! this.albums.find(a => a.id === item.track.album.id)) {
                            item.track.album.selected = true;
                            this.albums.push(item.track.album);
                        }
                    });
                });
            },
            deselectPlaylist() {
                this.selectedPlaylist = null;
                this.albums = [];
            },
            selectAlbum(album) {
                album.selected = !album.selected;
            },
            selectedAllAlbums() {
                this.albums.forEach(album => album.selected = true);
            },
            deselectedAllAlbums() {
                this.albums.forEach(album => album.selected = false);
            },
            save() {
                window.pa.track({ name: 'Save' });
                SpotifyService.getAlbumsTracks(this.selectedAlbums).then((tracksChunked) => {
                    SpotifyService.createPlaylist(this.selectedPlaylist.name).then((playlistId) => {
                        SpotifyService.addTracksToPlaylist(playlistId, tracksChunked).then(() => {
                            const tracksCount = tracksChunked.reduce((count, row) => count + row.length, 0);
                            window.pa.track({ name: 'Saved', value: tracksCount, unit: 'Tracks' });

                            this.$buefy.snackbar.open({
                                type: 'is-primary',
                                message: 'Playlist created',
                                position: 'is-top',
                            });
                        });
                    });
                });
            },
            logout() {
                this.authorization = {};

                lscache.remove('spotify_auth_code');
                lscache.remove('spotify_access_token');
                lscache.remove('spotify_user_id');

                this.$router.push({ name: 'Home' });
            },
        }
    }
</script>
