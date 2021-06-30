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
                    Authorization:'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjamdseSIsImlhdCI6MTYyNTAxODc5NywiZXhwIjoxNjI1NjIzNTk3fQ.lvUeoiQIP3sKBwI1pNFXVQrulmbhx3LTi38Y0_PbJ8UbHLQElernJOsQZTwX65UZBXYPg0Asz5G_GJ_sm2811A'
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
        width: calc(100% - 10px);
        //height: 60px;
        //background-color: rgba(#d78a34 , .7);
        background-image: linear-gradient(to right, rgba(#d78a34,.7), rgba(#d78a34,.3));
        color: #fff;
        position: absolute;
        top: -21px;
        left: 5px;
        padding: 2px 5px;
        //border-radius: 5px;
        font-size: 12px;
        transform:rotateY(20deg);
        overflow: hidden;
        border-left: 3px solid rgba(#fcbf84,.9);
        //&:before {
        //    content: '';
        //    width: 50%;
        //    height:100%;
        //    position: absolute;
        //    left: -40%;
        //    background-color: #fcbf84;
        //    top: -5px;
        //    transform: rotate(-45deg);
        //}
    }
    .box-content{
        transform:rotateY(20deg);
        border: 2px solid rgba(#d78a34, .7);
        //border-radius: 5px;
    }
    .my-loading {
        height: calc(100% - 13px);
        width: calc(100% - 0px);
    }
    /deep/ .el-loading-mask,.my-loading{
        transform:rotateY(20deg);
    }
    //&::before {
    //    content: "";
    //    position: absolute;
    //    width: 0px;
    //    height: 0px;
    //    transform:rotateY(20deg);
    //    left: calc(50% - 8px);
    //    bottom: -10px;
    //    border-top: 8px solid #0ff;
    //    border-right: 8px solid transparent;
    //    border-left: 8px solid transparent;
    //    border-bottom: 8px solid transparent;
    //}
    &:before {
        content: '';
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAABaCAMAAABkHv9lAAABZVBMVEUAAAACAgL///8AAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAD///////8AAAAAAAAAAAD+/v7///////////////////////////8AAAD///+RkZH////////t7e319fX///////8AAAAAAAD///+Xl5f////c3NwAAACpqan////////////4+Pj+/v7////////////////AwMDQ0ND////////////v7+////////8AAAD9/f3////////////////////////////8/Pzh4eH8/Pz6+vr////Ozs7///+fn5+2trbj4+P////////////l5eX////////////f398AAACoqKjv7+/IyMjT09P////o6Oj///+8vLzw8PCnp6fp6ena2tqMjIxdXV3AwMBAQEBVVVXOzs7u7u41NTX////19fXq6ura2tr5+fnw8PDV1dXDw8PIyMjHx8e+vr7Ozs4TwFotAAAAa3RSTlMAAU0ECgcG/REMGA8B+xYcFET594Mzb0gZHtJua15RT0tBIiCPa2dVJWJhWhsK9amUcmRcWFZTUEM5KCeeiod5dnRiLCH+9Luzh3xpYFMqFAX8gYB+ZCsU/ODa2dDIs56ainZUR0E4Nh8eGLFp/d4AAANySURBVGje7dppU9pAGMDxJRYjkKgRI4fagoiAQj3AikKtivd9VO193wG8+/m7eTZx0eigHZKsM/nPiPjK3zzPZuWFiIGEoCxFAlE5KCBGCkY5rWgQsZAwxdU0xcKgiIiakO0FuWvZvjtBAkdn2O8Pd8Jbye7VpYExrEDD8EMa2ZsMM1K0YE4ysjfYW1gnhWFzyJz2lP/Jr5IiyJSGRNZIvaIyg+5U1JrFgYit441Fs2xdAqqIratyUFRG2fqDAqL7tHlVtNl4Ea90oXsllGpFpYavbY7nu9j6CAei+yekZSkSkeR040/2mCpiKvZEAzzfg5jKET1EUQ/PDyCmckR3Eo0hpupyRHcRzSGmYlCk8IOIqUYV0RHVaVYRexFTsSeacUR1e6GIQ4ipHNFDFK0q4jhiKvZELx1R3faUjmeIqXaZE3U+LJHL5UKWByKmSFg0caMFQTaIponIGKXUQVkhckHaG/XVwlGBiENMkZ4bRa7bsoBFRTAIOhT7SCCKIKZINSJD9qD6FX9A17Bh0kQMkVSRAdRkyDqSoImoBTg2kkB0bS7NNItJVATpGHdt1pOEEeWppHPA8EjPrX65YVRWilwjPBbBdMDioRGWm4KsIblgRk3A8fh8LXo+nw9Mt5CQmVvDM2pyYw1mtONacfgboC5JxoPU+I9NwnYmI2iivBt7MMWrh1FA8ngISCOZuLPMvBzl1AKTpSK/mPe0tHrbcKEQfgESFvlwIHKDx9SDtDXJ0ZbExf0/3rZQrA8Xi8UA1QokON30CqiBNJi0LXO1ovKrlfXUz2ShUEgmk326qJ0sDYua6YzMIm1HiWVoenh5ubh0vLOyFo/Hvx0cFECkrg1APgJqIpn63JOljS93KLjyzsmHbuhHgYwIe+AUeWBjdEAmkrZANPFWBfHH1fPT00/d3fH42lcyIXjOtAFdTsjkC3IeSLsgKlcvLk7PXmNQKpUKkQHpz70uugljCmlVJR1VTs7P/p68SaXW17NZLz1AwDF7ZbQMB73HQzqqLFSrCwsr2Ww2l/ve4rmyLpdpD70xmRym4iJ/VD6uVN59yeUSuUTiUL8SqcQykqDfk6P9xY+f9xO4jY2NX/p0TD3K9f83/cljrfwhsVjNoWVKEUIi5X/jx9xOEiRsbU5KAS4g5eX5jJEBFFu6ZSYOicbEr/8HZUTFNkbq7ZMAAAAASUVORK5CYII=');
        background-size: 100% 100%;
        position: absolute;
        left: -100px;
        bottom: -60px;
        width: 120px;
        height: 80px;
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
