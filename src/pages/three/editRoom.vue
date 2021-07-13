<style scoped lang="scss">
@import "scss/_editRoom.scss";
/*网格*/

</style>
<template>
    <ui-main title="编辑机房"
             v-loading="loading"
             element-loading-text="正在绘制,请稍等"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)">
        <!--工具栏-->
        <div class="toolbar">
            <el-radio-group v-model="editType">
                <el-radio-button label="cabinet">编辑机柜</el-radio-button>
                <el-radio-button label="kt">编辑空调</el-radio-button>
                <el-radio-button label="odf">编辑ODF架</el-radio-button>
                <el-radio-button label="wall">编辑围墙</el-radio-button>
                <el-radio-button label="door">编辑门</el-radio-button>
                <el-radio-button label="line">编辑轨道</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="wallType" class="m-l-20"
                            :disabled="!['wall','door','line'].includes(editType)">
                <el-radio label="horizontal">—</el-radio>
                <el-radio label="vertical">|</el-radio>
            </el-radio-group>


            <el-image
                fit="contain"
                class="help-btn"
                id="help-btn"
                src="static/images/help-btn.png"
                title="帮助手册"
                :preview-src-list="['static/images/help.png']">
            </el-image>


            <span class="m-l-50">
                <el-dropdown @command="handleCommand" trigger="click" placement="bottom-start">
                      <span class="el-dropdown-link t-blue" style="cursor: pointer">
                        清除<i class="el-icon-arrow-down el-icon--right"></i>
                      </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="cabinet-机柜方块">机柜方块</el-dropdown-item>
                        <el-dropdown-item command="kt-空调方块">空调方块</el-dropdown-item>
                        <el-dropdown-item command="odf-ODF架方块">ODF架方块</el-dropdown-item>
                        <el-dropdown-item command="wall-围墙线条">围墙线条</el-dropdown-item>
                        <el-dropdown-item command="door-门线条">门线条</el-dropdown-item>
                        <el-dropdown-item command="line-轨道线条">轨道线条</el-dropdown-item>
                        <el-dropdown-item command="camera-摄像头">摄像头</el-dropdown-item>
                        <el-dropdown-item command="sensor-传感器">传感器</el-dropdown-item>
                        <el-dropdown-item command="ground-地板名称">地板名称</el-dropdown-item>
                        <el-dropdown-item command="all-数据" divided>全部</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </span>
        </div>
        <!--编辑网格-->
        <div class="grid-box auto-center"
             :style="`grid-template-columns:repeat(${widthNum}, 1fr);grid-template-rows: repeat(${heightNum}, ${heightPX}px)`">
            <template v-for="item in roomList">
                <div
                    :class="{'grid-item':true,
                    'left-border':item.leftBorder,
                    'top-border':item.topBorder,
                    'left-door':item.leftDoor,
                    'top-door':item.topDoor,
                    'left-line':item.leftLine,
                    'top-line':item.topLine,
                    'is-center':item.isCenter,
                    'is-cabinet':item.type === 'cabinet' && act.includes(item.id),
                    'is-kt':item.type === 'kt' && act.includes(item.id),
                    'is-odf':item.type === 'odf' && act.includes(item.id)}"
                    :key="item.id"
                    :id="'room-' + item.id"
                >
                    <div style="overflow: hidden" class="w-100p h-100p" @click.stop="select(item)"
                         @contextmenu="selectSense(item)">
                        <template v-if="act.includes(item.id)">
                            <div class="item-position" :title="item.num">
                                <div @click.stop="open(item)" class="pos-tip">
                                    <div class="pos-tip-num">{{ item.num }}</div>
                                </div>
                                <div class="pos-up" :class="{active:item.pos.includes('back')}"
                                     @click.stop="changePos(item,'back')"><i class="icon caret up"></i></div>
                                <div class="pos-left" :class="{active:item.pos.includes('left')}"
                                     @click.stop="changePos(item,'left')"><i class="icon caret left"></i></div>
                                <div class="pos-center" v-if="item.senseId === 'sensor'"></div>
                                <div class="pos-right" :class="{active:item.pos.includes('right')}"
                                     @click.stop="changePos(item,'right')"><i class="icon caret right"></i></div>
                                <div class="pos-down" :class="{active:item.pos.includes('head')}"
                                     @click.stop="changePos(item,'head')"><i class="icon caret down"></i></div>
                            </div>
                        </template>
                        <div class="sense-pos" v-if="item.senseId">
                            <template v-for="(camera) in cameraPos">
                                <div class="sense-item"
                                     :class="camera.id === item.senseId ?  `iconfont ${camera.icon}` :''"
                                     :key="camera.id"></div>
                            </template>
                        </div>
                        <div class="item-name" v-if="item.name">
                            {{ item.name }}
                        </div>
                    </div>
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
            <div style="position:absolute;width: 100px; left:calc(50% - 50px);bottom: 10px;text-align: center">
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
            oldRoomList: [],// 网格数据
            act: [],// 被选中的网格
            actWall: [], // 选中的墙
            wallData: [], // 墙数据
            groundData: [], // 地板数据
            senseData: [], // 传感器数据
            selected: [], // 机柜数据存放
            centerData: null, // 中心点
            wallType: "horizontal",
            widthNum: 36,
            heightNum: 50,
            heightPX: 0,
            editType: "cabinet",
            editTypeOption: [
                "cabinet",
                "kt",
                "odf",
                "wall",
                "door",
                "line",
            ],
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
                for (let i = 0; i < this.editTypeOption.length; i++) {
                    if (this.editType === this.editTypeOption[i]) {
                        if (i === this.editTypeOption.length - 1) {
                            this.editType = this.editTypeOption[0];
                        } else {
                            this.editType = this.editTypeOption[i + 1];
                        }
                        break;
                    }
                }
            } else if (e.ctrlKey) {
                e.preventDefault();
                this.changeWallType();
            }
        }
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        })
    },
    beforeMount() {
        this.centerData = this.$parent.params.centerData;
        this.initDom();
        this.initWallData();
        this.initCabinetPos();
        this.initSenseData();
        this.initGroundData();
    },
    mounted() {
        this.$nextTick(() => {
            this.heightPX = Math.floor((this.$el.clientWidth - 40) / this.widthNum)
            this.loading = false;
        })

        setTimeout(() => {
            $('#help-btn').trigger('click')
        }, 500)

    },
    methods: {
        /*初始化网格数据，固定宽高*/
        initDom() {
            let start = 0;
            let x = start;
            let z = 0;
            for (let i = 0; i < this.widthNum * this.heightNum; i++) {
                if (i !== 0) x += 4;
                if (i % this.widthNum === 0 && i !== 0) {
                    z += 4;
                    x = start;
                }

                this.roomList.push({
                    type: '',
                    x: x,
                    z: z,
                    id: i,
                    pos: ['head'],
                    leftBorder: false,
                    topBorder: false,
                    topDoor: false,
                    leftDoor: false,
                    leftLine: false,
                    topLine: false,
                    isCenter: this.centerData?.id === i ? true : false,
                    senseId: '',
                    dataId: '',
                    num: '',
                    name: '',
                });
                this.oldRoomList.push({
                    type: 'cabinet',
                    x: x,
                    z: z,
                    id: i,
                    pos: ['head'],
                    leftBorder: false,
                    topBorder: false,
                    topDoor: false,
                    leftDoor: false,
                    leftLine: false,
                    topLine: false,
                    isCenter: false,
                    senseId: '',
                    dataId: '',
                    num: '',
                    name: '',
                })
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
                        room.type = item.type;
                        room.leftBorder = item.leftBorder;
                        room.topBorder = item.topBorder;
                        room.topDoor = item.topDoor;
                        room.leftDoor = item.leftDoor;
                        room.leftLine = item.leftLine;
                        room.topLine = item.topLine;
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
                        room.type = item.type;
                        room.senseId = item.data.senseId;
                        room.dataId = item.data.dataId;
                        room.dataName = item.data.dataName;
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
            } else if (item.type === 'odf') {
                text = 'OTF架名称';
            } else {
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
            item.type = this.editType;
            switch (this.editType) {
                case "cabinet":
                case "kt":
                case "odf":
                    this.changeSelect(item);
                    break;
                default:
                    this.changeDoorOrWall(item);
                    break;
            }
        },
        changeDoorOrWall(item) {
            switch (this.editType) {
                case "wall":
                    if (this.wallType === 'vertical') {
                        item.leftBorder = !item.leftBorder;
                        item.leftDoor = false;
                        item.leftLine = false;
                    } else {
                        item.topBorder = !item.topBorder;
                        item.topDoor = false;
                        item.topLine = false;
                    }
                    break;
                case "door":
                    if (this.wallType === 'vertical') {
                        item.leftDoor = !item.leftDoor;
                        item.leftBorder = false;
                        item.leftLine = false;
                    } else {
                        item.topDoor = !item.topDoor;
                        item.topBorder = false;
                        item.topLine = false;
                    }
                    break;
                default:
                    if (this.wallType === 'vertical') {
                        item.leftLine = !item.leftLine;
                        item.leftDoor = false;
                        item.leftBorder = false;
                    } else {
                        item.topLine = !item.topLine;
                        item.topBorder = false;
                        item.topDoor = false;
                    }
            }
            if (this.actWall.length && this.actWall.includes(item.id)) {
                for (let i = 0; i < this.wallData.length; i++) {
                    if (this.wallData[i].id === item.id) {
                        this.wallData[i] = item;
                        break;
                    }
                }

                if (!item.topBorder && !item.leftBorder
                    && !item.topDoor && !item.leftDoor
                    && !item.topLine && !item.leftLine) {
                    this.deleteData(item.id);
                }
            } else {
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
            switch (this.editType) {
                case "door":
                case "wall":
                case "line":
                    this.wallType === 'horizontal' ?
                        this.wallType = 'vertical' : this.wallType = 'horizontal';
                    break;
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

            let selectedData = this.roomList.reduce((arr, cur) => {
                if (cur.dataId) {
                    arr.push(cur.dataId)
                }
                return arr;
            }, []);
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
                    if (data && data !== 'setCenter') {
                        if (data.data.dataId) {
                            if (data.data.type === 'delete') {
                                vm.senseData = vm.senseData.filter((source) => {
                                    return item.id !== source.data.id;
                                });
                                item.senseId = '';
                                item.dataId = '';
                            } else {
                                if (data.data.type === 'camera') {
                                    item.type = 'camera';
                                }
                                item.senseId = data.data.senseId;
                                item.dataId = data.data.dataId;
                                item.dataName = data.data.dataName;
                                vm.senseData.push({
                                    type: data.data.type,
                                    data: item
                                })
                            }
                        }else if (data.name) {
                            item.name = data.name;
                        } else if (data.oldName && !data.name) {
                            item.name = '';
                        }

                    } else {
                        if (data) {
                            vm.initCenter();
                            item.isCenter = true;
                            vm.centerData = item;
                        }
                    }

                    vm.showMark = false;
                }
            })
        },
        initCenter() {
            this.roomList.forEach(item => {
                item.isCenter = false;
            })
        },
        handleCommand(command) {

            let res = command.split('-')
            let content = `删除后不可恢复,确认删除所有${res[1]}?`;
            if (res[0] === 'cabinet') {
                content = `删除机柜方块会删除对应传感器数据且不可恢复，确认删除所有${res[1]}?`
            }
            this.$confirm(content, '提示', {
                type: 'warning'
            }).then(() => {
                switch (res[0]) {
                    case 'cabinet':
                    case 'kt':
                    case 'odf':
                        this.selected = this.selected.filter(item => {
                            return item.type !== res[0]
                        })
                        this.act = this.selected.reduce((arr, cur) => {
                            arr.push(cur.id)
                            return arr;
                        }, []);
                        if (res[0] === 'cabinet') {
                            this.senseData = this.senseData.filter(item => {
                                return item.type !== 'sensor'
                            })
                        }
                        break;
                    case 'wall':
                    case 'door':
                    case 'line':
                        this.wallData = this.wallData.filter(item => {
                            return item.type !== res[0]
                        })
                        this.actWall = this.wallData.reduce((arr, cur) => {
                            arr.push(cur.id)
                            return arr;
                        }, []);
                        this.initRoomWall(res[0]);
                        break;
                    case 'camera':
                    case 'sensor':
                        this.senseData = this.senseData.filter(item => {
                            return item.type !== res[0]
                        })
                        this.roomList.forEach(item => {
                            if (item.type === res[0] || item.senseId === res[0]) {
                                item.senseId = '';
                                item.dataId = '';
                            }
                        })
                        break;
                    case 'ground':
                        this.roomList.forEach(item => {
                            item.name = '';
                        })
                        break;
                    case 'all':
                        this.selected = [];
                        this.act = [];
                        this.wallData = [];
                        this.actWall = [];
                        this.centerData = null;
                        this.roomList = this.oldRoomList;
                        break;
                }

            }).catch(() => {

            });
        },
        initRoomWall(type) {
            switch (type) {
                case 'wall':
                    this.roomList.forEach(item => {
                        item.leftBorder = false;
                        item.topBorder = false;
                    });
                    break;
                case 'door':
                    this.roomList.forEach(item => {
                        item.leftDoor = false;
                        item.topDoor = false;
                    })
                    break;
                case 'line':
                    this.roomList.forEach(item => {
                        item.leftLine = false;
                        item.topLine = false;
                    })
                    break;
            }
        },
        submit() {
            // this.groundData = this.roomList.filter((item) => {
            //     return item.name !== '';
            // });
            this.$parent.close({
                cabinetData: this.selected,
                wallData: this.wallData,
                senseData: this.senseData,
                groundData: this.groundData,
                centerData: this.centerData,
            });

        }
    }
}
</script>

