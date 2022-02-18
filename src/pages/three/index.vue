<style scoped lang="scss">
@import "scss/_index.scss";
</style>

<template>
    <ui-main :title="$route.name" noPadding
             v-loading="loading"
             element-loading-text="拼命绘制中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)">
        <div ref="threeDom" class="w-100p h-100p" style="overflow: hidden"></div>

        <div class="control" title="编辑" v-show="false">
            <i class="icon edit"></i>
        </div>

        <div class="model-popup" v-show="false">
            <div class="close-bth"><i class="iconfont ali-iconsimui-close"></i></div>
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

// 鼠标控件 旋转缩放
import OrbitControls from 'three-orbitcontrols';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
import room3D from './data/610B.js';
import Vue from 'vue';
import mapPopup from '@/pages/videoPlayer/_videoPopup.vue';


// 场景
let scene = null;
// Mesh 集合
let group = null;
let otherGroup = null;
// 相机
let camera = null;
let rotateX = 0;
// 渲染器
let renderer = null;
// 灯光
let light = null;
// 点光源 聚光灯
let spotLight = null;
// 性能插件
let stats = null;
// 高光强度
let shininessNum = 15;
// 实例平移
// let transformControls = null;
// 鼠标拾取射线
let rayCaster = null;
// 鼠标
let mouse = null;
// 时钟
let clock = null;
//
let mixer = null;
let AnimationAction = null;
// 鼠标拖拽
// let dragControls = null;
let controls = null;// 鼠标控制器
let textureLoader = null;// 材质加载器
let cssRender = null;// 自定义css渲染器
let GLTFLoader = null;// 外部模型加载器 .GLTF，.GLB
let cameraObj = null;// 摄像头模型
let sensorObj = null;// 传感器模型
let emptyMesh = null;// 空白Mesh
let beforeSelected = null;
let videoVm = null;// 用以存储弹窗实例，用以销毁视频播放
let videoComponent = null;
let cabinetGeometry = null; // 机柜的Geometry 和 材质
let wallMaterial = null; // 围墙材质
export default {
    data() {
        return {
            showStatusUi: false,
            loading: true,
            flag: true,
            max: 0,
            near: 1,
            far: 1000,
            selectedMesh: [],
            cubeList: [],
            wallList: [],
            groundDataList: [],
            senseList: [],
            centerData: null,
            sensorList: [],
            linePoints: [],
            cabinetNum: 0,
            cameraNum: 0,
            sensorNum: 0,
            FPS: 80,
            renderT: 0,
            timeS: 0
        }
    },
    created() {
        // 创建场景
        this.initScene();
        // 创建相机
        this.initCamera();
        // 创建渲染器
        this.initRenderer();
        // 创建光源
        this.initLight();
        // 初始化外部模型加载器
        this.initLoader();

        this.renderT = 1 / this.FPS;
    },
    mounted() {
        // 加载CSS2DRenderer
        this.initCssRender();

        // 初始化空白Mesh
        this.getEmptyMesh();
        //初始化性能插件
        this.initStats();
        // 初始化机柜相关材质
        this.initCabinetGeometry();
        // 初始化围墙材质
        this.initWallMaterial();

        // 鼠标控制器
        this.getOrbitControls()

        // 添加点击事件
        this.initRayCaster();

        // 创建背景地板
        this.createGround()

        //加入事件监听器,窗口自适应
        let vm = this;
        window.addEventListener('resize', function () {
            let width = window.innerWidth;
            let height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用。
            camera.updateProjectionMatrix();
            vm.render()
        })

        setTimeout(() => {
            this.render();
            this.loading = false
            this.showStatusUi = true
            // 初始化各面板
            this.initMyDom();
        }, 1000)

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
                    centerData: vm.centerData,
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
            // 迷雾
            scene.fog = new THREE.Fog("#0f1e3e", 20, 700);
            scene.position.set(0, 0, 0);

            clock = new THREE.Clock();//声明一个时钟对象

            this.initGroup()
            // 加载辅助坐标系 实际应用的时候需要注释此代码
            // const axisHelper = new THREE.AxisHelper(250)
            // axisHelper.position.set(0, 0, 0);//位置
            // scene.add(axisHelper)
        },
        initGroup() {
            group = new THREE.Group();
            otherGroup = new THREE.Group();
            scene.add(group);
            scene.add(otherGroup);
        },
        // 更新中心点
        initCenter(item) {
            spotLight.position.set(item.x, 150, item.z);
            controls.target = new THREE.Vector3(item.x, 0, item.z);
            controls.update();
        },
        // 初始化摄像机
        initCamera() {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.near, this.far);
            camera.position.set(97, 90, 180);//位置
            camera.lookAt(scene.position);//对准的焦点
        },
        // 初始化光源
        initLight() {
            light = new THREE.AmbientLight('#a7a3a3') // 环境光源颜色;
            scene.add(light);

            spotLight = new THREE.SpotLight(
                '#a7a3a3', 2.0, 200, 90, 1, 0
            );  // 聚光

            spotLight.position.set(0, 150, 50);
            spotLight.shadow.mapSize.width = 2048;	//阴影贴图宽度设置为2048像素
            spotLight.shadow.mapSize.height = 2048;	//阴影贴图高度设置为2048像素

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
            renderer.setClearColor('#0f1e3e', 1);// 设置渲染颜色（背景底色）
            renderer.setSize(window.innerWidth, window.innerHeight);// 渲染面大小（在二维平面上的窗口大小）
            renderer.setPixelRatio(window.devicePixelRatio); //设备像素比 可以清晰物体
            renderer.shadowMap.enabled = true; // 接受阴影
            renderer.shadowMapType = THREE.PCFSoftShadowMap; // 阴影类型
            this.$nextTick(() => {
                this.$refs.threeDom.appendChild(renderer.domElement);
            })
        },
        // 性能检测
        initStats() {
            stats = new Stats();
            this.$el.parentElement.appendChild(stats.dom);
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
            /*一根射线，通过碰撞获取物体*/
            rayCaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            //监听全局点击事件,通过ray检测选中哪一个object
            cssRender.domElement.addEventListener("mousedown", (event) => {
                event.preventDefault();
                if (event.button === 2) {
                    return false;
                }

                mouse.x = (event.clientX / cssRender.domElement.clientWidth) * 2 - 1;
                mouse.y = -(event.clientY / cssRender.domElement.clientHeight) * 2 + 1;

                rayCaster.setFromCamera(mouse, camera);
                let intersects = rayCaster.intersectObjects(group.children, true);
                if (intersects.length) {
                    if (intersects[0].object.children[0]?.isScene) {
                        let obj = intersects[0].object.children[0];
                        // this.initCenter({
                        //     x:obj.parent.position.x,
                        //     z:obj.parent.position.z
                        // })
                        // 给选中的模型添加弹窗或移除弹窗
                        let dom = obj.children[1].element;
                        this.openOrClose(dom)
                        if (dom.children.length === 1) {
                            const comp = new videoComponent({
                                propsData: {
                                    param: {
                                        id: obj.userData.dataId,
                                        name: obj.name
                                    }
                                }
                            }).$mount();

                            if (beforeSelected && beforeSelected.id !== intersects[0].object.id) {
                                this.closeVideo()
                            }
                            dom.children[0].onclick = this.closeVideo;
                            dom.append(comp.$el)
                            videoVm = comp;
                            beforeSelected = intersects[0].object;

                        } else {
                            videoVm.$destroy();
                            videoVm = null;
                            beforeSelected = null;
                            dom.lastElementChild.remove();
                            this.flag = true;
                        }

                    }
                }
            }, false)
        },
        closeVideo() {
            if (beforeSelected) {
                let oldDom = beforeSelected.children[0].children[1].element;
                videoVm.$destroy();
                videoVm = null;
                beforeSelected = null;
                this.openOrClose(oldDom);
                oldDom.lastElementChild.remove();
            }
        },
        /*关闭打开弹框*/
        openOrClose(dom) {
            dom.style.fontSize = dom.style.fontSize === '0px' ? '16px' : '0px';
            dom.style.overflow = dom.style.overflow === 'hidden' ? 'unset' : 'hidden';
            dom.style.width = dom.style.width === '0px' ? '400px' : '0px';
            dom.style.height = dom.style.height === '0px' ? '230px' : '0px';
            dom.style.padding = dom.style.padding === '0px' ? '5px' : '0px';
        },
        // 初始化外部模型加载器
        initLoader() {
            textureLoader = new THREE.TextureLoader();
            GLTFLoader = new THREE.GLTFLoader();
            let vm = this;
            GLTFLoader.load('static/three/model/scene.gltf', function (obj) {
                    cameraObj = obj.scene;
                    GLTFLoader.load('static/three/model/温湿度/scene.gltf', function (obj) {
                            sensorObj = obj.scene;
                            // 本地数据
                            vm.initData(room3D);
                        }, undefined,
                        function (error) {
                            console.error(error)
                        });
                }, undefined,
                function (error) {
                    console.error(error)
                });
        },

        // 初始化数据
        initData(item) {
            if (!item) {
                return;
            }
            /*先移除所有的网格物体*/
            this.removeMesh().then(() => {
                this.initGroup();

                if (item.centerData) {
                    this.centerData = item.centerData;
                    this.initCenter({
                        x: item.centerData.x,
                        z: item.centerData.z
                    })
                }

                this.groundDataList = item.groundData;
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
                    this.initLineData();
                }
                this.createPlane('ground');


                this.render();
                setTimeout(() => {
                    this.loading = false
                    this.showStatusUi = true;
                }, 1000)
            });
        },
        // 初始化弹窗渲染器
        initCssRender() {
            cssRender = new CSS2DRenderer();
            cssRender.setSize(window.innerWidth, window.innerHeight);
            cssRender.domElement.style.position = 'absolute';
            cssRender.domElement.style.top = 0;
            cssRender.domElement.style.left = 0;
            cssRender.domElement.style.right = 0;
            cssRender.domElement.style.bottom = 0;
            cssRender.domElement.style.overflow = 'hidden';
            this.$el.parentElement.appendChild(cssRender.domElement);
        },
        initMyDom() {
            // vue实例
            videoComponent = Vue.extend(mapPopup)

            // 编辑按钮
            let control = document.querySelector('.control').cloneNode(true)
            control.style.display = 'block'
            control.addEventListener('click', this.drawRoom)
            this.$el.parentElement.appendChild(control);

            // 统计面板
            // let statusUi = this.$el.querySelector('.status-ui');
            // this.$el.parentElement.appendChild(statusUi);
        },
        /*外部模型不太好做事件绑定，用一个透明的Mesh包裹来做*/
        getEmptyMesh() {
            // 添加一个透明的Mesh 将模型添加进去
            let geometry = new THREE.BoxBufferGeometry(3, 3, 3);
            let material = new THREE.MeshBasicMaterial({color: 0xffffff});
            material.transparent = true;
            material.opacity = 0;
            emptyMesh = new THREE.Mesh(geometry, material);
        },
        // 创建各模型
        createSense() {
            /*弹框dom*/
            const popupDiv = document.getElementsByClassName('model-popup')[0].cloneNode(true);
            popupDiv.style.overflow = 'hidden';
            popupDiv.style.width = '0px';
            popupDiv.style.height = '0px';
            popupDiv.style.padding = '0px';
            popupDiv.style.fontSize = '0px';
            let moonLabel = new CSS2DObject(popupDiv);
            this.senseList.forEach(item => {
                if (item.type === 'camera') {
                    this.cameraNum++;
                    this.addCamera(item.data, moonLabel.clone())
                } else {
                    this.sensorNum++;
                    this.addSensor(item.data, moonLabel.clone())
                }
            })
        },
        // 添加温湿度传感器模型
        addSensor(item, moonLabel) {
            let model = sensorObj.clone(), x = item.x, y = 9, z = item.z;
            model.rotateZ(Math.PI);
            if (item.pos.includes('head')) {
                model.rotateY(Math.PI / -2)
                z -= 2;
            } else if (item.pos.includes('back')) {
                model.rotateY(Math.PI / 2)
                z += 2;
                x += 4;
            } else if (item.pos.includes('left')) {
                x += 2;
            } else {
                model.rotateY(Math.PI)
                x -= 2;
            }


            model.isCustomer = true
            let scale = 1;
            model.scale.set(scale, scale, scale) // 缩放
            model.name = item.dataName;
            model.userData.dataId = item.dataId;
            // 给模型定制弹窗
            moonLabel.element.id = item.dataId
            moonLabel.position.set(0, 1, 0);
            model.add(moonLabel)

            let other = emptyMesh.clone();
            other.position.set(x, y, z);
            other.add(model)

            group.add(other)
        },
        // 添加摄像头模型
        addCamera(item, moonLabel) {
            let mesh = cameraObj.clone();
            switch (item.senseId) {
                case 'rightBack':
                    mesh.rotateY(Math.PI / 4);
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
            mesh.scale.set(scale, scale, scale) // 缩放
            mesh.name = item.dataName;
            mesh.userData.dataId = item.dataId;

            moonLabel.element.id = item.dataId
            moonLabel.position.set(0, 1, 0);
            mesh.add(moonLabel)

            let other = emptyMesh.clone();
            other.position.set(item.x, 12, item.z)
            other.add(mesh)

            group.add(other)

        },

        // 创建墙体
        createWall(item, type, obj) {
            let material;
            let rotate = false, x = item.x, z = item.z;
            if (type === 'v' || type === 'vDoor') {
                rotate = true;
                x -= 2;
            } else {
                z -= 2;
            }

            if (type === 'vDoor' || type === 'hDoor') {
                material = wallMaterial[0]
            } else {
                material = wallMaterial[1]
            }


            let plane = obj.clone();
            plane.material = material;
            plane.position.set(x, 5, z)
            if (rotate) {
                plane.rotateY(Math.PI / 2);
            }
            otherGroup.add(plane);
        },
        /*初始化墙体贴图*/
        initWallMaterial() {
            let texture = textureLoader.load('static/images/door.png');

            let materials1 = new THREE.MeshPhongMaterial(
                {
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 1,
                }
            );

            let color = "#425fac";
            let materials2 = [
                //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
                new THREE.MeshLambertMaterial({color: color, opacity: 0, transparent: true}),
                new THREE.MeshLambertMaterial({color: color, opacity: 0, transparent: true}),
                new THREE.MeshPhongMaterial({color: color, opacity: 0.4, transparent: true}),
                new THREE.MeshLambertMaterial({color: color, opacity: 0.4, transparent: true}),
                new THREE.MeshPhongMaterial({
                    color: color,
                    opacity: 0.6,
                    transparent: true
                }),
                new THREE.MeshPhongMaterial({
                    color: color,
                    opacity: 0.6,
                    transparent: true
                }),
            ]
            wallMaterial = [materials1, materials2]
        },
        // 创建面
        createPlane(type) {
            if (type === 'wall') {
                let geometry = new THREE.BoxBufferGeometry(4, 10, 0.3);
                let plane = new THREE.Mesh(geometry);

                this.wallList.forEach((item) => {
                    if (item.leftBorder) {
                        this.createWall(item, 'v', plane);
                    }
                    if (item.topBorder) {
                        this.createWall(item, 'h', plane);
                    }
                    if (item.leftDoor) {
                        this.createWall(item, 'vDoor', plane);
                    }
                    if (item.topDoor) {
                        this.createWall(item, 'hDoor', plane);
                    }
                })

            } else {
                let obj = this.getMinAndMax(this.wallList);

                let result = []
                /*组装墙内地板区域数据*/
                /*以z轴为主轴，往x轴方向绘制*/
                for (let i = obj.minZ; i < obj.maxZ; i += 4) {
                    let arr = [];
                    this.wallList.forEach(item => {
                        /*拿到所有平行于z轴的墙数据*/
                        if (item.z === i && (!item.topBorder || (item.topBorder && item.leftBorder))) {
                            arr.push(item)
                        }
                    })
                    result.push(arr);
                }
                for (let i = 0; i < result.length; i++) {
                    if (i === 0 && result.length > 1 && result[i].length < 2) {// 第一条数据如果只有一条 就取后一条数据补全
                        result[i].push({
                            x: this.getDistance(result[i + 1]).max.x,      //  得到同z轴的最大最小x
                            z: result[i][0].z
                        }, {
                            x: this.getDistance(result[i + 1]).min.x,
                            z: result[i][0].z
                        })
                    } else if (i > 0 && result[i].length === 1) {// 如果当前x方向只有一条数据 就取上一条数据的x
                        result[i].push({
                            x: result[i - 1].max.x,
                            z: result[i][0].z
                        }, {
                            x: result[i - 1].min.x,
                            z: result[i][0].z
                        })
                    }
                    /*得到同z的最大最小x*/
                    result[i] = this.getDistance(result[i])
                }


                // 减 4 是为了让地板往外延伸
                let res = {
                    maxZ: obj.maxZ,
                    minZ: obj.minZ - 4,
                    maxX: obj.maxX,
                    minX: obj.minX - 4,
                }

                // 生产围墙区域内的地板
                this.createSelfGround(result)
                if (this.groundDataList.length) this.groundText(res)

            }
        },
        /*获取x,z的最大最小值*/
        getMinAndMax(arr) {
            let maxZ = Math.max.apply(Math, arr.map(function (o) {
                return o.z
            })) // 最大 Z 值
            let minZ = Math.min.apply(Math, arr.map(function (o) {
                return o.z
            })) // 最小 Z 值
            let maxX = Math.max.apply(Math, arr.map(function (o) {
                return o.x
            })) // 最大 X 值
            let minX = Math.min.apply(Math, arr.map(function (o) {
                return o.x
            })) // 最小 X 值
            return {maxX: maxX, minX: minX, maxZ: maxZ, minZ: minZ}
        },
        /*将地板数据按照x排序*/
        sortArr(arr, sortOrder) {
            const handle = (prop) => {
                return (a, b) => {
                    const val1 = a[prop];
                    const val2 = b[prop];
                    return val1 - val2;
                }
            }
            arr.sort(handle(sortOrder));
            return arr;
        },
        getDistance(arr) {
            let res = this.sortArr(arr, 'x')
            return {min: res[0], max: res[res.length - 1]}
        },
        // 创建地板
        createGround() {
            let floorMat = new THREE.MeshStandardMaterial({
                roughness: 0.8,
                color: 0xffffff,
                metalness: 0.2,
                bumpScale: 0.0005,
            });
            // 地板贴图
            textureLoader.load("static/images/地板2.jpg", function (map) {

                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(250, 250);
                map.encoding = THREE.sRGBEncoding;
                floorMat.map = map;
                // floorMat.needsUpdate = true;
                floorMat.side = THREE.DoubleSide;
            });
            let width = window.innerWidth, height = window.innerWidth;
            let geometry = new THREE.PlaneBufferGeometry(width, height);
            let plane = new THREE.Mesh(geometry, floorMat);
            plane.position.set(60, 0, 60)
            // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
            plane.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
            plane.receiveShadow = true; // 接受阴影
            scene.add(plane);
        },
        // 生产围墙区域内的地板
        createSelfGround(arr) {
            let width = 4, height = 4;
            let geometry = new THREE.PlaneBufferGeometry(width, height);
            let material = new THREE.MeshPhongMaterial(
                {
                    color: '#555',
                    side: THREE.DoubleSide,
                    specular: "#8D93AB",
                    shininess: 2,
                    // opacity:0.7,
                    // transparent:true
                }
            );
            let plane = new THREE.Mesh(geometry, material);
            //描边
            let edgesMtl = new THREE.LineBasicMaterial({color: '#666'})
            let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
            let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
            arr.forEach(item => {
                for (let i = item.min.x; i < item.max.x; i += 4) {
                    let pal = plane.clone();
                    pal.position.set(i, 0.1, item.min.z)
                    // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
                    pal.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
                    pal.receiveShadow = true; // 接受阴影
                    let cubeLines = cubeLine.clone(); // 描边
                    pal.add(cubeLines);
                    otherGroup.add(pal);
                }
            })
        },
        // 创建地板标记
        groundText(data) {
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

                for (let j = 0; j < this.groundDataList.length; j++) {
                    if (x === this.groundDataList[j].x && z === this.groundDataList[j].z) {
                        let width = 4, height = 4;
                        let geometry = new THREE.PlaneBufferGeometry(width, height);
                        let textMaterial = new THREE.MeshPhongMaterial(
                            {
                                map: new THREE.CanvasTexture(this.getTextCanvas(this.groundDataList[j].name, "#555", '#000')),
                                side: THREE.DoubleSide,
                                specular: "#8D93AB",
                                shininess: 2
                            }
                        );
                        let plane = new THREE.Mesh(geometry, textMaterial);
                        plane.position.set(x, 0.1, z)
                        // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
                        plane.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
                        plane.receiveShadow = true; // 接受阴影
                        otherGroup.add(plane);
                        break;
                    }
                }

            }
        },
        // 获取轨道线路
        initLineData() {
            let lineData = this.wallList.reduce((arr, cur) => {
                if (cur.type === 'line') {
                    arr.push(cur)
                }
                return arr;
            }, []);
            if (lineData.length) {
                lineData.forEach(item => {
                    this.linePoints.push({
                        x: item.x,
                        y: 16,
                        z: item.z
                    })
                });
                /*加载沿线动画*/
                this.animate()
                this.initHoverRayCaster()
            }

        },
        // 添加机柜
        initCabinetGeometry() {
            //添加长方体
            let geometry = new THREE.BoxBufferGeometry(3.7, 8, 3);
            let texture = {
                fuwuqiTex: textureLoader.load('static/images/fuwuqi.png'),
                kontiaoTex: textureLoader.load('static/images/空调.png'),
                odfTex: textureLoader.load('static/images/ODF.png')
            }
            let leftAndRight1 = new THREE.MeshPhongMaterial({
                name: 'leftAndRightMaterial',
                color: '#222',
                specular: 0x4488ee,
                shininess: shininessNum
            });
            let leftAndRight2 = new THREE.MeshPhongMaterial({
                name: 'leftAndRightMaterial',
                color: '#eee',
                specular: 0x4488ee,
                shininess: shininessNum
            });
            let leftAndRight3 = new THREE.MeshPhongMaterial({
                name: 'leftAndRightMaterial',
                color: '#ddd',
                specular: 0x4488ee,
                shininess: shininessNum
            });
            let down = new THREE.MeshPhongMaterial({color: '#000'})// 下
            cabinetGeometry = {
                geometry: geometry,
                texture: texture,
                leftAndRight1: leftAndRight1,
                leftAndRight2: leftAndRight2,
                leftAndRight3: leftAndRight3,
                down: down,
            }
        },
        // 创建机柜
        createCabinet() {

            let cabinetCube = new THREE.Mesh(cabinetGeometry.geometry);
            this.cubeList.forEach(item => {
                this.cabinetNum++;
                let cube = cabinetCube.clone();
                let material = this.getMaterial(item, cabinetGeometry.texture);
                cube.material = material;
                // cube.material.map.needsUpdate = true;
                cube.position.set(item.x, 4, item.z);


                cube.castShadow = true;
                cube.receiveShadow = true;
                if (item.pos.includes('left')) {
                    cube.rotateY(Math.PI / -2);
                } else if (item.pos.includes('right')) {
                    cube.rotateY(Math.PI / 2);
                }
                otherGroup.add(cube);
            })
        },
        /*获取材质*/
        getMaterial(item, textures) {
            let leftAndRightMaterial, // 左右
                color, // 上下
                bgColor, // 贴图背景
                textColor, // 字体颜色
                texture // 材质
            if (item.type === 'cabinet') {
                leftAndRightMaterial = cabinetGeometry.leftAndRight1;
                color = '#111';
                bgColor = '#333';
                textColor = '#fff';
                texture = textures.fuwuqiTex;
            } else if (item.type === 'kt') {
                leftAndRightMaterial = cabinetGeometry.leftAndRight2;
                color = '#ddd';
                bgColor = '#fff';
                textColor = '#000';
                texture = textures.kontiaoTex;
            } else {
                leftAndRightMaterial = cabinetGeometry.leftAndRight3;
                color = '#999';
                bgColor = '#ddd';
                textColor = '#000';
                texture = textures.odfTex;
            }
            //导入材质
            texture.matrixAutoUpdate = false;
            // texture.needsUpdate = true;
            //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
            let material = [
                leftAndRightMaterial,// 右
                leftAndRightMaterial,// 左
                new THREE.MeshPhongMaterial(
                    item.num ?
                        {map: new THREE.CanvasTexture(this.getTextCanvas(item.num, bgColor, textColor))}
                        :
                        {color: bgColor, specular: bgColor, shininess: shininessNum}
                ),// 上
                cabinetGeometry.down,// 下
                new THREE.MeshPhongMaterial(
                    item.pos.includes('head') ||
                    item.pos.includes('left') ||
                    item.pos.includes('right')
                        ? {map: texture} : {
                            color: color,
                            specular: 0x4488ee,
                            shininess: shininessNum
                        }
                ),                                                       // 前
                new THREE.MeshPhongMaterial(
                    item.pos.includes('back') ||
                    (item.pos.includes('left') && item.pos.includes('right'))
                        ? {map: texture} : {
                            color: color,
                            specular: 0xeeeeee,
                            shininess: shininessNum
                        }
                ),                                                       // 后
            ];
            return material;
        },
        // 获取文本贴图
        getTextCanvas(text, bgColor, textColor) {
            let width = 200, height = 150;
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d', {
                antialias: true,
                depth: true,
            });
            ctx.fillStyle = bgColor ? bgColor : '#ddd'; // 背景颜色
            ctx.fillRect(0, 0, width, height);
            ctx.font = 50 + 'px " bold';
            ctx.fillStyle = textColor; // 字体颜色
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text || '', width / 2, height / 2);
            return canvas;
        },
        // 移除所有Mesh
        removeMesh() {
            return new Promise(resolve => {
                this.dispose(scene, group)
                this.dispose(scene, otherGroup)
                this.objects = [];
                this.linePoints = [];
                this.cabinetNum = 0;
                this.cameraNum = 0;
                this.sensorNum = 0;
                group = null;
                otherGroup = null;
                resolve()
            })
        },
        dispose(parent, child) {
            if (child.children.length) {
                let arr = child.children.filter(x => x);
                arr.forEach(a => {
                    this.dispose(child, a)
                })
            }
            if (child.type !== 'Group') {
                child.remove();
                parent.remove(child);
                if (child instanceof THREE.Mesh
                    || child instanceof THREE.Object3D
                    || child instanceof THREE.LineSegments
                    || child instanceof THREE.Line) {
                    child.geometry?.dispose();
                    if (child.material) {
                        if (child.material.length) {
                            child.material.forEach(i => {
                                i.dispose()
                            });
                        } else {
                            child.material.dispose();
                        }
                        if (child.material.map && typeof child.material.map !== 'function') {
                            child.material.map.dispose();
                        }

                    }
                } else if (child.material) {
                    child.material.dispose();
                }

            } else if (child.isScene) {
                child.dispose();
            } else {
                parent.remove(child)
            }

        },
        /*沿线动画*/
        animate() {
            let other;
            let vm = this;
            let mesh = cameraObj.clone();
            let scale = 0.5
            mesh.scale.set(scale, scale, scale) // scale here
            mesh.name = '610-西南侧-热成像';
            mesh.userData.dataId = '29e3fbfc923d11eb908d0242ac110004';
            mesh.userData.isAnimation = true;

            const popupDiv = document.getElementsByClassName('model-popup')[0].cloneNode(true);
            popupDiv.style.overflow = 'hidden';
            popupDiv.style.width = '0px';
            popupDiv.style.height = '0px';
            popupDiv.style.padding = '0px';
            popupDiv.style.fontSize = '0px';
            let moonLabel = new CSS2DObject(popupDiv);
            moonLabel.element.id = '29e3fbfc923d11eb908d0242ac110004';
            moonLabel.element.addEventListener('mouseover', event => {
                this.flag = false;
                AnimationAction.paused = true;
            });
            moonLabel.element.addEventListener('mouseleave', event => {
                this.flag = true;
            });
            moonLabel.position.set(0, 1, 0);
            mesh.add(moonLabel)

            // 添加一个透明的Mesh 将模型添加进去，用以点击
            // let geometry = new THREE.BoxBufferGeometry(4, 4, 4);
            // let material = new THREE.MeshBasicMaterial({color: 0xffffff});
            // material.transparent = true;
            // material.opacity = 0;
            other = emptyMesh.clone();
            other.add(mesh)
            group.add(other);


            let pointsArr = []
            vm.linePoints.forEach(item => {
                pointsArr.push(
                    new THREE.Vector3(item.x, item.y, item.z + 4),
                )
            })
            // 通过类CatmullRomCurve3创建一个3D样条曲线
            let curve = new THREE.CatmullRomCurve3(pointsArr, true, 'catmullrom', 0.1);
            let divisions = Math.round(10 * pointsArr.length); // 样条曲线均匀分割200分，返回102个顶点坐标
            let points = curve.getPoints(divisions);
            // console.log('points', points);//控制台查看返回的顶点坐标
            let geometryLine = new THREE.BufferGeometry();
            // 把从曲线轨迹上获得的顶点坐标赋值给几何体
            geometryLine.setFromPoints(points)
            let lineMaterial = new THREE.LineBasicMaterial({
                color: "#12D497"
            });
            let line = new THREE.Line(geometryLine, lineMaterial);
            otherGroup.add(line)

            // 声明一个数组用于存储时间序列
            let arr = []
            for (let i = 0; i < divisions + 1; i++) {
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
            let duration = divisions + 1;
            let clip = new THREE.AnimationClip("default", duration, [posTrack]);
            mixer = new THREE.AnimationMixer(other);
            AnimationAction = mixer.clipAction(clip);
            AnimationAction.timeScale = 10;
            AnimationAction.play();
        },
        // 鼠标经过事件
        initHoverRayCaster() {
            //监听全局点击事件,通过ray检测选中哪一个object
            cssRender.domElement.addEventListener("mousemove", (event) => {

                mouse.x = (event.clientX / cssRender.domElement.clientWidth) * 2 - 1;
                mouse.y = -(event.clientY / cssRender.domElement.clientHeight) * 2 + 1;

                rayCaster.setFromCamera(mouse, camera);
                let intersects = rayCaster.intersectObjects(group.children, true);
                if (this.flag) {
                    AnimationAction.paused = false;
                }
                if (intersects.length) {
                    if (intersects[0].object.children[0]?.isScene) {
                        let obj = intersects[0].object.children[0];
                        if (obj.userData.isAnimation) {
                            AnimationAction.paused = true
                        }
                    }
                }
            }, false)
        },
        // 创建鼠标控件
        getOrbitControls() {
            controls = new OrbitControls(camera, cssRender.domElement)
            // 使动画循环使用时阻尼或自转 意思是否有惯性
            // controls.enableDamping = true;
            //动态阻尼系数 就是鼠标拖拽旋转灵敏度
            controls.dampingFactor = 0.25;
            // 设置相机距离原点的最近距离
            controls.minDistance = this.near;
            // 设置相机距离原点的最远距离
            controls.maxDistance = this.far;
            // 是否开启右键拖拽
            controls.enablePan = true
            // 缩放范围
            controls.minZoom = 0.5;
            controls.maxZoom = 1;
            // //监听鼠标事件，触发渲染函数，更新canvas画布渲染效果
            // controls.addEventListener('change', () => {
            //     this.render()
            // });
        },
        // 渲染
        render() {
            requestAnimationFrame(this.render);

            let T = clock.getDelta();
            this.timeS = this.timeS + T;
            if (this.timeS > this.renderT) {
                renderer && renderer.render(scene, camera); //执行渲染操作
                cssRender && cssRender.render(scene, camera);
                //更新性能插件
                stats.update();

                if (this.linePoints.length) {
                    // 更新帧动画的时间
                    mixer.update(T);
                }
                //renderer.render每执行一次，timeS置0
                this.timeS = 0;
            }

        },
    },
    destroyed() {
        this.closeVideo();
        this.removeMesh().then(() => {
            scene.remove();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.content = null;
            cssRender.content = null;
            renderer.domElement = null;
            cssRender.domElement = null;
            renderer = null;
            cssRender = null;
            cancelAnimationFrame(this.render)
        });
    }
}
</script>

