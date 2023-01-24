<template>
    <div id="overlay" :style="{ width: '100vw', height: '100vh' }">
        <div v-for="(video, index) in videoList" :key="index" class="draggable" @mousedown="startDragging"
            @mousemove="drag" @mouseup="stopDragging">
            <div class="video-container">
                <video type="video" :srcObject.prop="video.stream" autoplay :muted="video.id == ownId"
                    :id="'video-' + video.id"></video>
            </div>
        </div>
    </div>
</template>
  
<style>
#overlay {
    position: absolute;
    overflow: hidden;
    z-index: 999;
}

.draggable {
    position: absolute;
}

.video-container {
    cursor: move;
    user-select: none;
    -webkit-user-select: none;
}

.video-container video {
    width: 250px;
    height: 250px;
}
</style>

<script>
import { Peer } from "peerjs"

export default {
    name: 'VideoStream',
    props: {
        room: Object,
        url: Object,
        peer: String,
        emitter: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isDragging: false,
            currentDraggedVideo: null,
            ownId: '',
            videoList: [],
            peers: {},
            myPeer: new Peer(
                {
                    config: {
                        'iceServers': [
                            { url: process.env.VUE_APP_STUN_SERVER + ':' + process.env.VUE_APP_STUN_PORT },
                            {
                                url: process.env.VUE_APP_TURN_SERVER + ':' + process.env.VUE_APP_TURN_PORT,
                                username: process.env.VUE_APP_TURN_USER,
                                credential: process.env.VUE_APP_TURN_PASS
                            }
                        ]
                    }
                }),
            myStream: '',
            videoGrid: {
                width: '',
                height: '',
                cols: ''
            }
        }
    },
    methods: {
        startDragging(e) {
            this.isDragging = true
            this.currentDraggedVideo = e.currentTarget
        },
        drag(e) {
            if (!this.isDragging) return
            const video = this.currentDraggedVideo
            video.style.left = `${e.clientX - video.offsetWidth / 2}px`
            video.style.top = `${e.clientY - video.offsetHeight / 2}px`
        },
        stopDragging() {
            this.isDragging = false
            this.currentDraggedVideo = null
        },
        callUser(userId) {
            const call = this.myPeer.call(userId, this.myStream)
            this.handleStream(call)
        },
        handleStream(call) {
            call.on("stream", (remoteStream) => {
                this.addVideoStream(call.peer, remoteStream)
            });
            call.on("error", (err) => {
                alert(err)
                console.log(err)
            });
            call.on('close', () => {
                let i = this.videoList.map(video => video.id).indexOf(call.peer)
                this.videoList.splice(i, 1)
            });
            this.peers[call.peer] = call
        },
        addVideoStream(id, stream) {
            let i = this.videoList.map(video => video.id).indexOf(id)
            if (i == -1) {
                this.videoList.push({ stream, id })
            }
        }
    },
    mounted() {
        this.myPeer.on("open", (id) => {
            this.ownId = id
            this.emitter.emit("peer", id);
            navigator.mediaDevices.getUserMedia(
                { video: true, audio: true }
            ).then((stream) => {
                this.myStream = stream
                this.addVideoStream(this.ownId, this.myStream)
                this.myPeer.on("call", (call) => {
                    if (confirm(`Accept call from ${call.peer}?`)) {
                        call.answer(stream)
                        this.handleStream(call)
                    } else {
                        call.close()
                    }
                })
                this.emitter.on('calling', userId => {
                    if (userId != this.ownId) {
                        this.callUser(userId)
                    }
                })
                this.emitter.emit('peer', { 'room': this.room, 'peer': this.ownId })
            })
            this.emitter.on('end', userId => {
                if (this.peers[userId]) {
                    this.peers[userId].close()
                }
            })
        })
    },
    unmounted() {
        this.myStream.getTracks().forEach(function (track) { track.stop() })
        this.myPeer.disconnect()
    }
}
</script>