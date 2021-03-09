/************
 * 工具库 - 过滤器
 * 存放本项目相关的过滤器
 ************/

export default {
    install(Vue) {

        //内务系统,合同编号过滤器 001-(17-03-13)-0123 这种格式
        Vue.filter('contract', n => {
            if(!n){
                return n
            }
            let s = n + ''
            if (s.length!==13) {
                return n
            }
            return `${s.substr(0,3)}-(${s.substr(3,2)}-${s.substr(5,2)}-${s.substr(7,2)})-${s.substr(9)}`
        })

        // 格式化为单引号分隔的字符串 例如: 1,2,3 转换 为 '1','2','3'
        Vue.filter('addSingleQuotes', s => {
            if(!s) return false
            return s.replace(/(\b\w+\b)/g, '\'$1\'')
        })
        let addSingleQuotesFN = (s) => {
            if (!s) return false
            return s.replace(/(\b\w+\b)/g, '\'$1\'')
        }
        Object.defineProperty(Vue.prototype.$bui, 'addSingleQuotes', {
            value: addSingleQuotesFN
        });
    }
}
