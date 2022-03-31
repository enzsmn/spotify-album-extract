import VueRouter from "vue-router";
import Albums from "../views/Albums";
import Callback from "../views/Callback";
import Home from "../views/Home";
import NotFound from "../views/NotFound";
import Playlists from "../views/Playlists";

const routes = [
  { name: "Home", path: "/", component: Home },
  {
    name: "Callback",
    path: "/callback",
    component: Callback,
    meta: {
      authenticated: true,
    },
  },
  {
    name: "Playlists",
    path: "/playlists",
    component: Playlists,
    meta: {
      authenticated: true,
    },
  },
  {
    name: "Albums",
    path: "/playlists/:playlistId",
    component: Albums,
    meta: {
      authenticated: true,
    },
    props: true,
  },
  { name: "404", path: "*", component: NotFound },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  next();
});

export default router;
