export default {
    name: 'stopGoBack',  //锁定路由
    state: {
        url: null
    },
    mutations: {
        SET_URL(state, v) {
            // 变更状态
            state.url = v
        }
    },
    getters: {
        stopGoBack: state => {
            return state.url
        }
    },
    actions: {}
}
