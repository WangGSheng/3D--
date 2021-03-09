/************
 * 一键创建组件及业务配套的文件及文件夹
 * Created by donkey on 2018/5/23
 *
 * 创建方式: 只需要敲入路由中的state值即可
 * (例如敲入: bui_xxx 即可创建组件所需要的sidebar json以及相关文件和文件夹)
 *
 *************/
const inquirer = require('inquirer');
const path = require('path')
const ROOT_PATH = path.join(__dirname, '..', './')   //项目根路径
const fs = require('fs')
const dbJson = `${ROOT_PATH}static/json/db.json`
const json = require(dbJson)
const SIDE_BAR = json.sidebar.returnData


let STATE; //把输入的state放入全局
let TITLE; //把输入的title放入全局

// input内容
function prompt(question, callback) {
    let stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(`\x1b[36m${question} \x1b[0m`);

    stdin.once('data', function(data) {
        callback(data.toString().trim());
    });
}

// 检查文件夹是否存在  bui_dateTimePicker
function fsExistsSync(path) {
    try{
        fs.accessSync(path, fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

// 一个递归工具函数
function getNodes(state, nodes) {
    for (let i = 0, len = nodes.length; i < len; i++) {
        let node = nodes[i];
        if (node.state === state) {
            return true;
        }
        if (node.subMenu) {
            if (getNodes(state, node.subMenu)) {
                return true;
            }
        }
    }
    return false;
}

// 失败的消息
function warning(txt) {
    return process.stdout.write(`\n\x1b[41m\x1b[30m ! \x1b[0m \x1b[31m${txt}!\x1b[0m \n \n`)
}

// 成功的消息
function success(txt) {
    return process.stdout.write(`\n\x1b[42m\x1b[30m ✔ \x1b[0m \x1b[32m${txt}!\x1b[0m \n \n`)
}

// 复制模版文件
function moveFile(type, stateName) {
    let folder = `${ROOT_PATH}build/sample/${type}/`
    let url
    fs.readdir(folder, (err, files) => {
        if (err) throw err
        files.forEach(file => {
            let sourceFile = folder + file
            let destPath
            switch(type){
                case 'api':
                    destPath = `${ROOT_PATH}src/bui/$bui/${stateName}/${file.replace('api', stateName)}`
                    break
                case 'components':
                    destPath = `${ROOT_PATH}src/bui/${stateName}/${file.replace('components', stateName)}`
                    break
                case 'pages':
                    destPath = `${ROOT_PATH}src/pages/${stateName}/${file}`
                    break
            }

            if (type === 'pages') {
                // 复制后端模版
                fs.writeFileSync(destPath,
                    fs.readFileSync(sourceFile, 'utf8')
                        .replace(/\$\{stateName\}\$/g, STATE)
                        .replace(/\$\{url\}\$/g, stateName)  // 后端这里stateName变成这种了  xxx/xxx
                )

            }else{
                // 复制前端模版
                fs.writeFileSync(destPath,
                    fs.readFileSync(sourceFile, 'utf8')
                        .replace(/\$\{stateName\}\$/g, stateName)
                        .replace(/\$\{title\}\$/g, TITLE)
                )
            }
            console.log(destPath);
        });
        process.exit()
    })
}

// 创建前端文件夹修改json
function buildFed(path, input, type) {
    return new Promise((resolve, reject) => {
        if (fsExistsSync(path)) {
            warning(`"${path}" 文件夹已经存在,请勿重复创建`)
            init()
        }else{
            let typeName = (type === 'api') ? 'API' : '组件'
            prompt(`请为你的${typeName}创建title:`, function(title) {
                TITLE = title
                let num = 0
                for (let i = 0, len = SIDE_BAR.length; i < len; i++) {
                    if (SIDE_BAR[i].state === type) {
                        SIDE_BAR[i].subMenu.push({
                            'title': title,
                            'state': input,
                            'hasChildren': 'false'
                        })
                        fs.mkdir(path, function(err) {
                            if (err) throw err;
                            json.sidebar.returnData = SIDE_BAR
                            let modData = JSON.stringify(json)
                            fs.writeFile(dbJson, modData, (err) => {
                                if (err) throw err;
                                resolve(typeName)
                            })
                        })
                        break
                    }else{
                        if(SIDE_BAR.length === num){
                            console.log(`未找到json中的对应节点: ${type}`);
                        }
                    }
                }
            })
        }

    })
}

// 创建后端文件及文件夹
function buildBed(path, stateArr) {
    return new Promise((resolve, reject) => {
        if (fsExistsSync(path)) {
            warning(`"${path}" 文件夹已经存在,请勿重复创建`)
            init()
        }else{
            if (fsExistsSync(`${ROOT_PATH}src/pages/${stateArr[0]}`)) {
                fs.mkdir(`${ROOT_PATH}src/pages/${stateArr[0]}/${stateArr[1]}`, function(err) {
                    if (err) throw err;
                    resolve('success')
                })
            }else{
                fs.mkdir(`${ROOT_PATH}src/pages/${stateArr[0]}`, function(err) {
                    if (err) throw err;
                    fs.mkdir(`${ROOT_PATH}src/pages/${stateArr[0]}/${stateArr[1]}`, function(err) {
                        if (err) throw err;
                        resolve('success')
                    })
                })
            }
        }

    })
}

function init() {
    // 弹出说明
    process.stdout.write(`\n\x1b[42m\x1b[30m \x1b[0m \x1b[32m使用说明:\x1b[0m \n \n`)
    process.stdout.write(`① 创建自定义组件:  敲入bui_xxx 即可创建组件所需要的sidebar json以及相关文件和文件夹\x1b[0m \n`)
    process.stdout.write(`② 创建通用方法:   敲入bui_$bui_xxx 即可创建通用方法相关文件和文件夹\x1b[0m \n`)
    process.stdout.write(`③ 创建业务代码:   敲入xxx_xxx 或 xxx_xxx_xxx 即可创建相关文件和文件夹\x1b[0m \n \n`)

    // 开始
    prompt('请输入你的state名称:', function(input) {
        STATE = input
        let stateArr = input.split('_')  // 分离state
        let stateExist = getNodes(input, SIDE_BAR) // 检查json

        if (stateArr.length < 2) {
            warning('state命名有误(请参考这个格式:"xxx_xxx")')
            init()
        }
        else if (stateExist) {
            warning('你的组件名称已经存在,请不要重复建立组件')
            init()
        }
        // 前端 创建工具类
        else if (stateArr[0] === 'bui' && stateArr[1] === '$bui') {

            if (!stateArr[2]) {
                warning('你工具类state命名有误(请参考这个格式:"bui_$bui_xxx")')
                init()
            }else{
                let path = `${ROOT_PATH}src/${stateArr[0]}/${stateArr[1]}/${stateArr[2]}`;
                buildFed(path, input, 'api').then((typeName) => {
                    moveFile('api', stateArr[2])
                    success(`${typeName}创建成功, 记着要手动添加到GIT哦!`)
                })

            }
        }
        // 前端 创建组件
        else if (stateArr[0] === 'bui' && stateArr[1] !== '$bui') {

            let path = `${ROOT_PATH}src/${stateArr[0]}/${stateArr[1]}`;
            buildFed(path, input, 'components').then((typeName) => {
                moveFile('components', stateArr[1])
                success(`${typeName}创建成功, 记着要手动添加到GIT哦!`)
            })
        }
        // 后端 创建业务
        else{
            let path = `${ROOT_PATH}src/pages/${stateArr[0]}/${stateArr[1]}/`;
            buildBed(path, stateArr).then(() => {
                moveFile('pages', `${stateArr[0]}/${stateArr[1]}`)
                success(`业务文件及文件夹创建成功, 记着要手动添加到GIT哦!`)
            })
        }
    });
}

init()
