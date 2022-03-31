import "./assets/app.scss";
import "./plugins/axios";
import "./plugins/bugsnag";
import "./plugins/buefy";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import router from "./router/router";

Vue.config.productionTip = process.env.NODE_ENV !== "production";

Vue.use(VueRouter);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
