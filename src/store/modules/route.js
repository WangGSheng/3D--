export default {
    name: 'route',  //路由全局指向
    state: {
        obj: null
    },
    mutations: {
        SET_ROUTE_INFO(state, v) {state.obj = v}
    },
    getters: {
        routeInfo: state => {return state.obj}
    },
    actions: {}
}
