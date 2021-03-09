<style lang="scss" scoped></style>
<template>
    <ui-nest>
        <ui-main :title="title" noPadding back>
            <div class="ui flex row-center">
                <div class="m-20 auto-center">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item name="1">
                            <template slot="title">
                                <i class="f-18 icon file alternate outline"></i>
                                <span class="f-18">基本信息</span>
                            </template>
                            <table class="ui celled vertical-striped compact table">
                                <tbody>
                                <tr>
                                    <td class="t-r w-20p">xxx</td>
                                    <td class="w-30p">
                                        {{form.name}}
                                    </td>
                                    <td class="t-r w-20p required">xxx</td>
                                    <td class="w-30p">
                                        {{form.name_short}}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
            <div slot="footerBar" class="ui flex col-center bottom-button-box">
                <div class="m-l-15">
                    <el-button size="medium" v-close-modal="this">取消</el-button>
                </div>
            </div>
        </ui-main>
    </ui-nest>
</template>
<script>
    export default {
        props: {
            showDialog: Object
        },
        data() {
            return {
                title: '',
                loading: true,
                formData: {},
                activeNames: ['1', '2', '3'],
                form: {
                    id: '',
                    name: ''
                }
            }
        },
        mounted() {
            this.$http.GetDictData('VI_DICT_SALE_CUSTOMER_TYPE', 'customer_types').then(data => {
                this.formData = data;
                if (this.$route.path.indexOf('add') < 0) {
                    this.$http.Datas('/admin/${url}$/getObjInit', { id: this.$route.params.id }).then(data => {
                        this.form = data;
                        this.loading = false;

                    })
                }
            })
        }
    }
</script>
