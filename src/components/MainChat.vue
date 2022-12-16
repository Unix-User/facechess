<template>
    <div id="MainChat">
        <div id="chat">
            <div id="chat-messages">
                <div v-for="message in messages" :key="message.id" class="message">
                    <div class="message-content">
                        <div class="message-text">{{ message }}</div>
                    </div>
                </div>
            </div>
            <div id="chat-input">
                <input type="text" v-model="text" @keyup.enter="sendMessage" ref="input" />
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'MainChat',
    props: {
        emitter: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            text: '',
        }
    },
    computed: {
        messages() {
            return this.$parent.messages;
        }
    },
    methods: {
        sendMessage() {
            this.emitter.emit('send-message', this.text);
            this.text = '';
            this.$refs.input.scrollIntoView({ behavior: 'smooth' });
        }
    },
    mounted() {
        this.$refs.input.scrollIntoView({ behavior: 'smooth' });
    }
}
</script>

<style>
</style>




  