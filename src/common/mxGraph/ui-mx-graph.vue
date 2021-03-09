
<template>
    <!-- 下面放置页面内容 -->
    <div class="ui flex item one of-h" v-loading="loading">
        <div class="ui flex item one" ref="mxMainContainer"></div>
    </div>
</template>
<script>
    /* eslint-disable */
    export default {
        name: 'ui-mx-graph',
        props: {
            data: {},
            layers: {},
            fullScreen: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                graph: '',
                alarmsed: [],
                cell: '',
                loading: true,
                init: false,
                zoom: 10
            }
        },
        mounted() {
            this.main(this.$refs['mxMainContainer']);
        },
        watch: {
            layers(layerList) {
                let mxGraphLayers = this.graph.getLayers();
                for (let i in mxGraphLayers) {
                    this.graph.getModel().setVisible(mxGraphLayers[i], jQuery.inArray(mxGraphLayers[i].id, layerList) !== -1);
                }
            },
            data: {
                handler: function(v) {
                    $(this.$refs['mxMainContainer']).html(null);
                    this.main(this.$refs['mxMainContainer']);
                },
                deep: true
            }
        },
        methods: {
            //初始化图形
            main(container) {
                if (!mxClient.isBrowserSupported()) {
                    mxUtils.error('Browser is not supported!', 200, false);
                }else{
                    mxGraph.prototype.zoomToCenter = function(margin) {
                        this.container.style.overflow = 'hidden';
                        let bounds = this.getGraphBounds();
                        this.center(true, true);//将画布放到容器中间

                        /*while((bounds.width + margin * 2) > this.container.clientWidth
                        || (bounds.height + margin * 2) > this.container.clientHeight){
                            this.zoomOut();
                            bounds = this.getGraphBounds();
                        }*/
                    };

                    mxGraph.prototype.getLayers = function() {
                        //获取已标点数据
                        let allCells = this.getModel().cells;
                        let layers = [];
                        for (let i in allCells) {
                            if (allCells[i].parent && allCells[i].parent.id === '0' && allCells[i].id !== '1') {
                                layers.push(allCells[i]);
                            }
                        }
                        return layers;
                    }

                    let graph = new mxGraph(container);

                    this.graph = graph;
                    // Loads the stencils into the registry
                    // let req = mxUtils.load(BASE_URL + '/static/libs/mxGraph/stencils/android/android.xml');
                    let req = mxUtils.load('/static/libs/mxGraph/stencils/android/android.xml');
                    let root = req.getDocumentElement();
                    let shape = root.firstChild;

                    // let req1 = mxUtils.load(BASE_URL + '/static/libs/mxGraph/js/shapes.js');
                    let req1 = mxUtils.load('/static/libs/mxGraph/js/shapes.js');

                    if (req1 != null) {
                        eval.call(window, req1.getText())
                    }

                    while(shape != null){
                        if (shape.nodeType == mxConstants.NODETYPE_ELEMENT) {
                            mxStencilRegistry.addStencil(root.getAttribute('name') + '.' + shape.getAttribute('name'), new mxStencil(shape));
                        }

                        shape = shape.nextSibling;
                    }

                    // let node = mxUtils.load(BASE_URL + '/static/libs/mxGraph/resources/default-style.xml').getDocumentElement();
                    let node = mxUtils.load('/static/libs/mxGraph/resources/default-style.xml').getDocumentElement();
                    let dec = new mxCodec(node.ownerDocument);
                    dec.decode(node, graph.getStylesheet());

                    graph.setEnabled(false);
                    graph.setPanning(true);
                    graph.setTooltips(true);

                    graph.setTooltips(true);
                    graph.setEnabled(false);

                    graph.setPanning(true);
                    graph.setCellsMovable(false);
                    // 节点是否解析html
                    graph.setHtmlLabels(true);

                    graph.panningHandler.useLeftButtonForPanning = true;

                    new mxCellTracker(graph);

                    let style = graph.getStylesheet().getDefaultVertexStyle();
                    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ROUNDED;
                    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
                    style[mxConstants.STYLE_PERIMETER_SPACING] = 4;
                    //style[mxConstants.STYLE_SHADOW] = true;

                    style = graph.getStylesheet().getDefaultEdgeStyle();
                    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';

                    style = mxUtils.clone(style);
                    style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
                    graph.getStylesheet().putCellStyle('2way', style);

                    graph.isHtmlLabel = function(cell) {
                        return !this.isSwimlane(cell);
                    };

                    graph.getModel().beginUpdate();
                    try{
                        this.read(graph, '/static/libs/mxGraph/resources/default-style.xml');
                        let parent = graph.getDefaultParent();
                    }finally{
                        graph.getModel().endUpdate();
                    }

                    graph.dblClick = function(evt, cell) {
                        let mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
                        this.fireEvent(mxe);

                        if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed() &&
                            cell != null) {
                            mxUtils.alert('Show properties for cell ' + (cell.customId || cell.getId()));
                        }
                    };

                    if (mxClient.IS_QUIRKS) {
                        document.body.style.overflow = 'hidden';
                        new mxDivResizer(container);
                    }

                    // 点击选中
                    graph.click = (evt, cell) => {
                        if (evt.getCell() != null) {
                            this.selectCell(evt.getCell().id, true);
                            this.cell = evt.getCell();
                            if (this.fullScreen) {
                                this.$eventHub.$emit('fullScreenCellClick', this.cell);
                            }else{
                                this.$eventHub.$emit('cellClick', this.cell);
                            }
                        }else{
                            this.clearSelect();
                            this.cell = '';
                        }
                    }

                    // 滚动鼠标滚轮放大缩小
                    $(this.$refs['mxMainContainer']).on('mousewheel', (event, delta) => {
                        let up = delta > 0;
                        if (up) {
                            graph.zoomIn();
                            this.zoom = this.zoom < 40 ? this.zoom + 1 : this.zoom;
                        }else{
                            graph.zoomOut();
                            this.zoom = this.zoom > 1 ? this.zoom - 1 : this.zoom;
                        }
                        this.cell = '';
                    });

                    if (this.fullScreen) {
                        //监听外部按钮事件
                        this.$eventHub.$on('fullScreenMxGraphAction', (v) => {
                            if (v === 'restore') {
                                graph.getView().setScale(0.25);
                            }
                            if (v === 'plus') {
                                graph.zoomIn();
                                this.zoom = this.zoom < 40 ? this.zoom + 1 : this.zoom;
                            }
                            if (v === 'minus') {
                                graph.zoomOut();
                                this.zoom = this.zoom > 1 ? this.zoom - 1 : this.zoom;
                            }
                        })
                    }else{
                        //监听外部按钮事件
                        this.$eventHub.$on('mxGraphAction', (v) => {
                            if (v === 'restore') {
                                graph.getView().setScale(0.25);
                            }
                            if (v === 'plus') {
                                graph.zoomIn();
                                this.zoom = this.zoom < 40 ? this.zoom + 1 : this.zoom;
                            }
                            if (v === 'minus') {
                                graph.zoomOut();
                                this.zoom = this.zoom > 1 ? this.zoom - 1 : this.zoom;
                            }
                        })
                    }
                }
            },
            read(graph, filename) {
                let alog = 0;
                // 回显xml
                if (this.data.xml_url) {
                    this.$http.getDatas(this.data.xml_url).then((res) => {
                        let data = res.result
                        // let data = res;
                        if (!data) {
                            data = filename;
                        }
                        let doc = mxUtils.parseXml(data);
                        let codec = new mxCodec(doc);
                        codec.decode(doc.documentElement, graph.getModel());
                        // graph.fit();
                        graph.zoomToCenter(10);
                        alog++;
                        if (this.data.pic_url) {
                            if (alog === 2) {
                                this.loading = false;
                            }
                        }else{
                            this.loading = false;
                        }
                    })

                }else{
                    console.log('没有对应标点的XML！')
                }

                // 回显图片
                if (this.data && this.data.pic_url) {
                    let _this = this;
                    let imgtmp = new Image();
                    graph.getModel().beginUpdate();
                    try{
                        // 回显图片
                        loadBackImage(this.data.pic_url);

                        //开始加载背景图片
                        function loadBackImage(backurl) {
                            loadImage(backurl, setBackgroundImage);

                        }

                        //处理背景图片
                        function loadImage(url, callback) {
                            // 创建一个Image对象，实现图片的预下载
                            imgtmp.src = url;

                            /*if(imgtmp.complete){ // 如果图片已经存在于浏览器缓存，直接调用回调函数
                                callback.call(imgtmp, graph);
                                return; // 直接返回，不用再处理onload事件
                            }*/
                            imgtmp.onload = function() { // 图片下载完毕时异步调用callback函数。
                                callback.call(imgtmp, graph);// 将回调函数的this替换为Image对象
                            };

                            imgtmp.onerror = function() {
                                alog++;
                                if (_this.data.xml_url) {
                                    if (alog === 2) {
                                        _this.loading = false;
                                    }
                                }else{
                                    _this.loading = false;
                                }
                            };
                        }

                        //加载背景图片
                        function setBackgroundImage(parent) {
                            if (parent.view == null) {
                                parent = null;
                            }

                            let w = this.width;
                            let h = this.height;
                            //let bl = w/h;

                            parent.img = new mxImage(BASE_URL + '/admin/file/image/safe/' + _this.data.pic_url, w, h);
                            parent.setBackgroundImage(parent.img);
                            parent.view.validate();
                            parent.sizeDidChange();
                            graph.fit();

                            alog++;
                            if (_this.data.xml_url) {
                                if (alog === 2) {
                                    _this.loading = false;
                                }
                            }else{
                                _this.loading = false;
                            }
                        }
                    }finally{
                        graph.getModel().endUpdate();
                    }
                }
            },
            selectCell: function(id, scroll) {
                let model = this.graph.getModel();
                let cell = model.getCell(id);
                this.clearSelect();
                if (cell != null) {
                    this.graph.setSelectionCell(cell);
                    if (!scroll) {
                        this.graph.scrollCellToVisible(cell, true);
                    }
                }
            },
            clearSelect: function() {
                this.graph.clearSelection();
            },
        },
        beforeDestroy() {
            $(this.$refs['mxMainContainer']).off('mousewheel');
            //解除外部按钮事件监听
            if (this.fullScreen) {
                this.$eventHub.$off('fullScreenMxGraphAction');
            }else{
                this.$eventHub.$off('mxGraphAction');
            }

            this.$eventHub.$off('cellClick');
        }
    }
</script>
<style lang="scss"></style>
