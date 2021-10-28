import axios from 'axios';
import lscache from 'lscache';
import moment from 'moment';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const CLEAN_URL = process.env.VUE_APP_URL.replace('http://', '').replace('https://', '');

const getUserId = () => {
    return axios.get(`${ SPOTIFY_API }/me`, {
        headers: {
            'Authorization': 'Bearer ' + lscache.get('spotify_auth_code'),
        }
    })
        .then((res) => {
            console.log('Received user ID', res);
            lscache.set('spotify_user_id', res.data.id);
        });
};

const getPlaylists = () => {
   let playlists = [];
   let offset = 0;

   return new Promise((resolve) => {
       const cb = () => {
           axios.get(`${ SPOTIFY_API }/me/playlists?limit=50&offset=${ offset }`)
               .then((res) => {
                   console.log('Loaded playlists', res.data.items);
                   playlists.push(...res.data.items);
                   offset += res.data.items.length;

                   if (res.data.total > offset) {
                       if (offset % 200 === 0) {
                           setTimeout(cb, 1000);
                       } else {
                           cb();
                       }
                   } else {
                       resolve();
                   }
               });
       };
       cb();
   }).then(() => {
       return playlists;
   });
};

const getPlaylistTracks = (playlistId) => {
    let tracks = [];
    let offset = 0;

    return new Promise((resolve) => {
        const cb = () => {
            axios.get(`${ SPOTIFY_API }/playlists/${ playlistId }/tracks?limit=100&offset=${ offset }`)
                .then((res) => {
                    console.log('Received playlist tracks', res.data.items);

                    const tracksWithAlbums = res.data.items.filter(item => item.track && item.track.album.id);
                    console.log('Filtered out tracks without albums', tracksWithAlbums);
                    tracks.push(...tracksWithAlbums);

                    offset += res.data.items.length;

                    if (res.data.total > offset) {
                        if (offset % 1000 === 0) {
                            setTimeout(cb, 1000);
                        } else {
                            cb();
                        }
                    } else {
                        resolve();
                    }
                });
        };
        cb();
    }).then(() => {
        return tracks;
    });
};

const getAlbumsTracks = (albums) => {
    let tracks = [];

    return new Promise((resolve) => {
        let promises = [];

        albums.forEach(album => {
            promises.push(
                getAlbumTracks(album.id).then((items) => {
                    items.forEach((item) => {
                        tracks.push(item.uri);
                    });
                }),
            );
        });

        Promise.all(promises).then(() => {
            console.log('Found ' + tracks.length + ' tracks');
            resolve();
        });
    }).then(() => {
        return chunk(tracks, 100);
    });
};

const getAlbumTracks = (albumId) => {
    let tracks = [];
    let offset = 0;

    return new Promise((resolve) => {
        const cb = () => {
            axios.get(`${ SPOTIFY_API }/albums/${ albumId }/tracks?limit=50&offset=${ offset }`)
                .then((res) => {
                    console.log('Loaded album tracks', res.data.items);
                    tracks.push(...res.data.items);
                    offset += res.data.items.length;

                    if (res.data.total > offset) {
                        if (offset % 200 === 0) {
                            setTimeout(cb, 1000);
                        } else {
                            cb();
                        }
                    } else {
                        resolve();
                    }
                });
        };
        cb();
    }).then(() => {
        return tracks;
    });
};

const createPlaylist = (name) => {
    return axios.post(`${ SPOTIFY_API }/users/${ lscache.get('spotify_user_id') }/playlists`, {
        name: `${ name } – Albums`,
        public: false,
        description: `Albums extracted from “${ name }” on ${ moment().format('YYYY-MM-DD' )} with ${ CLEAN_URL }`,
    }).then((res) => {
        console.log('Created playlist', res.data.id);
        return res.data.id;
    });
};

const addTracksToPlaylist = (playlistId, tracks) => {
    const chunks = [...chunk(tracks, 100)[0]]; // TODO: Support more than 100 tracks per album

    return new Promise((resolve) => {
        let promises = [];
        let count = 0;
        chunks.forEach(c => {
            promises.push(
                axios.post(`${ SPOTIFY_API }/playlists/${ playlistId }/tracks`, {
                    uris: c,
                }).then(() => {
                    count += c.length;
                })
            )
        });
        Promise.all(promises).then(() => {
            console.log('Added ' + count + ' tracks to playlist');
            resolve();
        });
    });
};

const chunk = (arr, size) => {
    let i, j, tmp, chunks = [];

    for (i = 0, j = arr.length; i < j; i += size) {
        tmp = arr.slice(i, i + size);
        chunks.push(tmp);
    }

    return chunks;
};

export default {
    getUserId: getUserId,
    getPlaylists: getPlaylists,
    getPlaylistTracks: getPlaylistTracks,
    getAlbumsTracks: getAlbumsTracks,
    getAlbumTracks: getAlbumTracks,
    createPlaylist: createPlaylist,
    addTracksToPlaylist: addTracksToPlaylist,
}
