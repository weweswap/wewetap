<template>
    <ModalPlaneGame v-if="modalIsOpened('plane-game')" />
    <ModalPlaneGameResult v-if="modalIsOpened('plane-game-result')" />
    <ModalInvite v-if="modalIsOpened('invite')" />
    <ModalUser v-if="modalIsOpened('user')" />
    <ModalLoader v-if="modalIsOpened('loader')" />
</template>



<script setup>
import { reactive } from 'vue';
import ModalLoader from '@/components/modals/ModalLoader.vue';
import ModalPlaneGame from '@/components/modals/ModalPlaneGame.vue';
import ModalPlaneGameResult from '@/components/modals/ModalPlaneGameResult.vue';
import ModalInvite from '@/components/modals/ModalInvite.vue';
import ModalUser from '@/components/modals/ModalUser.vue';
import { mapState } from '@/map-state';

const { modals } = reactive(mapState());

const modalIsOpened = (name) => !!modals.find((modal) => modal.name === name);
</script>












