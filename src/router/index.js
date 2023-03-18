import VueRouter from "@/vue-router";
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      children: [
        {
          path: "/a",
          component: () => import("@/components/A.vue"),
        },
        {
          path: "/b",
          component: () => import("@/components/B.vue"),
        },
      ],
    },
    {
      path: "/about",
      name: "About",
      component: About,
      children: [
        {
          path: "/a",
          component: () => import("@/components/A.vue"),
        },
        {
          path: "/b",
          component: () => import("@/components/B.vue"),
        },
      ],
    },
  ],
});
router.matcher.addRoutes([
  {
    path: "/about",
    name: "About",
    component: About,
    children: [
      {
        path: "/c",
        component: () => <h1>about c</h1>,
      },
    ],
  },
]);

router.beforeEach((from, to, next) => {
  setTimeout(() => {
    console.log(1);
    next();
  }, 1000);
});
router.beforeEach((from, to, next) => {
  setTimeout(() => {
    console.log(2);
    next();
  }, 1000);
});

export default router;
