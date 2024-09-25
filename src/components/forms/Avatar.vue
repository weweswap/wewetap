<template>
    <span>{{ props.name?.length ? props.name[0] : '-' }}</span>
</template>

<script setup>
const props = defineProps({
    name: { type: String, default: '' },
});
</script>

<style lang="scss" scoped>
span {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
    background-color: $black-3;
    @include font-h2;
    color: $white;
    border-radius: 50%;
    text-transform: uppercase;
    letter-spacing: -3px; // Дефект шрифта
    line-height: normal;

    &.big {
        width: 94px;
        height: 94px;
        background-color: $persian-blue;
        font-size: 52px;
    }
}
</style>
