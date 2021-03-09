/************
 * 给后端用的路由全局前置守卫
 * 进行权限的判断并指向对应路由
 * Created by donkey on 2017/12/22
 ************/

// import router from '@/router'
import store from '@/store'
import { getToken } from '@/common/permission/auth'

/*const getQueryString = function(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    }
    return '';
}*/

const whiteList = ['/login'] // 不重定向白名单

function bed(to, from, next, router) {
    if (getToken()) { //判断,如果登录成功
        if (to.path === '/login') { // 如果登录了还显示登录干嘛?直接进入啥!
            setTimeout(() => { // hack方法解决进来后不跳走的问题.
                // next(store.getters.addRouters[0].path)// 登录成功后跳第一个菜单
                next('/home')
            })
        }
        if (!store.getters.stopGoBack) { // 进入子路由将页面锁死,等待子路由的操作
            if (!store.getters.role) {   // 如果vuex中没有用户权限信息


                store.dispatch('GetInfo', router) // 获取ajax用户权限然后存储到vuex
                    .then((info) => {
                        Object.defineProperty(window.Vue.prototype, '$USER', { value: info.user })                // 把用户信息放到全局
                        Object.defineProperty(window.Vue.prototype, '$CUSTOMER', { value: info.customerInfo })    // 把企业信息放到全局
                    })
                    .then(() => store.dispatch('GenerateRoutes', { router, isStatic:false }))        // 生成动态路由
                    .then(() => router.addRoutes(store.getters.addRouters))      // 最后把动态路由加入路由中,正真跑起来
                    .then(() => {
                        if (sessionStorage.getItem('login') === 'true') {
                            next({ ...to })
                        }else{
                            let r_path = store.getters.addRouters[0].path;
                            if (r_path) {
                                next('three') // 登录成功后跳第一个菜单
                                sessionStorage.setItem('login', 'true') //
                            }
                        }

                    })
                // .then(() => {next({ ...to })})                            // hack方法 确保addRoutes已完成
            }else{ // 否则用户权限信息和路由生成已经完成无需其他操作直接进行下一步

                if (BASE_URL === '/permission/') {
                    next();
                }else{
                    if (to.path === '/home') {
                        next(store.getters.addRouters[0].path)
                    }else{
                        next();
                    }
                }
            }
        }
    }else{ // 否则只能进白名单页面
        if (whiteList.indexOf(to.path) !== -1) {       // 在免登录白名单，直接进入
            next()
        }else{
            sessionStorage.removeItem('login');      // 清除登录session
            //next('/login')                         // 全部重定向到登录页
            //处理url不要带着产品子系统参数。
            let path = window.location.href;
            if (path.indexOf('?') > 0) {
                window.location.href = path.split('?')[0] + '#/login'
            }else{
                window.location.href = path.split('#')[0] + '#/login'
            }
            next('/login')
        }
    }
}

export default bed
