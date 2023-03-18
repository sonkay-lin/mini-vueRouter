//根据用户路由递归路由信息返回映射表
export default function createRouteMap(routes, pathMap) {
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
