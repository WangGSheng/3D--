<template>
    <div class="w-100p h-100p">
        <div class="w-100p h-100p pos-a" style="z-index:0;top: 0;left: 0;bottom: 0;right: 0;" v-if="loading" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.5)"></div>
        <div ref="box" class="w-100p h-100p" style="background-color: #000;" @dblclick.stop="full">
            <video  ref="videoElement" width="100%" height="100%"></video>
            <div class="toolbar">
                <ui-tab-btn :name="isFull ?'缩小':'全屏'" :icon="`icon ${isFull ? 'compress':'expand'}`" @click="full" :key="changFull"></ui-tab-btn>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    // props: {
    //     flvPlayer:null,
    //     hlsPlayer:null,
    // },
    data() {
        return {
            item:null,
            flvPlayer:null,
            hlsPlayer:null,
            loading:true,
            isFull:false,
            playing:false,
            changFull:0,
        }
    },
    mounted() {
        this.getUrl();
    },
    methods:{
        getUrl() {
            // this.$http.get(`/video/getIermEngineroomCamerasVideo?id=${ id }`).then((resp) => {
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
            //         this.getUrl(id)
            //         return false
            //     }
            // })
            // this.play('http://182.43.48.126:8082/1621562286015/1621562286015/hls.m3u8')
            this.play('http://182.43.48.126:8082/1621562286015/1621562286015.flv')
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
    width: 100%;
    height: 100%;
}
 .toolbar {
     position: absolute;
     right: 0;
     bottom: 15px;
     /deep/ .el-button {
         background-color: transparent;
         border:unset;
         & > i {
             font-size: 20px !important;
         }
     }
 }
</style>
