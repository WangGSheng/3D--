/* eslint-disable */
import Vue from 'vue'
//#region 安装element

//semantic-UI
import '@/scss/index.scss'

// vuex 状态管理
import store from './store'

// 路由集合
import router from './router'

// echarts
/*import mapboxgl from 'mapbox-gl'
window.mapboxgl = mapboxgl
import 'mapbox-gl/dist/mapbox-gl.css'*/
// bui
import { BuiComponents, $buiCommon } from 'bui2'

$buiCommon.inject(Vue) // $bui 公共方法
Vue.use(BuiComponents) // bui 组件

// 业务相关工具库
import utils from './common/utils/index.js'

Vue.use(utils)

import * as THREE from 'three' // 引用Three.js
// Vue.use(THREE)
Vue.prototype.THREE = THREE
/*import mxGraph from '@/common/mxGraph/ui-mx-graph.vue'
Vue.component('ui-mx-graph', mxGraph)*/

// 前后端分离 , 选择性进入前后端不同入口
const importFed = () => import('./App/_frontEndIndex.vue')
const importBed = (process.env.STAGE === 'handbook') ? importFed : () => import('./App/_backEndIndex.vue')
const App = importBed

// 注册自定义全局组件
import commonComponents from './common/components'

Vue.use(commonComponents)

window.API_URL = 'http://203.6.239.8:7070/'
// window.API_URL='http://127.0.0.1:7070'

// 全局开关
Vue.config.productionTip = false // vue 在启动时生成生产提示
Vue.config.addFormCache = false // addFormCache 新增表单页面数据自动缓存
Vue.config.drawerEsc = true //抽屉页面按下Esc键关闭, 默认为开启状态
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
})
