<style lang="scss" scoped></style>
<template>
    <ui-nest>
        <ui-main :title="title" noPadding back>
            <div class="ui flex row-center">
                <el-form class="m-20 auto-center" ref="formName" :model="form">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item name="1">
                            <template slot="title">
                                <i class="f-18 el-icon-edit"></i>
                                <span class="f-18">基本信息</span>
                            </template>
                            <table class="ui celled vertical-striped table compact">
                                <tbody>
                                <tr>
                                    <td class="t-r required">xxx</td>
                                    <td>
                                        <el-form-item prop="name"
                                            :rules="[{ required: true, message: 'xxx', trigger: 'blur' }]">
                                            <el-input size="small"
                                                v-model="form.name"
                                                placeholder="请输入客户名称"></el-input>
                                        </el-form-item>
                                    </td>
                                    <td class="t-r required">xxx</td>
                                    <td>
                                        <el-form-item prop="name_short"
                                            :rules="[{ required: true, message: 'xxx', trigger: 'blur' }]">
                                            <el-input size="small"
                                                v-model="form.name_short"
                                                placeholder="请输入客户简称"></el-input>
                                        </el-form-item>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </el-collapse-item>
                    </el-collapse>
                </el-form>
            </div>
            <div slot="footerBar" class="ui flex col-center bottom-button-box">
                <div class="m-l-15">
                    <el-button type="primary"
                        size="medium"
                        @click="submitForm('formName')">保存
                    </el-button>
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
                loading: false,
                title: '',
                data_url: '/admin/${url}$/saveOrUpdate',
                formData: {},
                activeNames: ['1', '2', '3'],
                form: {
                    id: '',
                    name: ''
                },
                link: {
                    link_person: '',
                    link_phone: ''
                },
                account: {
                    account_person: '',
                    account: '',
                    account_bank: ''
                }
            }
        },
        mounted() {
            if (this.$route.path.indexOf('add') < 0) {
                this.title = '';
                this.loading = true
            }
            this.$http.GetDictData('VI_DICT_SALE_CUSTOMER_TYPE', 'customer_types').then(data => {
                this.formData = data;
                if (this.$route.path.indexOf('add') < 0) {
                    this.$http.Datas('/admin/${url}$/getObjInit', { id: this.$route.params.id }).then(data => {
                        this.form = data;
                        this.loading = false;
                    })
                }else{
                    this.loading = false;
                }
            })
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$http.SaveOrUpdate(this.data_url, this.form).then(data => {
                            this.$bui.closeNest(this, 'save', '/${stateName}$?id=' + data.obj.id);
                        });
                    }else{
                        this.$message.error('验证失败!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    }
</script>
