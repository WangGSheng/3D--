import { removeToken, setToken } from '@/common/permission/auth'
import Axios from 'bui2/$bui/http/_Axios.js'
import getAllChildrens from '@/router/getAllChildrens'
/* eslint-disable */
export default {
    name: 'permission',
    state: {
        sidebar: '',
        nickname: '',
        userId: '',
        avatar: '',
        customerInfo: {},
        user: {},
        permissions: [],
        products: [],
        subs: [],
        role: '',
        current_pid: '',
        current_sid: '',
        addRouters: []
    },
    mutations: {
        SET_SIDEBAR(state, sidebar) {
            state.sidebar = sidebar
        },
        SET_ROUTERS(state, routers) {
            state.addRouters = routers
        },
        SET_USER: (state, userInfo) => {
            state.customerInfo = userInfo.customerInfo
            state.user = userInfo.customerInfo.username
            state.permissions = userInfo.permissionList
            state.products = userInfo.customerInfo.discDetail
            state.subs = userInfo.customerInfo.discTitle
            state.role = userInfo.customerInfo.roleIds
            state.userId = userInfo.customerInfo.userId
            state.avatar = userInfo.customerInfo.imgPath
        },
        SET_SYSTEM_INFO: (state, info) => {
            state.current_pid = info.pid
            state.current_sid = info.sid
        },
        RESET_USER: state => {
            state.customerInfo = {}
            state.user = {}
            state.permissions = []
            state.products = []
            state.subs = []
            state.role = ''
            state.current_pid = ''
            state.current_sid = ''
            state.userId = ''
        }
    },
    getters: {
        sidebar: state => state.sidebar,
        addRouters: state => state.addRouters,
        customerInfo: state => state.customerInfo,
        user: state => state.user,
        role: state => state.role,
        avatar: state => state.avatar,
        permissions: state => state.permissions,
        products: state => state.products,
        subs: state => state.subs,
    },
    actions: {
        // 用户登录
        UserLogin({ commit, state }, param) {
            return new Promise((resolve, reject) => {
                Axios({
                    method: 'post',
                    url: '/system/login',
                    data: param.account,
                    dataType: 'json',
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        biyiCaptchaKey: param.verify.vcodeKey,
                        biyiCaptcha: JSON.stringify({
                            code: param.verify.vcode
                        })
                    }
                })
                    .then(data => {
                        if (data.token) {
                            setToken(data.token) //把登录状态保存到cookies,表示已经成功登录
                        }
                        resolve(data)
                    })
                    .catch(err => {
                        // console.log(err)
                        reject(err)
                    })
            })
        },
        // 登出
        UserLogout({ commit }) {
            return new Promise(resolve => {
                Axios({
                    url: '/login/logout',
                    method: 'post'
                })
                    .then(data => {
                        commit('RESET_USER')
                        sessionStorage.setItem('login', null) //
                        removeToken()
                        location.reload() // 为了重新实例化vue-router对象 避免bug
                        resolve(data)
                    })
                    .catch(() => {
                        commit('RESET_USER')
                        sessionStorage.setItem('login', null) //
                        removeToken()
                        location.reload() // 为了重新实例化vue-router对象 避免bug
                        resolve()
                    })
            })
        },

        // 前端 登出
        FedLogout({ commit }) {
            return new Promise(resolve => {
                commit('RESET_USER')
                sessionStorage.setItem('login', null) //
                removeToken()
                location.reload() // 为了重新实例化vue-router对象 避免bug
                resolve()
            })
        },
        // 获取用户信息
        GetInfo({ commit, state }, params) {
            return new Promise((resolve, reject) => {
                Axios({
                    // url: '/system/menu/queryByRoleId',
                    url: '/system/cscpCurrentUserPermission',
                    method: 'get',
                })
                    .then(userInfo => {

                        // console.log(userInfo)

                        //把权限数组转换成键值对保存
                        let userPermission = {}
                        userInfo.data.permissionList.forEach(key => {
                            if(key){
                                userPermission[key.replace(/\./g, ':')] = true
                            }

                        })

                        userInfo.permissionList = userPermission
                        commit('SET_USER', userInfo.data) //储存用户信息
                        // setToken() //cookie保存登录状态,仅靠vuex保存的话,页面刷新就会丢失登录状态

                        resolve(userInfo)

                    })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            })
        },
        // 路由生成器
        GenerateRoutes({ commit, state }, { router, isStatic }) {

            let sRoutes = router.options.routes //从js中获取的静态路由
            let dRoutes = [] //动态路由

            // 把获得的json搅和成路由表
            let _blender = (data, parentTitle) => {
                let state = data.state || data.sref
                // console.log('-----------',state)
                let hasChildren = (data.items && data.items.length > 0)  || data.hasChildren === 'true' || data.hasChildren === true // 不管获得的ture是字符串还是啥子都转成布尔值
                let title = parentTitle ? `${ parentTitle } - ${ data.title }` : data.title
                // let title = data.title + parentTitle

                //按条件拼装组件地址
                let component = state.replace(/_/g, '/')
                let Reg_bui = new RegExp(/^bui\/.*/) // bui开头的都是前端demo页面
                if (Reg_bui.test(component)) {
                    component = component + '/demo-' + component.match(/[^/]+$/g)
                }else{
                    // 其他的都是业务页面 都放在pages目录下
                    component = 'pages/' + component + '/index'
                }

                if (!hasChildren) {
                    for (let i = 0, len = sRoutes.length; i < len; i++) {
                        // 凡是静态路由表中存在的就不再加入动态路由
                        if (sRoutes[i].path.replace(/\//, '') === state) {
                            return false
                        }
                    }
                    if (getAllChildrens[state]) {
                        // 如果存在子路由就插入
                        dRoutes.push({
                            name: title,
                            path: '/' + state,
                            component: () => import(`@/${ component }.vue`), //根据json中的state值计算component路径
                            children: getAllChildrens[state],
                            query: { id: '' },
                            meta: data.meta
                        })
                    }else{
                        dRoutes.push({
                            name: title,
                            path: '/' + state,
                            component: () => import(`@/${ component }.vue`),
                            query: { id: '' },
                            meta: data.meta
                        })
                    }
                }
                if (hasChildren) {
                    if (data.subMenu && data.subMenu.length > 0) {
                        blender(data.subMenu, title)
                    }else if(data.items && data.items.length > 0){
                        blender(data.items, title)
                    }else{
                        console.error('sidebar数据错误！设置了hasChildren但未设置对应的subMenu内容，请检查你的_route.js文件或是异步sidebar的json')
                    }
                }
            }
            let blender = (data, parentTitle) => {
                for (let i = 0, len = data.length; i < len; i++) {
                    _blender(data[i], parentTitle)
                }
            }

            // let testArr = []
            return new Promise((resolve, reject) => {
                // 纯静态模式 不加载远程数据
                if (isStatic) {
                    let response
                    if (getAllChildrens.mainMenu) {
                        response = [...getAllChildrens.mainMenu]
                    }
                    commit('SET_SIDEBAR', response) // 把json发到vuex给sidebar用
                    blender(response) // 搅和
                    commit('SET_ROUTERS', dRoutes) // 搅和完成装入
                    // console.log('动态路由获取成功');
                    resolve()
                }else{
                    // 这里载入sidebar 的 JSON
                    Axios({
                        // url: 'admin/sidebar',
                        url: '/system/menu/queryByRoleIdIerm',
                        method: 'post',
                        data: { userId: state.userId }
                    })
                        .then(response => {
                            // 拼接文件夹中的目录内容
                            // console.log('xxxxxxxxxxxxx',response)
                            response = response.data.items
                            // console.log(response)
                            if (getAllChildrens.mainMenu) {
                                response = [...response, ...getAllChildrens.mainMenu]
                            }
                            // console.log(response)
                            commit('SET_SIDEBAR', response) // 把json发到vuex给sidebar用
                            blender(response) // 搅和
                            commit('SET_ROUTERS', dRoutes) // 搅和完成装入
                            // console.log('动态路由获取成功');
                            resolve()
                        })
                        .catch(error => {
                            console.log(error)
                            reject(error)
                        })
                }

            })
        },

    }
}
