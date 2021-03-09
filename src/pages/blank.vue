<template>
    <div class="ui flex column item one" style="background: #fff;"></div>
</template>
<script>
    export default {
        mounted() {
            let routerTo = this.$route.query.routerTo;
            if(routerTo){ // 存在路由地址就路由到指定位置
                this.$router.replace({
                    path:routerTo
                })
            }else{ // 否则就直接返回上一页
                this.$router.go(-1)
            }
        }
    }
</script>
