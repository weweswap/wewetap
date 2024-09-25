<template>
    <div>
        <span v-if="props.title">{{ props.title }}</span>
        <span v-if="props.description" class="description">{{ props.description }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    title: { type: String, default: '' },
    description: { type: String, default: '' }
});
</script>

<style lang="scss" scoped>
div {
    display: flex;
    flex-direction: column;
     align-items: center;
    justify-content: center;
    margin: auto;
    gap: 8px;

    & > span {
        @include font-b-bold;
        color: $black-3;
        &.description {
            @include font-b;
            text-align: center;
            padding: 0 10px;
        }
    }
}
</style>
