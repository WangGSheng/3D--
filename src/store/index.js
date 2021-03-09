/************
 * vuex 入口
 * Created by donkey on 2018/1/2
 ************/
import Vue from 'vue'
import Vuex from 'vuex'
const debug = process.env.NODE_ENV !== 'production'

const mods = (r => {
    return r.keys().map(key => r(key));
})(require.context('./modules', true, /^\.\/.*\.js$/))

const modules = {}
mods.map(mod => {
    modules[mod.default.name] = mod.default;
})
Vue.use(Vuex)
export default new Vuex.Store({
    strict: debug,
    modules: modules,
})
