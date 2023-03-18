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
    history.listen((newRoute) => {
      app._route = newRoute;
    });
  }
  //根据url匹配路由记录
  match(location) {
    return this.matcher.match(location);
  }
  push(location) {
    //这里是用户触发了跳转
    this.history.push(location);
  }
  beforeEach(cb) {
    this.beforeEachHooks.push(cb);
  }
}

//用户如果将类导出，在类上添加install 方法 会优先调用此方法
VueRouter.install = install;

export default VueRouter;
