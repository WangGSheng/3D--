// 业务相关工具库 入口
const LIB = (r => {
    return r.keys().map(key => r(key))
})(require.context('@/common/utils', true, /^\.\/(?!index).*\.(vue|js)$/))

export default {
    install(Vue) {
        LIB.map(item => {
            item.default && Vue.use(item.default)
        })
    }
}
