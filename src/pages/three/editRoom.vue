<template>
    <ui-main title="编辑机房"
             v-loading="loading"
             element-loading-text="正在绘制,请稍等"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)" >
        <div class="toolbar">
            <el-radio-group v-model="editType">
                <el-radio-button label="room">编辑机柜</el-radio-button>
                <el-radio-button label="wall">编辑围墙</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="wallType" class="m-l-20" :disabled="editType === 'room'">
                <el-radio label="horizontal">—</el-radio>
                <el-radio label="vertical">|</el-radio>
            </el-radio-group>

        </div>
        <div class="grid-box auto-center" :key="domKey"
             :style="`grid-template-columns:repeat(${widthNum}, 40px);grid-template-rows: repeat(${heightNum}, 40px)`">
            <template v-for="item in roomList">
                <div :class="{'grid-item':true,active:act.includes(item.id)}" :key="item.id"
                     :id="'room-' + item.id"
                     @click.stop="select(item)" @contextmenu="selectSense(item)">
                    <template v-if="act.includes(item.id)">
                        <div class="item-position">
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
<!--                                <div v-if="item.senseId === 'sense' && index === 4" :key="index" class="center-item"></div>-->
                            <div  @click.stop="deleteCamera(item,camera)"  class="sense-item" :class="camera.id === item.senseId ?  `iconfont ${camera.icon}` :''" :key="camera.id"></div>
                        </template>
                    </div>

                </div>
            </template>
        </div>
        <!--页脚工具栏 插槽 -->
        <div slot="footerBar" class="ui flex col-center bottom-button-box">
            <div class="m-l-15">
                <el-button type="primary" size="medium" @click="submit">保存
                </el-button>
                <el-button size="medium" @click="$parent.close()">取消</el-button>
            </div>
        </div>


        <div class="contextmenu-box" id="contextmenu-box" :style="`left:${offsetX}px;top:${offsetY}px`" v-show="showContextmenu">
            <div class="top-control" @click="showContextmenu = false"><i class="icon close m-5"></i></div>
            <div class="content-title" v-if="canAddCamera">摄像头(朝向)</div>
            <div class="camera-pos" v-if="canAddCamera">
                <template v-for="(item) in cameraPos">
<!--                    <div v-if="index === 4" :key="index" class="center-item"></div>-->
                    <div class="camera-item" :class="{active:item.id === currentSense.senseId}" :key="item.id"
                         @click="selectCamera(item.id)">
<!--                        {{item.label}}-->
                        <i :class="`w-100p h-100p iconfont ${item.icon}`"></i>
                    </div>
                </template>
            </div>
            <div class="content-title" v-if="canAddSense">传感器</div>
            <div class="camera-pos" v-if="canAddSense">
                <div class="camera-item" :class="{active:currentSense.senseId === 'sense'}"
                     @click="selectCamera('sense')">
                    <i class="w-100p h-100p iconfont ali-iconchuanganqi"></i>
                </div>
                <div class="camera-item"
                     @click="selectCamera('delete')">
                    <i class="w-100p h-100p iconfont ali-iconshanchu"></i>
                </div>
            </div>
        </div>
    </ui-main>
</template>

