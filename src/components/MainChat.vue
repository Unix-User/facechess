<template>
    <b-container>
        <b-card>
            <template #header>
                <b-input-group prepend="@">
                    <b-form-input v-model="name" placeholder="Username"></b-form-input>
                </b-input-group>
            </template>
            <b-card-body>
                <b-row align-v="stretch">
                    <b-container v-for="message in messages" :key="message.id" class="message">
                        <b-card>
                            {{ message }}
                        </b-card>
                    </b-container>
                </b-row>
            </b-card-body>
            <template #footer>
                <b-row align-v="end">
                    <b-input-group>
                        <b-form-input type="text" v-model="text" @keyup.enter="sendMessage" ref="input"></b-form-input>
                        <b-input-group-append>
                            <b-button variant="outline-secondary" @click="sendMessage">Enviar</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-row>
            </template>
        </b-card>

    </b-container>
</template>

<script>
import { BContainer, BFormInput, BInputGroupAppend, BInputGroup, BRow, BButton, BCard, BCardBody } from 'bootstrap-vue';

export default {
    name: 'MainChat',
    props: {
        emitter: {
            type: Object,
            required: true,
        },
    },
    components: {
        BContainer,
        BFormInput,
        BInputGroupAppend,
        BInputGroup,
        BRow,
        BButton,
        BCard, BCardBody
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