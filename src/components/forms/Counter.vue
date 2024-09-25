<template>
    <span v-if="props.value !== null">{{ numberWithSpaces(data.value) }}</span>
</template>

<script setup>
    import { delay, numberWithSpaces } from '@/utils/utils';
    import { watch, reactive } from 'vue';

    const props = defineProps({
        value: { type: [Number, null], default: null },
    });

    const data = reactive({
        value: props.value
    });

    watch(
        () => props.value,
        async () => {
            let steps = Math.min(14, Math.abs(props.value - data.value)); // 5
            const letters = ((data.value).toString().split('.')[1] || '').length; // 1
            const diff = +((props.value - data.value) / steps).toFixed(letters); // -1

            const doIt = async () => {
                if (steps <= 0) {
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
