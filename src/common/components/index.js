// 业务相关公共组件入口
const components = (r => {
    // console.log(r.keys())
    return r.keys().map(key => r(key))
})(require.context('./', true, /^\.((?!\/(demo-|_|index)).)*\.(vue|js)$/))

//
function mapComp(Vue) {
    components.map(item => {
        let comp = item.default
        if (comp && comp.name) {
            // console.log(comp.name)
            //有名字就加入ui前缀
            let compName = comp.name.replace(/^(?!ui-)/, 'ui-')
            Vue.component(compName, comp)
        }
    })
}

export default {
    install(Vue) {
        mapComp(Vue)
    }
}

