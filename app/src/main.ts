// import Vue from 'vue';
import { createApp } from "vue";
// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import XIVodreview from "./XIVodreview.vue";
import router from "./router";

// Import Bootstrap and BootstrapVue CSS files (order is important)
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
// Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)

const app = createApp(XIVodreview);

app.use(router);

app.mount("#app");
