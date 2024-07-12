import { stateManager } from './stateManager';

export const videoService = {
  async startSharing(userId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stateManager.updateState('videoStreams', {
      ...stateManager.state.videoStreams,
      [userId]: { stream, isSharing: true }
    });
    return stream;
  },

  stopSharing(userId) {
    const videoStream = stateManager.state.videoStreams[userId];
    if (videoStream && videoStream.stream) {
      videoStream.stream.getTracks().forEach(track => track.stop());
    }
    stateManager.updateState('videoStreams', {
      ...stateManager.state.videoStreams,
      [userId]: { stream: null, isSharing: false }
    });
  }
};