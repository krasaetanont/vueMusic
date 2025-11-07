import './assets/main.css';
import 'primeicons/primeicons.css';
import router from './router';
import { createApp } from 'vue';
import App from './App.vue';
import GoogleSignInPlugin from 'vue3-google-signin';

const app = createApp(App)
app.use(router);
app.use(GoogleSignInPlugin, {
    clientId: '720160670197-hi6qnhl1eanjk5lhp7sd7mjcctdnvlv2.apps.googleusercontent.com',
})

app.mount('#app')