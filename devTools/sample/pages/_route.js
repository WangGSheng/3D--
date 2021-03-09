/************
 * 客户信息子路由
 * Created by donkey on 2018/3/10
 ************/
export default [
    {
        ${stateName}$:[
            { //查看
                path:'/${stateName}$/view/:id',
                meta: { formView: true },
                component:() => import('@/pages/${url}$/view.vue')
            }, { //增加
                path:'/${stateName}$/add/',
                meta: { formAdd: true },
                component:() => import('@/pages/${url}$/form.vue')
            }, { //修改
                path:'/${stateName}$/edit/:id',
                meta: { formEdit: true },
                component:() => import('@/pages/${url}$/form.vue')
            }
        ]
    }
]
