// vue.config.js
const path = require('path');
const webpack = require('webpack')
const chickenSoup = require('./devTools/chickenSoup')

function resolve(dir) {
    return path.join(__dirname, dir)
}

// 接收package 上传递的参数
const configArgv = JSON.parse(process.env.npm_config_argv)
const stage = configArgv.original.pop()
let STAGE
if (stage.indexOf('--') !== -1) {
    STAGE = stage.replace(/--/g, '')
}

// 设置代理地址
// const IP = 'http://10.46.16.252:9000' // 大江
// const IP = 'http://10.46.16.243:9000' //jiancheng
// const IP = 'http://lbsksa.tooo.top:3810' //建成 外网
// const IP = 'http://10.46.16.199:9000'  // xiaoyxiong
const IP = 'http://182.43.86.226:9000'  // 远程

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/monitor/' : '/',
    outputDir: 'dist',
    assetsDir: 'static',
    indexPath: 'index.html',
    pages: {
        index: {
            // page 的入口
            entry: 'src/main.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        }
    },
    // 生产环境是否生成 sourceMap 文件
    productionSourceMap: false,
    // 添加外部引用 public/static/libs
    chainWebpack: config => {
        config.externals({
            // 不从npm安装的目的是不打包这些文件,从index.html引入,以加快dev和build环境的速度.
            'BASE_URL': 'BASE_URL',
            'vue': 'Vue',
            'vue-router': 'VueRouter',
            'jquery': 'jQuery',
            'vuex': 'Vuex',
            'axios': 'axios',
            // 'echarts': 'echarts',
            'element-ui': 'element-ui',
            'Sass': 'Sass',
        })
        // 设置全局变量
        config.resolve.alias
            .set('@', resolve('src'))
            // .set('publicPath',)
        // .set('assets', resolve('src/bui/assets'))
        // .set('scss', resolve('src/bui/scss'))
    },
    configureWebpack: {
        plugins: [
            // 把参数传递给vue使用
            new webpack.DefinePlugin({
                'process.env.STAGE': JSON.stringify(STAGE)
            }),
            new webpack.ProgressPlugin((percentage, message, ...args) => {
                chickenSoup(percentage, message, ...args)
            }),

        ]
    },
    devServer: {
        progress: false,
        open: false,
        host: '0.0.0.0',
        port: 9909,
        https: false,
        hotOnly: false,
        disableHostCheck: true,
        // contentBase: path.join(__dirname, 'dist'),
        proxy: {
            '/permission': {
                // target:'http://rap.taobao.org/mockjs/30588',
                target: 'http://localhost:4044',
                ws: true,//代理websockets
                changeOrigin: true,
                pathRewrite: {
                    '^/permission': '/permission'
                },
                bypass: function(req) { // 解决 echarts.min.js不能引用的问题
                    if (req.url.indexOf('echarts.min.js') > -1) {
                        return '/static/libs/echarts/echarts.min.js';
                    }
                    if (req.url.indexOf('/echarts/dark.js') > -1) {
                        return '/static/libs/echarts/dark.js';
                    }
                }
            },
            '/api': {
                target: IP,
                ws: true,
                changeOrigin: false,
                pathRewrite: {
                    '^/api': '/api'
                }
            },
            '/video': {
                target: 'http://iermd.gzdict.cn:9000',
                ws: true,
                changeOrigin: false,
                pathRewrite: {
                    '^/video': '/api'
                }
            },
        }
    }
}
