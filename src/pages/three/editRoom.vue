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
                <el-radio-button label="wall">编辑围墙</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="wallType" class="m-l-20" :disabled="editType === 'room'">
                <el-radio label="horizontal">—</el-radio>
                <el-radio label="vertical">|</el-radio>
            </el-radio-group>
            <div style="position:absolute;left: 50%;top: 0;text-align: center">
                <i class="iconfont ali-iconjiantou_xiangshang"></i>
                <div>视角朝向</div>
            </div>
        </div>
        <!--编辑网格-->
        <div class="grid-box auto-center"
             :style="`grid-template-columns:repeat(${widthNum}, 40px);grid-template-rows: repeat(${heightNum}, 40px)`">
            <template v-for="item in roomList">
                <div
                    :class="{'grid-item':true,active:act.includes(item.id),'left-border':item.leftBorder,'top-border':item.topBorder}"
                    :key="item.id"
                    :id="'room-' + item.id"
                    @click.stop="select(item);showContextmenu = false" @contextmenu="selectSense(item)">
                    <template v-if="act.includes(item.id)">
                            <div class="item-position" :title="item.num">
                                <div @click.stop="open(item)" class="pos-tip">
                                    <div class="pos-tip-num">{{item.num}}</div>
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
                    <template v-if="item.name">
                        <div class="item-name">
                            {{item.name}}
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <div class="current-mask" v-show="showMark"></div>
        <!--页脚工具栏 插槽 -->
        <div slot="footerBar" class="ui flex col-center bottom-button-box">
            <div class="m-l-15">
                <el-button type="primary" size="medium" @click="submit">保存
                </el-button>
                <el-button size="medium" @click="$parent.close()">取消</el-button>
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
            loading: true,
            showMark: false,
            canAddCamera: true,
            roomList: [],// 网格数据
            act: [],// 被选中的网格
            actWall: [], // 选中的墙
            wallData: [], // 墙数据
            senseData: [], // 传感器数据
            selected: [], // 机柜数据存放
            editType: "room",
            wallType: "horizontal",
            widthNum: 36,
            heightNum: 50,
            cameraPos: [  // 摄像头朝向数据
                {label: '左前', id: 'leftHead',icon:'ali-iconjiantou_zuoshang'},
                {label: '正前', id: 'head',icon:'ali-iconjiantou_xiangshang'},
                {label: '右前', id: 'rightHead',icon:'ali-iconjiantou_youshang'},
                {label: '正左', id: 'left',icon:'ali-iconjiantou_xiangzuo'},
                {label: '删除', id: 'delete',icon:'ali-iconshanchu t-red'},
                {label: '正右', id: 'right',icon:'ali-iconjiantou_xiangyou'},
                {label: '左后', id: 'leftBack',icon:'ali-iconjiantou_zuoxia'},
                {label: '正后', id: 'back',icon:'ali-iconjiantou_xiangxia'},
                {label: '右后', id: 'rightBack',icon:'ali-iconjiantou_youxia'},
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
            setTimeout(()=>{
                this.initDom();
                this.initWallData();
                this.initCabinetPos();
                this.initSenseData();
                this.loading = false;
            },500)
        })
    },
    methods: {
        /*初始化网格数据，固定宽高*/
        initDom() {
            let x = 0;
            let z = 0
            for (let i = 0; i < this.widthNum * this.heightNum; i++) {
                if (i > 0) x += 4;
                if (i % this.widthNum === 0) {
                    z += 4;
                    x = 0;
                }
                this.roomList.push({
                    x: x,
                    z: z,
                    id: i,
                    pos: ['head'],
                    leftBorder: false,
                    topBorder: false,
                    senseId: '',
                    num:'',
                    name:'',
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
                    }
                })
            })
        },
        open(item) {
            this.$prompt('', '机柜编号', {
                inputValue: item.num,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
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
            if (this.editType === 'room') {
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
            } else {
                if (this.actWall.length && this.actWall.includes(item.id)) {
                    if (this.wallType === 'vertical') {
                        item.leftBorder = !item.leftBorder;

                    } else if (this.wallType === 'horizontal') {
                        item.topBorder = !item.topBorder;
                    }
                    if (!item.topBorder && !item.leftBorder) {
                        this.deleteData(item.id);
                    }
                } else {
                    if (this.wallType === 'horizontal') {
                        item.topBorder = true;
                    } else {
                        item.leftBorder = true;
                    }
                    this.wallData.push(item)
                    this.actWall.push(item.id);
                }

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
            this.$bui.drawer({
                comp: () => import('./_popup.vue'),
                params: {
                    canAddCamera: vm.canAddCamera,
                    currentSense: item,
                },
                size: {
                    width: '300px',
                    right: '0',
                    padding: '50px 0 0 0'
                },
                callback: (data) => {
                    if (data ?.data) {
                        if (data.data.type === 'delete') {
                            vm.senseData = vm.senseData.filter((source) => {
                                return item.id !== source.data.id;
                            });
                            item.senseId = '';
                        } else {
                            item.senseId = data.data.senseId;
                            item.dataId = data.data.dataId;
                            item.dataName = data.data.dataName;
                            vm.senseData.push({
                                type: data.data.type,
                                data: item
                            })
                        }
                    }else if (data ?.name) {
                        item.name = data.name;
                    }
                    vm.showMark = false;
                }
            })
        },
        submit() {
            this.$parent.close({
                cabinetData: this.selected,
                wallData: this.wallData,
                senseData: this.senseData
            });
        }
    }
}
</script>

<style scoped lang="scss">
/*网格*/
.grid-box {
    width: 1460px;
    //height: 100%;
    display: grid;
    overflow-x: auto;
    margin: 10px auto 0 auto;
    //grid-template-columns: repeat(20, 40px);
    //grid-template-rows: repeat(20, 40px);

    .grid-item {
        border: 1px solid rgba(0, 0, 0, .2);
        cursor: pointer;
        overflow: hidden;
        &.active {
            background-color: #d3ea7f;
        }
    }

    .item-name {

    }

    .left-border {
        border-left: 3px solid rgba(200, 200, 10, 1);
    }

    .top-border {
        border-top: 3px solid rgba(200, 200, 10, 1);
    }

}

/*机柜方向*/
.item-position {
    width: 100%;
    height: 100%;
    position: relative;
    font-size: 12px;
    color: rgba(0, 0, 0, .5);
    overflow: hidden;
    .active {
        color: #409eff;
    }

    .pos-tip {
        background-color: #409eff;
        position: absolute;
        left: -12px;
        top: -12px;
        width: 25px;
        height: 25px;
        transform: rotate(-45deg);
        color: white;

        .pos-tip-num {
            transform: scale(.7);
            position: absolute;
            bottom: -9.5px;
            left: 0px;
            width: 100%;
            height: 100%;
            text-align: center;
        }
    }

    .pos-up {
        line-height: 100%;
        position: absolute;
        top: 0;
        left: 50%;
        margin-top: -2px;
        transform: translateX(-50%);
        z-index: 99;
    }

    .pos-left {
        line-height: 100%;
        position: absolute;
        left: 2px;
        text-align: center;
        top: 50%;
        transform: translateY(-50%);
    }

    .pos-center {
        background-color: #cba15e;
        width: 5px;
        height: 5px;
        position: absolute;
        left: 50%;
        text-align: center;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .pos-right {
        line-height: 100%;
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
    }

    .pos-down {
        line-height: 100%;
        position: absolute;
        bottom: -2px;
        text-align: center;
        left: 50%;
        transform: translateX(-50%);
    }

    .icon {
        width: unset !important;
        height: unset !important;
        margin: unset !important;
        padding: unset !important;
    }
}

/*右键菜单*/
.contextmenu-box {
    z-index: 99;
    width: 150px;
    height: 250px;
    position: absolute;
    border: 2px solid rgba(#000, .3);
    border-radius: 5px;
    background-color: #fff;
    overflow: hidden;
    color: #36b894;
    font-size: 16px;

    .top-control {
        float: right;
        margin-bottom: 5px;

        &:hover {
            color: red;
            cursor: pointer;
        }
    }

    .content-title {
        clear: both;
        padding: 10px 5px;
        background-color: #235193;
        color: white;
        margin-bottom: 5px;
    }

    .camera-pos {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 50px);

        .center-item {
            /*background-image: url("./center.png");*/
            background-color: #eaa447;
        }

        .camera-item {
            line-height: 60px;
            text-align: center;
            cursor: pointer;
            border: 1px solid rgba(0, 0, 0, .2);
            //border-radius: 10px;

            .iconfont {
                font-size: 16px;
            }

            &.active {
                background-color: #d3ea7f;
            }

            &:hover {
                background-color: #45c2d0;
            }
        }
    }
}

/*摄像头回显*/
.sense-pos {
    position: relative;
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);

    .sense-item {
        &.active {
            background-color: #6876ff;
        }
    }

}

/*遮罩*/
.current-mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.1);
}
</style>
