<template>
    <ui-main :title="$route.name">
        <!--组件示例-->
        <ui-${stateName}$></ui-${stateName}$>
        <!--说明文档-->
        <ui-load-md file="${stateName}$"></ui-load-md>
    </ui-main>
</template>
<script>
    export default {
        data() {
            return {
                key: 'value'
            }
        },
        mounted() {

        },
        methods: {
            name() {

            }
        }
    }
</script>
