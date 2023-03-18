import createRouteMap from "./createRouteMap";

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
