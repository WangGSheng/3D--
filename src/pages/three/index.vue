<template>
    <ui-main :title="$route.name" noPadding>
        <div ref="threeDom" class="w-100p h-100p"></div>

        <div class="control" @click="drawRoom" title="编辑">
            <i class="icon edit" ></i>
        </div>
    </ui-main>
</template>

<script>
let scene = null;
let group = null;
let camera = null;
let renderer = null;
let light = null;
let transformControls = null;
let rayCaster = null;
let mouse = null;
// let dragControls = null;

// import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols' //鼠标
/*eslint-disable*/
import room3D from './机房.js'

export default {
    data() {
        return {
            threeDom: null,
            controls: null,
            drawer: false,
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
        // 本地数据
        this.initData(room3D);
        // 创建地板
        // this.createGround();
        // 创建立方体
        // this.createCube();
        // 鼠标控制器
        this.getOrbitControls()
        // 添加拖拽控件
        // this.initTransformControl();
        // 添加删除事件
        // this.initDeleteEvent();

        // 传感器
        // this.addScene()
        this.render();

        //加入事件监听器,窗口自适应
        window.addEventListener('resize', function () {
            let width = window.innerWidth;
            let height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        })


        // 添加点击事件
        this.initRayCaster();
    },
    methods: {
        initData(item) {
            this.removeMesh();
            if (item.cabinetData && item.cabinetData.length) {
                this.cubeList = item.cabinetData;
                this.createCube();
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
        },
        drawRoom() {
            let vm = this;
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
                        vm.initData(item);
                    }
                }
            })
        },
        removeMesh() {
            this.objects.forEach(item => {
                group.remove(item);
                // if (item.type === type) {
                // }
            })
        },
        addScene(item, loader) {
            let vm = this;
            loader.load('static/three/model/温湿度传感器.glb', function (gltf) {
                    let model = gltf.scene;
                    model.position.set(item.x + 6, 11, item.z + 2)
                    model.rotateZ(Math.PI)
                    model.isCustomer = true
                    model.scale.set(1, 1, 1) // scale here
                    group.add(model)
                    vm.objects.push(model)

                }, undefined,
                function (error) {
                    console.error(error)
                });
        },
        addCamera(item, loader) {
            let vm = this;
            loader.load('static/three/model/监控摄像头.glb', function (gltf) {
                    let mesh = gltf.scene;
                    mesh.position.set(item.x, 10, item.z)
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
                    mesh.scale.set(0.02, 0.02, 0.02) // scale here
                    mesh.name = 'camera';
                    scene.add(mesh);
                    vm.objects.push(mesh)

                    // mesh.rotateZ(Math.PI / 2)
                    //
                    // group.add(mesh)
                    // vm.objects.push(mesh)
                }, undefined,
                function (error) {
                    console.error(error)
                });
        },
        createSense() {
            let loader = new THREE.GLTFLoader();
            this.senseList.forEach(item => {
                if (item.type === 'camera') {
                    this.addCamera(item.data, loader)
                } else {
                    this.addScene(item.data, loader)
                }
            })
        },
        initScene() {
            scene = new THREE.Scene();
            group = new THREE.Group();
            scene.add(group);
            // 加载辅助坐标系 实际应用的时候需要注释此代码
            // const axisHelper = new THREE.AxisHelper(250)
            // axisHelper.position.set(0, 0, 0);//位置
            // scene.add(axisHelper)
        },
        initCamera() {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.near, this.far);
            camera.position.set(140, 70, 190);//位置
            camera.lookAt(scene.position);//对准的焦点
        },
        initRenderer() {
            renderer = new THREE.WebGLRenderer({
                //增加下面两个属性，可以抗锯齿
                antialias: true,
                alpha: true
            });
            renderer.setClearColor('#ddd', 1);// 设置渲染颜色（背景底色
            renderer.setSize(window.innerWidth, window.innerHeight);// 渲染面大小（在二维平面上的窗口大小）
            renderer.setPixelRatio(window.devicePixelRatio); //设备像素比 可以清晰物体
            this.$refs.threeDom.appendChild(renderer.domElement);
        },
        initLight() {
            light = new THREE.AmbientLight('#fff') // 光源颜色;
            // light.position.set(0, 0, 100);
            scene.add(light);
        },
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
                }))
                let minZ = Math.min.apply(Math, this.wallList.map(function (o) {
                    return o.z
                }))
                let maxX = Math.max.apply(Math, this.wallList.map(function (o) {
                    return o.x
                }))
                let minX = Math.min.apply(Math, this.wallList.map(function (o) {
                    return o.x
                }))
                let res = {
                    maxZ: maxZ,
                    minZ: minZ - 4,
                    maxX: maxX,
                    minX: minX - 4,
                }


                this.createGround(res)
            }
        },
        createGround(data) {
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
                plane.rotateX(Math.PI / 2);
                let edgesMtl = new THREE.LineBasicMaterial({color: '#777'})
                let cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                let cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                plane.add(cubeLine);
                scene.add(plane);
                // this.objects.push(plane)
            }
        },
        unique(arr, key) {
            const res = new Map();
            return arr.filter((a) => !res.has(a[key]) && res.set(a[key], 1))
        },

        initTransformControl() {
            // 添加平移控件
            transformControls = new THREE.TransformControls(camera, renderer.domElement);
            transformControls.setMode("translate");//translate，rotate，scale
            transformControls.showY = false;
            scene.add(transformControls);
        },
        initRayCaster() {
            rayCaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            //监听全局点击事件,通过ray检测选中哪一个object
            renderer.domElement.addEventListener("mousedown", (event) => {
                event.preventDefault();
                if (event.button === 2) {
                    return false;
                }

                mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
                mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
                // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

                rayCaster.setFromCamera(mouse, camera);
                let intersects = rayCaster.intersectObjects(scene.children,true);
                if (intersects.length) {
                    // console.log(intersects)
                    intersects.forEach(item => {
                        console.log(item.object.name,'------',item.object.type)
                    })
                    // intersects[0].object.children[0].material.visible = !intersects[0].object.children[0].material.visible;
                    // if (intersects[0].object.children[0].material.visible) {
                    //     this.selectedMesh.push(intersects[0].object);
                    // } else {
                    //     this.selectedMesh.splice(intersects[0].object, 1)
                    // }
                }
            }, false)
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
        getOrbitControls() {
            this.controls = new OrbitControls(camera, renderer.domElement)
            // 设置相机距离原点的最近距离
            this.controls.minDistance = this.near;
            // 设置相机距离原点的最远距离
            this.controls.maxDistance = this.far;
            // 是否开启右键拖拽
            this.controls.enablePan = true
        },
        createCube() {
            //导入材质
            let texture = new THREE.TextureLoader().load('static/images/fuwuqi.png')
            texture.matrixAutoUpdate = false;

            if (this.cubeList && this.cubeList.length) {
                this.cubeList.forEach(item => {
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
                    //添加长方体
                    let geometry = new THREE.BoxGeometry(4, 8, 3);
                    let cube = new THREE.Mesh(geometry, material);
                    cube.position.set(item.x, 4, item.z);
                    let edgesMtl = new THREE.LineBasicMaterial({color: '#999', alpha: 0.1})
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
        render() {
            requestAnimationFrame(this.render);
            renderer.render(scene, camera);
        }
    }
}
</script>

<style scoped lang="scss">
.control {
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
</style>
