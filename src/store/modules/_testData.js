export default {
    name: 'testData',
    state: {
        count: 0
    },
    mutations: {
        incrementx(state) {
            // 变更状态
            state.count++
        }
    },
    actions: {
        inc({commit}) {
            commit('incrementx')
        }
    }
}
