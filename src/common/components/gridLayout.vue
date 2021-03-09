<style lang="scss" scoped>
    @import "./gridLayout";
</style>
<template>
    <div>
        <slot name="topTitle"></slot>
        <grid-layout :layout.sync="data"
            :col-num="colNum"
            :row-height="rowHeight"
            :is-draggable="isDraggable"
            ref="gridLayout"
            :is-resizable="isResizeble"
            :is-mirrored="isMirrored"
            :autoSize="autoSize"
            :vertical-compact="verticalCompact"
            :margin="margin"
            :use-css-transforms="false"
            :responsive="responsive"
            :breakpoints="breakpoints"
            :cols="cols"
            @layout-created="layoutCreatedEvent"
            @layout-before-mount="layoutBeforeMountEvent"
            @layout-mounted="layoutMountedEvent"
            @layout-ready="layoutReadyEvent"
            @layout-updated="layoutUpdatedEvent">
            <slot name="background"></slot>
            <grid-item ref="gridItem"
                :class="['grid-item', {'static': item.static || item._static}, {'fullScreen': item._fullScreen}]"
                v-for="item in value"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :key="item.i"
                @resize="resizeEvent"
                @move="moveEvent"
                @resized="resizedEvent"
                @moved="movedEvent">
                <div :class="['ui card', diyClass || 'default-bgc', item.t ? 'transparent':'']" v-loading="item.loading"
                    element-loading-background="rgba(0, 0, 0, 0)">
                    <div class="header" v-if="$scopedSlots.title">
                        <p class="title">
                            <slot name="title" :data="item"></slot>
                        </p>
                    </div>
                    <span v-if="isDraggable" class="toolbar">
                        <template v-if="!item._fullScreen">
                            <i class="icon expand" title="放大" @click.stop="amplification(item.i)"></i>
                            <i class="icon code" title="编辑" @click.stop="edit(item)"></i>
                            <i class="icon times" title="删除" @click="delItem(item.i)"></i>
                        </template>
                        <i class="icon compress" v-else title="缩小" @click.stop="compress"></i>
                    </span>
                    <div class="center of-h flex-1">
                        <component v-if="item.comp && item.comp.name" :is="item.comp.name"
                            :option="comData[item.comp.type]" width="100%" height="100%" dark />
                        <slot :data="item" v-else></slot>
                    </div>
                </div>
            </grid-item>
        </grid-layout>
    </div>
