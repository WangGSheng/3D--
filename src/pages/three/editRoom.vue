<template>
    <ui-main title="编辑机房">
        <div class="toolbar">
            <el-radio-group v-model="editType">
                <el-radio label="room">编辑机柜</el-radio>
                <el-radio label="wall">编辑围墙</el-radio>
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
                        <el-popover
                            placement="top"
                            title="机柜门方向"
                            width="180"
                            trigger="hover"
                            :key="item.id">
                            <el-checkbox-group v-model="item.pos" class="w-100p"
                                               @change="changeSelect(item.id,item.pos)">
                                <el-checkbox v-for="pos in position" :label="pos.id" :key="pos.id + 'popover'">
                                    {{ pos.label }}
                                </el-checkbox>
                            </el-checkbox-group>
                            <div slot="reference"
                                 class="w-100p h-100p"></div>
                        </el-popover>
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
        window.onmousedown = (e) => {
            if (e.button == 2) {
                e.preventDefault();
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
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
                    wall:[]
                });
            }


            setTimeout(()=>{
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
                    }else {
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
                        dom.setAttribute('borderLeft','true');
                        this.changeWall(item.id,'vertical','add');
                    }else if (this.wallType === 'horizontal' &&
                        (!dom.getAttribute('borderTop') || dom.getAttribute('borderTop') === 'false')) {
                        dom.style.borderTop = newStyle
                        dom.setAttribute('borderTop','true');
                        this.changeWall(item.id,'horizontal','add');
                    }else if (this.wallType === 'horizontal'
                        && dom.getAttribute('borderTop') === 'true') {
                        dom.style.borderTop = oldStyle
                        dom.setAttribute('borderTop', 'false');

                        if (!dom.getAttribute('borderLeft')
                            || dom.getAttribute('borderLeft') === 'false') {
                            this.deleteData(item.id);
                        }else{
                            this.changeWall(item.id,'horizontal','delete');
                        }
                    } else if (this.wallType === 'vertical'
                        && dom.getAttribute('borderLeft') === 'true') {
                        console.log('---------')
                        dom.style.borderLeft = oldStyle
                        dom.setAttribute('borderLeft', 'false');

                        if (!dom.getAttribute('borderTop')
                            || dom.getAttribute('borderTop') === 'false') {
                            this.deleteData(item.id);
                        }else{
                            this.changeWall(item.id,'vertical','delete');
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
        changeWall(id,type,methods) {
            let remove = (data,source) => {
                data.forEach((item,index) => {
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
                        }else {
                            item.wall.push('horizontalWall');
                        }
                    }
                });
            }else{
                this.wallData.forEach(item => {
                    if (id === item.id) {
                        if (type === 'vertical') {
                            remove(item.wall, 'verticalWall');
                        }else {
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
        changeSelect(id, pos) {
            this.selected.forEach(item => {
                if (item.id === id) {
                    item.pos = pos;
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
            background-color: rgb(238, 217, 146);
        }
    }
}

</style>
