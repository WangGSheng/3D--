<template>
    <ui-main title="编辑机房"
             v-loading="loading"
             element-loading-text="正在绘制,请稍等"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)">
        <!--工具栏-->
        <div class="toolbar">
            <el-radio-group v-model="editType">
                <el-radio-button label="room">编辑机柜</el-radio-button>
                <el-radio-button label="kt">编辑空调</el-radio-button>
                <el-radio-button label="odf">编辑ODF架</el-radio-button>
                <el-radio-button label="wall">编辑围墙</el-radio-button>
                <el-radio-button label="door">编辑门</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="wallType" class="m-l-20" :disabled="editType !== 'wall' && editType !== 'door'">
                <el-radio label="horizontal">—</el-radio>
                <el-radio label="vertical">|</el-radio>
            </el-radio-group>

            <i class="icon question circle outline help-btn" @click="dialogVisible = true" title="帮助手册"></i>
        </div>
        <!--编辑网格-->
        <div class="grid-box auto-center"
             :style="`grid-template-columns:repeat(${widthNum}, 40px);grid-template-rows: repeat(${heightNum}, 40px)`">
            <template v-for="item in roomList">
                <div
                    :class="{'grid-item':true,'left-border':item.leftBorder,'top-border':item.topBorder,'left-door':item.leftDoor,'top-door':item.topDoor,
                    'is-cabinet':item.type === 'cabinet' && act.includes(item.id),
                    'is-kt':item.type === 'kt' && act.includes(item.id),
                    'is-odf':item.type === 'odf' && act.includes(item.id)}"
                    :key="item.id"
                    :id="'room-' + item.id"
                    @click.stop="select(item)" @contextmenu="selectSense(item)">
                    <template v-if="act.includes(item.id)">
                        <div class="item-position" :title="item.num">
                            <div @click.stop="open(item)" class="pos-tip">
                                <div class="pos-tip-num">{{ item.num }}</div>
                            </div>
                            <div class="pos-up" :class="{active:item.pos.includes('back')}"
                                 @click.stop="changePos(item,'back')"><i class="icon caret up"></i></div>
                            <div class="pos-left" :class="{active:item.pos.includes('left')}"
                                 @click.stop="changePos(item,'left')"><i class="icon caret left"></i></div>
                            <div class="pos-center" v-if="item.senseId === 'sense'"></div>
                            <div class="pos-right" :class="{active:item.pos.includes('right')}"
                                 @click.stop="changePos(item,'right')"><i class="icon caret right"></i></div>
                            <div class="pos-down" :class="{active:item.pos.includes('head')}"
                                 @click.stop="changePos(item,'head')"><i class="icon caret down"></i></div>
                        </div>
                    </template>
                    <div class="sense-pos" v-if="item.senseId">
                        <template v-for="(camera) in cameraPos">
                            <div class="sense-item" :class="camera.id === item.senseId ?  `iconfont ${camera.icon}` :''"
                                 :key="camera.id"></div>
                        </template>
                    </div>
                    <div class="item-name" v-if="item.name">
                        {{ item.name }}
                    </div>
                </div>
            </template>
        </div>
        <div class="current-mask" v-show="showMark"></div>
        <el-dialog
            title="帮助手册"
            append-to-body
            :visible.sync="dialogVisible"
            top="48px"
            width="75%">
            <img class="w-100p" src="static/images/3D机房编辑手册.png" alt="">
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!--页脚工具栏 插槽 -->
        <div slot="footerBar" class="ui flex col-center bottom-button-box">
            <div class="m-l-15">
                <el-button type="primary" size="medium" @click="submit">保存
                </el-button>
                <el-button size="medium" @click="$parent.close()">取消</el-button>
            </div>
            <div style="position:absolute;left: 48%;bottom: 10px;text-align: center">
                <i class="iconfont ali-iconjiantou_xiangshang"></i>
                <div>视角朝向</div>
            </div>
        </div>
    </ui-main>
</template>

