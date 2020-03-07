<template>
    <div></div>
</template>

<script>
    import SpotifyService from '../services/SpotifyService';

    export default {
        mounted() {
            console.log('Callback', this.$route.query);

            localStorage.setItem('spotify_auth_code', this.$route.query.code);
            localStorage.setItem('spotify_auth_state', this.$route.query.state);

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
