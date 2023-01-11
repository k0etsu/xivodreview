import { createApp } from "vue";
import XIVodreview from "./XIVodreview.vue";
import router from "./router";
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(XIVodreview);

app.use(vue3GoogleLogin, {
    clientId: '613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com'
})
app.use(router);

app.mount("#app");
