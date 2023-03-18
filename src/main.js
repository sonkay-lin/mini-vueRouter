import Vue from "vue";
import App from "./App.vue";
import vueRouter from "@/vue-router";
import router from "@/router";

Vue.config.productionTip = false;

Vue.use(vueRouter);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
