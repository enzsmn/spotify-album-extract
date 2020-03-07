import axios from 'axios';
import moment from 'moment';

const SPOTIFY_AUTH = 'https://accounts.spotify.com/api';
const SPOTIFY_API = 'https://api.spotify.com/v1';
const CLEAN_URL = process.env.VUE_APP_URL.replace('http://', '').replace('https://', '');

const getToken = (code) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', encodeURI(process.env.VUE_APP_SPOTIFY_CALLBACK_URI));

    return axios.post(`${ SPOTIFY_AUTH }/token`,
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

            return getUserId(res.data.access_token);
        });
};

const getUserId = (accessToken) => {
    return axios.get(`${ SPOTIFY_API }/me`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
        .then((res) => {
            console.log('Received user ID', res);
            localStorage.setItem('spotify_user_id', res.data.id);
        });
};

const getPlaylists = () => {
    return axios.get(`${ SPOTIFY_API }/me/playlists?limit=50`)
        .then((res) => {
            // TODO: if res.data.total > 50, again with &offset=50
            console.log('Loaded playlists', res.data.items);
            return res.data.items;
        });
};

const getPlaylistTracks = (playlistId) => {
    return axios.get(`${ SPOTIFY_API }/playlists/${ playlistId }/tracks`)
        .then((res) => {
            console.log('Received playlist tracks', res.data.items);
            return res.data.items;
        });
};

const getAlbumTracks = (albumId) => {
    return axios.get(`${ SPOTIFY_API }/albums/${ albumId }/tracks`)
        .then((res) => {
            return res.data.items;
        });
};

const createPlaylist = (name) => {
    return axios.post(`${ SPOTIFY_API }/users/${ localStorage.getItem('spotify_user_id') }/playlists`, {
        name: `${ name } – Albums`,
        public: false,
        description: `Albums extracted from “${ name }” on ${ moment().format('YYYY-MM-DD' )} with ${ CLEAN_URL }`,
    }).then((res) => {
        return res.data.id;
    });
};

const addTracksToPlaylist = (playlistId, uris) => {
    return axios.post(`${ SPOTIFY_API }/playlists/${ playlistId }/tracks`, {
        uris: uris,
    })
};

export default {
    getToken: getToken,
    getUserId: getUserId,
    getPlaylists: getPlaylists,
    getPlaylistTracks: getPlaylistTracks,
    getAlbumTracks: getAlbumTracks,
    createPlaylist: createPlaylist,
    addTracksToPlaylist: addTracksToPlaylist,
}
