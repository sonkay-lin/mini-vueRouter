## 运行

```
npm install
```

然后

```
npm run serve
```

# vue-router

## hash 模式和 history 的对比

1. hash 模式

- 浏览器通过 onhashchange()事件监听变化，所有路径都带有 #
- 服务端无法获取锚点，无法根据对应的路径来解析内容(无法实现 seo 优化)
- hash 值变化不会导致浏览器向服务器发出请求,而且 hash 改变会触发 hashchange 事件

2. history 模式

- 通过浏览器中 history 中的 pushState()、onpopstate()和 replaceState()方法实现
- 配合服务端渲染优化 seo
- 浏览器的 URL 发生了变化，但是不会立即向后端服务器发送请求，但是如果点击刷新，就会重新向后端服务器发送请求。

---

# 实现

## 1. 挂载路由

- Vue 使用 use 方法将路由实例传进去，会默认执行传进来的数据中的 install 方法，然后将当前的 Vue 作为参数传递给 install

```js
//main.js
import Vue from "vue";
import App from "./App.vue";
import vueRouter from "@/vue-router";
import router from "@/router";

Vue.use(vueRouter);
```

- 在 Vue 中挂载 router-link 和 router-view 组件到全局

```js
//router install.js
import routerLink from "./components/router-link";
import routerView from "./components/router-view";

export let Vue;
export default function install(_Vue) {
  console.log("install");
  Vue = _Vue;

  //不能直接将属性放在原型上，只能通过new Vue才被router共享
  // Vue.prototype.$router;

  //所有组件初始化都会调用这个方法
  Vue.mixin({
    beforeCreate() {},
  });
  Vue.component("router-link", routerLink);
  Vue.component("router-view", routerView);
}
```

## 2. 路由生成

- 根据用户传进来的 routes 配置递归扁平化路由生成映射关系，利用 match 方法传入地址返回路由记录

```js
// router index.js
import install from "./install";
import createMatcher from "./createMatcher";
import Hash from "./mode/hash";
import History from "./mode/history";
class VueRouter {
  constructor(options) {
    //用户传递的路由列表，需要对用户的路由做映射
    const routes = options.routes;
    //将用户的所有路由根据path生成映射方便后续操作
    this.matcher = createMatcher(routes);
}

//用户如果将类导出，在类上添加install 方法 会优先调用此方法
VueRouter.install = install;
export default VueRouter;
```

```js
export default function createMatcher(routes) {
  const { pathMap } = createRouteMap(routes);
  //动态添加多个路由
  function addRoutes(dynamicRoutes) {
    createRouteMap(dynamicRoutes, pathMap);
  }
  //动态添加一个路由
  function addRoute(dynamicRoute) {
    createRouteMap(dynamicRoute, pathMap);
  }
  function match(location) {
    return pathMap[location];
  }
  return {
    addRoutes,
    addRoute,
    match,
  };
}
function createRouteMap(routes, pathMap) {
  pathMap = pathMap || {};
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
  return {
    pathMap,
  };
}
//递归添加路由记录
function addRouteRecord(route, pathMap, parentRecord) {
  let parentPath = "";
  //对父路径做处理
  if (parentRecord?.path && parentRecord.path !== "/") {
    parentPath = parentRecord.path;
  }
  //对路径做处理，没有/开头就添加上
  if (!route.path.startsWith("/")) {
    route.path = `/${route.path}`;
  }
  //将路径拼接
  let path = parentRecord ? `${parentPath}${route.path}` : route.path;
  //路由记录
  let record = {
    path,
    component: route.component,
    props: route.props,
    meta: route.meta,
    parent: parentRecord,
  };
  if (!pathMap[path]) {
    pathMap[path] = record;
  }
  //递归添加路由信息
  route.children?.forEach((childRoute) => {
    addRouteRecord(childRoute, pathMap, record);
  });
}
```

- 根据用户传进来的 mode 生成对应的路由模式

```js
//index.js
class VueRouter {
  constructor(options) {
    //用户传递的路由列表，需要对用户的路由做映射
    const routes = options.routes;
    //将用户的所有路由根据path生成映射方便后续操作
    this.matcher = createMatcher(routes);
    this.beforeEachHooks = [];
    const { mode = "hash" } = options;
    if (mode === "hash") {
      this.history = new Hash(this);
    } else if (mode === "history") {
      this.history = new History(this);
    }
  }
}
```

## 3. 初始化路由

- install 方法将路由实例挂载到 Vue 的根实例上，vue 组件会通过 $parent 属性链式递归向上查找，直到根实例上拿到路由实例，就不需要在每个 vue 组件中生成 $router ，会浪费空间。

```js
//install.js
export default function install(_Vue) {
  console.log("install");
  Vue = _Vue;

  //不能直接将属性放在原型上，只能通过new Vue才被router共享
  // Vue.prototype.$router;

  //所有组件初始化都会调用这个方法
  Vue.mixin({
    beforeCreate() {
      //有this.options.router说明当前为根组件
      if (this.$options.router) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        //将_route转为响应式数据
        Vue.util.defineReactive(this, "_route", this._router.history.current);
      } else {
        //子组件会递归向上拿到根组件的router
        this._routerRoot = this.$parent?._routerRoot;
      }
    },
  });
  //下面代码省略。。。
}
```

