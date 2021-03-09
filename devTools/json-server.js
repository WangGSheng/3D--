/************
 * json 服务器
 * Created by donkey on 2017/4/20
 ************/
var path = require('path');
var jsonServer = require('json-server');
var jServer = jsonServer.create();
jServer.use(jsonServer.defaults());

//获取外部传入的参数
var time = process.argv[process.argv.length - 1].replace('--', '');

// 或者自己建立json
var jsonRouter = jsonServer.router(path.resolve('./')+'/public/json/db.json');

//你可以选择加载生成的数据
var jsonGenerate = require(path.resolve('./') + '/devTools/json-generate.js');
jServer.get('/faker/1', (req, res) =>{
    //res.jsonp(jsonGenerate())
    res.json(jsonGenerate.one())
});
jServer.get('/faker/2', (req, res) =>{
    res.json(jsonGenerate.two())
});

// 侧栏
jServer.post('/permission/admin/sidebar', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('sidebar').value()
    res.jsonp(data.returnData)
})

// 用户授权
jServer.post('/permission/login/auth', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('auth').value() //这里的login就是db中的key
    res.jsonp(data)
})
// 用户登录
jServer.post('/permission/login/getInfo', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('getInfo').value()
    res.jsonp(data)
})

//人员管理页面列表
jServer.post('/permission/PersonnelManagement/Lists', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('table').value()
    res.jsonp(data)
})

//写页面的测试数据
jServer.post('/permission/Test/Lists', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('testTable').value()
    res.jsonp(data)
})

//mx-graph数据
jServer.get('/permission/mx-graph', function(req, res) {
    let db = jsonRouter.db
    let data = db.get('mxGraph').value()
    res.jsonp(data)
})

// 设置json加载延迟
jServer.use('/api', function(req, res, next){
    setTimeout(next, time)
    //next();
});
jServer.use('/api', jsonRouter);
jServer.listen(4044, function(){
    console.log('\x1b[42m\x1b[30m JSON服务启动成功 \x1b[0m');
    /*console.log('\x1b[36m%s\x1b[0m', '静态json请求地址 : /api/你的json名称');
    console.log('\x1b[36m%s\x1b[0m', '配置json物理地址 : '+ path.resolve('./')+'/public/json/db.json');
    console.log('\x1b[36m%s\x1b[0m', '动态json请求地址 : /faker/你的json名称');
    console.log('\x1b[36m%s\x1b[0m', '动态生成json配置物理地址 : ' + path.resolve('./') + '/devTools/json-generate.js');*/
    console.log('\x1b[36m%s\x1b[0m', '延迟 : ' + time + 'ms \n');
});

//module.exports = function(){};
