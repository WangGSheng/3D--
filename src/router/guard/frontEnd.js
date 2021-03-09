/************
 * 静态路由无需加载远程路由数据
 * Created by donkey on 2019/12/27
 ************/

import store from '@/store'

let flag = false

function fed(to, from, next, router) {
    //传入全局路由状态信息
    store.commit('SET_ROUTE_INFO', { to, from });
    if (flag) {
        next();
    }else{
        store.dispatch('GenerateRoutes', { router, isStatic: 'isStatic' })
            .then(() => router.addRoutes(store.getters.addRouters))
            .then(() => {
                flag = true
                next({ ...to })
            })
    }

}

export default fed
