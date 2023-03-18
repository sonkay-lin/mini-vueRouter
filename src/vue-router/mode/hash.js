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
  push(location) {
    this.transitionTo(location, () => {
      window.location.hash = location;
    });
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
