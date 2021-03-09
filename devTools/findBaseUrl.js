// 查询devTools/baseUrl.js是否存在 如果不存在就不提示解压baseUrl.rar
const path = require('path');
const fs = require('fs');
const FILE_PATH = path.resolve(__dirname, './baseurl.js'); //目标文件,最后会在index.html中引用

fs.exists(FILE_PATH, function(exists) {
    // 如果目标文件不存在
    if(!exists){
        console.log(`\x1b[41m\x1b[33m 严重错误! \x1b[0m 项目缺少baseUrl.js文件，请检查你的前端项目目录下的\n "devTools/baseUrl.rar" 文件是否已经解压，\n解压完成后请npm执行一次 "切换前后端BaseUrl"`)
    }
})
