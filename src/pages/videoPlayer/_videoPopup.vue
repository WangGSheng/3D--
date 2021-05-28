<template>
    <div class="w-100p h-100p video-box">
        <div class="title" v-if="title">{{title}}</div>
        <div class="pos-a my-loading" style="z-index:1;top: 7px;left: 1px;bottom: 0;right: 0;" v-if="loading" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.5)"></div>
        <div ref="box" class="w-100p h-100p box-content" style="background-color: #000;" @dblclick.stop="full">
            <video  ref="videoElement"  width="100%" height="100%"></video>
            <div class="toolbar ui flex">
                <ui-tab-btn style="margin-top: 8px;margin-right: -10px;" :name="isMuted ?'静音':'打开'" :class="`iconfont ${isMuted ? 'ali-iconshengyin-kai':'ali-iconshengyin-guan'}`" @click="changeMuted" :key="muted"></ui-tab-btn>
                <ui-tab-btn :name="isFull ?'缩小':'全屏'" :icon="`icon ${isFull ? 'compress':'expand'}`" @click="full" :key="changFull"></ui-tab-btn>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    props:{
        param:Object
    },
    data() {
        return {
            item:null,
            flvPlayer:null,
            hlsPlayer:null,
            loading:true,
            isFull:false,
            isMuted:false,
            playing:false,
            changFull:0,
            muted:1,
            title: ''
        }
    },
    mounted() {
        this.title = this.param.name;
        this.getUrl();
    },
    methods:{
        changeMuted() {
            this.muted = Math.random();
            this.isMuted = !this.isMuted;
            this.$refs.videoElement.muted = !this.$refs.videoElement.muted;
        },
        getUrl() {
            this.$axios({
                url:`/api/getIermEngineroomCamerasVideo?id=${ this.param.id }`,
                data:{
                    id: this.param.id
                },
                method: 'get',
                headers:{
                    'Content-Type':'application/json',
                    Authorization:'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseHgiLCJpYXQiOjE2MjIxNzM4NzcsImV4cCI6MTYyMjc3ODY3N30.hdXqRwaO89xFvoZdVomappniIlK4Xk6lR-ZLwaEDiaKDb8MWcp_h-agiQfEyUQF6v58dmh7ccc0u5ExZ6b2qkg'
                }
            }).then(response => {
                let resp = response.data;
                if (!resp) {
                    return false;
                }

                // 如果视频节点出现问题则不进行播放
                if (resp.code !== 1000) {
                    this.$message.error(`视频网络连接失败! (${ resp.msg })`);
                    this.$parent.close();
                    return false;
                }
                if (resp.data.resCode === '408') {
                    this.getUrl(this.param.dataId)
                    return false
                }
                this.play(resp.data.videoUrl.m3u8uri)
            }).catch((e) => {
                console.log(e)
            })
            // this.$http.get(`/video/getIermEngineroomCamerasVideo?id=${ this.param.dataId }`).then((resp) => {
            //     if (!resp) {
            //         return false;
            //     }
            //
            //     // 如果视频节点出现问题则不进行播放
            //     if (resp.code !== 1000) {
            //         this.$message.error(`视频网络连接失败! (${ resp.msg })`);
            //         this.$parent.close();
            //         return false;
            //     }
            //     if (resp.data.resCode === '408') {
            //         this.getUrl(this.param.dataId)
            //         return false
            //     }
            //     this.play(resp.data.videoUrl.m3u8uri)
            // })
            // this.play('http://hls.cntv.lxdns.com/asp/hls/main/0303000a/3/default/978a64ddd3a1caa85ae70a23414e6540/main.m3u8')
            // this.play('http://ivi.bupt.edu.cn/hls/cctv6.m3u8')
            // this.play('http://182.43.48.126:8082/1621562286015/1621562286015.flv')
        },
        play(url){
            // 播放flv格式视频流
            if (/.*\.flv$/.test(url)) {
                if (flvjs.isSupported() && !this.flvPlayer) {
                    flvjs.LoggingControl.enableVerbose = false;
                    this.loading = true;
                    let videoElement = this.$refs.videoElement;
                    this.flvPlayer = flvjs.createPlayer({
                        type: 'flv',
                        url: url
                    });
                    this.flvPlayer.attachMediaElement(videoElement);
                    this.flvPlayer.load();

                    this.flvPlayer.play().then(() => {
                        this.loading = false;
                        this.playing = true;
                    });

                    // 默认静音
                    this.flvPlayer.muted = false
                }
            }

            // 播放HLS视频流
            if (/.*\.m3u8$/.test(url)) {
                if (Hls.isSupported() && !this.hlsPlayer) {
                    this.loading = true;
                    let video = this.$refs.videoElement;
                    // var video = document.getElementById('video');
                    this.hlsPlayer = new Hls();
                    this.hlsPlayer.loadSource(url);
                    this.hlsPlayer.attachMedia(video);
                    this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().then(() => {
                            this.loading = false;
                            this.playing = true;
                        })
                    });

                    // 默认静音 (在<video>上面加上muted即可，这个是静音)
                    video.muted = true
                }
            }


        },
        full() {
            this.changFull = Math.random();
            // 全屏状态切换
            this.isFull = !this.isFull;

            // 监听全屏状态 控制使用退出键退出后恢复初始值
            let quit = () => {
                if (!document.fullscreenElement) {
                    // console.log('退出全屏');
                    document.removeEventListener('fullscreenchange', quit, false);
                    this.isFull = false;
                }
            };
            if (this.isFull) {
                // 全屏
                this.$refs.box.requestFullscreen();
                // 监听全屏状态
                document.addEventListener('fullscreenchange', quit, false);
            }else{
                this.quitFull()
            }
        },
        quitFull() {
            // 退出全屏
            if (document.fullscreenElement) {
                document.exitFullscreen()
            }
        },
    },
    beforeDestroy() {
        if (this.flvPlayer) {
            // this.$refs.videoElement.pause();
            this.flvPlayer.destroy();
            this.flvPlayer = null;
        }
        if (this.hlsPlayer) {
            this.$refs.videoElement.pause();
            this.hlsPlayer.destroy();
            this.hlsPlayer = null;
        }
    },
    destroyed() {
        if (this.flvPlayer) {
            // this.$refs.videoElement.pause();
            this.flvPlayer.destroy();
            this.flvPlayer = null;
        }
        if (this.hlsPlayer) {
            // this.$refs.videoElement.pause();
            this.hlsPlayer.destroy();
            this.hlsPlayer = null;
        }
    },

}
</script>

