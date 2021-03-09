<style lang="scss" scoped>
    @import "./gridCont.scss";
</style>
<template>
    <div class="ui flex flex-1 column p-40 p-r-0 main-cont " v-loading="!show" element-loading-background="rgba(0, 0, 0, 0)">
        <div class="title p-r-45" v-show="show">
            {{title}}
            <span class="meta">{{meta}} （共{{ list.length }}个）</span>
            <div class="fl-r t-r dis-i-b w-30p">
                <div v-if="list.length > 10" class="ui left icon input" :class="{loading:searchLoading}">
                    <input v-model="searchVal" type="text" placeholder="请输入筛选关键字...">
                    <i class="search icon"></i>
                    <a class="times" title="清空" @click.stop="clearInput">
                        <i class="times icon"></i>
                    </a>
                </div>
                <!--<button class="ui inverted teal button mini" @click="openPopup">
                    <i class="add icon"></i>
                    添加
                </button>-->
            </div>
        </div>
        <div v-show="show" class="flex-1 box" :class="boxClass" style="height:0">
            <ui-scrollbar ref="scrollbar">
                <div class="wrapper" v-if="dataList">
                    <div class="ui card" v-for="(item, index) in dataList" :key="index" @click="routerTo(item)">
                        <div class="cont">
                            <strong class="ui-ellipsis dis-i-b w-100p">{{item.title}}</strong>
                            <div class="right floated meta">
                                <a @click.stop="edit">
                                    <i class="icon pencil "></i>
                                </a>
                                <a @click.stop="del">
                                    <i class="icon trash "></i>
                                </a>
                            </div>
                        </div>
                        <div class="image">
                            <img :src="item.image"/>
                        </div>
                    </div>
                </div>
            </ui-scrollbar>
        </div>
        <router-view class="mask"/>
    </div>
</template>
<script>
    import { debounce } from 'lodash'

    let debounceRun = debounce(function(cb) {
        cb && cb()
    }, 500)

    export default {
        name: 'grid-cont',
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                list: this.data.list,
                title: this.data.title,
                meta: this.data.meta,
                category: this.$route.matched[0].path,
                searchVal: '',
                searchLoading: false,
                dataList: null,
                boxClass: 2,
                show: true
            }
        },
        mounted() {
            this.init()

            // 是否显示阴影
            let scrollbar = this.$refs.scrollbar.$el
            this.$nextTick(() => {
                if (scrollbar.children[0].scrollHeight > scrollbar.offsetHeight) {
                    scrollbar.children[0].addEventListener('scroll', this.setBoxshadow)
                    this.boxClass = 'bottom'
                }
            })
        },
        watch: {
            'searchVal': {
                handler(val) {
                    let vm = this
                    let result = this.list
                    this.searchLoading = true
                    if (val) {
                        debounceRun(() => {
                            result = result.filter((item) => {
                                return item.title.toUpperCase().indexOf(this.searchVal.toUpperCase()) !== -1
                            })
                            if (result.length > 0) {
                                vm.dataList = result
                            }else{
                                this.$message('未查询到相关内容')
                                vm.dataList = vm.list
                            }
                            this.searchLoading = false
                        })
                    }else{
                        vm.dataList = vm.list
                        this.searchLoading = false
                    }

                }
            },
            'data.list': {
                handler(val) {
                    this.list = val
                    this.dataList = null
                    setTimeout(() => {
                        this.$set(this, 'dataList', val)
                        this.init()
                    })

                }
            }
        },
        methods: {
            init() {

                this.show = false

                // 载入数据
                this.dataList = this.list
                // 载入封面
                this.list.map((item, i) => {
                    if (!item.id) {
                        console.error('数据缺少id请检查！')
                        return
                    }
                    if (!item.image) {
                        this.cover(item.id).then((module) => {
                            this.$set(this.list[i], 'image', module.default)
                        })
                    }
                })

                setTimeout(() => {
                    this.show = true
                },300)

            },
            setBoxshadow(e) {
                if (e.target.scrollTop === 0) {
                    // console.log(1)
                    this.boxClass = 'bottom'
                }else if (e.target.scrollTop === e.target.scrollHeight - this.$refs.scrollbar.$el.offsetHeight) {
                    // console.log(2)
                    this.boxClass = 'top'
                }else{
                    // console.log(3)
                    this.boxClass = 'bottom top'
                }
            },
            clearInput() {
                this.searchVal = ''
            },
            routerTo(item) {
                this.$router.push({
                    path: `${ this.category }/${ item.id }`,
                    query: { title: this.title + ' / ' + item.title }
                })
            },
            cover(id) {
                let cover = () => import(`@/pages${ this.category }/code/_${ id }_cover.js`)
                return cover()
            },
            openPopup() {
                let vm = this
                this.$bui.drawer({
                    comp: () => import('./_gridCont_popup.vue'),
                    params: {
                        title: '添加代码',
                        route: this.$route
                    },
                    size: {
                        width: '500px',
                        top: '0',
                        right: '0'
                    },
                    animate: {
                        in: 'slideInRight',
                        out: 'slideOutRight'
                    },
                    closeBtn: false,
                    callback(t) {
                        if (t === 'succeed') {
                            // console.log(t)
                            vm.$parent.init()
                        }
                    }
                })
            },
            edit() {
                console.log('edit')
            },
            del() {
                console.log('del')
            }
        },
        beforeDestroy() {
            this.$refs.scrollbar.$el.children[0].removeEventListener('scroll', this.setBoxshadow)
        }

    }
</script>