</template>
<script>
    import {
        GridLayout,
        GridItem
    } from 'vue-grid-layout'

    export default {
        name: 'ui-layout',
        data() {
            return {
                packUp: false,
                loading: true
            }
        },
        components: {
            GridLayout,
            GridItem
        },
        props: {
            // 网格初始化布局  数组
            value: Array,
            // 表示网格有多少列 数字
            colNum: {
                type: Number,
                default: 12
            },
            // 表示一行的高度(以像素为单位)
            rowHeight: {
                type: Number,
                default: 30
            },
            // 表示网格项数是否可以拖动
            isDraggable: {
                type: Boolean,
                default: true
            },
            // 表示网格是否可以改变带大小
            isResizeble: {
                type: Boolean,
                default: true
            },
            // RTL/LTR 的转换
            isMirrored: {
                type: Boolean,
                default: false
            },
            // 容器是否根据内部自适应
            autoSize: {
                type: Boolean,
                default: true
            },
            // 垂直方向上是否紧凑布局
            verticalCompact: {
                type: Boolean,
                default: true
            },
            // 网格之间的边距 [水平, 垂直]
            margin: {
                type: Array,
                default: () => [10, 10]
            },
            // 布局是否为响应式
            responsive: {
                type: Boolean,
                default: false
            },
            // 响应式布局设置断点
            breakpoints: {
                type: Object,
                default: () => ({})
            },
            // 设置每个断点对应的列数
            cols: {
                type: Object,
                default: () => ({})
            },

            // 删除按钮是否显示
            delIcon: {
                type: Boolean,
                default: false
            },
            // 自定义样式的类名
            diyClass: {
                type: String,
                default: null
            }
        },
        computed: {
            data: {
                get() {
                    return this.value
                },
                set(val) {
                    this.$emit('input', val)
                }
            }
        },
        mounted() {
            this.$nextTick(() => {
                
                setImmediate(() => {
                    this.$refs.gridLayout.onWindowResize()
                });

                //执行一次重绘解决子容器无法取得容器高宽问题
                this.$refs.gridLayout.updateHeight()

                // 检查是否嵌套布局
                if (this.$parent.$el.className.indexOf('vue-grid-item') > -1) {
                    let val = this.$bui.findCompUpward(this, 'ui-layout').value

                    for (let i = 0, len = val.length; i < len; i++) {
                        if (val[i].i === this.$parent.i) {
                            //关闭嵌套父级loading
                            val[i].loading = false
                            break
                        }
                    }
                }
            })
        },
        methods: {
            // 对应Vue生命周期的created
            layoutCreatedEvent(newLayout) {
                this.$emit('layoutCreatedEvent', newLayout)
            },
            // 对应Vue生命周期的beforeMount
            layoutBeforeMountEvent(newLayout) {
                this.$emit('layoutBeforeMountEvent', newLayout)
            },
            // 对应Vue生命周期的mounted
            layoutMountedEvent(newLayout) {
                this.$emit('layoutMountedEvent', newLayout)
            },
            // 当完成mount中的所有操作时生成的事件
            layoutReadyEvent(newLayout) {
                this.$emit('layoutReadyEvent', newLayout)
            },
            // 更新事件
            layoutUpdatedEvent(newLayout) {
                this.$emit('layoutUpdatedEvent', newLayout)
            },
            // 调整大小时的事件
            resizeEvent(i, newH, newW, newHPx, newWPx) {
                this.$emit('resizeEvent', {
                    i,
                    newH,
                    newW,
                    newHPx,
                    newWPx
                })
            },
            // 调整大小后的事件
            resizedEvent(i, newH, newW, newHPx, newWPx) {
                this.$emit('resizedEvent', {
                    i,
                    newH,
                    newW,
                    newHPx,
                    newWPx
                })
                console.log(document.querySelectorAll('.vue-grid-layout')[1].__vue__.layout)
            },
            // 移动时的事件
            moveEvent(i, newX, newY) {
                this.$emit('moveEvent', {
                    i,
                    newX,
                    newY
                })
            },
            // 移动后的事件
            movedEvent(i, newX, newY) {
                this.$emit('movedEvent', {
                    i,
                    newX,
                    newY
                })
            },
            // 新增子容器
            addItem(item) {
                this.data.push(item || {
                    h: 1,
                    i: new Date().getTime(),
                    w: 1,
                    x: 0,
                    y: 0
                })
            },
            amplification(i) {
                this.data.forEach((val) => {
                    if (i === val.i) {
                        this.$set(val, '_fullScreen', true)
                        this.$set(val, '_static', true)
                        document.addEventListener('keyup', this.listenerEsc)
                    }
                })
            },
            listenerEsc(e) {
                // 监听ESC
                console.log(111)
                if (e.keyCode == 27) {
                    this.compress()
                }
            },
            compress() {
                this.data.forEach((val) => {
                    if (val._fullScreen) {
                        this.$set(val, '_fullScreen', false)
                        this.$set(val, '_static', false)
                        // 关闭ESC监听
                        document.removeEventListener('keyup', this.listenerEsc)
                    }
                })
            },
            // 删除某子容器
            delItem(i) {
                this.data.forEach((val, index) => {
                    if (val.i === i) {
                        this.data.splice(index, 1)
                    }
                })
            },
            // 编辑某子容器
            edit(item) {
                this.$emit('edit', item)
            },
        }
    }
</script>
