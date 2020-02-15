<template>
    <div class="page-home">

        <h1>Spotify <span>album extract</span></h1>

        <p>This tool allows you to put the full abums from a selected playlist's tracks into a new playlist.</p>

        <b-button type="is-primary is-rounded" @click="auth">Authorize and load playlists</b-button>

    </div>
</template>

<script>
    export default {
        computed: {
            authUrl() {
                return 'https://accounts.spotify.com/authorize?'
                    + 'client_id=' + process.env.VUE_APP_SPOTIFY_CLIENT_ID
                    + '&response_type=code'
                    + '&redirect_uri=' + encodeURI(process.env.VUE_APP_SPOTIFY_CALLBACK_URI)
                    + '&scope=' + encodeURI(process.env.VUE_APP_SPOTIFY_SCOPE)
                    + '&state=' + process.env.VUE_APP_SPOTIFY_STATE;
            },
        },
        methods: {
            auth() {
                window.location = this.authUrl;
            },
        }
    }
</script>
