<style lang="scss" scoped>
    @import '~@/scss/global/colors.scss';
    .ui.page-content{
        background:url("/static/shape2.png") top right no-repeat $content-bg !important;
    }
    #app /deep/ .ui-sidebar{
        background: #141A30;
    }

</style>
<template>
    <div id="app" class="ui flex vh-100 ">
        <ui-sidebar-b sort></ui-sidebar-b>
        <div class="ui flex column item one page-content" id="app-router">
            <router-view></router-view>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'app',
    }
</script>
