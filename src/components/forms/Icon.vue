<template>
    <svg
        :width="props.size ? props.size[0] : null"
        :height="props.size ? props.size[1] : null"
        :fill="props.color ? props.color : null"
    >
        <title v-if="props.title">{{ props.title }}</title>
        <use :href="url"></use>
    </svg>
</template>



<script setup>
import { computed } from 'vue';

const props = defineProps({
    icon: { type: String, default: '' },
    size: { type: [Array, null], default: () => ['1em', '1em'] },
    color: { type: [String, null], default: null },
    title: { type: String, default: '' }
});

const url = computed(() => `/img/svg-sprite.svg#${props.icon}`);
</script>
