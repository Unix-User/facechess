<template>
    <b-container class="bv-example-row bv-example-row-flex-cols">
        <b-row align-v="stretch">
            <div v-for="message in messages" :key="message.id" class="message">
                {{ message }}
            </div>
        </b-row>
        <b-row align-v="end">
            <b-input-group>
                <b-form-input type="text" v-model="name"></b-form-input>
                <b-form-input type="text" v-model="text" @keyup.enter="sendMessage" ref="input"></b-form-input>
                <b-input-group-append>
                    <b-button variant="outline-secondary">Enviar</b-button>
                </b-input-group-append>
            </b-input-group>
        </b-row>
    </b-container>
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