export default {
    methods: {
      captureVideo() {
        return navigator.mediaDevices.getUserMedia({ video: true })
          .catch(err => {
            console.error('Error accessing camera:', err);
            return null;
          });
      }
    }
  }