<template>
    <div :style="videoGrid" id="video-grid">
        <div v-for="(video, index) in videoList" :key="index" class="video-container">
            <video :srcObject.prop="video.stream" autoplay :muted="video.id == ownId" :id="'video-' + video.id"></video>
        </div>
    </div>
</template>
  
<script>
import debounce from "lodash/debounce";
import { Peer } from "peerjs"
import { io } from "socket.io-client"
var socket = io.connect("https://localhost:8080")

export default {

    // layout: Layout,
    props: {
        room: Object,
        url: Object,
    },
    data() {
        return {
            ownId: '',
            videoList: [],
            peers: {},
            myPeer: new Peer(),
            myStream: '',
            videoGrid: {
                width: '',
                height: '',
                cols: ''
            }
        }
    },
    methods: {
        recalculateLayout() {
            const aspectRatio = 16 / 9;
            const screenWidth = document.body.getBoundingClientRect().width;
            const screenHeight = document.body.getBoundingClientRect().height;
            const videoCount = document.getElementsByTagName("video").length;

            function calculateLayout(
                containerWidth,
                containerHeight,
                videoCount,
                aspectRatio
            ) {
                let bestLayout = {
                    area: 0,
                    cols: 0,
                    rows: 0,
                    width: 0,
                    height: 0
                };

                for (let cols = 1; cols <= videoCount; cols++) {
                    const rows = Math.ceil(videoCount / cols);
                    const hScale = containerWidth / (cols * aspectRatio);
                    const vScale = containerHeight / rows;
                    let width;
                    let height;
                    if (hScale <= vScale) {
                        width = Math.floor(containerWidth / cols);
                        height = Math.floor(width / aspectRatio);
                    } else {
                        height = Math.floor(containerHeight / rows);
                        width = Math.floor(height * aspectRatio);
                    }
                    const area = width * height;
                    if (area > bestLayout.area) {
                        bestLayout = {
                            area,
                            width,
                            height,
                            rows,
                            cols
                        };
                    }
                }
                return bestLayout;
            }

            const { width, height, cols } = calculateLayout(
                screenWidth,
                screenHeight,
                videoCount,
                aspectRatio
            );

            this.videoGrid.width = width + "px"
            this.videoGrid.height = height + "px";
            this.videoGrid.cols = cols + "";
        },

        callUser(userId) {
            const call = this.myPeer.call(userId, this.myStream)
            this.handleStream(call)
        },
        handleStream(call) {
            call.on("stream", (remoteStream) => {
                this.addYoutube(call.peer, remoteStream)
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
        addYoutube(id, stream) {
            let i = this.videoList.map(video => video.id).indexOf(id)
            if (i == -1) {
                this.videoList.push({ stream, id })
            }

        }
    },
    umounted() {

        this.myPeer.on("open", (id) => {
            this.ownId = id
            navigator.mediaDevices.getUserMedia(
                { video: true, audio: true }
            ).then((stream) => {
                this.myStream = stream
                this.addYoutube(this.ownId, this.myStream)
                this.myPeer.on("call", (call) => {
                    if (confirm(`Accept call from ${call.peer}?`)) {
                        call.answer(stream)
                        this.handleStream(call)
                    } else {
                        call.close()
                    }
                })
                socket.on('user-connected', userId => {
                    if (userId != this.ownId) {
                        this.callUser(userId)
                    }
                })

                socket.emit('join-room', this.room, this.ownId)
                const debouncedRecalculateLayout = debounce(this.recalculateLayout, 50);
                window.addEventListener("resize", debouncedRecalculateLayout);

            })
            socket.on('user-disconnected', userId => {
                if (this.peers[userId]) {
                    this.peers[userId].close()
                }
            })

        })


    },
    mounted() {
        window.removeEventListener("resize",);
        this.myStream.getTracks().forEach(function (track) { track.stop() })
        this.myPeer.disconnect()
    }
}
</script>
  
<style>
/* video-gallery */
body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #3a6a3a;
}

#video-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    max-width: calc(var(--width) * var(--cols));
}

.video-container {
    width: var(--width);
    height: var(--height);
    background-color: #3a3a3e;
}

video {
    height: 100%;
    width: 100%;
}
</style>