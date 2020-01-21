<template>
    <div></div>
</template>

<script>
    import axios from 'axios';
    import moment from 'moment';

    export default {
        mounted() {
            console.log('Callback', this.$route.query);

            localStorage.setItem('spotify_auth_code', this.$route.query.code);
            localStorage.setItem('spotify_auth_state', this.$route.query.state);

            this.getToken(this.$route.query.code);
        },
        methods: {
            getToken(code) {
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('code', code);
                params.append('redirect_uri', encodeURI(process.env.VUE_APP_SPOTIFY_CALLBACK_URI));

                axios.post('https://accounts.spotify.com/api/token',
                    params,
                    {
                        headers: {
                            'Authorization': 'Basic ' + btoa(process.env.VUE_APP_SPOTIFY_CLIENT_ID + ':' + process.env.VUE_APP_SPOTIFY_CLIENT_SECRET),
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    }
                )
                    .then((res) => {
                        console.log('Received token', res.data);

                        localStorage.setItem('spotify_access_token', res.data.access_token);
                        localStorage.setItem('spotify_refresh_token', res.data.refresh_token);
                        localStorage.setItem('spotify_expires', moment().add('1', 'hour'));

                        this.getUserId(res.data.access_token);
                    });
            },
            getUserId(access_token) {
                axios.get('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                })
                    .then((res) => {
                        console.log('Received user ID', res);
                        localStorage.setItem('spotify_user_id', res.data.id);

                        this.$router.push({ name: 'Playlists' });
                    });
            },
        }
    }
</script>