- 调用 init 方法初始化路由，根据当前 url 和 路由模式 开启监听跳转到对应页面

```js
//index.js
class VueRouter {
  constructor(options) {
    //用户传递的路由列表，需要对用户的路由做映射
    const routes = options.routes;
    //将用户的所有路由根据path生成映射方便后续操作
    this.matcher = createMatcher(routes);
    this.beforeEachHooks = [];
    const { mode = "hash" } = options;
    if (mode === "hash") {
      this.history = new Hash(this);
    } else if (mode === "history") {
      this.history = new History(this);
    }
  }
  //初始化路由
  init(app) {
    let history = this.history;
    // history.setupListener();
    history.transitionTo(history.getCurrentLocation(), () => {
      history.setupListener();
    });
  }
}
```

## 4. 跳转

- 根据当前路径，从路由映射表中拿到路由记录，然后跳转

```js
//路由公共方法 base.js
class base {
  constructor(router) {
    //所有路由
    this.router = router;
  }
  transitionTo(location, listener) {
    listener?.();
  }
}
```

```js
//以hash路由为例 hash.js
import Base from "./base";
class Hash extends Base {
  constructor(router) {
    super(router);
    //根据用户url加上#
    ensureHash();
  }
  //监听路由变换
  setupListener() {
    window.addEventListener("hashchange", () => {
      //这里是监听了浏览器前进后退
      this.transitionTo(this.getCurrentLocation());
    });
  }
  //获取当前路径
  getCurrentLocation() {
    return getHash();
  }
}
//返回 截去 # 的url
function getHash() {
  return window.location.hash.slice(1);
}
//判断用户是否传入了 #
function ensureHash() {
  if (window.location.hash) {
    return;
  }
  window.location.hash = "/";
}

export default Hash;
```

## 5. 获取组件

- 根据当前路径，从路由映射表中拿到路由记录，然后递归(因为有路由嵌套的情况)查找添加到数组中

```js
class base {
  constructor(router) {
    //所有路由
    this.router = router;
    //当前路由
    this.current = createRoute(null, {
      path: "/",
    });
  }
  transitionTo(location, listener) {
    let record = this.router.match(location);
    let route = createRoute(record, { path: location });
    if (
      location === this.current.path &&
      route.matched.length === this.current.matched.length
    ) {
      return;
    }
    this.current = route;
    listener?.();
    this.cb?.(route);
  }
  //每次路由切换，更新当前路由
  listen(cb) {
    this.cb = cb;
  }
}
//创建当前页面的路由
function createRoute(record, location) {
  const matched = [];
  if (record) {
    //递归往父节点上找到路由记录添加到数组前
    while (record) {
      matched.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...location,
    matched,
  };
}

export default base;
```

## 6. 渲染组件

- router-view 为函数组件，它将当前组件添加 routerView 标识 ，然后递归向父节点查找有没有 router-view 组件，判断当前的深度，然后渲染对应的组件

```js
export default {
  functional: true,
  render(h, { parent, data }) {
    const route = parent.$route;
    //给router-view组件加个标识
    data.routerView = true;
    let depth = 0;
    while (parent) {
      //递归找父节点，如果为router-view就depth+1
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      parent = parent.$parent;
    }
    console.log(depth, route.matched);
    const record = route.matched[depth];
    if (!record) {
      return h();
    }
    return h(record.component, data);
  },
};
```

## 7. 路由拦截

- 在路由跳转时做处理，递归调用用户传入的函数(类似洋葱模型)

```js
class base {
  constructor(router) {
    //所有路由
    this.router = router;
    //当前路由
    this.current = createRoute(null, {
      path: "/",
    });
  }
  transitionTo(location, listener) {
    let record = this.router.match(location);
    let route = createRoute(record, { path: location });
    if (
      location === this.current.path &&
      route.matched.length === this.current.matched.length
    ) {
      return;
    }
    let queue = [].concat(this.router.beforeEachHooks);
    //递归调用用户的hooks，类似洋葱模型
    runQueue(queue, this.current, route, () => {
      this.current = route;
      listener?.();
      this.cb?.(route);
    });
  }
  //每次路由切换，更新当前路由
  listen(cb) {
    this.cb = cb;
  }
}
//创建当前页面的路由
function createRoute(record, location) {
  const matched = [];
  if (record) {
    //递归往父节点上找到路由记录添加到数组前
    while (record) {
      matched.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...location,
    matched,
  };
}

function runQueue(queue, from, to, cb) {
  function next(index) {
    if (index >= queue.length) return cb();
    const hook = queue[index];
    //将from, to, next参数传给用户
    hook(from, to, () => {
      //用户调用了next()后，递归调用runQueue中的next 并且 index + 1 (因为用户可能使用多个beforeEach)
      next(index + 1);
    });
  }
  next(0);
}

export default base;
```
