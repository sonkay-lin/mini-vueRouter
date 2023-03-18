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

  //调用this,$router时返回_routerRoot?._router
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot?._router;
    },
  });
  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot?._route;
    },
  });
  Vue.component("router-link", routerLink);
  Vue.component("router-view", routerView);
}
