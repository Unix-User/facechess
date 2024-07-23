<template>
  <div>
    <div
      v-for="(stream, index) in streams"
      :key="index"
      :class="['video-circle', { dragging: stream.isDragging }]"
      :style="getStreamStyle(stream)"
      @mousedown="startDragging(index, $event)"
      @touchstart="startDragging(index, $event)"
    >
      <video
        :ref="(el) => updateVideoRef(el, index)"
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
          <b-icon :icon="getMuteIcon(stream.isAudioMuted)"></b-icon>
        </b-button>
        <b-button
          variant="light"
          @click="toggleVideo(index)"
          class="control-button"
        >
          <b-icon :icon="getVideoIcon(stream.isVideoOff)"></b-icon>
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
import { ref, onUnmounted, onMounted } from "vue";
import videoService from "@/services/videoService";
import notificationService from "@/services/notificationService";

export default {
  name: "VideoStream",
  props: {
    streams: {
      type: Array,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const videoRefs = ref([]);
    const draggingStream = ref(null);
    const offset = ref({ x: 0, y: 0 });
    const peer = ref(null);
    const localStream = ref(null);
    const connections = ref([]);

    const updateVideoRef = (el, index) => {
      if (el) videoRefs.value[index] = el;
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
      if (draggingStream.value === null) return;
      updateStreamPosition(event.clientX, event.clientY);
    };

    const updateStreamPosition = (clientX, clientY) => {
      emit("update-stream", {
        index: draggingStream.value,
        key: "posX",
        value: clientX - offset.value.x,
      });
      emit("update-stream", {
        index: draggingStream.value,
        key: "posY",
        value: clientY - offset.value.y,
      });
    };

    const stopDragging = () => {
      draggingStream.value = null;
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDragging);
    };

    const startResizing = (index) => {
      console.log(`Start resizing stream ${index}`);
    };

    const toggleMute = (index) => {
      const stream = props.streams[index];
      const newMuteState = !stream.isMuted;
      stream.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
      emit("update-stream", { index, key: "isMuted", value: newMuteState });
    };

    const setVideoQuality = (index, quality) => {
      const stream = props.streams[index];
      stream.mediaStream.getVideoTracks().forEach((track) => {
        track.applyConstraints({ width: quality });
      });
      emit("update-stream", { index, key: "quality", value: quality });
    };

    const startScreenShare = async (index) => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = props.streams[index].peerConnection
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        await sender.replaceTrack(videoTrack);
        videoTrack.onended = () => {
          const originalTrack = props.streams[index].mediaStream.getVideoTracks()[0];
          sender.replaceTrack(originalTrack);
        };
      } catch (error) {
        console.error("Error starting screen share:", error);
      }
    };

    const closeStream = (index) => {
      videoService.closeStream(index, props.streams, emit);
    };

    const handleIncomingCall = (callerId) => {
      if (notificationService?.notifyIncomingCall) {
        notificationService.notifyIncomingCall(callerId);
      }
      if (confirm(`Recebendo chamada de ${callerId}. Deseja atender?`)) {
        startCall(callerId);
      }
    };

    const startCall = async (callerId) => {
      try {
        const result = await videoService.startCall(props.roomId, callerId);
        if (!result) return;
        const { peer: newPeer, localStream: newLocalStream } = result;
        peer.value = newPeer;
        localStream.value = newLocalStream;
        addVideoStream(newPeer.id, newLocalStream);
        newPeer.on("call", handleIncomingPeerCall);
        newPeer.on("error", handleConnectionError);
      } catch (error) {
        console.error("Error starting call:", error);
        emit("connection-error", error.message);
      }
    };

    const handleIncomingPeerCall = (call) => {
      call.answer(localStream.value);
      handleStream(call);
    };

    const handleStream = (call) => {
      call.on("stream", (remoteStream) => addVideoStream(call.peer, remoteStream));
      call.on("close", () => removeVideoStream(call.peer));
    };

    const addVideoStream = (id, stream) => {
      const newStream = {
        id,
        mediaStream: stream,
        posX: 0,
        posY: 0,
        size: 150,
        isMuted: false,
        isDragging: false,
        isVideoOff: false,
        peerConnection: null,
      };
      emit("add-stream", newStream);
    };

    const removeVideoStream = (id) => {
      emit("remove-stream", id);
    };

    const handleConnectionError = (error) => {
      const errorMessage = error.type === "max-reconnect-attempts"
        ? "Unable to connect after multiple attempts. Please try again later."
        : `Connection error: ${error.type}`;
      emit("connection-error", errorMessage);
    };

    onMounted(() => {
      videoService.onIncomingCall(({ callerId }) => handleIncomingCall(callerId));
      videoService.onCallEnded(() => videoService.closeAllStreams(props.streams));
    });

    onUnmounted(() => {
      if (peer.value) peer.value.destroy();
      if (localStream.value) localStream.value.getTracks().forEach((track) => track.stop());
      connections.value.forEach((conn) => conn.close());
    });

    const getStreamStyle = (stream) => ({
      left: `${stream.posX}px`,
      top: `${stream.posY}px`,
      width: `${stream.size}px`,
      height: `${stream.size}px`,
    });

    const getMuteIcon = (isAudioMuted) => 
      isAudioMuted ? 'mic-mute-fill' : 'mic-fill';

    const getVideoIcon = (isVideoOff) => 
      isVideoOff ? 'camera-video-off-fill' : 'camera-video-fill';

    return {
      videoRefs,
      updateVideoRef,
      startDragging,
      startResizing,
      toggleMute,
      closeStream,
      startCall,
      setVideoQuality,
      startScreenShare,
      handleConnectionError,
      getStreamStyle,
      getMuteIcon,
      getVideoIcon,
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