let fs = require('fs');
let path = require('path');
const shell = require('shelljs');

let filePath = path.join(__dirname, '../src/bui/package.json')

// 获取bui版本数据
let json = fs.readFileSync(filePath, 'utf8')
let jsonObj = JSON.parse(json)
let ver = jsonObj.version
let verArr = ver.split('.')

// 改写版本号（版本号加1）
jsonObj.version = `${ verArr[0] }.${ verArr[1] }.${ +verArr[2] + 1 }`

// 写入文件执行发布
fs.writeFile(filePath, JSON.stringify(jsonObj), 'utf-8', (err) => {
    if (err) {
        return console.error(err)
    }
    shell.exec('npm publish src/bui  --registry http://182.43.86.226:4873')
});
