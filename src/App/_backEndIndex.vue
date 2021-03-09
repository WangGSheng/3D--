<style lang="scss" scoped>
@import '~@/scss/global/colors.scss';

.ui.page-content {
    background: url("/static/shape2.png") top right no-repeat $content-bg !important;
}

#app /deep/ .ui-sidebar {
    background: $sidebar-bg;
}
</style>

<template>
    <div id="app" class="ui flex column vh-100">
        <app-header></app-header>
        <div class="ui flex item one">
            <ui-sidebar-b sort></ui-sidebar-b>
            <div class="ui flex column item one" id="app-router">
                <keep-alive>
                    <router-view v-if="$route.meta.keepAlive"></router-view>
                </keep-alive>
                <router-view v-if="!$route.meta.keepAlive"></router-view>

            </div>
        </div>
    </div>
</template>
<script>
    import appHeader from './_indexHeader.vue'
    export default {
        components: {
            appHeader
        },
        name:'bed',
       /* created() {
            console.log(this.$route)
        }*/

    }
</script>
