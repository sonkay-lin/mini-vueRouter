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
