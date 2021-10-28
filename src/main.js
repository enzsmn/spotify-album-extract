import Bugsnag from "@bugsnag/js";
import BugsnagPluginVue from "@bugsnag/plugin-vue";
import Buefy from "buefy";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import Callback from "./components/Callback";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Playlists from "./components/Playlists";

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueRouter);

Bugsnag.start({
  apiKey: process.env.VUE_APP_BUGSNAG_API_KEY,
  enabledReleaseStages: ["production"],
  plugins: [new BugsnagPluginVue()],
  releaseStage: process.env.NODE_ENV
  // onError: function (event) {
  //     event.addMetadata('foo', {
  //         lorem: 'ipsum',
  //     })
  // }
});

Bugsnag.getPlugin("vue").installVueErrorHandler(Vue);

const routes = [
  { name: "Home", path: "/", component: Home },
  { name: "Callback", path: "/callback", component: Callback },
  { name: "Playlists", path: "/playlists", component: Playlists },
  { name: "404", path: "*", component: NotFound }
];

const router = new VueRouter({
  mode: "history",
  routes
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
