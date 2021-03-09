//
export default {
    install(Vue) {
        Object.defineProperty(Vue.prototype.$bui, '${stateName}$', {
            value: function() {

            }
        })
    }
}
