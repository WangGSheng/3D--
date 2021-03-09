<style lang="scss" scoped>
    .closeBtn {
        color: #fff;
    }

    .title {
        color: #fff;
        background: #141A30;
        margin-bottom: 10px;
        padding: 0 0 0 10px;
        height: 40px;
        line-height: 40px;
    }

    .inverted {
        color: #E1E0ED;
        background: rgba(#232c50, .97);
        box-shadow: 0 0 20px #000;

        input {
            border: 2px rgba(#fff, .2) solid !important;
            color: #fff !important;
            background: rgba(#fff, .05) !important;
        }

        /deep/ .el-textarea{
            border-radius:5px;
            border: 2px rgba(#fff, .2) solid !important;
        }

        /deep/ textarea {
            border-radius: 5px;
            background: rgba(#fff, .05) !important;
            color: #fff;
        }

        /deep/ textarea:focus {
            border-color: transparent;
            background: rgba(#fff, .05) !important;
            color:#fff;
        }

        /deep/ .image-slot, .el-image {
            width: 100%;
            height: 150px;
            background: rgba(#fff, .05);
            font-size: 30px;
            cursor: pointer;
            color: rgba(#fff, .2);

            &:hover {
                color: rgba(#fff, .4);
            }
        }

        /deep/ .el-image {
            border-radius: 5px;
            border: 2px rgba(#fff, .2) solid;
        }
    }

    .field {
        padding: 0 20px;
    }

    .icon.close {
        cursor: pointer;
        float: right;
        display: inline-block;
        height: 40px;
        width: 40px;
        margin: 0;

        &:hover {
            background: #e23623;
        }
    }
</style>
<template>
    <el-form @submit.native.prevent class="ui form flex column inverted w-100p pos-r" :model="form">
        <div class="title"><strong>{{ title }}</strong>
            <i class="icon close" @click="closePop"></i>
        </div>
        <div class="field">
            <el-form-item label="标题" prop="title">
                <input autocomplete="off" v-model="form.title" type="text" name="first-name" placeholder="请输入标题">
            </el-form-item>
        </div>
        <div class="field">
            <el-form-item label="封面" prop="image">
            <el-image :fit="'scale-down'" class="w-100p" :src="form.image" style="height: 150px">
                <div @click="toggleShow" slot="error" class="image-slot ui flex row-center col-center">
                    <i class="el-icon-picture-outline"></i>
                </div>
            </el-image>
            <ui-avatar withCredentials
                field="img"
                @crop-success="cropSuccess"
                v-model="show"
                :width="250"
                :height="200"
                img-format="jpg"
                noCircle/>
            </el-form-item>
        </div>
        <div class="field">
            <el-form-item label="代码" prop="code" class="">
                <el-input type="textarea" :rows="20" placeholder="请输入代码" v-model="form.code"></el-input>
            </el-form-item>
        </div>
        <div class="p-20 ">
            <button class="ui button inverted teal m-r-15" @click.stop="submit">提交</button>
            <button class="ui button inverted basic" @click="closePop">取消</button>
        </div>
    </el-form>
</template>
<script>
    export default {
        data() {
            return {
                title: this.$parent.params.title,
                show: false,
                form: {
                    'title': '',
                    'author': 'donkey',
                    'category': this.$parent.params.route.path.replace('/', ''),
                    'code': '',
                    'image': ''
                }
            }
        },
        mounted() {
            // console.log()
            /*console.clear()
            this.log('%c💬参数 : ' + this.$parent.params.title, 'color:#f90')*/
        },
        methods: {
            submit() {
                let vm = this
                this.$axios.post(`${ window.API_URL }/v1/chart`, this.form)
                    .then(function() {
                        // console.log(res.data)
                        // console.log(vm.form)
                        vm.$parent.close('succeed')
                    })
            },
            closePop() {
                this.$parent.close()
            },
            toggleShow() {
                this.show = !this.show;
            },
            /**
             * crop success
             *
             * [param] imgDataUrl
             * [param] field
             */
            cropSuccess(imgDataUrl /*field*/) {
                this.form.image = imgDataUrl;
            },


        }
    }
</script>
