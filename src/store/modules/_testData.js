export default {
    name: 'testData',
    state: {
        count: 0
    },
    mutations: {
        incrementx(state) {
            // εζ΄ηΆζ
            state.count++
        }
    },
    actions: {
        inc({commit}) {
            commit('incrementx')
        }
    }
}
