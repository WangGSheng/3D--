/**
 * table表格公共混入方法
 */
/*eslint-disable*/
let loadingInstance //laoding蒙层
export default {
    data() {
        return {
            url: null, // 默认的会被自动拼接的url
            staticUrl: null, // 自定义的url 会与baseURL拼接
            testUrl: null, // 写模版时候的假数据
            tabObj: {
                content: [], //table数据
                tableDom: '', //当前表格的dom范围
                total: 0, //分页总条数
                totalPages: 0, //分页总页数
                loading: null
            },
            searchData: {
                pageNumber: 1,
                pageSize: 20
            },
            form: {}, //整行编辑的行级form
            index: 0, //用于整行编辑
            editedList: [],
            tbHeight: 0,
            currentRowId:''
        }
    },
    created() {

        // 根据路由path自动获取当前页面的json根路径
        this.url = this.url || this.$route.path.replace(/_/, '/').replace(/\/?/, '') + '/'

        // 监听topAccordion控制按钮的点击事件
        this.$store.watch(
            state => state.tableEdit.topAccordion,
            () => {
                setTimeout(() => {
                    this.$$setTabHeight()
                }, 200)
            }
        )
    },
    mounted() {
        this.$$setTabHeight()

        //el-table有横向滚动条时提示用户
        this.$nextTick(() => {
            // 初次进入需要显示loading画面
            this._setLoading(true)
            // 初次进入小提示
            const $table = window.jQuery(this.$el || this).find('.el-table') //el-tabl DOM
            if ($table.hasClass('el-table--scrollable-x')) {
                // 给予用户操作小提示
                if (!window.sessionStorage.getItem('notify')) {
                    setTimeout(() => {
                        this._notify()
                    }, 1000)
                }
            }
        })
    },
    beforeDestroy() {
        // 离开页面清理提示
        this.instanceNotify && this.instanceNotify.close()
    },
    methods: {
        _setLoading(flag) {
            //设置全局loading状态
            if (flag) {
                if(!loadingInstance){
                    loadingInstance = window.ELEMENT.Loading.service({
                        target:'#app-router',
                        background: 'rgba(0, 0, 0, .25)'
                    })
                    this.tabObj.loading = true
                }
            } else {
                if(loadingInstance){
                    loadingInstance.close()
                    loadingInstance = null
                }
                this.tabObj.loading = null
            }


        },
        // 载入数据
        $$uiTableLoad(STATIC_URL) {
            let obj = this.tabObj
            let sData = this.searchData

            this._setLoading(true)

            if (!this.staticUrl) {
                // 如果有静态传入的json就
                this.staticUrl = STATIC_URL
            }

            return new Promise((resolve, reject) => {
                    this.$http({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        dataType: 'json',
                        url: STATIC_URL || this.staticUrl || this.url,
                        method: 'POST',
                        data: JSON.stringify(sData)
                    }).then(res => {
                        res = res.data
                        if (res.hasOwnProperty('total')) {
                            // console.log(obj)
                            obj.content = res.content
                            obj.total = res.total
                            obj.totalPages = res.totalPages
                            sData.pageNumber = res.pageNumber
                            sData.pageSize = res.pageSize
                        }else{
                            obj.content = res
                        }
                        Object.freeze(obj) //单向绑定
                        this._setLoading(false)
                        resolve(res)
                    }).catch(error => {
                        this._setLoading(false)
                        this.$message.error('数据加载失败:' + error)
                    })


                    /*this.$http
                        .post(STATIC_URL || this.staticUrl || this.url + 'dataList', sData)
                        .then(res => {
                            if (res.hasOwnProperty('total')) {
                                obj.content = res.content
                                obj.total = res.total
                                obj.totalPages = res.totalPages
                                sData.pageNumber = res.pageNumber
                                sData.pageSize = res.pageSize
                            } else {
                                obj.content = res
                            }
                            Object.freeze(obj) //单向绑定
                            this._setLoading(false)
                            resolve(res)
                        })
                        .catch(error => {
                            this._setLoading(false)
                            this.$message.error('数据加载失败:' + error)
                        })*/
            })
        },

        // 提示用户横向滚动的方式
        _notify() {
            this.instanceNotify = this.$notify({
                title: '小提示',
                message: '按住Shift键后滚动中键,可左右滚动表格',
                position: 'bottom-right',
                type: 'info',
                onClose() {
                    window.sessionStorage.setItem('notify', 'close')
                }
            })
        },
        // 指定 Table 组件的 row-class-name 属性来为 Table 中的某一行添加 class，表明该行处于某种状态。
        $$rowClassName({ row, rowIndex }) {
            let className = ''

            // 30分钟内被编辑过的行
            if (row.is_new === '-1') {
                className += ' edited-tr '
            }

            // 根据url参数被高亮的行
            const qid = this.$route.query.id //根据query.id控制高亮行
            const highlightKey = this.$refs.table.currentRowKey || 'id' //取el-table的current-row-key参数,不传默认为id
            // console.log(highlightKey)
            if (row[highlightKey] === qid || row[highlightKey]==this.currentRowId) {
                className += ' highlignt-tr '
            }

            return className
        },
        //点击行的时候高亮
        $$rowClick(row) {
            const highlightKey = this.$refs.table.currentRowKey || 'id'
            this.currentRowId = row[highlightKey];
        },
        //设置表格的固定高度,起到可以锁定表头的作用
        $$setTabHeight() {
            setTimeout(() => {
                const $content = jQuery('.el-table').parents('.ui.content')
                this.tbHeight = $content.height()

                this.$refs.table && this.$refs.table.doLayout() //重绘表格,el-table 2.9.1+ 防止合计被顶下去
            }, 300)
        },
        //打开模态框子路由 (scope 是点击时候传入的scope对象)
        $$openModal(router, scope) {
            this.$router.replace({
                path: router,
                //给子路由传递参数 ( model : true 表示显示遮罩层)
                query: { backpath: this.$route.path, model: true }
            })
        },
        //打开平铺子路由
        $$openFlat(router, scope) {
            //this.setDB(scope)
            this.$router.push({
                path: router,
                query: { backpath: this.$route.path }
            })
        },
        $$reloadPage() {
            this.$$uiTableLoad()
        },
        $$pageSizeChange(num) {
            this.searchData.pageSize = num
            this.$$reloadPage(num)
        },
        //分页相关的公共方法，页面变化的时候
        $$pageChange(num) {
            //pageNumber的只为val
            this.searchData.pageNumber = num
            this.$$reloadPage(num)
        },
        //为后续设定连续计数
        $$indexMethod(index) {
            let curPageNum = +this.searchData.pageNumber
            let pageSize = +this.searchData.pageSize
            if (curPageNum > 1) {
                return index + (pageSize * curPageNum - pageSize) + 1
            }
            return index + 1
        },
        //整行编辑的确定取消公共方法
        $$trEditCancel() {
            if (this.form.hasOwnProperty('id') && (this.form.id + '').indexOf('ls') >= 0) {
                let last = this.tabObj.content.length - 1
                this.tabObj.content.splice(last, 1)
            }
        },
        $$trEditConfirm() {
            if (this.form.hasOwnProperty('id') && (this.form.id + '').indexOf('ls') >= 0) {
                this.form.id = null
            }

            this.$http({
                headers: { 'Content-Type': 'application/json' },
                dataType: 'json',
                url: this.url + 'saveOrUpdate',
                method: 'post',
                data: JSON.stringify(this.form)
            })
                .then(data => {
                    if (this.treeDataLoad) {
                        this.treeDataLoad()
                    } else {
                        this.$$uiTableLoad()
                    }
                })
                .catch(error => {
                    this.$message.error('提交失败:' + error)
                })
        },
        //整行编辑公共的编辑方法
        $$trEdit(index, rowData, trEditId) {
            this.index = +this.$$indexMethod(index)
            this.form = JSON.parse(JSON.stringify(rowData))
            this.$nextTick(() => {
                this.$store.commit('trEdit/change', {
                    index: index,
                    trEditId: trEditId
                })
            })
        },
        //整行编辑添加一条函数
        $$trEditAdd(tableId) {
            // let id = 'ls' + new Date().getTime()
            for (let row in this.rowTpl) {
                this.form[row] = this.rowTpl[row]
            }
            // this.form.id = id
            let obj = Object.assign({}, this.form)
            this.tabObj.content.push(obj)
            let last = this.tabObj.content.length - 1
            this.$nextTick(() => {
                this.$el.querySelector(
                    (tableId ? '#' + tableId + ' ' : '') + '.el-table__body-wrapper'
                ).scrollTop = 10000
            })
            this.$$trEdit(last, this.tabObj.content[last], 'table_1')
        },
        $$deleteRow(scope, call) {
            let id = scope.row.id + ''
            if (id && id.indexOf('ls') >= 0) {
                this.$confirm('确认删除空数据?', '提示', {
                    callback: () => {
                        let last = this.tabObj.content.length - 1
                        this.tabObj.content.splice(last, 1)
                        if (call) return call()
                    }
                })
            } else {
                this.$bui.httpConfirm({
                    content: 'delete',
                    url: this.url + 'delete',
                    data: {
                        id: id
                    },
                    success: data => {
                        this.$$uiTableLoad()
                        if (call) return call(data)
                    }
                })
            }
        },
        // 给删选器的直接搜索公共方法
        $$directSearch() {
            this.searchData.pageNumber = 1
            this.$$uiTableLoad()
        }
    }
}
