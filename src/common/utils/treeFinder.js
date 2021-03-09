/**
 - 工具库 - 默认选中树有内容的节点
 - @param data {Array} 传入树的列表数据
 - @param args {url: string & Array, fid: String} 设置需要请求的url，当url是Array时会执行文章类型的http请求，要求必须填入fid
 - @param cb   {function} 需要执行的回调函数。
 - @author donkey 2019/05/21
 - @example
        this.$bui.treeFinder(this.formData.chapterTree, { url: 'admin/file/md/chapter/', fid:'pre_field2' }, (id) => {
            this.currentKey = id
            let node = this.$refs['treeMenu'].uiInstance.getNode(this.currentKey);
            if (node) {
                this.handleClick(node.data, node)
            }
        })
 */

export default {
    install(Vue) {


        let FN = (data, args, cb) => {

            if (!data && !args && !cb) {
                console.warn('请按照正确方式设置函数参数！')
                return false
            }
            if (typeof data !== 'object' && typeof args !== 'object') {
                console.warn('传入的参数必须是对象！')
                return false
            }
            if (typeof cb !== 'function') {
                console.warn('回调方法必须是函数！')
                return false
            }

            let vm = Vue;
            let num = 9  // 设置最大循环次数 限制最多请求http 10次
            let keyArr = [] // 需要进行http查询的内容

            // 获取树的节点值
            let getKey = (data) => {
                for (let i = 0, len = data.length; i < len; i++) {
                    let node = data[i]
                    if (!node.id) {
                        console.warn('json数据缺少 "id"键')
                        return false
                    }
                    if (keyArr.length > num) return //设置最大请求次数
                    keyArr.push({ id: node.id, fid: node[args.fid] })
                    if (node.children && node.children.length > 0) {
                        getKey(node.children)
                    }
                }
            }
            getKey(data);

            //通过id值执行Promise回调
            if (args.url && Array.isArray(args.url)) {
                (async function loop() {
                    for (let i = 0, len = keyArr.length; i < len; i++) {
                        let _url = args.url[0]
                        let ids = null;
                        if (args.fid) {
                            ids = args.fid;
                        }
                        await new Promise(resolve => {
                            vm.prototype.$http
                                .post(_url, {code: keyArr[i].id ,fid:ids})
                                .then(res => {
                                    if (res.content.length > 0) {
                                        data.break = true
                                    }
                                    resolve()
                                })
                                .catch(error => {
                                    resolve()
                                    vm.$message.error('数据加载失败:' + error)
                                })
                        })
                        if (data.break) {
                            return cb && cb(keyArr[i].id)
                        }
                    }
                })();
            }else{
                if (!args.fid) {
                    console.warn('treeFinder函数缺少 "args.fid" 键')
                    return false
                }
                (async function loop() {
                    for (let i = 0, len = keyArr.length; i < len; i++) {
                        let _url = args.url + keyArr[i].fid
                        await new Promise(resolve => {
                            vm.prototype.$http
                                .post(_url, {})
                                .then(res => {
                                    if (res.toString().length > 0) {
                                        data.break = true
                                    }
                                    resolve()
                                })
                                .catch(error => {
                                    resolve()
                                    vm.$message.error('数据加载失败:' + error)
                                })
                        })
                        if (data.break) {
                            return cb && cb(keyArr[i].id)
                        }
                    }
                })();
            }

        }

        Object.defineProperty(Vue.prototype.$bui, 'treeFinder', {
            value: FN
        });
    }
}
