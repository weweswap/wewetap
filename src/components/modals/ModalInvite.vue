<template>
    <BaseModal
        name="invite"
        @close="close"
    >
        <template v-slot:title>
            {{ t('modals.invite.title') }}
        </template>
        <template v-slot:content>
            <div class="buttons">
                <Button :name="t('modals.invite.share')" @click="share"/>
                <Button :name="t('modals.invite.copy')" @click="copy"/>
                <Button :name="t('common.close')" class="secondary" @click="close"/>
            </div>
        </template>
    </BaseModal>
</template>

<script setup>
import Button from '@/components/forms/Button.vue';
import BaseModal from '@/components/modals/BaseModal.vue';
import { useI18n } from 'vue-i18n';
import { mapMutations, mapState } from '@/map-state';
import { message, copyText } from '@/utils/utils';

const { t } = useI18n();
const { closeModal } = mapMutations();
const { user } = mapState();

const close = () => {
    closeModal('invite');
}

const copy = () => {
    copyText(`https://t.me/wewetapbot/app?startapp=ref_${user.value.profile?.uuid}`);
    message.loki(t('modals.invite.copied'));
}

const share = () => {
    if (window.Telegram?.WebApp) {
        const url = `https://telegram.me/share/url?url=https://t.me/wewetapbot/app?startapp=ref_${user.value.profile?.uuid}&text=Join me on WeWeTap and let's start hunting together`;

        window.Telegram?.WebApp.openLink(url);
    }

    close();
}
</script>

<style lang="scss" scoped>
    .buttons {
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        gap: 20px;
    }
</style>
