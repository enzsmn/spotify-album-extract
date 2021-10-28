<template>
    <div class="page-home">

        <h1>Spotify <span>album extract</span></h1>

        <p>This tool lets you select a playlist and will put each track's full album into a new playlist.</p>

        <b-button type="is-primary is-rounded" @click="auth">Authorize and load playlists</b-button>

    </div>
</template>

<script>
    export default {
        methods: {
            auth() {
                window.pa.track({ name: 'Authorize' });
                window.location = 'https://accounts.spotify.com/authorize?'
                    + 'client_id=' + process.env.VUE_APP_SPOTIFY_CLIENT_ID
                    + '&response_type=token'
                    + '&redirect_uri=' + encodeURI(process.env.VUE_APP_SPOTIFY_CALLBACK_URI)
                    + '&scope=' + encodeURI('playlist-read-private playlist-read-collaborative playlist-modify-private');
            },
        }
    }
</script>
