export default [
    { path: '/', redirect: '/three' },
    { path:'*', component:() => import('@/pages/404.vue') },
    { path:'/login', component:() => import('@/pages/three/index.vue') },
    { path:'/loginFed', component:() => import('@/pages/three/index.vue') },
    // { path:'/welcome', component:() => import('@/pages/login/welcome.vue') },
    // { path:'/welcome', component:() => import('@/pages/login/welcome.vue') },
    { path:'/blank', component:() => import('@/pages/blank.vue') },
    // { path:'/', component:() => import('@/pages/index.vue') }
]
