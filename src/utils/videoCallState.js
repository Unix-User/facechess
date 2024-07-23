import { reactive } from 'vue';

export const videoCallState = reactive({
  isCallActive: false,
  participants: [],
  toggleCall(isActive) {
    this.isCallActive = isActive;
  },
  addParticipant(participant) {
    this.participants.push(participant);
  },
  removeParticipant(participantId) {
    const index = this.participants.findIndex(p => p.id === participantId);
    if (index !== -1) {
      this.participants.splice(index, 1);
    }
  },
  clearParticipants() {
    this.participants = [];
  }
});
