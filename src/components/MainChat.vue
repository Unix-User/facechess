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
body {
    margin: 0;
    padding-bottom: 3rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#form {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 3rem;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
}

#input {
    border: none;
    padding: 0 1rem;
    flex-grow: 1;
    border-radius: 2rem;
    margin: 0.25rem;
}

#input:focus {
    outline: none;
}

#form>button {
    background: #333;
    border: none;
    padding: 0 1rem;
    margin: 0.25rem;
    border-radius: 3px;
    outline: none;
    color: #fff;
}

#messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

#messages>li {
    padding: 0.5rem 1rem;
}

#messages>li:nth-child(odd) {
    background: #efefef;
}
</style>




  