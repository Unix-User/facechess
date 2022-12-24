<template>
    <b-container fluid="left" class="MainChat">
        <b-input-group prepend="Nome:" class="NomeJogador">
            <b-form-input type="text" v-model="name" placeholder="Coloque seu Nick" ref="b-form-input" />
        </b-input-group>
        <b-input-group prepend="Chat:" class="ChatEscrever">
            <b-form-input type="text" placeholder="Escreva algo" v-model="text" @keyup.enter="sendMessage"
                ref="b-form-input" />
            <b-input-group-append>
                <b-button variant="info">Enviar</b-button>
            </b-input-group-append>
        </b-input-group>
    </b-container>



    <div id="MainChat">
        <div id="chat">
            <div id="chat-messages">
                <div v-for="message in messages" :key="message.id" class="message">
                    <div class="message-content">
                        <div class="message-text">{{ message }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { BFormInput } from 'bootstrap-vue';

export default {
    name: 'MainChat',
    props: {
        emitter: {
            type: Object,
            required: true,
        },
    },
    components: {
        BFormInput,
    },
    data() {
        return {
            name: '',
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
            this.emitter.emit('send-message', this.name + ': ' + this.text);
            this.text = '';
            if (this.$refs.bFormInput) {
                this.$refs.bFormInput.scrollIntoView({ behavior: 'smooth' });
            }
        },
        mounted() {
            if (this.$refs.bFormInput) {
                this.$refs.bFormInput.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },
};
</script>

<style>
#name {
    outline-color: rgb(109, 30, 30);
    font-size: 20px;
}
</style>