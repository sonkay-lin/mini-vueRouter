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
