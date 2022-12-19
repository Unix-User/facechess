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
  
<style>
 #MainChat {
         background-color: rgb(0, 0, 0);
         width: 100%;
         height: auto;
         border-radius: 2px;
}
input {
    width: 100%;
    height: auto;
    max-width: 200px;
    min-width: 200px;
    max-height: 35px;
    min-height: 35px;
    border-radius: 7.2px;
    border-style: solid;
    border-width: 2px;
    border-color: rgb(58, 50, 47);
}
</style>

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




  