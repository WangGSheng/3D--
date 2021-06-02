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
    margin-top: -130px;
    color: #B9EDF8;
    background-color: transparent;
    transition: all 0.2s linear;
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
/*eslint-disable*/
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
// 时钟
// let clock = null;
//
let mixer = null;
// 鼠标拖拽
// let dragControls = null;
// 鼠标控件 旋转缩放
import OrbitControls from 'three-orbitcontrols'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
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
            groundDataList: [],
            senseList: [],
            sensorList: [],
            linePoints: [],
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

        // 轨迹动画
        // this.animat();
        //加入事件监听器,窗口自适应
        window.addEventListener('resize', function () {
            let width = window.innerWidth;
            let height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            this.render()
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
        // 机房编辑
        drawRoom() {
            let vm = this;
            this.showStatusUi = false;
            this.closeVideo()
            this.$bui.drawer({
                comp: () => import('./editRoom.vue'),
                params: {
                    selected: vm.cubeList,
                    wallList: vm.wallList,
                    senseList: vm.senseList,
                    groundData: vm.groundDataList,
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
        // 创建场景
        initScene() {
            scene = new THREE.Scene();
            group = new THREE.Group();
            scene.position.set(-50, 0, 0)
            scene.add(group);
            // 加载辅助坐标系 实际应用的时候需要注释此代码
            const axisHelper = new THREE.AxisHelper(250)
            axisHelper.position.set(0, 0, 0);//位置
            scene.add(axisHelper)
        },
        // 初始化摄像机
        initCamera() {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.near, this.far);
            camera.position.set(57, 90, 180);//位置
            camera.lookAt(camera.position);//对准的焦点
        },
        // 初始化光源
        initLight() {
            light = new THREE.AmbientLight('#a7a3a3' ) // 环境光源颜色;
            scene.add(light);

            let spotLight = new THREE.SpotLight('#848383');  // 聚光

            spotLight.position.set(80, 70, 70);
            spotLight.shadow.mapSize.width=2048;	//阴影贴图宽度设置为2048像素
            spotLight.shadow.mapSize.height=2048;	//阴影贴图高度设置为2048像素

            spotLight.castShadow = true;

            scene.add(spotLight);
        },
        // 初始化渲染器
        initRenderer() {
            renderer = new THREE.WebGLRenderer({
                // 增加下面两个属性，可以抗锯齿
                antialias: true,
                alpha: true
            });
            renderer.setClearColor('#000', 1);// 设置渲染颜色（背景底色）
            renderer.setSize(window.innerWidth, window.innerHeight);// 渲染面大小（在二维平面上的窗口大小）
            renderer.setPixelRatio(window.devicePixelRatio); //设备像素比 可以清晰物体
            renderer.shadowMap.enabled = true;
            this.$nextTick(()=>{
                this.$refs.threeDom.appendChild(renderer.domElement);
            })
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
                let intersects = rayCaster.intersectObjects(group.children, true);
                if (intersects.length) {
                    if (intersects[0].object.children[0]?.isScene) {
                        let obj = intersects[0].object.children[0];
                        // 给选中的模型添加弹窗或移除弹窗
                        let dom = obj.children[1].element;
                        this.openOrClose(dom)

                        if (!dom.children.length) {
                            const comp = new this.videoComponent({
                                propsData: {
                                    param: {
                                        id: obj.userData.dataId,
                                        name:obj.name
                                    }
                                }
                            }).$mount();

                            if (this.beforeSelected && this.beforeSelected.id !== intersects[0].object.id) {
                                this.closeVideo()
                            }

                            dom.append(comp.$el)
                            this.videoVm = comp;
                            this.beforeSelected = intersects[0].object;
                        } else {
                            this.videoVm.$destroy();
                            this.videoVm = null;
                            this.beforeSelected = null;
                            dom.firstElementChild.remove();
                        }

                    }
                }
            }, false)
        },
        closeVideo() {
            if (this.beforeSelected) {
                let oldDom = this.beforeSelected.children[0].children[1].element;
                this.videoVm.$destroy();
                this.videoVm = null;
                this.beforeSelected = null;
                this.openOrClose(oldDom)
                oldDom.firstElementChild.remove();
            }
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
            this.removeMesh().then(()=>{
                scene.add(group);

                if (item.groundData && item.groundData.length) {
                    this.groundDataList = item.groundData;
                }
                if (item.senseData && item.senseData.length) {
                    this.senseList = item.senseData;
                    this.createSense();
                }
                if (item.cabinetData && item.cabinetData.length) {
                    this.cubeList = item.cabinetData;
                    this.createCabinet();
                }
                if (item.wallData && item.wallData.length) {
                    this.wallList = item.wallData;
                    this.createPlane('wall');
                    this.createPlane('ground');
                }



                setTimeout(() => {
                    this.loading = false
                    this.showStatusUi = true;
                    for (let i = 0; i < 2; i++) {
                        this.render();
                    }
                }, 1000)
            });
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
                    // popupDiv.textContent = '传感器-' + item.id;
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
                        other.position.set(item.x, 9, item.z - 2);
                    } else {
                        other.position.set(item.x + 4, 9, item.z - 2);
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
                    mesh.name = item.dataName;
                    mesh.userData.dataId = item.dataId;
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
                    this.cameraNum ++;
                    this.addCamera(item.data, this.GLTFLoader)
                } else {
                    this.sensorNum ++;
                    this.addScene(item.data, this.GLTFLoader)
                }
            })
        },
        // 创建墙体
        createWall(item, type) {
            let width = 4, height = 10, rotate = false, x = item.x, z = item.z;
            if (type === 'v') {
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
                    if (item.leftBorder) {
                        this.createWall(item, 'v');
                    }
                    if (item.topBorder) {
                        this.createWall(item, 'h');
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

                /*获取轨道线路*/
                // let lineX = minX, lineY = 16, lineZ = minZ, change = false;
                // let num = maxZ - minZ;
                // for (let i = minX; i < maxX - minX; i += 4) {
                //
                //     if (change) {
                //         num += 4;
                //         lineZ -= num;
                //     } else {
                //         num -= 4;
                //         lineZ += num;
                //     }
                //
                //     if (lineZ > maxZ) {
                //         lineZ = maxZ;
                //         change = true;
                //     }
                //     if (lineZ < minZ) {
                //         lineZ = minZ;
                //         change = false
                //     }
                //     lineX += 4;
                //     this.linePoints.push({
                //         x: lineX,
                //         y: lineY,
                //         z: lineZ
                //     })
                // }
                //
                // lineX = maxX, lineZ = maxZ, change = true;
                // num = maxZ - minZ;
                // for (let i = maxX - minX; i > minX; i -= 4) {
                //
                //     if (change) {
                //         num += 4;
                //         lineZ -= num;
                //     } else {
                //         num -= 4;
                //         lineZ += num;
                //     }
                //
                //     if (lineZ > maxZ) {
                //         lineZ = maxZ;
                //         change = true;
                //     }
                //     if (lineZ < minZ) {
                //         lineZ = minZ;
                //         change = false
                //     }
                //     lineX -= 4;
                //     this.linePoints.push({
                //         x: lineX,
                //         y: lineY,
                //         z: lineZ
                //     })
                // }

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

                let material = null;

                if (this.groundDataList.length) {
                    for (let j = 0; j < this.groundDataList.length; j++) {
                        if (x === this.groundDataList[j].x && z === this.groundDataList[j].z) {
                            console.log(this.groundDataList[j].name)
                            material =  new THREE.MeshLambertMaterial(
                                {
                                    map: new THREE.CanvasTexture(this.getTextCanvas(this.groundDataList[j].name,null,'#000')),
                                    side: THREE.DoubleSide,
                                    wireframe:false,
                                }
                            );
                            break;
                        }
                    }
                }

                if (!material) {
                    let texture = new THREE.TextureLoader().load('static/images/水泥.png');
                    material = new THREE.MeshLambertMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        wireframe:false
                    });
                }

                let plane = new THREE.Mesh(geometry, material);
                plane.position.set(x, 0, z)
                plane.rotateX(- Math.PI / 2); // 沿 X 轴旋转 90°
                let edgesMtl = new THREE.LineBasicMaterial({color: '#777'})
                let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);

                plane.receiveShadow = true; // 接受阴影
                plane.add(cubeLine);
                scene.add(plane);
            }
        },
        // 创建机柜
        createCabinet() {
            if (this.cubeList && this.cubeList.length) {
                //添加长方体
                let geometry = new THREE.BoxGeometry(4, 8, 3);
                let edgesMtl = new THREE.LineBasicMaterial({color: '#999', alpha: 0.1})
                this.cubeList.forEach(item => {
                    this.cabinetNum++;

                    let material = this.getMaterial(item);
                    let cube = new THREE.Mesh(geometry, material);
                    cube.position.set(item.x, 4, item.z);

                    // 给模型添加描边
                    let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                    let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                    // cubeLine.name = 'cubeLine';
                    cubeLine.material.visible = true;
                    cube.add(cubeLine);
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    if (item.pos.includes('left')) {
                        cube.rotateY(Math.PI / -2);
                    } else if (item.pos.includes('right')) {
                        cube.rotateY(Math.PI / 2);
                    }
                    // this.objects.push(cube)
                    scene.add(cube);
                })
            }
        },
        getMaterial(item) {
            let color1,color2,bgcolor,textcolor,texture;
            if (item.type === 'cabinet') {
                color1 = '#222';
                color2 = '#111';
                bgcolor = '#333';
                textcolor = '#fff';
                texture = new THREE.TextureLoader().load('static/images/fuwuqi.png');
            }else if (item.type === 'kt') {
                color1 = '#222';
                color2 = '#111';
                bgcolor = '#333';
                textcolor = '#fff';
                texture = new THREE.TextureLoader().load('static/images/空调.png');
            }
            //导入材质
            texture.matrixAutoUpdate = false;
            //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
            let material = [
                new THREE.MeshLambertMaterial({color: color1}),// 右
                new THREE.MeshLambertMaterial({color: color1}),// 左
                new THREE.MeshLambertMaterial(
                    { map: new THREE.CanvasTexture(this.getTextCanvas(item.num,bgcolor,textcolor)) }
                ),// 上
                new THREE.MeshLambertMaterial({color: '#000'}),// 下
                new THREE.MeshLambertMaterial(
                    item.pos.includes('head') ||
                    item.pos.includes('left') ||
                    item.pos.includes('right')
                        ? {map: texture} : {color: color2}
                ),                                                       // 前
                new THREE.MeshLambertMaterial(
                    item.pos.includes('back') || (item.pos.includes('left') && item.pos.includes('right'))
                        ? {map: texture} : {color: color2}
                ),                                                       // 后
            ];
            return material;
        },
        // 获取文本贴图
        getTextCanvas(text,bgColor,textColor){
            let width=200, height=150;
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d',{ antialias: true,
                depth: true });
            ctx.fillStyle = bgColor ? bgColor : 'rgba(255,255,255,.7)'; // 背景颜色
            ctx.fillRect(0, 0, width, height);
            ctx.font = 50+'px " bold';
            ctx.fillStyle = textColor; // 字体颜色
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text ??= '', width/2,height/2,150);
            return canvas;
        },
        // 移除所有Mesh
        removeMesh() {
            return new Promise(resolve => {
                // this.objects.forEach(item => {
                //     //删除掉所有的模型组内的mesh
                //     group.traverse((child) => {
                //         console.log(child)
                //         if (child instanceof THREE.Mesh) {
                //             child.geometry.dispose(); //删除几何体
                //             // child.material.dispose(); //删除材质
                //         }
                //         if (child instanceof THREE.Object3D) {
                //             child.remove();
                //         }
                //     })
                //
                //     group.remove(item);
                // })
                scene.remove(group)
                this.objects = [];
                this.cabinetNum = 0;
                this.cameraNum = 0;
                this.sensorNum = 0;

                resolve()
            })
        },
        unique(arr, key) {
            const res = new Map();
            return arr.filter((a) => !res.has(a[key]) && res.set(a[key], 1))
        },

        /*沿线动画*/
        animat() {
            let other;
            let vm = this;
            this.GLTFLoader.load('static/three/model/scene.gltf', function (obj) {
                    let mesh = obj.scene;
                    let scale = 0.5
                    mesh.scale.set(scale, scale, scale) // scale here
                    // 添加一个透明的Mesh 将模型添加进去，用以点击
                    let geometry = new THREE.BoxBufferGeometry(2, 2, 2);
                    let material = new THREE.MeshBasicMaterial({color: 0xffffff});
                    material.transparent = true;
                    material.opacity = 0;
                    other = new THREE.Mesh(geometry, material);
                    other.add(mesh)
                    other.position.set(10, 15, 20)
                    scene.add(other);

                    let pointsArr = []
                    vm.linePoints.forEach(item => {
                        pointsArr.push(
                            new THREE.Vector3(item.x, item.y, item.z),
                        )
                    })
                    pointsArr.push(
                        new THREE.Vector3(vm.linePoints[0].x, vm.linePoints[0].y, vm.linePoints[0].z)
                    )
                    // 通过类CatmullRomCurve3创建一个3D样条曲线
                    let curve = new THREE.CatmullRomCurve3(pointsArr);

                    // 样条曲线均匀分割200分，返回102个顶点坐标
                    let points = curve.getPoints(200);
                    // console.log('points', points);//控制台查看返回的顶点坐标
                    let geometryLine = new THREE.Geometry();
                    // 把从曲线轨迹上获得的顶点坐标赋值给几何体
                    geometryLine.vertices = points
                    let lineMaterial = new THREE.LineBasicMaterial({
                        color: "#dbb14a"
                    });
                    let line = new THREE.Line(geometryLine, lineMaterial);
                    scene.add(line)

                    // 通过Threejs的帧动画相关API播放网格模型沿着曲线做动画运动

                    // 声明一个数组用于存储时间序列
                    let arr = []
                    for (let i = 0; i < 201; i++) {
                        arr.push(i)
                    }

                    // 生成一个时间序列
                    let times = new Float32Array(arr);

                    let posArr = []
                    points.forEach(elem => {
                        posArr.push(elem.x, elem.y, elem.z)
                    });
                    // 创建一个和时间序列相对应的位置坐标系列
                    let values = new Float32Array(posArr);
                    // 创建一个帧动画的关键帧数据，曲线上的位置序列对应一个时间序列
                    let posTrack = new THREE.KeyframeTrack('.position', times, values);
                    let duration = 201;
                    let clip = new THREE.AnimationClip("default", duration, [posTrack]);
                    mixer = new THREE.AnimationMixer(other);
                    let AnimationAction = mixer.clipAction(clip);
                    AnimationAction.timeScale = 10;
                    AnimationAction.play();

                    // clock = new THREE.Clock();//声明一个时钟对象
                }, undefined,
                function (error) {
                    console.error(error)
                });
            // // 创建一个模型，用于沿着三维曲线运动
            // let box = new THREE.BoxGeometry(5, 5, 5);
            // let material = new THREE.MeshLambertMaterial({
            //     color: 0x0000ff
            // }); //材质对象
            // let mesh = new THREE.Mesh(box, material);


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
            this.controls.addEventListener('change', ()=>{
                this.render()
            });
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

            // 更新帧动画的时间
            // mixer.update(clock.getDelta());
        }
    }
}
</script>

