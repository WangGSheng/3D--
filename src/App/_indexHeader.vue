<style lang="scss" scoped>
@import '~@/scss/global/colors.scss';

.ui.top {
    /*border-bottom:1px solid rgba(#fff, .2);*/
    box-shadow:#000 2px 5px 5px;
}

.subMenu {
    a {
        position: relative;
        cursor: pointer;
        color: $header-txt;
        margin: 0 15px;

        &:hover {
            color: $header-heightLight;
        }

        &:last-child {
            margin-right: 0;
        }
    }

    a.active {
        color: $header-heightLight;
    }

    &::before {
        display: none;
    }

    padding: 0 !important;

    .active {
        padding: 6px 15px 0 15px;
        position: relative;
        background: rgba(#fff, .1);
        height: 30px;
        top: 0;
        border-radius: 3px;
    }

}
.main-title {
    padding: 0 10px 0 30px;
    font-weight: bolder;
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9) ;
}
</style>
<template>
    <div class="ui top menu navbar" style="border-radius:0;margin:0" v-if="noLogin" v-show="userName">
        <div class="item">
            <img src="static/logo.png"
                alt="logo"
                style="position:absolute;width:29px; left:8px; top:13px;">
            <span class="main-title">智能化机房运维管控系统</span>
        </div>
        <!--<div class="item subMenu">
            <a v-for="(ss,index) in subs"
                :key="index"
                :class="{ active: +current_sid === +ss.id}"
                :href="'?pid=' + current_pid + '&sid=' + ss.id">
                <i :class="ss.icon"></i>
                {{ss.subsystem_name}}
            </a>
        </div>-->
        <div class="menu right">
            <el-dropdown size="small" placement="top" class="item" @command="logout" trigger="hover" :show-timeout="10" :hide-timeout="300">
                <a>
                    <img class="ui avatar image" :src="avatar">
                    <span>{{ userName }}</span>
                </a>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item disabled>
                        <i class="icon question"></i>
                        帮助
                    </el-dropdown-item>
                    <el-dropdown-item divided>
                        <i class="power off icon"></i>
                        退出
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>
<script>
/* eslint-disable */
export default {
    name: 'appHeader',
    data() {
        return {
            url: '',
            jiank : 0,//区域监控
            churukou : 0,//出入口监控
            shidu : 0,//湿度监控
            wendu : 0,//温度监控
        }
    },
    mounted() {

        // this.$router.afterEach((to, from) => {
        //     //获取告警统计
        //     this.$http.get(`/iermWarningCategory`).then(data => {
        //         // console.log(data)
        //         for (let i = 0; i < data.data.length; i++) {
        //             switch(data.data[i].category+''){
        //                 case '0': // 区域
        //                     this.jiank = data.data[i].total;
        //                     break;
        //                 case '1': // 温湿度
        //                     this.wendu = data.data[i].total;
        //                     break;
        //                 case '2': // 出入口
        //                     this.churukou = data.data[i].total;
        //                     break;
        //             }
        //         }
        //     })
        // })

    },
    methods: {
        //跳转到告警页面
        enterAlarm(category){
            // this.$store.commit('alarmType/get',category)
            this.$router.push(`/${category}`)
        },
        logout() {
            this.$store.dispatch('FedLogout')
                .then(() => {
                    //处理url不要带着产品子系统参数。
                    let path = window.location.href;
                    if (path.indexOf('?') > 0) {
                        window.location.href = path.split('?')[0] + '#/login'
                    }else{
                        window.location.href = path.split('#')[0] + '#/login'
                    }
                })
                .catch(err => {
                    this.log(err)
                })
        }
    },
    computed: {
        noLogin() {
            let path = this.$route.fullPath
            return path !== '/loginFed' && path !== '/login' && path !== '/welcome'
        },
        avatar() {
            return this.$store.state.permission.avatar;
        },
        userName() {
            return this.$store.state.permission.user;
        },
        products() {
            return this.$store.state.permission.products;
        }
    }
}
</script>
