<template>
  <div>
    <div
      v-for="(stream, index) in streams"
      :key="index"
      :class="['video-circle', { dragging: stream.isDragging }]"
      :style="{
        left: `${stream.posX}px`,
        top: `${stream.posY}px`,
        width: `${stream.size}px`,
        height: `${stream.size}px`,
      }"
      @mousedown="startDragging(index, $event)"
      @touchstart="startDragging(index, $event)"
    >
      <video
        :ref="el => updateVideoRef(el, index)"
        :srcObject.prop="stream.mediaStream"
        autoplay
        :muted="stream.isMuted"
        class="video-element"
      ></video>
      <div class="controls">
        <b-button
          variant="light"
          @click="toggleMute(index)"
          class="control-button"
        >
          <b-icon :icon="stream.isMuted ? 'mic-mute-fill' : 'mic-fill'"></b-icon>
        </b-button>
        <b-button
          variant="danger"
          @click="closeStream(index)"
          class="control-button"
        >
          <b-icon icon="x-circle-fill"></b-icon>
        </b-button>
      </div>
      <div
        class="resize-handle"
        @mousedown="startResizing(index)"
        @touchstart="startResizing(index)"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted, nextTick } from "vue";
import Peer from "peerjs";
import socketClient from "@/utils/socketClient";

export default {
  name: "VideoStream",
  props: {
    streams: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const videoRefs = ref([]);
    const peer = ref(null);
    const localStream = ref(null);
    const connections = ref([]);
    const draggingStream = ref(null);
    const offset = ref({ x: 0, y: 0 });
    const ownId = ref('');
    const peers = ref({});

    const updateVideoRef = (el, index) => {
      if (el) {
        videoRefs.value[index] = el;
      }
    };

    const startDragging = (index, event) => {
      draggingStream.value = index;
      offset.value = {
        x: event.clientX - props.streams[index].posX,
        y: event.clientY - props.streams[index].posY,
      };
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDragging);
    };

    const onDrag = (event) => {
      if (draggingStream.value !== null) {
        emit('update-stream', { index: draggingStream.value, key: 'posX', value: event.clientX - offset.value.x });
        emit('update-stream', { index: draggingStream.value, key: 'posY', value: event.clientY - offset.value.y });
      }
    };

    const stopDragging = () => {
      draggingStream.value = null;
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDragging);
    };

    const startResizing = (index) => {
      // Implement your resizing logic here
      console.log(`Start resizing stream ${index}`);
    };

    const toggleMute = (index) => {
      emit('update-stream', { index, key: 'isMuted', value: !props.streams[index].isMuted });
    };

    const startCall = async () => {
      localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      await nextTick();
      if (videoRefs.value[0]) {
        videoRefs.value[0].srcObject = localStream.value;
      }

      peer.value = new Peer(undefined, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
              urls: 'turn:your.turn.server:3478',
              username: 'your-username',
              credential: 'your-credential'
            }
          ]
        }
      });

      peer.value.on('open', id => {
        ownId.value = id;
        socketClient.joinRoom('your-room-id');
        socketClient.sendPeerInfo({ id });
      });

      peer.value.on('call', call => {
        call.answer(localStream.value);
        call.on('stream', remoteStream => {
          addVideoStream(call.peer, remoteStream);
        });
      });

      socketClient.on('user-connected', userId => {
        if (userId !== ownId.value) {
          callUser(userId);
        }
      });

      socketClient.on('user-disconnected', userId => {
        if (peers.value[userId]) {
          peers.value[userId].close();
        }
      });
    };

    const callUser = (userId) => {
      const call = peer.value.call(userId, localStream.value);
      handleStream(call);
    };

    const handleStream = (call) => {
      call.on('stream', remoteStream => {
        addVideoStream(call.peer, remoteStream);
      });
      call.on('close', () => {
        emit('remove-stream', call.peer);
      });
      peers.value[call.peer] = call;
    };

    const addVideoStream = (id, stream) => {
      emit('add-stream', { id, stream });
    };

    const closeStream = (index) => {
      if (props.streams[index].mediaStream) {
        props.streams[index].mediaStream.getTracks().forEach(track => track.stop());
      }
      emit('close-stream', index);
      emit('toggle-video-stream');
    };

    onUnmounted(() => {
      if (peer.value) {
        peer.value.destroy();
      }
      if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
      }
      connections.value.forEach(conn => conn.close());
    });

    return {
      videoRefs,
      updateVideoRef,
      startDragging,
      startResizing,
      toggleMute,
      closeStream,
      startCall, // Expose startCall method
    };
  },
};
</script>

<style scoped>
.video-circle {
  position: absolute;
  cursor: grab;
  border-radius: 50%;
  overflow: hidden;
}

.video-circle.dragging {
  cursor: grabbing;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
}

.control-button {
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #fff;
  cursor: se-resize;
}
</style>