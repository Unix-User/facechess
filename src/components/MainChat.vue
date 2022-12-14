<template>
    <div id="MainChat">
        <div id="chat">
            <div id="chat-messages">
                <div v-for="message in messages" :key="message.id" class="message">
                    <div class="message-content">
                        <div class="message-text">{{ message.text }}</div>
                        <div class="message-time">{{ message.time }}</div>
                    </div>
                </div>
            </div>
            <div id="chat-input">
                <textarea v-model="text" placeholder="Chat aqui, mande uma mensagem" left="100"></textarea>
            </div>
        </div>
    </div>
</template>


<style>
#Chat {
    position: relative;
    bottom: 0px;
    left: 0px;
    width: 200px;
    height: 125px;
    background-color: #ffffff;
    color: rgb(133, 86, 86);
    border: 1px solid rgb(104, 67, 67);
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
}
</style>


<script>
export default {
    name: 'MainChat',
    data() {
        return {
            text: '',
            messages: []
        }
    },
    methods: {
        // Send message do serve
        // send message with socketio
        // receive message with socketio
        receiveMessage(message) {
            this.messages.push(message)
        },

        sendMessage() {
            if (this.text.length > 0) {
                this.$socket.emit('chat-message', this.text)
                this.text = ''
            }
        },


    },
    mounted() {
        this.$socket.on('chat-message', this.receiveMessage)
    },
}

</script>