<style scoped lang="scss">
.video-box {
    position: relative;
    //perspective: 1000px;     /* 景深 */
    //transform-style: preserve-3d;      /* 让我的元素成3D在舞台上呈现 */
    padding: 5px;

    .title {
        width: auto;
        height: 60px;
        background-color: #0ff;
        color: #fff;
        position: absolute;
        top: -30px;
        left: 12.1px;
        padding: 8px;
        border-radius: 5px;
        transform:rotateY(20deg);
    }
    .box-content{
        transform:rotateY(20deg);
        border: 2px solid rgba(#0ff, 1);
        border-radius: 5px;
    }
    .my-loading {
        height: calc(100% - 13px);
        width: calc(100% - 0px);
    }
    /deep/ .el-loading-mask,.my-loading{
        transform:rotateY(20deg);
    }
    &::before {
        content: "";
        position: absolute;
        width: 0px;
        height: 0px;
        transform:rotateY(20deg);
        left: calc(50% - 8px);
        bottom: -10px;
        border-top: 8px solid #0ff;
        border-right: 8px solid transparent;
        border-left: 8px solid transparent;
        border-bottom: 8px solid transparent;
    }
    .toolbar {
        position: absolute;
        right: 5px;
        bottom: 5px;
        /deep/ .el-button {
            background-color: transparent;
            border:unset;
            & > i {
                font-size: 20px !important;
            }
        }
    }
}

</style>
