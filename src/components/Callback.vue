<template>
    <div></div>
</template>

<script>
    import SpotifyService from '../services/SpotifyService';
    import lscache from 'lscache';

    export default {
        mounted() {
            console.log('Callback', this.$route.query);

            const expiration = this.$route.query.code / 60;
            lscache.set('spotify_auth_code', this.$route.query.code, expiration);
            lscache.set('spotify_auth_state', this.$route.query.state, expiration);

            this.getToken(this.$route.query.code);
        },
        methods: {
            getToken(code) {
                SpotifyService.getToken(code).then(() => {
                    this.$router.push({ name: 'Playlists' });
                });
            },
        }
    }
</script>
