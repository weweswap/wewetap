<template>
    <div class="modal-container" @click="closeOutside">
        <div class="modal" @click.stop="">
            <div class="header" v-if="slots.title">
                <h3>
                    <slot name="title"></slot>
                </h3>

                <Button
                    v-if="props.canCancel"
                    class="icon"
                    @click="close"
                >
                    <Icon icon="close" :size="[24, 24]" />
                </Button>
            </div>

            <div class="content" v-if="!props.isLoading">
                <slot name="content"></slot>
            </div>

            <div class="loader" v-if="props.isLoading">
                <Loader />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, useSlots } from 'vue';
import Button from '@/components/forms/Button.vue';
import Loader from '@/components/forms/Loader.vue';
import { mapMutations } from '@/map-state';

const { closeModal } = mapMutations();
const emit = defineEmits(['close']);
const slots = useSlots();

const props = defineProps({
    canCancel: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    closeOutside: {
        type: Boolean,
        default: true
    }
});

const close = () => {
    emit('close');
    closeModal(props.name);
};

const closeOutside = () => {
    if (props.closeOutside) {
        emit('close');
        closeModal(props.name);
    }
};
</script>

<style lang="scss" scoped>
.modal-container {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgb(34 34 34 / 72%);
    display: flex;
    align-items: end;
    justify-content: center;
    box-sizing: border-box;
    z-index: 999;
    padding: 0;
    animation: modal-bg ease-out .2s;

    .modal {
        width: 100%;
        background-color: $black;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
        padding: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        position: relative;
        animation: modal-up ease-out .1s;

        &:before {
            position: absolute;
            content: '';
            background-image: url(/img/bg.svg);
            background-size: 52%;
            background-position: center;
            animation: modal-bg-2 infinite 10s;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            opacity: .3;
            filter: blur(4px);
        }

        .loader {
            background-color: $black;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            // border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            & > div {
                margin: auto;
            }
        }

        .header {
            border-top-right-radius: 20px;
            border-top-left-radius: 20px;
            min-height: 64px;
            display: flex;
            align-items: center;
            position: relative;
            width: 100%;
            border-bottom: solid 1px $black-2;
            z-index: 1;

            h3 {
                margin: 0 auto;
                padding: 0;
                @include font-h3;
                color: $white;
                text-align: center;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            button {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
            }
        }

        .content {
            padding: 0 36px;
            overflow: auto;
            flex: 1 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
            z-index: 1;
            @include scrollbar();
        }
    }

    &.full-size {
        .modal {
            height: 100%;
            border-radius: 0;
            animation: none;
        }

        &.light {
            .modal {
                .content {
                    padding: 0;
                }

                &:before {
                    content: none;
                }
            }
        }
    }
}

@keyframes modal-bg {
    0% {
        background: rgb(34 34 34 / 1%);
    }
    100% {
        background: rgb(34 34 34 / 72%);
    }
}

@keyframes modal-up {
    0% {
        transform: translateY(100%);
    }
    100% {
        transform: translateY(0);
    }
}

@keyframes modal-bg-2 {
    0% {
        background-position-x: 0%;
        background-position-y: 0%;
        background-size: 82%;
    }
    50% { 
        background-position-x: 50%;
        background-size: 152%;
    }
    100% { 
        background-position-x: 100%;
        background-position-y: 100%;
        background-size: 82%;
    }
}
</style>
