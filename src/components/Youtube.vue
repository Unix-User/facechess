<template>
  <div id="Youtube">
    <YoutubeVue3 ref="youtube" :video_id="play.video_id" :loop="play.loop" @ended="onEnded" @paused="onPaused"
      @played="onPlayed" width="50" height="50" />
    <div>

    </div>
  </div>
</template>

<script>
import { YoutubeVue3 } from 'youtube-vue3'

export default {
  name: 'App',
  data() {
    return {
      temp: { video_id: "wSYoT_ptT00", loop: 1 },
      play: { video_id: "wSYoT_ptT00", loop: 1 }
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