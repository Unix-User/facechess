<template>

      <YoutubeVue3 ref="youtube" :videoid="play.video_id" :loop="play.loop" :left="0" :top="0" :width="280" :height="120"
        @ended="onEnded" @paused="onPaused" @played="onPlayed"/>
  </template>
  
  <div> 
{
    style = "position: absolute; top: 0; right: 0; width: 179px; height: 135px; border: 1px solid #000; z-index: 100;"
     }

    <input type="text" v-model="temp.video_id" placeholder="d98ejnKa-g8" />
    <input type="2" v-model="temp.loop" placeholder="Loop" />
    <button @click="applyConfig">Apply</button>
    <button @click="playCurrentVideo">Play</button>
    <button @click="stopCurrentVideo">Stop</button>
    <button @click="pauseCurrentVideo">Pause</button>

</div>
  <script>
  import { YoutubeVue3 } from 'youtube-vue3'
  
  export default {
    name: 'App',
    data() {
      return {
        temp: { video_id:"d98ejnKa-g8", loop:1 },
        play : { video_id:"d98ejnKa-g8", loop:1 }
      }
    },
    components: {
      YoutubeVue3
    },
    methods: {
      applyConfig() {
        this.play = Object.assign(this.play, this.temp)
      },
      playCurrentVideo() {
        this.$refs.youtube.player.playVideo();
      },
      stopCurrentVideo() {
        this.$refs.youtube.player.stopVideo();
      },
      pauseCurrentVideo() {
        this.$refs.youtube.player.pauseVideo();
      },
      onEnded() {
        console.log("## OnEnded")
      },
      onPaused() {
        console.log("## OnPaused")
      },
      onPlayed() {
        console.log("## OnPlayed")
      }
    }
  }
  </script>