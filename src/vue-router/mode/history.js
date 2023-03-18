import Base from "./base";
class History extends Base {
  constructor(router) {
    super(router);
  }
  //监听路由变换
  setupListener() {
    window.addEventListener("popstate", () => {
      this.transitionTo(this.getCurrentLocation());
    });
  }
  //获取当前路径
  getCurrentLocation() {
    return window.location.pathname;
  }
  push(location) {
    this.transitionTo(location, () => {
      history.pushState({}, "", location);
    });
  }
}

export default History;
