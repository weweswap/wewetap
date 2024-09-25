<template>
    <link rel="stylesheet" :href="`/themes/${theme}.css`" />
    <Pixi @ready="ready" />
    <div class="layout">
        <div id="page">
            <RouterView />
            <Modals />
        </div>
        <Navigation />
    </div>
    <Messages />
</template>

<script setup>
import Pixi from '@/components/forms/Pixi.vue';
import Navigation from '@/components/custom/Navigation.vue';
import Modals from '@/components/modals/Modals.vue';
import Messages from '@/components/forms/Messages.vue';
import { onMounted, reactive } from 'vue';
import { mapState, mapMutations, mapActions } from '@/map-state';
import router from '@/router';
import { initTg } from '@/utils/tg';

const { theme, user } = mapState();
const { openModal, closeModal, setReady } = mapMutations();
const { login, getSettings } = mapActions();

const data = reactive({
    loading: true
});

const ready = async () => {
    // Login
    await login();

    // Get Settings
    await getSettings();

    if (!user.value?.token) {
        if (['access-denied', 'bad-ref-code'].indexOf(router?.currentRoute?.value?.name) === -1) {
            router.push({ name: 'error' });
        }
        return;
    }

    // End we are ready
    setTimeout(() => {
        setReady(true);
        closeModal('loader');
    }, 1000);
}

onMounted(async () => {
    initTg();

    openModal('loader');
});
</script>

<style scoped lang="scss">
.layout {
    display: flex;
    background: $black;
    color: $white;
    flex: 1 1 100%;
    height: 100%;
    flex-direction: column;
    max-height: var(--tg-viewport-height);
    overflow: hidden;

    #page {
        flex: 1 1 1%;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: auto;

        .page-container {
            position: relative;
            display: flex;
            flex-direction: column;
            flex: 1 1;
            overflow: auto;
            @include scrollbar();
        }
    }
}
</style>