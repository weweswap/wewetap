<template>
    <div class="messages" v-if="messages.length">
        <div>
            <div
                v-for="message in messages"
                :key="message.id"
                class="message"
                :class="[message.type, message.config?.class ? message.config?.class : '', classes[message.type]]"
                :style="message.config?.style ? message.config.style : {}"
            >
                <Icon :icon="message.config?.icon ? message.config.icon : icons[message.type]" />
                <span class="devider"></span>
                <span v-html="message.text"></span>
            </div>
        </div>
    </div>
</template>



<script setup>
import { mapState } from '@/map-state';

const { messages } = mapState();

const classes = {
    loki: 'loki',
    pass: 'pass',
    blood: 'blood'
};

const icons = {
    loki: 'loki',
    pass: 'game-pass',
    blood: 'blood'
};
</script>

<style lang="scss" scoped>
.messages {
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 9999;
    pointer-events: none;

    & > div {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        padding-top: 8px;

        .message {
            position: relative;
            width: auto;
            box-shadow: 0px 0px 6px -3px $persian-blue;
            animation: move-down ease-out .1s;
            @include message;
        }

        @keyframes move-down {
            0% {
                transform: translateY(-100%);
            }
            100% {
                transform: translateY(0);
            }
        }
    }
}
</style>

