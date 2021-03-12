import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue';
import Vue from 'vue';
import App from './App.vue';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import Home from './components/Home';
import Callback from './components/Callback';
import Playlists from './components/Playlists';
import NotFound from './components/NotFound';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueRouter);

Bugsnag.start({
    apiKey: process.env.VUE_APP_BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginVue()],
    releaseStage: process.env.NODE_ENV,
    // onError: function (event) {
    //     event.addMetadata('foo', {
    //         lorem: 'ipsum',
    //     })
    // }
});

Bugsnag.getPlugin('vue').installVueErrorHandler(Vue);

const routes = [
    {name: 'Home', path: '/', component: Home},
    {name: 'Callback', path: '/callback', component: Callback},
    {name: 'Playlists', path: '/playlists', component: Playlists},
    {name: '404', path: '*', component: NotFound},
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
