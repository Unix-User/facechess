<template>
    <b-container style="height: 100%;">
        <b-card no-body style="height: 100%;">
            <template #header>
                <b-input-group prepend="@">
                    <b-form-input v-model="name" placeholder="Username" :state="nameValidationState"
                        @input="resetNameValidationState"></b-form-input>
                </b-input-group>
                <template v-if="nameValidationState === 'invalid'">
                    Digite um nome de usuario para enviar mensagens!
                </template>
            </template>
            <b-card-body>
                <b-row align-v="stretch">
                    <b-container v-for="message in messages" :key="message.id" class="message">
                        <b-card>
                            <b-card-text>
                                {{ message }}
                            </b-card-text>
                        </b-card>
                        <br />
                    </b-container>
                </b-row>
            </b-card-body>
            <template #footer>
                <b-row align-v="end">
                    <b-input-group>
                        <b-form-input type="text" v-model="text" @keyup.enter="sendMessage" ref="input"></b-form-input>
                        <b-input-group-append>
                            <b-button variant="primary" @click="sendMessage">Enviar</b-button>
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
            nameValidationState: null
        }
    },
    computed: {
        messages() {
            return this.$parent.messages;
        }
    },
    methods: {
        sendMessage() {
            if (!this.name) {
                this.nameValidationState = 'invalid';
                return;
            }
            this.emitter.emit('send-message', this.name + ': ' + this.text);
            this.text = '';
        },
        resetNameValidationState() {
            this.nameValidationState = null;
        }
    },
};
</script>

<style>
html,
body {
    height: 100%;
}
</style>