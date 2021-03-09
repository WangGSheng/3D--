// ${stateName}$
<template>
    <ui-main ref="main" :title="$route.name">
        <!--可折叠的工具栏-->
        <div slot="topAccordion" class="p-l-10 p-r-10">
            <ui-screening v-model="searchData"
                @reset="resetCallback"
                @search="searchCallback">
                <!--你的筛选器内容-->
            </ui-screening>
        </div>
        <!--顶部按钮  slot="toolbar"代表其中的内容为菜单按钮-->
        <span slot="toolbar">
            <ui-btn name="刷新"></ui-btn>
            <span class="parting-line"></span>
            <ui-btn v-has:add
                @click="add()"
                icon="plus icon"
                name="增加"></ui-btn>
        </span>
        <!-- 内容-->
        <el-table ref="table"
            :data="tabObj.tableData"
            size="mini"
            border
            current-row-key="id"
            :row-class-name="$$rowClassName"
            :height="tbHeight">
            <el-table-column align="center"
                label="序号"
                type="index"
                :index="$$indexMethod"
                width="60"></el-table-column>
            <el-table-column align="center"
                prop="name_short"
                label="客户简称"></el-table-column>
            <el-table-column header-align="center"
                align="right"
                label="操作"
                class-name="tr-edit-operate"
                width="155"><!--增加一个按钮宽度就加50px反之减少50px-->
                <template slot-scope="scope">
                    <ui-tab-btn name="查看" @click="view(scope)"></ui-tab-btn>
                    <ui-tab-btn name="修改" @click="edit(scope)"></ui-tab-btn>
                    <ui-tab-btn name="删除"
                        @click="$$deleteRow(scope)"></ui-tab-btn>
                </template>
            </el-table-column>
        </el-table>
    </ui-main>
</template>
<script>
    //表格的公共方法 使用表格必须混入 //
    import UiTable from '@/common/mixins/ui-get-table.js'

    export default {
        mixins: [UiTable],//混入获取数据的公共方法
        data() {
            return {
                url: '/admin/${url}$/',
                initData: {},
                searchData: {
                    name: ''
                },
                loading: true
            }
        },
        mounted() {
            // 初始化数据
            this.$http.GetDictData('VI_DICT_SALE_CUSTOMER_TYPE', 'customer_types').then(data => {
                this.initData = data;
                this.$$uiTableLoad();
            })
        },
        methods: {
            add() {
                //打开平铺子路由
                //this.$$openFlat('/${url}$/add/')
            },
            edit(scope) {
                //打开平铺子路由
                //this.$$openFlat('/${url}$/edit/' + scope.row.id);
            },
            view(scope) {
                //打开平铺子路由
                //this.$$openFlat('/${url}$/view/' + scope.row.id);
            },
            resetCallback() {
                this.$$uiTableLoad();
            },
            searchCallback(data) {
                this.$$uiTableLoad();
            }
        }
    }
</script>
