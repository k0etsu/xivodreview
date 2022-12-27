import { createRouter, createWebHistory } from "vue-router";
import XIVodreview from "../XIVodreview.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: XIVodreview,
    },
  ],
});

export default router;
