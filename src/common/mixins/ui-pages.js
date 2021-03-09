/**************
 * 子路由公共混入方法
 **************/
/*import { isEqual } from 'lodash'
let loadingInstance // laoding蒙层
export default {
    data() {
        return {
            storeState:false, // loading的状态
            oldFormData:null, // 保存初始化表单数据
            save:false  // 是否是保存操作状态
        }
    },
    /!*provide() {
        /!****** 此方法只为编辑后锁表单创建 ******!/
        const nestFormData = {}
        Object.defineProperty(nestFormData, 'data', {
            enumerable:true,
            get:() => {
                return {
                    form:this.form,
                    state:this.storeState
                }
            }
        })
        return { nestFormData }
        /!****** end ******!/
    },*!/
    mounted() {
        // dom加载完成后显示loading
        this.$nextTick(() => {
            loadingInstance = this.$loading({ // 开始loading画面
                target:'.ui-nest'
            });
        })
        this.init()
    },
    methods:{
        init() {
            //存储上一步路由
            // this.$store.commit('SET_URL', this.$router.history.current);

            // console.log(this.$store.getters.stopGoBack)

            //监听刷新
            window.addEventListener('beforeunload', this.reloadLock);
            //数据初始化
            if(this.form && this.$route.meta.formAdd){ // 如果是添加页面
                this.$nextTick(() => {
                    loadingInstance.close(); // 关闭loading画面
                    this.oldFormData = Object.assign({}, this.form)  // 否者直接克隆一份
                })
            }else{
                let unwatch = this.$watch('form', (val) => { // 创建一个可以关闭的监听器
                    this.oldFormData = Object.assign({}, this.form) // 克隆一份初始化的表单数据
                    unwatch() // 当表单数据加载完毕就关闭监听
                    loadingInstance.close() // 关闭loading画面
                })
            }
            //监听关闭按钮事件
            this.$eventHub.$on('closeThis', (v) => {
                this.closeThis(v)
            })
        },
        // 判断当前表单是否被编辑
        checkEdit() {
            if(this.save){ // 当是保存操作时就不做对比
                return true
            }
            return isEqual(this.oldFormData, this.form)
        },
        // 锁定刷新事件
        reloadLock(e) {
            // 如果表单数据没有变化就不锁定
            if(this.checkEdit()){
                return false
            }
            // 否则锁定并提示
            let confirmationMessage = '-_-! 🈚';                        //文本写上去没啥鸟用 这里有说明 https://developer.mozilla.org/zh-CN/docs/Web/Events/beforeunload
            (e || window.event).returnValue = confirmationMessage;     // Gecko and Trident
            return confirmationMessage;                                // Gecko and WebKit
        },
        //点击关闭按钮
        closeThis(v) {
            // 根据传递的关闭事件做出对应的关闭动作
            if(v === 'save'){  // 点击保存按钮无需检测直接返回
                this.save = true
                this.$bui.goBack()
            }else if(typeof v === 'object'){ // 返回到目标位置
                this.$bui.goBack(v)
            }else{ //正常关闭事件
                this.$bui.goBack()
            }
        }

    },
    beforeDestroy() {
        //解除监听刷新
        window.removeEventListener('beforeunload', this.reloadLock);
        //解除关闭监听
        this.$eventHub.$off('closeThis');
        //清除vuex中的当前url
        this.$store.commit('SET_URL', null);
    },
    beforeRouteLeave(to, from, next) {
        if(this.checkEdit()){
            next()
        }else{
            this.$confirm('当前页面还有未保存的内容，确认要离开吗？', '提示', {
                type:'warning'
            }).then(() => {  //点击确认按钮后
                next()
            }).catch(() => { //点击取消按钮后
                next(false)
            });
        }
    }
}*/
