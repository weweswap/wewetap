<template>
    <div class="page-container">
        <Icon icon="loki" />
        <EmptyLabel :title="t('pages.error.title')" :description="data.description" />
    </div>
</template>

<script setup>
    import { reactive } from 'vue';
    import { useI18n } from 'vue-i18n';
    import EmptyLabel from '@/components/forms/EmptyLabel.vue';

    const { t, tm, rt } = useI18n();

    const description = tm('pages.error.descriptions').map(item => rt(item));

    const data = reactive({
        description: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });

</script>

<style lang="scss" scoped>
    .page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;

        svg {
            fill: $turquoise;
            width: 30px;
            height: 30px;
        }
        & > div {
            margin: 0;
        } 
    }
</style>