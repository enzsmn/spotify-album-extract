import Bugsnag from "@bugsnag/js";
import BugsnagPluginVue from "@bugsnag/plugin-vue";
import Vue from "vue";

Bugsnag.start({
  apiKey: process.env.VUE_APP_BUGSNAG_API_KEY,
  enabledReleaseStages: ["production"],
  plugins: [new BugsnagPluginVue()],
  releaseStage: process.env.NODE_ENV,
});

Bugsnag.getPlugin("vue").installVueErrorHandler(Vue);
