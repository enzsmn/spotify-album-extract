import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue';
import Vue from 'vue';
import App from './App.vue';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import Home from './components/Home';
import Callback from './components/Callback';
import Playlists from './components/Playlists';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueRouter);

Bugsnag.start({
    apiKey: process.env.VUE_APP_BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginVue()],
    // onError: function (event) {
    //     event.addMetadata('foo', {
    //         lorem: 'ipsum',
    //     })
    // }
});

Bugsnag.getPlugin('vue').installVueErrorHandler(Vue);

Bugsnag.notify(new Error('Test error'));

const routes = [
    {name: 'Home', path: '/', component: Home},
    {name: 'Callback', path: '/callback', component: Callback},
    {name: 'Playlists', path: '/playlists', component: Playlists},
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