<script>
    export default {
        name: "editRoom",
        data() {
            return {
                visible: false,
                loading: true,
                showContextmenu: false,
                canAddCamera: true,
                canAddSense: true,
                roomList: [],
                act: [],
                actWall: [],
                wallData: [],
                senseData: [],
                selected: [],
                selectedPos: [],
                posData: [],
                cameraPos: [
                    {label: '左前', id: 'leftHead',icon:'ali-iconjiantou_zuoshang'},
                    {label: '正前', id: 'head',icon:'ali-iconjiantou_xiangshang'},
                    {label: '右前', id: 'rightHead',icon:'ali-iconjiantou_youshang'},
                    {label: '正左', id: 'left',icon:'ali-iconjiantou_xiangzuo'},
                    {label: '删除', id: 'delete',icon:'ali-iconshanchu'},
                    {label: '正右', id: 'right',icon:'ali-iconjiantou_xiangyou'},
                    {label: '左后', id: 'leftBack',icon:'ali-iconjiantou_zuoxia'},
                    {label: '正后', id: 'back',icon:'ali-iconjiantou_xiangxia'},
                    {label: '右后', id: 'rightBack',icon:'ali-iconjiantou_youxia'},
                ],
                currentSense: {
                    senseId: ''
                },
                editType: "room",
                wallType: "horizontal",
                widthNum: 36,
                heightNum: 50,
                domKey: 1,
                offsetX: 1,
                offsetY: 1,
            }
        },
        created() {
            window.onkeydown = (e) => {
                if (e.code === 'Tab') {
                    e.preventDefault();
                    this.changeWallType();
                }
            }
            window.oncontextmenu = () => {
                return false
            }
            document.addEventListener('click', function() {
                this.showContextmenu = false
            })

        },
        mounted() {
            this.$nextTick(() => {
                let x = 0;
                let z = 0
                for (let i = 0; i < 36 * this.heightNum; i++) {
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
                        wall: [],
                        senseId: ''
                    });
                }


                setTimeout(() => {
                    this.initWallData();
                    this.initSenseData();
                    this.loading = false;
                })

                this.$el.parentElement.addEventListener('mousedown', (e) => {
                    if (e.button === 2) {
                        let parentHeight = this.$el.parentElement.clientHeight;
                        let parentWidth = this.$el.parentElement.clientWidth;
                        if (parentWidth - e.clientX < 200) {
                            this.offsetX = parentWidth - 200;
                        }else {
                            this.offsetX = e.clientX
                        }


                        if (parentHeight - e.clientY < 300) {
                            this.offsetY = parentHeight - 300;
                        }else {
                            this.offsetY = e.clientY - 100;
                        }

                    }

                })
            })
            this.$parent.params.selected && this.$parent.params.selected.forEach(item => {
                this.act.push(item.id);
                this.selected.push(item);
                setTimeout(() => {
                    this.roomList.forEach(room => {
                        if (item.id === room.id) {
                            room.pos = item.pos;
                        }
                    })
                })
            })

        },
        methods: {

            initWallData() {
                this.$parent.params.wallList && this.$parent.params.wallList.forEach(item => {
                    this.wallData.push(item)
                    this.actWall.push(item.id)
                    let dom = document.getElementById(`room-${item.id}`);
                    let newStyle = '3px solid rgba(200,200,10,1)';
                    item.wall.forEach(wall => {
                        if (wall === 'verticalWall') {
                            dom.style.borderLeft = newStyle;
                            dom.setAttribute('borderLeft', 'true');
                        } else {
                            dom.style.borderTop = newStyle;
                            dom.setAttribute('borderTop', 'true');
                        }
                    })
                })
            },
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
                    let dom = document.getElementById(`room-${item.id}`);
                    if (this.actWall.length && this.actWall.includes(item.id)) {
                        let oldStyle = '1px solid rgba(0, 0, 0, 0.2)';
                        let newStyle = '3px solid rgba(200,200,10,1)';
                        if (this.wallType === 'vertical' &&
                            (!dom.getAttribute('borderLeft') || dom.getAttribute('borderLeft') === 'false')) {
                            dom.style.borderLeft = newStyle;
                            dom.setAttribute('borderLeft', 'true');
                            this.changeWall(item.id, 'vertical', 'add');
                        } else if (this.wallType === 'horizontal' &&
                            (!dom.getAttribute('borderTop') || dom.getAttribute('borderTop') === 'false')) {
                            dom.style.borderTop = newStyle
                            dom.setAttribute('borderTop', 'true');
                            this.changeWall(item.id, 'horizontal', 'add');
                        } else if (this.wallType === 'horizontal'
                            && dom.getAttribute('borderTop') === 'true') {
                            dom.style.borderTop = oldStyle
                            dom.setAttribute('borderTop', 'false');

                            if (!dom.getAttribute('borderLeft')
                                || dom.getAttribute('borderLeft') === 'false') {
                                this.deleteData(item.id);
                            } else {
                                this.changeWall(item.id, 'horizontal', 'delete');
                            }
                        } else if (this.wallType === 'vertical'
                            && dom.getAttribute('borderLeft') === 'true') {
                            dom.style.borderLeft = oldStyle
                            dom.setAttribute('borderLeft', 'false');

                            if (!dom.getAttribute('borderTop')
                                || dom.getAttribute('borderTop') === 'false') {
                                this.deleteData(item.id);
                            } else {
                                this.changeWall(item.id, 'vertical', 'delete');
                            }
                        }
                    } else {
                        if (this.wallType === 'horizontal') {
                            dom.style.borderTop = '3px solid rgba(200,200,10,1)';
                            dom.setAttribute('borderTop', 'true');
                            item.wall.push('horizontalWall');
                        } else {
                            dom.style.borderLeft = '3px solid rgba(200,200,10,1)';
                            dom.setAttribute('borderLeft', 'true');
                            item.wall.push('verticalWall');
                        }
                        this.wallData.push(item)
                        this.actWall.push(item.id);
                    }

                }
            },
            changeWallType() {
                if (this.editType !== 'room') {
                    this.wallType === 'horizontal' ?
                        this.wallType = 'vertical' : this.wallType = 'horizontal';
                }
            },
            changeWall(id, type, methods) {
                let remove = (data, source) => {
                    data.forEach((item, index) => {
                        if (item === source) {
                            data.splice(index, 1);
                        }
                    })
                }
                if (methods === 'add') {
                    this.wallData.forEach(item => {
                        if (id === item.id) {
                            if (type === 'vertical') {
                                item.wall.push('verticalWall')
                            } else {
                                item.wall.push('horizontalWall');
                            }
                        }
                    });
                } else {
                    this.wallData.forEach(item => {
                        if (id === item.id) {
                            if (type === 'vertical') {
                                remove(item.wall, 'verticalWall');
                            } else {
                                remove(item.wall, 'horizontalWall');
                            }
                        }
                    });
                }
            },
            deleteData(id) {
                this.actWall = this.actWall.filter((source) => {
                    return id !== source;
                });
                this.wallData = this.wallData.filter((source) => {
                    return id !== source.id;
                });
            },
            changePos(item, pos) {
                this.selected.forEach(data => {
                    if (data.id === item.id) {
                        // data.pos = pos;
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
            selectSense(item) {
                if (this.act.includes(item.id)) {
                    this.canAddCamera = false
                    this.canAddSense = true
                }else {
                    this.canAddCamera = true
                    this.canAddSense = false;
                }
                this.showContextmenu = true;
                this.currentSense = item;

            },
            selectCamera(id) {
                if (id === 'delete') {
                    this.senseData = this.senseData.filter((source) => {
                        return this.currentSense.senseId !== source.data.senseId;
                    });
                    this.currentSense.senseId = '';
                }else {
                    this.currentSense.senseId = id;
                    if (id === 'sense') {
                        this.senseData.push({
                            type:'sense',
                            data:this.currentSense
                        });
                    }else {
                        this.senseData.push({
                            type:'camera',
                            data:this.currentSense
                        });
                    }

                }

                this.showContextmenu = false;
            },
            deleteCamera(item,camera) {
                console.log(item,camera)
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

            &.active {
                background-color: #d3ea7f;
            }
        }
    }

    /*机柜方向*/
    .item-position {
        width: 100%;
        height: 100%;
        position: relative;
        font-size: 12px;
        color: rgba(0, 0, 0, .5);

        .active {
            color: #409eff;
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
            transform: translate(-50%,-50%);
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
        width: 200px;
        height: 400px;
        position: absolute;
        border: 1px solid rgba(0, 0, 0, .2);
        /*border-radius: 10px;*/
        background-color: #fff;
        overflow: hidden;
        color: black;
        font-size: 18px;
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
            grid-template-rows: repeat(3, 60px);

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
                    font-size: 28px;
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
</style>
