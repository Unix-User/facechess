<template>

      <YoutubeVue3 ref="youtube" :videoid="play.video_id" :loop="play.loop" :left="0" :top="0" :width="280" :height="120"
        @ended="onEnded" @paused="onPaused" @played="onPlayed"/>
  </template>
  
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