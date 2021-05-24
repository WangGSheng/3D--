<style scoped lang="scss">
.control {
    z-index: 10;
    position: absolute;
    width: 40px;
    height: 40px;
    text-align: center;
    padding: 10px 0 5px 6px;
    cursor: pointer;
    color: #ddd;
    background-color: #7499d9;
    right: 10px;
    bottom: 10px;
    font-size: 18px;
    //width: 200px;
    //background-color: rgba(0, 0, 0, .5);
    border-radius: 50%;

    &:hover {
        color: #fff;
    }

    .title {
        padding: 5px;
        background-color: #dff;
    }

    .item-box {;

        .item-content {
            background-color: grey;
            display: flex;
            padding: 10px;

            .img {
                width: 40px;
                padding: 5px;

                .item-content-name {
                    color: #fff;
                    text-align: center;
                    letter-spacing: 2px;
                }

                &:hover {
                    border: 1px solid;
                }
            }

        }
    }
}

/*弹窗*/
.model-popup {
    height: 230px;
    //border: 1px solid rgba(#121b74, 0.1);
    border-radius: 5px;
    margin-top: -130px;
    color: #B9EDF8;
    background-color: rgba(#1F6ED4, 1);
    transition: all 0.2s linear;

    &::before {
        content: "";
        position: absolute;
        width: 0px;
        height: 0px;
        left: calc(50% - 8px);
        bottom: -15px;
        border-top: 8px solid #1F6ED4;
        border-right: 8px solid transparent;
        border-left: 8px solid transparent;
        border-bottom: 8px solid transparent;
    }
}

/*统计面板*/
.status-ui {
    position: absolute;
    left: 0;
    top: 0;
    width: 150px;
    height: 300px;
}
</style>

<template>
    <ui-main :title="$route.name" noPadding
             v-loading="loading"
             element-loading-text="拼命绘制中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)">
        <div ref="threeDom" class="w-100p h-100p"></div>

        <div class="control" title="编辑" v-show="false">
            <i class="icon edit"></i>
        </div>

        <div class="model-popup" v-show="false">
        </div>

        <div class="status-ui" v-show="showStatusUi">
            <table class="ui celled vertical-striped table compact w-100p">
                <tr>
                    <td class="w-50p t-r">机柜：</td>
                    <td>{{ cabinetNum }}</td>
                </tr>
                <tr>
                    <td class="w-50p t-r">摄像头：</td>
                    <td>{{ cameraNum }}</td>
                </tr>
                <tr>
                    <td class="w-50p t-r">传感器：</td>
                    <td>{{ sensorNum }}</td>
                </tr>
            </table>
        </div>
    </ui-main>
</template>

<script>
// 场景
let scene = null;
// Mesh 集合
let group = null;
// 相机
let camera = null;
// 渲染器
let renderer = null;
// 灯光
let light = null;
// 实例平移
// let transformControls = null;
// 鼠标拾取射线
let rayCaster = null;
// 鼠标
let mouse = null;
// 鼠标拖拽
// let dragControls = null;
// 鼠标控件 旋转缩放
import OrbitControls from 'three-orbitcontrols'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
/*eslint-disable*/
import room3D from './机房2.js'
import Vue from 'vue'
import mapPopup from '@/pages/videoPlayer/_videoPopup.vue'

export default {
    data() {
        return {
            threeDom: null,
            controls: null,
            drawer: false,
            showStatusUi: false,
            loading: true,
            objects: [],
            max: 0,
            groundCount: 1,
            wallCount: 1,
            near: 1,
            far: 1000,
            selectedMesh: [],
            cubeList: [],
            wallList: [],
            senseList: [],
            sensorList: [],
            GLTFLoader: null,// 外部模型加载器 .GLTF，.GLB
            cssRender: null,
            videoComponent: null,
            videoVm: null,// 用以存储弹窗实例，用以销毁视频播放
            beforeSelected: null,
            cabinetNum: 0,
            cameraNum: 0,
            sensorNum: 0,
        }
    },
    mounted() {
        // 创建场景
        this.initScene();
        // 创建相机
        this.initCamera();
        // 创建渲染器
        this.initRenderer();
        // 创建光源
        this.initLight();

        this.initLoader();
        // 本地数据
        this.initData(room3D);
        // 创建地板
        // this.createGround();
        // 创建立方体
        // this.createCabinet();
        // 添加拖拽控件
        // this.initTransformControl();
        // 添加删除事件
        // this.initDeleteEvent();

        // 加载CSS2DRenderer
        this.initCssRender();
        // 传感器
        // this.addScene()

        // 鼠标控制器
        this.getOrbitControls()

        // 添加点击事件
        this.initRayCaster();

        //加入事件监听器,窗口自适应
        window.addEventListener('resize', function () {
            let width = window.innerWidth;
            let height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        })

        setTimeout(() => {
            this.render();
            this.loading = false
            this.showStatusUi = true
            // 初始化各面板
            this.initMyDom();
        }, 1000)
        // vue实例
        this.videoComponent = Vue.extend(mapPopup)
    },
    methods: {
        // 创建场景
        initScene() {
            scene = new THREE.Scene();
            group = new THREE.Group();
            scene.add(group);
            // 加载辅助坐标系 实际应用的时候需要注释此代码
            const axisHelper = new THREE.AxisHelper(250)
            axisHelper.position.set(0, 0, 0);//位置
            scene.add(axisHelper)
        },
        // 初始化摄像机
        initCamera() {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.near, this.far);
            camera.position.set(140, 70, 190);//位置
            camera.lookAt(scene.position);//对准的焦点
        },
        // 初始化光源
        initLight() {
            light = new THREE.AmbientLight('#fff') // 光源颜色;
            // light.position.set(0, 0, 100);
            scene.add(light);
        },
        // 初始化渲染器
        initRenderer() {
            renderer = new THREE.WebGLRenderer({
                //增加下面两个属性，可以抗锯齿
                antialias: true,
                alpha: true
            });
            renderer.setClearColor('#000', 1);// 设置渲染颜色（背景底色
            renderer.setSize(window.innerWidth, window.innerHeight);// 渲染面大小（在二维平面上的窗口大小）
            renderer.setPixelRatio(window.devicePixelRatio); //设备像素比 可以清晰物体
            this.$refs.threeDom.appendChild(renderer.domElement);
        },
        // initTransformControl() {
        //     // 添加平移控件
        //     transformControls = new THREE.TransformControls(camera, renderer.domElement);
        //     transformControls.setMode("translate");//translate，rotate，scale
        //     transformControls.showY = false;
        //     scene.add(transformControls);
        // },
        // 初始化点击事件
        initRayCaster() {
            rayCaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            //监听全局点击事件,通过ray检测选中哪一个object
            this.cssRender.domElement.addEventListener("mousedown", (event) => {
                event.preventDefault();
                if (event.button === 2) {
                    return false;
                }

                mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
                mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

                rayCaster.setFromCamera(mouse, camera);
                let intersects = rayCaster.intersectObjects(this.objects, true);
                if (intersects.length) {
                    if (intersects[0].object.children[0]?.isScene) {
                        let dom = intersects[0].object.children[0].children[1].element;
                        this.openOrClose(dom)

                        if (!dom.children.length) {
                            const comp = new this.videoComponent({
                                propsData: {
                                    param: '1'
                                }
                            }).$mount();

                            if (this.beforeSelected && this.beforeSelected.id !== intersects[0].object.id) {
                                let oldDom = this.beforeSelected.children[0].children[1].element;
                                this.videoVm.$destroy();
                                this.videoVm = null;
                                this.beforeSelected = null;
                                this.openOrClose(oldDom)
                                oldDom.firstElementChild.remove();
                            }

                            dom.append(comp.$el)
                            this.videoVm = comp;
                            this.beforeSelected = intersects[0].object;
                        } else {
                            this.videoVm.$destroy();
                            dom.firstElementChild.remove();
                            this.videoVm = null;
                            this.beforeSelected = null;
                        }

                    }
                }
            }, false)
        },
        openOrClose(dom) {
            dom.style.fontSize = dom.style.fontSize === '0px' ? '16px' : '0px';
            dom.style.overflow = dom.style.overflow === 'hidden' ? 'unset' : 'hidden';
            dom.style.width = dom.style.width === '0px' ? '400px' : '0px';
            dom.style.padding = dom.style.padding === '0px' ? '5px' : '0px';
        },
        // 初始化外部模型加载器
        initLoader() {
            this.GLTFLoader = new THREE.GLTFLoader();
        },
        // 初始化数据
        initData(item) {
            if (!item) {
                return;
            }
            this.removeMesh();
            if (item.cabinetData && item.cabinetData.length) {
                this.cubeList = item.cabinetData;
                this.createCabinet();
            }
            if (item.wallData && item.wallData.length) {
                this.wallList = item.wallData;
                this.createPlane('wall');
                this.createPlane('ground');
            }
            if (item.senseData && item.senseData.length) {
                this.senseList = item.senseData;

                this.createSense();
            }
            setTimeout(() => {
                this.render();
                this.loading = false
                this.showStatusUi = true;
            }, 1000)
        },
        // 初始化弹窗渲染器
        initCssRender() {
            this.cssRender = new CSS2DRenderer();
            this.cssRender.setSize(window.innerWidth, window.innerHeight);
            this.cssRender.domElement.style.position = 'absolute';
            this.cssRender.domElement.style.top = 0;
            document.body.appendChild(this.cssRender.domElement);
        },
        initMyDom() {
            // 编辑按钮
            let control = document.querySelector('.control').cloneNode(true)
            control.style.display = 'block'
            control.addEventListener('click', this.drawRoom)
            document.body.appendChild(control);

            // 统计面板
            let statusUi = this.$el.querySelector('.status-ui');
            document.body.appendChild(statusUi);
        },
        // 机房编辑
        drawRoom() {
            let vm = this;
            this.showStatusUi = false;
            this.$bui.drawer({
                comp: () => import('./editRoom.vue'), // 注意: 需要懒加载的vue文件必须使用下划线前缀
                params: { // 参数将传给加载的_test.vue页面, 在_test.vue你可以通过this.$parent.params来调用此参数
                    title: '我是标题',
                    selected: vm.cubeList,
                    wallList: vm.wallList,
                    senseList: vm.senseList,
                },
                callback: (item) => {
                    if (item) {
                        vm.loading = true;
                        vm.showStatusUi = false;
                        vm.initData(item);
                    } else {
                        vm.showStatusUi = true;
                    }

                }
            })
        },
        // 添加温湿度传感器模型
        addScene(item, loader) {
            let vm = this;
            loader.load('static/three/model/温湿度/scene.gltf', function (gltf) {
                    let model = gltf.scene;

                    model.rotateZ(Math.PI)
                    model.rotateY(Math.PI / -2)
                    model.isCustomer = true
                    let scale = 1;
                    model.scale.set(scale, scale, scale) // scale here
                    model.name = '传感器-' + item.id
                    // 给模型定制弹窗
                    const popupDiv = document.getElementsByClassName('model-popup')[0].cloneNode(true);
                    popupDiv.textContent = '传感器-' + item.id;
                    popupDiv.style.overflow = 'hidden';
                    popupDiv.style.width = '0px';
                    popupDiv.style.padding = '0px';
                    popupDiv.style.fontSize = '0px';
                    let moonLabel = new CSS2DObject(popupDiv);
                    moonLabel.position.set(0, 1, 0);
                    model.add(moonLabel)


                    // 添加一个透明的Mesh 将模型添加进去
                    let geometry = new THREE.BoxBufferGeometry(2, 2, 2);
                    let material = new THREE.MeshBasicMaterial({color: 0xffffff});
                    material.transparent = true;
                    material.opacity = 0;
                    let other = new THREE.Mesh(geometry, material);
                    if (item.pos.includes('left') || item.pos.includes('right')) {
                        other.position.set(item.x, 9, item.z);
                    } else {
                        other.position.set(item.x + 4, 9, item.z);
                    }

                    other.add(model)


                    group.add(other)
                    vm.objects.push(other)

                }, undefined,
                function (error) {
                    console.error(error)
                });
        },
        // 添加摄像头模型
        addCamera(item, loader) {
            let vm = this;
            loader.load('static/three/model/scene.gltf', function (obj) {
                    let mesh = obj.scene;
                    switch (item.senseId) {
                        case 'rightBack':
                            mesh.rotateY(Math.PI / 4);
                            break;
                        case 'back':
                            // mesh.rotateY(Math.PI / 2);
                            break;
                        case 'leftBack':
                            mesh.rotateY(Math.PI / -4);
                            break;
                        case 'right':
                            mesh.rotateY(Math.PI / 2);
                            break;
                        case 'left':
                            mesh.rotateY(Math.PI / -2);
                            break;
                        case 'rightHead':
                            mesh.rotateY(Math.PI / 2 + Math.PI / 4);
                            break;
                        case 'head':
                            mesh.rotateY(Math.PI);
                            break;
                        case 'leftHead':
                            mesh.rotateY(Math.PI / -2 + Math.PI / -4);
                            break;
                        default:
                            break;
                    }
                    mesh.isCustomer = true
                    let scale = 0.2
                    mesh.scale.set(scale, scale, scale) // scale here
                    mesh.name = 'camera-' + item.senseId;
                    const popupDiv = document.getElementsByClassName('model-popup')[0].cloneNode(true);
                    // popupDiv.textContent = '摄像头方向-' + item.senseId;
                    popupDiv.style.overflow = 'hidden';
                    popupDiv.style.width = '0px';
                    popupDiv.style.padding = '0px';
                    popupDiv.style.fontSize = '0px';
                    let moonLabel = new CSS2DObject(popupDiv);
                    moonLabel.position.set(0, 1, 0);
                    // moonLabel.visible = false;
                    mesh.add(moonLabel)

                    // 添加一个透明的Mesh 将模型添加进去，用以点击
                    let geometry = new THREE.BoxBufferGeometry(2, 2, 2);
                    let material = new THREE.MeshBasicMaterial({color: 0xffffff});
                    material.transparent = true;
                    material.opacity = 0;
                    let other = new THREE.Mesh(geometry, material);
                    other.position.set(item.x, 12, item.z)
                    other.add(mesh)

                    group.add(other)
                    vm.objects.push(other)
                }, undefined,
                function (error) {
                    console.error(error)
                });
        },
        // 创建各模型
        createSense() {
            this.senseList.forEach(item => {
                if (item.type === 'camera') {
                    this.cameraNum++;
                    this.addCamera(item.data, this.GLTFLoader)
                } else {
                    this.sensorNum++;
                    this.addScene(item.data, this.GLTFLoader)
                }
            })
        },
        // 创建墙体
        createWall(item, type) {
            let width = 4, height = 10, rotate = false, x = item.x, z = item.z;
            if (type === 'verticalWall') {
                rotate = true;
                x -= 2;
            } else {
                z -= 2;
            }

            let material = new THREE.MeshBasicMaterial({
                color: '#5e81ec',
                side: THREE.DoubleSide,
                opacity: 0.7,
                transparent: true
            });

            let geometry = new THREE.PlaneGeometry(width, height);

            let plane = new THREE.Mesh(geometry, material);
            plane.position.set(x, 5, z)
            if (rotate) plane.rotateY(Math.PI / 2);
            scene.add(plane);
            // this.objects.push(plane)
        },
        // 创建面
        createPlane(type) {
            if (type === 'wall') {
                this.wallList.forEach((item) => {
                    if (item.wall.length > 1) {
                        this.createWall(item, item.wall[0]);
                        this.createWall(item, item.wall[1]);
                    } else {
                        this.createWall(item, item.wall[0]);
                    }
                })

            } else {
                let maxZ = Math.max.apply(Math, this.wallList.map(function (o) {
                    return o.z
                })) // 最大 Z 值
                let minZ = Math.min.apply(Math, this.wallList.map(function (o) {
                    return o.z
                })) // 最小 Z 值
                let maxX = Math.max.apply(Math, this.wallList.map(function (o) {
                    return o.x
                })) // 最大 X 值
                let minX = Math.min.apply(Math, this.wallList.map(function (o) {
                    return o.x
                })) // 最小 X 值

                // 减 4 是为了让地板往外延伸
                let res = {
                    maxZ: maxZ,
                    minZ: minZ - 4,
                    maxX: maxX,
                    minX: minX - 4,
                }


                this.createGround(res)
            }
        },
        // 创建地板
        createGround(data) {
            /*
            * 计算地板的面积
            * */
            let len = ((data.maxX - data.minX + 4) / 4) * ((data.maxZ - data.minZ + 4) / 4);
            let x = data.minX, z = data.minZ;
            for (let i = 0; i < len; i++) {
                if (x > data.maxX - 4) {
                    x = data.minX;
                    z += 4;
                } else if (i > 0) {
                    x += 4;
                }
                let width = 4, height = 4;
                let geometry = new THREE.PlaneGeometry(width, height);
                let material = new THREE.MeshBasicMaterial({color: '#b8b6b6', side: THREE.DoubleSide});
                let plane = new THREE.Mesh(geometry, material);
                plane.position.set(x, 0, z)
                plane.rotateX(Math.PI / 2); // 沿 X 轴旋转 90°
                let edgesMtl = new THREE.LineBasicMaterial({color: '#777'})
                let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                plane.add(cubeLine);
                scene.add(plane);
                // this.objects.push(plane)
            }
        },
        // 创建机柜
        createCabinet() {
            //导入材质
            let texture = new THREE.TextureLoader().load('static/images/fuwuqi.png')
            texture.matrixAutoUpdate = false;

            if (this.cubeList && this.cubeList.length) {
                //添加长方体
                let geometry = new THREE.BoxGeometry(4, 8, 3);
                let edgesMtl = new THREE.LineBasicMaterial({color: '#999', alpha: 0.1})
                this.cubeList.forEach(item => {
                    this.cabinetNum++;
                    //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
                    let material = [
                        new THREE.MeshLambertMaterial({color: '#222'}),// 右
                        new THREE.MeshLambertMaterial({color: '#222'}),// 左
                        new THREE.MeshLambertMaterial({color: '#333'}),// 上
                        new THREE.MeshLambertMaterial({color: '#000'}),// 下
                        new THREE.MeshLambertMaterial(
                            item.pos.includes('head') ||
                            item.pos.includes('left') ||
                            item.pos.includes('right')
                                ? {map: texture} : {color: '#111'}
                        ),                                                       // 前
                        new THREE.MeshLambertMaterial(
                            item.pos.includes('back') || (item.pos.includes('left') && item.pos.includes('right'))
                                ? {map: texture} : {color: '#111'}
                        ),                                                       // 后
                    ]
                    let cube = new THREE.Mesh(geometry, material);
                    cube.position.set(item.x, 4, item.z);

                    // 给模型添加描边
                    let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                    let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                    cubeLine.name = 'cubeLine';
                    cubeLine.material.visible = true;
                    cube.add(cubeLine);
                    cube.isCustomer = true
                    if (item.pos.includes('left')) {
                        cube.rotateY(Math.PI / -2);
                    } else if (item.pos.includes('right')) {
                        cube.rotateY(Math.PI / 2);
                    }
                    this.objects.push(cube)
                    group.add(cube);
                })
            }


            // this.initDragControls()
        },
        // 移除所有Mesh
        removeMesh() {
            this.objects.forEach(item => {
                //删除掉所有的模型组内的mesh
                group.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose(); //删除几何体
                        // child.material.dispose(); //删除材质
                    }
                })

                group.remove(item);
            })
            this.cabinetNum = 0;
            this.cameraNum = 0;
            this.sensorNum = 0;

        },
        unique(arr, key) {
            const res = new Map();
            return arr.filter((a) => !res.has(a[key]) && res.set(a[key], 1))
        },

        // initDeleteEvent() {
        //     document.addEventListener('keydown', ev => {
        //         if (ev.key === 'Delete' && this.selectedMesh.length) {
        //             this.clearScene();
        //         }
        //     })
        // },
        // clearScene() {
        //     // 从scene中删除模型并释放内存
        //     if (this.selectedMesh.length > 0) {
        //         for (let i = 0; i < this.selectedMesh.length; i++) {
        //             let currObj = this.selectedMesh[i];
        //
        //             // 判断类型
        //             if (currObj instanceof THREE.Scene) {
        //                 let children = currObj.children;
        //                 for (let i = 0; i < children.length; i++) {
        //                     this.deleteGroup(children[i]);
        //                 }
        //             } else {
        //                 this.deleteGroup(currObj);
        //             }
        //             scene.remove(currObj);
        //         }
        //     }
        // },
        // deleteGroup(mesh) {
        //     if (!mesh) return;
        //     group.remove(mesh)
        //     // 删除掉所有的模型组内的mesh
        //     // group.traverse(item => {
        //     //     if (item instanceof THREE.Mesh) {
        //     //         group.remove(item) // 删除几何体
        //     //         // item.material.dispose(); // 删除材质
        //     //     }
        //     // });
        //     this.objects.splice(mesh, 1);
        //     this.selectedMesh.splice(mesh, 1);
        // },
        // initDragControls() {
        //     let vm = this;
        //
        //     // 过滤不是 Mesh 的物体,例如辅助网格对象
        //     let objects = [];
        //     for (let i = 0; i < scene.children.length; i++) {
        //
        //         if (scene.children[i] instanceof THREE.Group) {
        //             scene.children[i].children.forEach(item => {
        //                 objects.push(item);
        //             })
        //
        //         }
        //     }
        //     // 初始化拖拽控件
        //     dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        //
        //     // 鼠标略过事件
        //     dragControls.addEventListener('hoveron', function (event) {
        //         if (event.object.name != "cubeLine") {
        //             // if (event.object.children.length) {
        //             //   event.object.children[0].material.visible = true;
        //             // } else {
        //             //   vm.hiedLineSegment();
        //             // }
        //             // 让变换控件对象和选中的对象绑定
        //             transformControls.attach(event.object);
        //         } else {
        //             event.target.enabled = false;
        //             // vm.hiedLineSegment()
        //         }
        //     });
        //
        //     // 鼠标离开事件
        //     dragControls.addEventListener('hoveroff', function (event) {
        //         // 让变换控件对象和选中的对象绑定
        //         transformControls.detach(event.object);
        //     });
        //     // 开始拖拽
        //     dragControls.addEventListener('dragstart', function (event) {
        //         vm.controls.enabled = false;
        //     });
        //     // 拖拽结束
        //     dragControls.addEventListener('dragend', function (event) {
        //         vm.controls.enabled = true;
        //     });
        // },
        // 创建鼠标控件
        getOrbitControls() {
            this.controls = new OrbitControls(camera, this.cssRender.domElement)
            // 设置相机距离原点的最近距离
            this.controls.minDistance = this.near;
            // 设置相机距离原点的最远距离
            this.controls.maxDistance = this.far;
            // 是否开启右键拖拽
            this.controls.enablePan = true
            //监听鼠标事件，触发渲染函数，更新canvas画布渲染效果
            this.controls.addEventListener('change', this.render);
        },
        hiedLineSegment() {
            for (let i = 0; i < scene.children.length; i++) {
                if (scene.children[i].isMesh && scene.children[i].children.length) {
                    let childArr = scene.children[i].children;
                    for (let j = 0; j < childArr.length; j++) {
                        if (childArr[j].type === 'LineSegments') {
                            childArr[j].material.visible = false;
                            break;
                        }
                    }
                }
            }
        },
        // 渲染
        render() {
            // requestAnimationFrame(this.render);
            this.cssRender.render(scene, camera)
            renderer.render(scene, camera);
        }
    }
}
</script>

