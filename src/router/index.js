/************
 * 路由入口
 * Created by donkey on 2018/1/2
 ************/
/* eslint-disable */
import Vue from 'vue'

// 路由插件
import VueRouter from 'vue-router'

// 分离前后端路由守卫
import bed from './guard/backEnd'
import fed from './guard/frontEnd'

Vue.use(VueRouter)

// 引入所有路由配置
const routerObj = (r => {
    return r.keys().map(key => r(key))
})(require.context('@/router/routes', true, /^\.\/.*\.js$/))

let routes = []
routerObj.map(rou => {
    if (rou.default.length > 0) {
        rou.default.map(ro => {
            routes.push(ro)
        })
    } else {
        routes.push(rou.default)
    }
})
// 整合路由
const router = new VueRouter({
    // mode:'history',
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    bed(to, from, next, router)
})

export default router
