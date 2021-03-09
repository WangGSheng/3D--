/************
 * 获取所有业务页面中自定义的子路由
 * Created by donkey on 2017/12/25
 ************/


// 带有"$"或者"_"的文件夹都不进行匹配,且文件名必须是"_"开头

const childrens = (r => {
    return r.keys().map(key => r(key));
})(require.context('@/pages', true, /_route\.js$/))


let obj = {} // 总路由对象表
let mainMenu = [] // 当前页面路由
let subMenu = [] // 当前页面子路由

childrens.map(o => {
    if(o.default){
        // 获取子路由的内容，子路由内容一般排在其他信息之后
        if(o.default.length > 1){
            mainMenu.push(o.default[0])
            subMenu.push(o.default[1])
        }else{
            mainMenu.push(o.default[0])
        }

    }
})

Object.assign(obj, ...subMenu)

// 把得到的侧栏目录输出
if(mainMenu.length > 0 ){
    obj.mainMenu = mainMenu
}

export default obj
