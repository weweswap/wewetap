<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import empty from '@/layouts/empty.vue';
import layout from '@/layouts/index.vue';

const route = useRoute();

const layoutComponent = computed(() => {
    if (route.name === undefined) {
        return;
    }

    if (!['error', 'access-denied', 'bad-ref-code'].includes(route.name)) {
        return layout;
    }

    return empty;
});
</script>

<template>
    <div>
        <component :is="layoutComponent"></component>
    </div>
</template>
