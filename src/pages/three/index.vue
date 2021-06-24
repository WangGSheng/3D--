<style scoped lang="scss">
 @import "scss/_index.scss";
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
// 场景
let scene = null;
// Mesh 集合
let group = null;

let otherGroup = null;
// 相机
let camera = null;
// 渲染器
let renderer = null;
// 灯光
let light = null;
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
// let clock = null;
//
let mixer = null;
// 鼠标拖拽
// let dragControls = null;
// 鼠标控件 旋转缩放
import OrbitControls from 'three-orbitcontrols'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
import room3D from './data/610B.js'
import Vue from 'vue'
import mapPopup from '@/pages/videoPlayer/_videoPopup.vue'

let controls = null;// 鼠标控制器
let cssRender = null;// 自定义css渲染器
let GLTFLoader = null;// 外部模型加载器 .GLTF，.GLB
let cameraObj = null;
let sensorObj = null;
let emptyMesh = null;
let beforeSelected = null;
let videoVm = null;// 用以存储弹窗实例，用以销毁视频播放
let videoComponent = null;
export default {
    data() {
        return {
            showStatusUi: false,
            loading: true,
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
            cssRender: null,
            videoVm: null,
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
        // 初始化外部模型加载器
        this.initLoader();
        // 初始化空白Mesh
        this.getEmptyMesh();
        //初始化性能插件
        this.initStats();

        // 添加拖拽控件
        // this.initTransformControl();
        // 添加删除事件
        // this.initDeleteEvent();

        // 加载CSS2DRenderer
        this.initCssRender();

        // 鼠标控制器
        this.getOrbitControls()

        // 添加点击事件
        this.initRayCaster();

        // 轨迹动画
        // this.animate();
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
        videoComponent = Vue.extend(mapPopup)
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
            scene.fog = new THREE.Fog("#0f1e3e", 20, 700);
            group = new THREE.Group();
            otherGroup = new THREE.Group();
            scene.position.set(0, 0, 0);
            scene.add(group);
            scene.add(otherGroup);
            // 加载辅助坐标系 实际应用的时候需要注释此代码
            // const axisHelper = new THREE.AxisHelper(250)
            // axisHelper.position.set(0, 0, 0);//位置
            // scene.add(axisHelper)
        },
        initCenter(item) {
            controls.target = new THREE.Vector3( item.x,0,item.z);
            //动态阻尼系数 就是鼠标拖拽旋转灵敏度
            controls.dampingFactor = 0.5;
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

            let spotLight = new THREE.SpotLight(
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
            renderer.shadowMap.enabled = true;
            renderer.shadowMapType=THREE.PCFSoftShadowMap;
            this.$nextTick(() => {
                this.$refs.threeDom.appendChild(renderer.domElement);
            })
        },
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
        openOrClose(dom) {
            dom.style.fontSize = dom.style.fontSize === '0px' ? '16px' : '0px';
            dom.style.overflow = dom.style.overflow === 'hidden' ? 'unset' : 'hidden';
            dom.style.width = dom.style.width === '0px' ? '400px' : '0px';
            dom.style.height = dom.style.height === '0px' ? '230px' : '0px';
            dom.style.padding = dom.style.padding === '0px' ? '5px' : '0px';
        },
        // 初始化外部模型加载器
        initLoader() {
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
            this.removeMesh().then(() => {
                scene.add(group);
                scene.add(otherGroup);


                if (item.centerData) {
                    this.centerData = item.centerData;
                    console.log(this.centerData)
                    this.initCenter({
                        x:item.centerData.x,
                        z:item.centerData.z
                    })
                }

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
                }
                this.createPlane('ground');


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
            cssRender = new CSS2DRenderer();
            cssRender.setSize(window.innerWidth, window.innerHeight);
            cssRender.domElement.style.position = 'absolute';
            cssRender.domElement.style.top = 0;
            // document.body.appendChild(cssRender.domElement);
            this.$el.parentElement.appendChild(cssRender.domElement);
        },
        initMyDom() {
            // 编辑按钮
            let control = document.querySelector('.control').cloneNode(true)
            control.style.display = 'block'
            control.addEventListener('click', this.drawRoom)
            this.$el.parentElement.appendChild(control);

            // 统计面板
            let statusUi = this.$el.querySelector('.status-ui');
            this.$el.parentElement.appendChild(statusUi);
        },
        getEmptyMesh() {
            // 添加一个透明的Mesh 将模型添加进去
            let geometry = new THREE.BoxBufferGeometry(3, 3, 3);
            let material = new THREE.MeshBasicMaterial({color: 0xffffff});
            material.transparent = true;
            material.opacity = 0;
            emptyMesh = new THREE.Mesh(geometry, material);
        },
        // 添加温湿度传感器模型
        addScene(item, moonLabel) {
            let model = sensorObj.clone(), x = item.x, y = 9, z = item.z;
            model.rotateZ(Math.PI);
            if (item.pos.includes('head')) {
                model.rotateY(Math.PI / -2)
                // x += 4;
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
            model.scale.set(scale, scale, scale) // scale here
            model.name = '传感器-' + item.id
            // // 给模型定制弹窗
            // const popupDiv = document.getElementsByClassName('model-popup')[0].cloneNode(true);
            //
            // popupDiv.style.overflow = 'hidden';
            // popupDiv.style.width = '0px';
            // popupDiv.style.height = '0px';
            // popupDiv.style.padding = '0px';
            // popupDiv.style.fontSize = '0px';
            // let moonLabel = new CSS2DObject(popupDiv);
            moonLabel.position.set(0, 1, 0);
            model.add(moonLabel)

            let other = emptyMesh.clone();

            other.position.set(x, y, z);

            other.add(model)


            group.add(other)
        },
        // 添加摄像头模型
        addCamera(item,moonLabel) {
            let mesh = cameraObj.clone();
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

            moonLabel.position.set(0, 1, 0);
            mesh.add(moonLabel)

            let other = emptyMesh.clone();
            other.position.set(item.x, 12, item.z)
            other.add(mesh)

            // geometryMerge.merge(other.geometry,other.matrix)
            group.add(other)


        },
        // 创建各模型
        createSense() {
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
                    this.addCamera(item.data,moonLabel.clone())
                } else {
                    this.sensorNum++;
                    this.addScene(item.data,moonLabel.clone())
                }
            })
        },
        // 创建墙体
        createWall(item, type, texture) {
            let material;
            let width = 4, height = 10, rotate = false, x = item.x, z = item.z;
            if (type === 'v' || type === 'vDoor') {
                rotate = true;
                x -= 2;
            } else {
                z -= 2;
            }

            if (type === 'vDoor' || type === 'hDoor') {
                material = new THREE.MeshPhongMaterial(
                    {
                        map: texture,
                        side: THREE.DoubleSide,
                        wireframe: false,
                        transparent: true,
                        opacity: 1,
                        specular: 0x4488ee,
                        shininess: shininessNum
                    }
                );
            } else {
                let color = "#425fac";
                //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
                material = [
                    new THREE.MeshLambertMaterial({color: color, opacity: 0, transparent: true}),
                    new THREE.MeshLambertMaterial({color: color, opacity: 0, transparent: true}),
                    new THREE.MeshPhongMaterial({color: color, opacity: 0.4, transparent: true}),
                    new THREE.MeshLambertMaterial({color: color, opacity: 0.4, transparent: true}),
                    new THREE.MeshPhongMaterial({
                        color: color,
                        specular: 0x4488ee,
                        shininess: shininessNum,
                        opacity: 0.6,
                        transparent: true
                    }),
                    new THREE.MeshPhongMaterial({
                        color: color,
                        specular: 0x4488ee,
                        shininess: shininessNum,
                        opacity: 0.6,
                        transparent: true
                    }),
                ]
            }


            let geometry = new THREE.BoxGeometry(width, height, 0.3);

            let plane = new THREE.Mesh(geometry, material);
            plane.position.set(x, 5, z)
            if (rotate) plane.rotateY(Math.PI / 2);
            otherGroup.add(plane);
            // this.objects.push(plane)
        },
        // 创建面
        createPlane(type) {
            if (type === 'wall') {
                let texture = new THREE.TextureLoader().load('static/images/door.png');
                this.wallList.forEach((item) => {
                    if (item.leftBorder) {
                        this.createWall(item, 'v');
                    }
                    if (item.topBorder) {
                        this.createWall(item, 'h');
                    }
                    if (item.leftDoor) {
                        this.createWall(item, 'vDoor', texture);
                    }
                    if (item.topDoor) {
                        this.createWall(item, 'hDoor', texture);
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

                let result = []
                for (let i = minZ; i < maxZ; i += 4) {
                    let arr = [];
                    this.wallList.forEach(item => {
                        if (item.z === i && (!item.topBorder || (item.topBorder && item.leftBorder))) {
                            arr.push(item)
                        }
                    })
                    result.push(arr)
                }

                for (let i = 0; i < result.length; i++) {
                    result[i] = this.getDistance(result[i])
                }



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

                this.createSelfGround(result)
                this.createGround(res)
                if (this.groundDataList.length) this.groundText(res)

            }
        },
        getDistance(arr) {
            const handle = (prop) => {
                return (a,b) => {
                    const val1 = a[prop];
                    const val2 = b[prop];
                    return val1 - val2;
                }
            }
            arr.sort(handle('x'));
            return {min:arr[0],max:arr[arr.length - 1]}
        },
        // 创建地板
        createGround() {

            const textureLoader = new THREE.TextureLoader();
            let floorMat = new THREE.MeshStandardMaterial({
                roughness: 0.8,
                color: 0xffffff,
                metalness: 0.2,
                bumpScale: 0.0005,
            });
            textureLoader.load("static/images/地板2.jpg", function (map) {

                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set(250, 250);
                map.encoding = THREE.sRGBEncoding;
                floorMat.map = map;
                floorMat.needsUpdate = true;
                floorMat.side = THREE.DoubleSide;
            });
            // textureLoader.load( "static/images/hardwood2_bump.jpg", function ( map ) {
            //
            //     map.wrapS = THREE.RepeatWrapping;
            //     map.wrapT = THREE.RepeatWrapping;
            //     map.anisotropy = 4;
            //     map.repeat.set( 10, 24 );
            //     floorMat.bumpMap = map;
            //     floorMat.needsUpdate = true;
            //
            // } );
            // textureLoader.load( "static/images/hardwood2_roughness.jpg", function ( map ) {
            //
            //     map.wrapS = THREE.RepeatWrapping;
            //     map.wrapT = THREE.RepeatWrapping;
            //     map.anisotropy = 4;
            //     map.repeat.set( 10, 24 );
            //     floorMat.roughnessMap = map;
            //     floorMat.needsUpdate = true;
            //
            // } );
            let width = window.innerWidth, height = window.innerWidth;
            let geometry = new THREE.PlaneGeometry(width, height);
            let plane = new THREE.Mesh(geometry, floorMat);
            plane.position.set(60, 0, 60)
            // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
            plane.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
            plane.receiveShadow = true; // 接受阴影
            otherGroup.add(plane);
            // this.objects.push(plane)
        },
        createSelfGround(arr) {
            const textureLoader = new THREE.TextureLoader();
            let map = textureLoader.load("static/images/地板2.jpg");
            let width = 4, height = 4;
            let geometry = new THREE.PlaneGeometry(width, height);
            let material = new THREE.MeshPhongMaterial(
                {
                    // map: map,
                    color:'#555',
                    side: THREE.DoubleSide,
                    specular: "#8D93AB",
                    shininess: 2,
                    // opacity:0.7,
                    // transparent:true
                }
            );
            let plane = new THREE.Mesh(geometry,  material);
            //描边
            let edgesMtl = new THREE.LineBasicMaterial({color: '#666'})
            let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
            let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
            arr.forEach(item => {
                for (let i = item.min.x; i < item.max.x ; i+= 4) {
                    let pal = plane.clone();
                    pal.position.set(i, 0.1, item.min.z)
                    // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
                    pal.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
                    pal.receiveShadow = true; // 接受阴影
                    let cubeLines = cubeLine.clone();
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
                        let geometry = new THREE.PlaneGeometry(width, height);
                        let textMaterial = new THREE.MeshLambertMaterial(
                            {
                                map: new THREE.CanvasTexture(this.getTextCanvas(this.groundDataList[j].name, "#182245", '#fff')),
                                side: THREE.DoubleSide,
                                wireframe: false,
                            }
                        );
                        let plane = new THREE.Mesh(geometry, textMaterial ? textMaterial : material);
                        plane.position.set(x, 0.1, z)
                        // plane.rotateY(- Math.PI / 2); // 沿 Y 轴旋转 90°
                        plane.rotateX(-Math.PI / 2); // 沿 X 轴旋转 90°
                        plane.receiveShadow = true; // 接受阴影
                        otherGroup.add(plane);
                        // this.objects.push(plane)
                        break;
                    }
                }

                //
                // let edgesMtl = new THREE.LineBasicMaterial({color: '#777'})
                // let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                // let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                //
                //
                // plane.add(cubeLine);

            }
        },
        // 创建机柜
        createCabinet() {
            if (this.cubeList && this.cubeList.length) {
                //添加长方体
                let geometry = new THREE.BoxBufferGeometry(3.7, 8, 3);
                let texture = {
                    fuwuqiTex: new THREE.TextureLoader().load('static/images/fuwuqi.png'),
                    kontiaoTex: new THREE.TextureLoader().load('static/images/空调.png'),
                    odfTex: new THREE.TextureLoader().load('static/images/ODF.png')
                }
                let cabinetCube = new THREE.Mesh(geometry);

                this.cubeList.forEach(item => {
                    this.cabinetNum++;
                    let cube = cabinetCube.clone();
                    let material = this.getMaterial(item,texture);
                    cube.material = material;
                    cube.material.map.needsUpdate = true;
                    cube.position.set(item.x, 4, item.z);


                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    if (item.pos.includes('left')) {
                        cube.rotateY(Math.PI / -2);
                    } else if (item.pos.includes('right')) {
                        cube.rotateY(Math.PI / 2);
                    }
                    // this.objects.push(cube)
                    otherGroup.add(cube);
                })
            }
        },
        getMaterial(item,textures) {
            let color1, // 左右
                color2, // 上下
                bgcolor, // 贴图背景
                textcolor, // 字体颜色
                texture // 材质
            if (item.type === 'cabinet') {
                color1 = '#222';
                color2 = '#111';
                bgcolor = '#333';
                textcolor = '#fff';
                texture = textures.fuwuqiTex;
            } else if (item.type === 'kt') {
                color1 = '#eee';
                color2 = '#ddd';
                bgcolor = '#fff';
                textcolor = '#000';
                texture = textures.kontiaoTex;
            } else {
                color1 = '#ddd';
                color2 = '#999';
                bgcolor = '#ddd';
                textcolor = '#000';
                texture = textures.odfTex;
            }
            //导入材质
            texture.matrixAutoUpdate = false;
            //直接使用材质数组来构建物体，数组里的材质分别对应物体的右、左、上、下、前、后
            let material = [
                new THREE.MeshPhongMaterial({
                    color: color1,
                    specular: 0x4488ee,
                    shininess: shininessNum
                }),// 右
                new THREE.MeshPhongMaterial({
                    color: color1,
                    specular: 0x4488ee,
                    shininess: shininessNum
                }),// 左
                new THREE.MeshPhongMaterial(
                    {map: new THREE.CanvasTexture(this.getTextCanvas(item.num, bgcolor, textcolor))}
                ),// 上
                new THREE.MeshPhongMaterial({color: '#000'}),// 下
                new THREE.MeshPhongMaterial(
                    item.pos.includes('head') ||
                    item.pos.includes('left') ||
                    item.pos.includes('right')
                        ? {map: texture} : {
                            color: color2,
                            specular: 0x4488ee,
                            shininess: shininessNum
                        }
                ),                                                       // 前
                new THREE.MeshPhongMaterial(
                    item.pos.includes('back') || (item.pos.includes('left') && item.pos.includes('right'))
                        ? {map: texture} : {
                            color: color2,
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
                depth: true
            });
            ctx.fillStyle = bgColor ? bgColor : 'rgba(255,255,255,0)'; // 背景颜色
            ctx.fillRect(0, 0, width, height);
            ctx.font = 50 + 'px " bold';
            ctx.fillStyle = textColor; // 字体颜色
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text || '', width / 2, height / 2, 150);
            return canvas;
        },
        // 移除所有Mesh
        removeMesh() {
            return new Promise(resolve => {
                scene.remove(group)
                scene.remove(otherGroup)
                group.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose(); //删除几何体
                        if (child.material.length) {
                            child.material.forEach(i => {
                                i.dispose()
                            });
                        } else {
                            child.material.dispose();
                        }
                    }
                })
                otherGroup.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose(); //删除几何体
                        if (child.material.length) {
                            child.material.forEach(i => {
                                i.dispose()
                            });
                        } else {
                            child.material.dispose();
                        }
                    }else{
                        child.geometry ?.dispose(); //删除几何体
                        if (child.material ?.length) {
                            child.material.forEach(i => {
                                i.dispose()
                            });
                        } else {
                            child.material ?.dispose();
                        }
                    }
                })
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
        animate() {
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
                    otherGroup.add(other);

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
                    otherGroup.add(line)

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

            cssRender.render(scene, camera)
            renderer.render(scene, camera);
            //更新性能插件
            stats.update();
            // 更新帧动画的时间
            // mixer.update(clock.getDelta());
        }
    },
    beforeDestroy() {
        this.closeVideo();
        this.removeMesh();
    }
}
</script>

