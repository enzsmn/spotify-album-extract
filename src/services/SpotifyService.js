import Bugsnag from "@bugsnag/js";
import axios from "axios";
import { ToastProgrammatic as Toast } from "buefy";
import router from "../router/router";

const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_AUTH = "https://accounts.spotify.com";

export default class SpotifyService {
  accessToken;
  logoutTimer;
  userId;
  callbackUrl;

  constructor() {
    const callbackRoute = router.getRoutes().find((r) => r.name === "Callback");
    this.callbackUrl = window.origin + callbackRoute.path;
  }

  async authenticate() {
    window.location =
      `${SPOTIFY_AUTH}/authorize` +
      `?response_type=code` +
      `&client_id=${process.env.VUE_APP_SPOTIFY_CLIENT_ID}` +
      `&redirect_uri=${encodeURI(this.callbackUrl)}` +
      `&scope=${encodeURI(
        "playlist-read-private playlist-read-collaborative playlist-modify-private"
      )}`;
  }

  async requestToken(search) {
    const parsedQuery = new URLSearchParams(search.substr(1));

    if (!parsedQuery.get("code")) {
      throw new Error("Incomplete token");
    }

    const auth = btoa(
      `${process.env.VUE_APP_SPOTIFY_CLIENT_ID}:${process.env.VUE_APP_SPOTIFY_CLIENT_SECRET}`
    );

    return axios
      .post(
        `${SPOTIFY_AUTH}/api/token`,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: parsedQuery.get("code"),
          redirect_uri: this.callbackUrl,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        this.accessToken = response.data.access_token;

        this.setupLogoutTimer(response.data.expires_in);
        this.setupAxiosHeaders();
        this.getUserId();
      });
  }

  getToken() {
    return this.accessToken;
  }

  setupLogoutTimer(expiresIn) {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      Toast.open({
        message: "Authentication expired, please login again",
        type: "is-danger",
      });

      this.logout();
    }, expiresIn * 1000);
  }

  setupAxiosHeaders() {
    axios.defaults.headers.common = {
      ...axios.defaults.headers.common,
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  async getUserId() {
    axios
      .get(`${SPOTIFY_API}/me`)
      .then((response) => {
        this.userId = response.data.id;
      })
      .catch((error) => {
        Bugsnag.notify(error);

        this.logout();
      });
  }

  async getPlaylists() {
    let playlists = [];
    let offset = 0;

    return new Promise((resolve) => {
      const callback = () => {
        axios
          .get(`${SPOTIFY_API}/me/playlists?limit=50&offset=${offset}`)
          .then((response) => {
            playlists.push(...response.data.items);
            offset += response.data.items.length;

            if (response.data.total > offset) {
              if (offset % 200 === 0) {
                setTimeout(callback, 1000);
              } else {
                callback();
              }
            } else {
              resolve();
            }
          });
      };

      callback();
    }).then(() => {
      return playlists;
    });
  }

  async getPlaylist(playlistId) {
    return axios
      .get(`${SPOTIFY_API}/playlists/${playlistId}`)
      .then((response) => {
        return response.data;
      });
  }

  async getPlaylistAlbums(playlistId) {
    const tracks = await this.getPlaylistTracks(playlistId);
    const albums = tracks.map((item) => item.track.album);

    // Remove duplicates
    return [...new Map(albums.map((item) => [item.uri, item])).values()];
  }

  async getPlaylistTracks(playlistId) {
    let tracks = [];
    let offset = 0;

    return new Promise((resolve) => {
      const callback = () => {
        axios
          .get(
            `${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=100&offset=${offset}`
          )
          .then((response) => {
            const tracksWithAlbums = response.data.items.filter(
              (item) => item.track && item.track.album.id
            );
            tracks.push(...tracksWithAlbums);

            offset += response.data.items.length;

            if (response.data.total > offset) {
              if (offset % 1000 === 0) {
                setTimeout(callback, 1000);
              } else {
                callback();
              }
            } else {
              resolve();
            }
          });
      };

      callback();
    }).then(() => {
      return tracks;
    });
  }

  async getAlbumTrackUris(albumId) {
    let tracks = [];
    let offset = 0;

    return new Promise((resolve) => {
      const callback = () => {
        axios
          .get(
            `${SPOTIFY_API}/albums/${albumId}/tracks?limit=50&offset=${offset}`
          )
          .then((response) => {
            tracks.push(...response.data.items.map((t) => t.uri));

            offset += response.data.items.length;

            if (response.data.total > offset) {
              if (offset % 200 === 0) {
                setTimeout(callback, 1000);
              } else {
                callback();
              }
            } else {
              resolve();
            }
          });
      };

      callback();
    }).then(() => {
      return tracks;
    });
  }

  async getAlbumsTrackIds(albumIds) {
    const trackIds = [];

    for (const albumId of albumIds) {
      const albumTrackIds = await this.getAlbumTrackUris(albumId);
      trackIds.push(...albumTrackIds);
    }

    return trackIds;
  }

  async createPlaylist(name) {
    return axios
      .post(`${SPOTIFY_API}/users/${this.userId}/playlists`, {
        name: `${name} – Albums`,
        public: false,
        description: `Full albums from “${name}”`,
      })
      .then((response) => {
        return response.data.id;
      });
  }

  async createPlaylistWithAlbums(playlistName, albumIds) {
    const trackIds = await this.getAlbumsTrackIds(albumIds);

    const playlistId = await this.createPlaylist(playlistName);

    return await this.addTracksToPlaylist(playlistId, trackIds);
  }

  async addAlbumsToPlaylist(
    selectedPlaylistId,
    albumIds,
    skipDuplicates = false
  ) {
    const trackIds = await this.getAlbumsTrackIds(albumIds);

    return this.addTracksToPlaylist(
      selectedPlaylistId,
      trackIds,
      skipDuplicates
    );
  }

  async addTracksToPlaylist(playlistId, trackIds, skipDuplicates = false) {
    if (skipDuplicates) {
      const tracksInPlaylist = await this.getPlaylistTracks(playlistId);
      const tracksInPlaylistUris = tracksInPlaylist.map(
        (item) => item.track.uri
      );

      trackIds = this.intersect(trackIds, tracksInPlaylistUris);
    }

    const chunks = this.chunk(trackIds, 100);

    for (const chunk of chunks) {
      await axios.post(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
        uris: chunk,
      });
    }
  }

  logout() {
    this.accessToken = null;
    this.userId = null;

    router.push({ name: "Home" });
  }

  chunk(array, size) {
    let i;
    let j;
    let tmp;
    let chunks = [];

    for (i = 0, j = array.length; i < j; i += size) {
      tmp = array.slice(i, i + size);
      chunks.push(tmp);
    }

    return chunks;
  }

  intersect(array1, array2) {
    return array1.filter(
      (item1) => array2.findIndex((item2) => item1 === item2) === -1
    );
  }
}
