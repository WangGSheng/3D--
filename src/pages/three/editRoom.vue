<template>
    <ui-main title="编辑机房">
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
            <template v-for="item in this.roomList">
                <div :class="{'grid-item':true,active:act.includes(item.id)}" :key="item.id"
                     :id="'room-' + item.id"
                     @click.stop="select(item)">
                    <template v-if="act.includes(item.id)">
                        <div class="item-position">
                            <div class="pos-up" :class="{active:item.pos.includes('back')}"
                                 @click.stop="changeSelect(item,'back')"><i class="icon caret up"></i></div>
                            <div class="pos-left" :class="{active:item.pos.includes('left')}"
                                 @click.stop="changeSelect(item,'left')"><i class="icon caret left"></i></div>
                            <div class="pos-right" :class="{active:item.pos.includes('right')}"
                                 @click.stop="changeSelect(item,'right')"><i class="icon caret right"></i></div>
                            <div class="pos-down" :class="{active:item.pos.includes('head')}"
                                 @click.stop="changeSelect(item,'head')"><i class="icon caret down"></i></div>
                        </div>
                    </template>
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
    </ui-main>
</template>

<script>
export default {
    name: "editRoom",
    data() {
        return {
            visible: false,
            roomList: [],
            act: [],
            actWall: [],
            wallData: [],
            selected: [],
            selectedPos: [],
            posData: [],
            editType: "room",
            wallType: "horizontal",
            position: [
                {
                    label: '前',
                    id: 'head'
                },
                {
                    label: '后',
                    id: 'back'
                },
                {
                    label: '左',
                    id: 'left'
                },
                {
                    label: '右',
                    id: 'right'
                },
            ],
            widthNum: 36,
            heightNum: 50,
            domKey: 1,
        }
    },
    created() {
        window.onkeydown = (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.changeWallType();
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            console.log(this.$refs.checkbox)
            // this.widthNum = parseInt(this.$el.lastElementChild.clientWidth / 40)
            // this.heightNum = parseInt((this.$el.lastElementChild.clientHeight - 10) / 40)
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
                    wall: []
                });
            }


            setTimeout(() => {
                this.initWallData();
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
        changeSelect(item, pos) {
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
        submit() {
            this.$parent.close({
                cabinetData: this.selected,
                wallData: this.wallData
            });
        }
    }
}
</script>

<style scoped lang="scss">
.grid-box {
    //width: 100%;
    //height: 100%;
    display: grid;
    overflow-x: auto;
    margin-top: 10px;
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

</style>