<script>
/* eslint-disable */
export default {
    name: "editRoom",
    data() {
        return {
            dialogVisible: false,
            loading: true,
            showMark: false,
            canAddCamera: true,
            roomList: [],// 网格数据
            act: [],// 被选中的网格
            actWall: [], // 选中的墙
            wallData: [], // 墙数据
            groundData: [], // 地板数据
            senseData: [], // 传感器数据
            selected: [], // 机柜数据存放
            editType: "room",
            wallType: "horizontal",
            widthNum: 36,
            heightNum: 50,
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
        }
    },
    beforeCreate() {
        window.onkeydown = (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.changeWallType();
            }
        }
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        })
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.initDom();
                this.initWallData();
                this.initCabinetPos();
                this.initSenseData();
                this.initGroundData();
                this.loading = false;
                setTimeout(()=>{
                    this.dialogVisible = true;
                })
            }, 500)
        })
    },
    methods: {
        /*初始化网格数据，固定宽高*/
        initDom() {
            let start = 0;
            let x = start;
            let z = 0;
            for (let i = 0; i < this.widthNum * this.heightNum; i++) {
                if (i !== 0 ) x += 4;
                if (i % this.widthNum === 0 && i !== 0 ) {
                    z += 4;
                    x = start;
                }
                this.roomList.push({
                    type: 'cabinet',
                    x: x,
                    z: z,
                    id: i,
                    pos: ['head'],
                    leftBorder: false,
                    topBorder: false,
                    topDoor: false,
                    leftDoor: false,
                    senseId: '',
                    dataId: '',
                    num: '',
                    name: '',
                });
            }
        },
        /*初始化机柜数据*/
        initCabinetPos() {
            this.$parent.params.selected && this.$parent.params.selected.forEach(item => {
                this.act.push(item.id);
                this.selected.push(item);
                setTimeout(() => {
                    this.roomList.forEach(room => {
                        if (item.id === room.id) {
                            room.pos = item.pos;
                            room.num = item.num;
                            room.type = item.type;
                        }
                    })
                })
            })
        },
        /*初始化墙体数据*/
        initWallData() {
            this.$parent.params.wallList && this.$parent.params.wallList.forEach(item => {
                this.wallData.push(item)
                this.actWall.push(item.id)
                this.roomList.forEach(room => {
                    if (room.id === item.id) {
                        room.leftBorder = item.leftBorder;
                        room.topBorder = item.topBorder;
                        room.topDoor = item.topDoor;
                        room.leftDoor = item.leftDoor;
                        room.name = item.name;
                    }
                })
            })
        },
        /*初始化摄像头，传感器数据*/
        initSenseData() {
            this.$parent.params.senseList && this.$parent.params.senseList.forEach(item => {
                this.senseData.push(item)
                this.roomList.forEach(room => {
                    if (room.id === item.data.id) {
                        room.senseId = item.data.senseId;
                        room.dataId = item.data.dataId;
                    }
                })
            })
        },
        /*初始化地板数据*/
        initGroundData() {
            this.$parent.params.groundData && this.$parent.params.groundData.forEach(item => {
                this.groundData.push(item)
                this.roomList.forEach(room => {
                    if (room.id === item.id) {
                        room.name = item.name;
                    }
                })
            })
        },
        open(item) {
            let text;
            if (item.type === 'kt') {
                text = '空调名称';
            }else if (item.type === 'odf') {
                text = 'OTF架名称';
            }else{
                text = '机柜编号';
            }

            this.$prompt('', text, {
                inputValue: item.num,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({value}) => {
                item.num = value;
            }).catch(() => {
                // this.$message({
                //     type: 'info',
                //     message: '取消输入'
                // });
            });
        },
        /*网格选中事件*/
        select(item) {
            if (this.editType === 'kt') {
                item.type = 'kt';
                this.changeSelect(item)
            }else if (this.editType === 'odf') {
                item.type = 'odf'
                this.changeSelect(item)
            }else if (this.editType === 'room') {
                item.type = 'cabinet'
                this.changeSelect(item)
            } else {
                this.changeDoorOrWall(item)
            }
        },
        changeDoorOrWall(item) {
            if (this.actWall.length && this.actWall.includes(item.id)) {
                if (this.editType === 'wall') {
                    if (this.wallType === 'vertical') {
                        item.leftBorder = !item.leftBorder;
                        item.leftDoor = false;
                    } else {
                        item.topBorder = !item.topBorder;
                        item.topDoor = false;
                    }

                }else {
                    if (this.wallType === 'vertical') {
                        item.leftDoor = !item.leftDoor;
                        item.leftBorder = false;
                    } else {
                        item.topDoor = !item.topDoor;
                        item.topBorder = false;
                    }
                }

                if (!item.topBorder && !item.leftBorder
                    && !item.topDoor && !item.leftDoor) {
                    this.deleteData(item.id);
                }
            } else {
                if (this.wallType === 'horizontal') {
                    if (this.editType === 'wall') {
                        item.topBorder = true;
                        item.topDoor = false;
                    }else{
                        item.topDoor = true;
                        item.topBorder = false;
                    }

                } else {
                    if (this.editType === 'wall') {
                        item.leftBorder = true;
                        item.leftDoor = false;
                    }else{
                        item.leftDoor = true;
                        item.leftBorder = false;
                    }
                }

                this.wallData.push(item)
                this.actWall.push(item.id);
            }
        },
        changeSelect(item) {
            if (this.act.length && this.act.includes(item.id)) {
                this.act = this.act.filter((source) => {
                    return item.id !== source;
                });
                this.selected = this.selected.filter((source) => {
                    return item.id !== source.id;
                });
            } else {
                this.act.push(item.id);
                this.selected.push(item);
            }
        },
        /*墙体方向切换方法*/
        changeWallType() {
            if (this.editType !== 'room') {
                this.wallType === 'horizontal' ?
                    this.wallType = 'vertical' : this.wallType = 'horizontal';
            }
        },
        /*数据过滤*/
        deleteData(id) {
            this.actWall = this.actWall.filter((source) => {
                return id !== source;
            });
            this.wallData = this.wallData.filter((source) => {
                return id !== source.id;
            });
        },
        /*改变机柜柜门朝向*/
        changePos(item, pos) {
            this.selected.forEach(data => {
                if (data.id === item.id) {
                    if (data.pos.indexOf(pos) > -1) {
                        data.pos.splice(data.pos.indexOf(pos), 1)
                        item.pos.splice(item.pos.indexOf(pos), 1)
                    } else {
                        data.pos.push(pos);
                        item.pos.push(pos)
                    }
                }
            })

        },
        /*选择摄像头或传感器*/
        selectSense(item) {
            // 有机柜的地方不能添加摄像头
            if (this.act.includes(item.id)) {
                this.canAddCamera = false
            } else {
                this.canAddCamera = true
            }

            this.showMark = true;
            let vm = this;

            let selectedData = this.roomList.reduce((arr,cur) => {
                if (cur.dataId) {
                  arr.push(cur.dataId)
                }
                return arr;
            },[]);
            this.$bui.drawer({
                comp: () => import('./_popup.vue'),
                params: {
                    canAddCamera: vm.canAddCamera,
                    currentSense: item,
                    selectedData: selectedData,
                },
                size: {
                    width: '300px',
                    right: '0',
                    padding: '50px 0 0 0'
                },
                callback: (data) => {
                    if (data?.data.dataId) {
                        if (data.data.type === 'delete') {
                            vm.senseData = vm.senseData.filter((source) => {
                                return item.id !== source.data.id;
                            });
                            item.senseId = '';
                            item.dataId = '';
                        } else {
                            item.senseId = data.data.senseId;
                            item.dataId = data.data.dataId;
                            item.dataName = data.data.dataName;
                            vm.senseData.push({
                                type: data.data.type,
                                data: item
                            })
                        }
                    } else if (data ?.name) {
                        vm.groundData = vm.groundData.filter((source) => {
                            return item.id !== source.id;
                        });
                        item.name = data.name;
                        vm.groundData.push(item)
                    }
                    vm.showMark = false;
                }
            })
        },
        submit() {
            this.$parent.close({
                cabinetData: this.selected,
                wallData: this.wallData,
                senseData: this.senseData,
                groundData: this.groundData,
            });
        }
    }
}
</script>

<style scoped lang="scss">
@import "./index.scss";
.help-btn {
    margin-left: 30px;
    color: #cda511;
    cursor: pointer;

    &:hover {
        color: #00B247;
    }
}

</style>
