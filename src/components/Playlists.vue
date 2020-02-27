<template>
    <div class="page-playlists">

        <div class="buttons">
            <h1><a href="/">Spotify <span>album extract</span></a></h1>
            <b-button
                v-if="selectedPlaylist"
                type="is-primary is-rounded"
                class="is-pulled-right"
                @click="save"
                :disabled="!selectedAlbums.length"
            >
                Save to new playlist
            </b-button>
        </div>

        <div class="columns">

            <div v-if="playlists" class="column">
                <h2 class="muted">Select playlist</h2>
                <p class="muted small">Found {{ playlists.length }} playlists</p>
                <a
                    v-for="playlist in playlists"
                    :key="playlist.id"
                    class="item"
                    :class="{ 'selected': playlist === selectedPlaylist }"
                    @click="selectPlaylist(playlist)"
                >
                    <img :src="playlist.images[0].url" v-if="playlist.images.length">
                    <h3 class="item-title">
                        <span>{{ playlist.name }}</span><br/>
                        <span class="small muted">{{ playlist.tracks.total }} {{ playlist.tracks.total > 1 ? 'tracks' : 'track' }}</span>
                    </h3>
                </a>
            </div>

            <div v-if="selectedPlaylist" class="column">
                <h2 class="muted">Select albums</h2>
                <p class="muted small">{{ albums.length }}/{{ selectedAlbumsTracksCount }} albums selected, {{ selectedAlbums.length }} tracks in total</p>
                <div class="select-buttons">
                    <b-button type="is-primary is-rounded is-outlined" @click="selectedAllAlbums">Select all</b-button>
                    <b-button type="is-primary is-rounded is-outlined" @click="deselectedAllAlbums">Deselect all</b-button>
                </div>
                <a
                    v-for="album in albums"
                    :key="album.id"
                    class="item"
                    @click="selectAlbum(album)"
                >
                    <img :src="album.images[0].url" v-if="album.images.length">
                    <h3 class="item-title">
                        <span>{{ album.name }}</span><br>
                        <span class="muted">{{ album.artists.map(a => a.name).join(', ') }}</span><br/>
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
    import moment from 'moment';

    export default {
        data() {
            return {
                authorization: {},
                playlists: [],
                albums: [],
                selectedPlaylist: null,
                tracksToAdd: [],
                newPlaylistId: null,
            }
        },
        computed: {
            authUrl() {
                return 'https://accounts.spotify.com/authorize?'
                    + 'client_id=' + process.env.VUE_APP_SPOTIFY_CLIENT_ID
                    + '&response_type=code'
                    + '&redirect_uri=' + encodeURI(process.env.VUE_APP_SPOTIFY_CALLBACK_URI)
                    + '&scope=' + process.env.VUE_APP_SPOTIFY_SCOPE
                    + '&state=' + process.env.VUE_APP_SPOTIFY_STATE;
            },
            cleanUrl() {
                return process.env.VUE_APP_URL.replace('http://', '').replace('https://', '');
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
        mounted() {
            this.authorization.code = localStorage.getItem('spotify_auth_code');
            this.authorization.refresh_token = localStorage.getItem('spotify_refresh_token');
            this.authorization.access_token = localStorage.getItem('spotify_access_token');
            this.authorization.user_id = localStorage.getItem('spotify_user_id');

            axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.authorization.access_token;
            axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

            this.setupAxios();

            this.loadPlaylists();
        },
        methods: {
            setupAxios() {
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
                axios.get('https://api.spotify.com/v1/me/playlists?limit=50')
                    .then((res) => {
                        // TODO: if res.data.total > 50, again with &offset=50

                        console.log('Loaded playlists', res.data.items);

                        this.playlists = res.data.items;
                    });
            },
            selectPlaylist(playlist) {
                if (this.selectedPlaylist === playlist) {
                    return false;
                }

                this.selectedPlaylist = playlist;

                // Get selected playlist's tracks
                axios.get('https://api.spotify.com/v1/playlists/' + playlist.id + '/tracks')
                    .then((res) => {
                        console.log('Received playlist tracks', res.data.items);

                        this.albums = [];
                        res.data.items.forEach((item) => {
                            if (! this.albums.find(a => a.id === item.track.album.id)) {
                                item.track.album.selected = true;
                                this.albums.push(item.track.album);
                            }
                        });
                    });
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
                this.extractSelectedAlbumsTracks().then(() => {
                    this.createPlaylist().then(() => {
                        this.addTracksToNewPlaylist().then(() => {
                            this.$buefy.snackbar.open({
                                type: 'is-primary',
                                message: 'Playlist created',
                                position: 'is-top',
                            });
                        });
                    });
                });
            },
            async extractSelectedAlbumsTracks() {
                return new Promise((resolve) => {

                    let promises = [];
                    let tracks = [];

                    // Get all tracks from each selected album
                    this.selectedAlbums.forEach(album => {
                        promises.push(
                            axios.get('https://api.spotify.com/v1/albums/' + album.id + '/tracks')
                                .then((res) => {
                                    res.data.items.forEach((item) => {
                                        tracks.push(item.uri);
                                    });
                                }),
                        );
                    });

                    Promise.all(promises).then(() => {
                        console.log('Found ' + tracks.length + ' tracks');
                        this.tracksToAdd = this.chunk(tracks, 100);
                        console.log('Chunked tracks', this.tracksToAdd);
                        resolve();
                    });

                });
            },
            createPlaylist() {
                return axios.post('https://api.spotify.com/v1/users/' + localStorage.getItem('spotify_user_id') + '/playlists', {
                    name: `${this.selectedPlaylist.name} – Albums`,
                    public: false,
                    description: `Albums extracted from “${this.selectedPlaylist.name}” on ${moment().format('YYYY-MM-DD')} with ${this.cleanUrl}`,
                })
                    .then((res) => {
                        console.log('Created playlist', res);
                        this.newPlaylistId = res.data.id;
                    });
            },
            addTracksToNewPlaylist() {
                return new Promise((resolve) => {

                    let promises = [];
                    let count = 0;

                    this.tracksToAdd.forEach(chunk => {
                        promises.push(
                            axios.post('https://api.spotify.com/v1/playlists/' + this.newPlaylistId + '/tracks', {
                                uris: chunk,
                            })
                                .then((res) => {
                                    console.log('Added ' + chunk.length + ' tracks to playlist', res);
                                    count += chunk.length;
                                }),
                        )
                    });

                    Promise.all(promises).then(() => {
                        console.log('Added ' + count + ' tracks to playlist');
                        resolve();
                    });

                });
            },
            chunk(arr, size) {
                let i, j, tmp, chunks = [];

                for (i = 0, j = arr.length; i < j; i += size) {
                    tmp = arr.slice(i , i + size);
                    chunks.push(tmp);
                }

                return chunks
            },
        }
    }
</script>
