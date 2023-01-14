import { createApp } from "vue";
import PrivacyPolicy from "./components/PrivacyPolicy.vue";
import router from "./router";
import vue3GoogleLogin from "vue3-google-login";

const app = createApp(PrivacyPolicy);

app.use(vue3GoogleLogin, {
  clientId:
    "613134000150-vledb3pl871faha1bj3q1vfsbjfemnss.apps.googleusercontent.com",
});
app.use(router);

app.mount("#app");
