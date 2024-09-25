<template>
    <button type="button"
        :class="{ delay: data.delayMode }"
        :disabled="props.disabled || data.delayMode"
    >
        <span v-if="data.delayMode && data.delayPercent"
            class="delay-progress"
            :style="{ width: data.delayPercent + '%' }"
        ></span>
        <span v-if="props.name">
            {{ props.name }}
        </span>

        <slot name="delay" v-if="data.delayMode"></slot>
        <slot v-else></slot>

        <span v-if="data.delayMode && data.delayTitle" class="delay-title">
            {{ data.delayTitle }}
        </span>

        <Icon icon="loader-3" v-if="props.loading" />
    </button>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue';
import moment from 'moment';

const props = defineProps({
    name: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    delay: { type: [Number, null], default: null },
    delayFrom: { type: [String, null], default: null }
});

const data = reactive({
    delayMode: false,
    delayTitle: null,
    delayPercent: 0
});

const runDelay = () => {
    clearTimeout(data.delayInterval);

    if (!props.delay || !props.delayFrom) {
        data.delayMode = false;
        return;
    }

    const from = moment(props.delayFrom);
    const to = moment(props.delayFrom).add(props.delay, 'minutes');

    const checkIt = () => {
        const current = moment();


        if (to.diff(current) <= 0) {
            clearInterval(data.delayInterval);
            data.delayMode = false;
            return;
        }

        data.delayPercent = parseInt(100 * current.diff(from, 'minutes') / (props.delay || 1));
        data.delayTitle = to.from(current);
    }

    data.delayInterval = setInterval(() => {
        checkIt();
    }, 30 * 1000);

    data.delayMode = true;
    checkIt();
}

watch(
    () => props.delay,
    () => {
        runDelay();
    }
);

watch(
    () => props.delayFrom,
    () => {
        runDelay();
    }
);

onMounted(() => {
    runDelay();
});
</script>

<style lang="scss" scoped>
button {
    cursor: pointer;
    border: none;
    outline: none;
    gap: 4px;
    height: 50px;
    display: flex;
    font-variant: unset;
    transition: all 0.4s;
    align-items: center;
    justify-content: center;
    background: $white;
    padding: 0 20px;
    border-radius: 4px;

    @include font-btn;
    color: $black;
    transition: all 0.2s;

    .delay-title {
        @include font-b;
        letter-spacing: 0;
        margin-left: auto;
    }

    &:hover {
        opacity: .8;
    }

    &[disabled] {
        cursor: default;
        filter: grayscale(1);
        opacity: .9;
        span {
            opacity: .5;
        }
    }

    &.light {
        padding: 0 10px;
        height: 32px;
        min-width: 54px;
        border-radius: 15px;
        @include font-label;
        flex-shrink: 0;

        &.claim {
            @include font-secondary-label;
        }
    }

    &.secondary {
        background-color: $black-2;
        color: $white;
    }

    &.claim {
        background-color: $turquoise;
        color: $black;
        @include font-secondray-btn;
    }

    &.vultisig {
        background-color: transparent;
        color: $white;
        position: relative;
        background: linear-gradient(to right, $persian-blue, $turquoise) border-box;

        &:before {
            content: "";
            position: absolute;
            left: 1px;
            top: 1px;
            right: 1px;
            background: $black;
            bottom: 1px;
            border-radius: 20px;
        }
        span {
            z-index: 1;
            @include gradient-color;
        }
    }

    &.icon {
        width: 50px;
        height: 50px;
        background: transparent;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        fill: $white;
        svg {
            width: 24px;
            height: 24px;
        }
    }

    &.delay {
        background-color: $black-2;
        color: $white;
        position: relative;

        span {
            @include font-b;
            letter-spacing: 0;
        }

        .delay-progress {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background-color: $black;
        }
        &[disabled] {
            filter: none;
        }
    }

    &.loader {
        background-color: $black-2;
        position: relative;
        overflow: hidden;
        svg {
            fill: $turquoise;
            height: 360px;
            width: 34px;
            animation: svg-loader infinite 3s;
            transform: translateY(-50%)
        }

        @keyframes svg-loader {
            0% {
                transform: translateY(-50%)
            }
            100% {
                transform: translateY(55%)
            }
        }
    }
}
</style>