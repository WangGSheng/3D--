<style lang="scss" scoped>
    @import "./nestCont";
</style>
<template>
    <div class="ui flex flex-1 column nest-cont">
        <div class="header">
            <strong class="f-18 m-l-20">{{ title }} <sup class="t-blue" v-show="time">*</sup></strong>
            <i class="icon close" @click="close()"></i>
        </div>
        <ui-split-screen v-if="code" left="49%">
            <!--左布局-->
            <div slot="left">
                <div class="toolbar" :class="{single:!time}">
                    <div>
                        <div class="mask"></div>
                        <a href="javascript:" v-if="time">
                            版本切换
                            <span>
                                <span @click="yuanban">官方原版</span>
                                <span @click="xiugaiban">{{time}} <i class="icon times m-l-10"
                                    @click.stop="clearLocalData"
                                    title="清除此本版"></i></span>
                            </span>
                        </a>
                        <a href="javascript:" @click="exportRaw">下载源码</a>
                    </div>
                </div>
                <ui-codemirror v-if="!bye" v-model="code" always-show dark></ui-codemirror>
            </div>
            <!--右布局-->
            <div slot="right">
                <div class="p-20 h-100p w-100p">
                    <ui-display :code="code"></ui-display>
                </div>
            </div>
        </ui-split-screen>
    </div>
</template>
<script>
    import { debounce } from 'lodash'

    let debounceRun = debounce(function(cb) {
        cb && cb()
    }, 600)
    export default {
        name: 'nest-cont',
        props: {
            pageCode: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                title: this.$route.query.title,
                code: null,
                disable: false,
                localData: JSON.parse(localStorage.getItem(this.$route.path)),
                time: null,
                notify: null,
                ver: 0,
                bye: false,
                routePath : this.$store.getters.routeInfo.from.path
            }
        },
        methods: {

            close() {
                this.bye = true
                setTimeout(() => {

                    if (this.$route.matched && this.$route.matched.length > 0 && this.routePath === '/') {
                        this.$router.push(this.$route.matched[0].path)
                    }else{
                        this.$router.push(this.routePath)
                        // this.$router.go(-1)
                    }
                },100)

            },
            listener(e) {
                if (e.key === 'Escape') {
                    this.close()
                }
            },
            exportRaw() {
                function fakeClick(obj) {
                    let ev = document.createEvent('MouseEvents');
                    ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    obj.dispatchEvent(ev);
                }

                function exportRaw(name, data) {
                    let urlObject = window.URL || window.webkitURL || window;
                    let export_blob = new Blob([data]);
                    let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
                    save_link.href = urlObject.createObjectURL(export_blob);
                    save_link.download = name;
                    fakeClick(save_link);
                }

                // console.log(this.code)
                exportRaw(`${ this.title }.vue`, this.code)
            },
            yuanban() {
                this.time = this.localData && this.localData.time
                this.disable = true
                this.code = this.pageCode
                this.$nextTick(() => {
                    this.disable = false
                    this.ver = 0
                    console.log('原版', this.ver)
                })
            },
            xiugaiban() {
                this.disable = true
                this.code = this.localData.code
                this.$nextTick(() => {
                    this.disable = false
                    this.ver = this.localData.time
                    console.log('修改版', this.ver)
                })

            },
            clearLocalData() {
                localStorage.removeItem(this.$route.path)
                this.time = null
                this.code = this.pageCode
            }
        },
        mounted() {

            //先载入官方原版
            this.yuanban()

            //再载入修改版
            if (this.localData) {
                let code = this.localData.code
                let vm = this
                // 如果得到的内容是字符串
                if (Object.prototype.toString.apply(code) === '[object String]') {
                    this.notify = this.$notify({
                        // title: '是否载入上次修改的代码?',
                        dangerouslyUseHTMLString: true,
                        duration: 3000,
                        offset: 30,
                        position: 'top-left',
                        message: '<a href="javascript:"><i class="icon info circle t-teal"></i> 是否载入上次修改的代码? </a>',
                        customClass: 'my-notify',
                        onClick() {
                            vm.xiugaiban()
                            vm.notify.close()
                        }
                    });
                }
            }

            // 监听退出键
            document.addEventListener('keydown', this.listener)
        },
        watch: {
            'code': {
                handler(val, oVal) {
                    let vm = this
                    if (oVal && !this.disable) {
                        debounceRun(() => {

                            if (this.ver === 0 && this.time) {
                                this.notify = this.$notify({
                                    // title: '是否载入上次修改的代码?',
                                    dangerouslyUseHTMLString: true,
                                    duration: 5000,
                                    offset: 30,
                                    position: 'top-left',
                                    message: '<a href="javascript:" style=""> <strong class="f-14"><i class="icon exclamation triangle t-warning"></i> 代码无法保存！</strong><span class="dis-b">点此请载入之前代码，再继续编辑.</span></a>',
                                    customClass: 'my-notify',
                                    onClick() {
                                        vm.xiugaiban()
                                        vm.notify.close()
                                    }
                                })
                                return
                            }

                            if (val !== this.pageCode) {
                                let thisTime = new Date()
                                this.time = this.$bui.formatDate(thisTime, 'yyyy-MM-dd HH:mm')
                                let obj = { time: this.time, code: val }
                                this.localData = obj
                                localStorage.setItem(this.$route.path, JSON.stringify(obj))
                                this.ver = this.localData.time
                            }else{
                                this.clearLocalData()
                            }
                        })
                    }
                }
                // immediate: true,
                // deep: true
            }
        },
        beforeDestroy() {
            if (this.notify) this.notify.close()
            document.removeEventListener('keydown', this.listener)
        }
    }
</script>
