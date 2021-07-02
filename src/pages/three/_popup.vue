
<style scoped lang="scss">
@import "scss/_popup.scss";
</style>
<template>
    <ui-main :title="title">
        <div class="content-title">
            {{ canAddCamera ? '摄像头(朝向)' : '传感器' }}
        </div>
        <div class="camera-pos" v-if="canAddCamera">
            <template v-for="(item) in cameraPos">
                <div class="camera-item" :class="{active:item.id === currentSelect}" :key="item.id"
                     @click="selectChange(item.id,'camera')">
                    <i :class="`w-100p h-100p iconfont ${item.icon}`"></i>
                </div>
            </template>
        </div>
        <div class="ui flex w-100p" v-else>
            <div class="sense-item" :class="{active:currentSelect === 'sensor'}"
                 @click="selectChange('sensor','sensor')">
                <i class="w-50p h-100p iconfont ali-iconchuanganqi"></i>
            </div>
            <div class="sense-item"
                 @click="selectChange('delete')">
                <i class="w-50p h-100p t-red iconfont ali-iconshanchu"></i>
            </div>
        </div>
        <div v-if="canAddCamera" class="m-b-5">
            <div  class="content-title">
                编辑名称
            </div>
            <div>
                <el-input v-model="name" placeholder="请输入名称" clearable></el-input>
            </div>
        </div>

        <div class="content-title">
            {{ canAddCamera ? '摄像头数据' : '传感器数据' }}
        </div>
        <div class="content-list-box">
            <template v-for="(item,index) in options">
                <div class="content-list-item" :key="index">
                    <div class="list-item-title">
                        {{ item.label }}
                    </div>
                    <template v-for="(child,childIndex) in item.children">
                        <div class="list-item-label" :class="{active : currentDeviceId === child.id}"
                             :key="childIndex" @click="selectData(child)">
                            {{ child.label }}
                        </div>
                    </template>
                </div>
            </template>
        </div>

        <!--页脚工具栏 插槽 -->
        <div slot="footerBar" class="ui flex col-center bottom-button-box">
            <div class="m-l-15">
                <el-button type="primary" size="medium" @click="submit">确认
                </el-button>
                <el-button type="primary" @click="setCenter">设为中心点</el-button>
                <el-button size="medium" @click="$parent.close()">取消</el-button>
            </div>
        </div>
    </ui-main>
</template>

<script>
export default {
    data() {
        return {
            title: '选择设备',
            name: '',
            cameraPos: [  // 摄像头朝向数据
                {label: '左前', id: 'leftHead', icon: 'ali-iconjiantou_zuoshang'},
                {label: '正前', id: 'head', icon: 'ali-iconjiantou_xiangshang'},
                {label: '右前', id: 'rightHead', icon: 'ali-iconjiantou_youshang'},
                {label: '正左', id: 'left', icon: 'ali-iconjiantou_xiangzuo'},
                {label: '删除', id: 'delete', icon: 'ali-iconshanchu t-red'},
                {label: '正右', id: 'right', icon: 'ali-iconjiantou_xiangyou'},
                {label: '左后', id: 'leftBack', icon: 'ali-iconjiantou_zuoxia'},
                {label: '正后', id: 'back', icon: 'ali-iconjiantou_xiangxia'},
                {label: '右后', id: 'rightBack', icon: 'ali-iconjiantou_youxia'},
            ],
            oldName: '',
            currentSelect: '',
            dataList: [],
            options: [],
            canAddCamera: true,
            currentDeviceId: '',
            selected: {
                type: '',
                senseId: '',
                dataId: '',
                cameraName: '',
            }
        }
    },
    mounted() {

        if (this.$parent.params.currentSense) {
            this.selected = JSON.parse(JSON.stringify(this.$parent.params.currentSense));
            this.currentDeviceId = this.selected.dataId;
            this.currentSelect = this.selected.senseId;
            this.name = this.$parent.params.currentSense.name;
            this.oldName = this.name;
        }

        if (this.$parent.params.canAddCamera) {
            this.canAddCamera = true;
            this.selected.type = 'camera';
        } else {
            this.canAddCamera = false;
            this.selected.type = 'sensor';
            this.selected.senseId = 'sensor';
            // this.currentDeviceId = 'sense';
            this.currentSelect = 'sensor';
        }


        this.$nextTick(() => {
            this.initData();
        });
    },
    methods: {
        initData() {
            this.$axios({
                url: '/api/iermEngineroomCamerasGC',
                data: {
                    id: '880512edc1724b9ab29d473c329a5f8a'
                },
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjamdseSIsImlhdCI6MTYyNTEwNzg4NiwiZXhwIjoxNjI1NzEyNjg2fQ.IEzrz6kyt7duzmZYevpw7m4pSss-UVIBobPtLuhQ6vLidwa83cYKFBCqyd9F8Ir_Yv4c67_M_Dsn_S5ogEfJjA'
                }
            }).then(response => {
                this.dataList = response.data.data;
                this.canAddCamera ? this.selectedType(0) : this.selectedType(1);
            }).catch((e) => {
                console.log(e)
            })

        },
        selectedType(v) {
            this.options = [];

            let source = this.$parent.params.selectedData;

            for (let i = 0; i < this.dataList.length; i++) {
                let children = this.dataList[i].children;
                for (let j = 0; j < children.length; j++) {
                    if (children[j].category === v) {
                        this.options.push(this.dataList[i])
                        break;
                    }
                }
            }

            if (!this.currentDeviceId) {
                this.options.forEach(item => {
                    item.children = item.children.filter(child => {
                        return !source.includes(child.id)
                    })
                });
            }
        },
        selectChange(id) {
            this.currentSelect = id;
            if (id === 'delete') {
                this.selected.type = id;
            } else if (id !== 'sensor') {
                this.selected.senseId = id;
            }
        },
        selectData(item) {
            this.currentDeviceId = item.id;
            this.selected.dataId = item.id;
            this.selected.dataName = item.label;
        },
        setCenter() {
            this.$parent.close('setCenter')
        },
        submit() {
            if (this.selected.type !== 'delete' && !this.name && !this.oldName) {
                if (this.canAddCamera && !this.selected.senseId) {
                    this.$message.warning('请选择摄像头朝向！');
                    return false;
                }

                if (!this.selected.dataId) {
                    this.$message.warning('请选择设备数据！');
                    return false;
                }
            }

            this.$parent.close({
                data:this.selected,
                name:this.name,
                oldName:this.oldName
            });
        }
    }
}
</script>

