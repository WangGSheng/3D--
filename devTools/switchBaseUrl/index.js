/**
 * 切换 BASE_URL 方便前后端进行开发
 * Created by donkey on 2018/2/6.
 */
const path = require('path');
const readline = require('readline');
const fs = require('fs');
const BASE_URL = require('../baseUrl.js');

const FILE_PATH = path.resolve(__dirname, '../../public/static/libs/baseurl.js'); //目标文件,最后会在index.html中引用

module.exports = !function() {
    fs.exists(FILE_PATH, function(exists) {
        let url, flag, rl
        if (exists) {
            rl = readline.createInterface({
                input: fs.createReadStream(FILE_PATH),
                crlfDelay: Infinity
            });
            let lineIdx = 0;
            rl.on('line', (line) => {
                if (lineIdx < 1) {
                    if (line === '// backend') {
                        url = BASE_URL.bed;
                        flag = 'frontend'
                    }else{
                        url = BASE_URL.fed;
                        flag = 'backend'
                    }
                    // 写入文件内容（如果文件不存在会创建一个文件）
                    // 写入时会先清空文件
                    fs.writeFile(FILE_PATH, `// ${ flag }
                    Object.defineProperty(this, 'BASE_URL', {value:'${ url }'});`
                        , 'utf8', function(err) {
                            if (err) throw err;
                            console.log(`\x1b[33m你的 "BASE_URL" 切换为 :\x1b[34m ${ url }`);
                        });
                }
                lineIdx++;
                rl.close();
            });
        }else{
            // 默认进入后端
            url = BASE_URL.bed;
            flag = 'frontend'

            fs.writeFile(FILE_PATH, `// ${ flag }
            Object.defineProperty(this, 'BASE_URL', {value:'${ url }'});`
                , 'utf8', function(err) {
                    if (err) throw err;
                    console.log(`\x1b[33m你的 "BASE_URL" 为 :\x1b[34m ${ url } \n`);
                });
        }
    })
}()
