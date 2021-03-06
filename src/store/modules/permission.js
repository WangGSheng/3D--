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
        // ????????????
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
                            setToken(data.token) //????????????????????????cookies,????????????????????????
                        }
                        resolve(data)
                    })
                    .catch(err => {
                        // console.log(err)
                        reject(err)
                    })
            })
        },
        // ??????
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
                        location.reload() // ?????????????????????vue-router?????? ??????bug
                        resolve(data)
                    })
                    .catch(() => {
                        commit('RESET_USER')
                        sessionStorage.setItem('login', null) //
                        removeToken()
                        location.reload() // ?????????????????????vue-router?????? ??????bug
                        resolve()
                    })
            })
        },

        // ?????? ??????
        FedLogout({ commit }) {
            return new Promise(resolve => {
                commit('RESET_USER')
                sessionStorage.setItem('login', null) //
                removeToken()
                location.reload() // ?????????????????????vue-router?????? ??????bug
                resolve()
            })
        },
        // ??????????????????
        GetInfo({ commit, state }, params) {
            return new Promise((resolve, reject) => {
                Axios({
                    // url: '/system/menu/queryByRoleId',
                    url: '/system/cscpCurrentUserPermission',
                    method: 'get',
                })
                    .then(userInfo => {

                        // console.log(userInfo)

                        //???????????????????????????????????????
                        let userPermission = {}
                        userInfo.data.permissionList.forEach(key => {
                            if(key){
                                userPermission[key.replace(/\./g, ':')] = true
                            }

                        })

                        userInfo.permissionList = userPermission
                        commit('SET_USER', userInfo.data) //??????????????????
                        // setToken() //cookie??????????????????,??????vuex????????????,????????????????????????????????????

                        resolve(userInfo)

                    })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            })
        },
        // ???????????????
        GenerateRoutes({ commit, state }, { router, isStatic }) {

            let sRoutes = router.options.routes //???js????????????????????????
            let dRoutes = [] //????????????

            // ????????????json??????????????????
            let _blender = (data, parentTitle) => {
                let state = data.state || data.sref
                // console.log('-----------',state)
                let hasChildren = (data.items && data.items.length > 0)  || data.hasChildren === 'true' || data.hasChildren === true // ???????????????ture??????????????????????????????????????????
                let title = parentTitle ? `${ parentTitle } - ${ data.title }` : data.title
                // let title = data.title + parentTitle

                //???????????????????????????
                let component = state.replace(/_/g, '/')
                let Reg_bui = new RegExp(/^bui\/.*/) // bui?????????????????????demo??????
                if (Reg_bui.test(component)) {
                    component = component + '/demo-' + component.match(/[^/]+$/g)
                }else{
                    // ??????????????????????????? ?????????pages?????????
                    component = 'pages/' + component + '/index'
                }

                if (!hasChildren) {
                    for (let i = 0, len = sRoutes.length; i < len; i++) {
                        // ????????????????????????????????????????????????????????????
                        if (sRoutes[i].path.replace(/\//, '') === state) {
                            return false
                        }
                    }
                    if (getAllChildrens[state]) {
                        // ??????????????????????????????
                        dRoutes.push({
                            name: title,
                            path: '/' + state,
                            component: () => import(`@/${ component }.vue`), //??????json??????state?????????component??????
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
                        console.error('sidebar????????????????????????hasChildren?????????????????????subMenu????????????????????????_route.js??????????????????sidebar???json')
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
                // ??????????????? ?????????????????????
                if (isStatic) {
                    let response
                    if (getAllChildrens.mainMenu) {
                        response = [...getAllChildrens.mainMenu]
                    }
                    commit('SET_SIDEBAR', response) // ???json??????vuex???sidebar???
                    blender(response) // ??????
                    commit('SET_ROUTERS', dRoutes) // ??????????????????
                    // console.log('????????????????????????');
                    resolve()
                }else{
                    // ????????????sidebar ??? JSON
                    Axios({
                        // url: 'admin/sidebar',
                        url: '/system/menu/queryByRoleIdIerm',
                        method: 'post',
                        data: { userId: state.userId }
                    })
                        .then(response => {
                            // ?????????????????????????????????
                            // console.log('xxxxxxxxxxxxx',response)
                            response = response.data.items
                            // console.log(response)
                            if (getAllChildrens.mainMenu) {
                                response = [...response, ...getAllChildrens.mainMenu]
                            }
                            // console.log(response)
                            commit('SET_SIDEBAR', response) // ???json??????vuex???sidebar???
                            blender(response) // ??????
                            commit('SET_ROUTERS', dRoutes) // ??????????????????
                            // console.log('????????????????????????');
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
