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
                <textarea v-model="text" placeholder="Chat aqui, mande uma mensagem" left="100"
                    @keyup.enter="sendMessage"></textarea>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MainChat',
    props: {
        messages: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            text: ''
        }
    },
    methods: {
        sendMessage() {
            this.$refs.myBoard.sendMessage(this.text);
            this.text = '';
        }

    }

}
</script>

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

