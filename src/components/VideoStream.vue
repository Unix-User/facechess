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
        @mousedown="startResizing(index, $event)"
        @touchstart="startResizing(index, $event)"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

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
    const observer = ref(null);

    const updateVideoRef = (el, index) => {
      if (el) {
        videoRefs.value[index] = el;
      }
    };

    const debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    const startDragging = (index, event) => {
      const stream = props.streams[index];
      stream.isDragging = true;
      stream.dragStartX =
        (event.clientX || event.touches[0].clientX) - stream.posX;
      stream.dragStartY =
        (event.clientY || event.touches[0].clientY) - stream.posY;
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag);
      document.addEventListener("mouseup", stopDragging);
      document.addEventListener("touchend", stopDragging);
    };

    const drag = debounce((event) => {
      const stream = props.streams.find((s) => s.isDragging);
      if (stream) {
        requestAnimationFrame(() => {
          stream.posX =
            (event.clientX || event.touches[0].clientX) - stream.dragStartX;
          stream.posY =
            (event.clientY || event.touches[0].clientY) - stream.dragStartY;
          checkOverlap(stream);
        });
      }
    }, 16);

    const stopDragging = () => {
      props.streams.forEach((stream) => (stream.isDragging = false));
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDragging);
      document.removeEventListener("touchend", stopDragging);
    };

    const checkOverlap = (currentStream) => {
      props.streams.forEach((stream) => {
        if (stream !== currentStream) {
          const dx = currentStream.posX - stream.posX;
          const dy = currentStream.posY - stream.posY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < currentStream.size) {
            const angle = Math.atan2(dy, dx);
            stream.posX =
              currentStream.posX - Math.cos(angle) * currentStream.size;
            stream.posY =
              currentStream.posY - Math.sin(angle) * currentStream.size;
          }
        }
      });
    };

    const toggleMute = (index) => {
      emit("update-stream", {
        index,
        key: "isMuted",
        value: !props.streams[index].isMuted,
      });
    };

    const closeStream = (index) => {
      emit("close-stream", index);
    };

    const startResizing = (index, event) => {
      const stream = props.streams[index];
      stream.isResizing = true;
      stream.resizeStartX = event.clientX || event.touches[0].clientX;
      stream.resizeStartY = event.clientY || event.touches[0].clientY;
      stream.resizeStartSize = stream.size;
      document.addEventListener("mousemove", resize);
      document.addEventListener("touchmove", resize);
      document.addEventListener("mouseup", stopResizing);
      document.addEventListener("touchend", stopResizing);
    };

    const resize = debounce((event) => {
      const stream = props.streams.find((s) => s.isResizing);
      if (stream) {
        requestAnimationFrame(() => {
          const dx =
            (event.clientX || event.touches[0].clientX) - stream.resizeStartX;
          const dy =
            (event.clientY || event.touches[0].clientY) - stream.resizeStartY;
          const newSize = stream.resizeStartSize + Math.max(dx, dy);
          stream.size = Math.max(50, Math.min(300, newSize)); // Limit size between 50 and 300 pixels
        });
      }
    }, 16);

    const stopResizing = () => {
      props.streams.forEach((stream) => (stream.isResizing = false));
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("touchmove", resize);
      document.removeEventListener("mouseup", stopResizing);
      document.removeEventListener("touchend", stopResizing);
    };

    onMounted(() => {
      observer.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = videoRefs.value.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1 && !props.streams[index].mediaStream) {
              navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                  emit("update-stream", {
                    index,
                    key: "mediaStream",
                    value: stream,
                  });
                })
                .catch((error) =>
                  console.error("Error accessing media devices:", error)
                );
            }
          } else {
            const index = videoRefs.value.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1 && props.streams[index].mediaStream) {
              props.streams[index].mediaStream
                .getTracks()
                .forEach((track) => (track.enabled = false));
            }
          }
        });
      });

      // Use nextTick to ensure the DOM has been updated
      nextTick(() => {
        videoRefs.value.forEach((ref) => {
          if (ref && ref instanceof Element) {
            observer.value.observe(ref);
          }
        });
      });
    });

    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect();
      }
      if (props.streams) {
        props.streams.forEach((stream) => {
          if (stream.mediaStream) {
            stream.mediaStream.getTracks().forEach((track) => track.stop());
          }
        });
      }
    });

    return {
      videoRefs,
      updateVideoRef,
      startDragging,
      toggleMute,
      closeStream,
      startResizing,
    };
  },
};
</script>

<style scoped>
.video-circle {
  position: absolute;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}
.video-circle.dragging {
  opacity: 0.8;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 5px;
}
.control-button {
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0 5px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0 0 50% 0;
}
</style>
