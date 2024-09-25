<template>
    <div v-if="props.value !== null">
        <svg width="2479" height="1080" viewBox="0 0 2479 1080" fill="none" xmlns="http://www.w3.org/2000/svg" class="bg">
            <path d="M1093.83 975.09L1015.43 1247.58" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M1498.1 988L1591.42 1120.27" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M1470.9 89.9301L1772.72 -152.65" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M1258.34 89.9301L1248.96 -152.65" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M937.03 38.3201L660.97 -186.19" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M1772.72 975.09L2047.07 1125.82" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M1853.53 102.84L2031.59 28" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M799 975.09L745.2 1039.61" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M474.3 543.78L230.94 561.12" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M520.03 89.9301L308.02 -64.8999" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M2047.07 430.51L2823.54 236.03" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M-161 1111.34L261.34 806.71" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M-137.34 65.4199L414.03 406.06" stroke-width="25" stroke-miterlimit="10"/>
            <path d="M2008.14 655.35L2146.67 709.78" stroke-width="25" stroke-miterlimit="10"/>
        </svg>

        <span>
            <Icon icon="blood" class="blood" />
            <template v-for="(item, id) in items" :key="id">
                <Icon v-if="!!item" :icon="`l-${item}`" />
                <span v-else> </span>
            </template>
        </span>

        <svg :width="items.length * 20 + 30" viewBox="0 0 1388 88" class="bottom" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.810059 0.140137V72.2501L1387.87 87.7401L1375.25 25.8001L0.810059 0.140137Z"/>
        </svg>
    </div>
</template>

<script setup>
    import { delay, numberWithSpaces } from '@/utils/utils';
    import { watch, reactive, computed } from 'vue';

    const props = defineProps({
        value: { type: [Number, null], default: null },
    });

    const data = reactive({
        value: props.value,
    });

    const items = computed(() => {
        return numberWithSpaces(parseInt(data.value)).replace(/,/g, ' ').split('');
    });

    watch(
        () => props.value,
        async () => {
            let steps = 14;
            const letters = ((data.value).toString().split('.')[1] || '').length;
            const diff = +((props.value - data.value) / steps).toFixed(letters);

            const doIt = async () => {
                if (!steps) {
                    data.value = props.value;
                    return;
                }

                data.value += diff;
                steps -=1;
                await delay(10);
                doIt();
            }

            doIt();
        }
    );
</script>
<style lang="scss" scoped>
    div {
        display: flex;
        width: 100%;
        height: 120px;
        max-height: 120px;
        flex-shrink: 0;
        position: relative;
        flex-direction: column;
        gap: 8px;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        span {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            flex: 1 1 100%;
            width: 100%;
            height: 100%;
            max-height: 50px;
            svg {
                height: 50px;
                width: 18px;
                fill: $white;

                &.blood {
                    width: 32px;
                    fill: $off-red;
                    margin-right: 8px;
                }
            }
        }

        .bottom {
            fill: $turquoise;
            margin: 0 auto;
        }

        .bg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateY(-50%) translateX(-50%);
            width: 120%;
            height: 120%;
            stroke: $white;
            path {
                animation-name: big-number-bg;
                animation-duration: 8s;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
                transform-origin: center;
                &:nth-child(1) { animation-delay: 50ms; }
                &:nth-child(2) { animation-delay: 150ms; }
                &:nth-child(3) { animation-delay: 100ms; }
                &:nth-child(4) { animation-delay: 250ms; }
                &:nth-child(5) { animation-delay: 30ms; }
                &:nth-child(6) { animation-delay: 50ms; }
                &:nth-child(7) { animation-delay: 80ms; }
                &:nth-child(8) { animation-delay: 180ms; }
            }

            @keyframes big-number-bg {
                0% {
                    transform: scale(.8)
                }
                50% { 
                    transform: scale(1.2)
                }
                100% { 
                    transform: scale(.8)
                }
            }
        }
    }
</style>