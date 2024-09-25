<template>
    <BaseModal
        name="user"
        @close="close"
    >
        <template v-slot:title>
            {{ data.username }}
        </template>
        <template v-slot:content>
            <div class="buttons">
                <Button @click="kickHim">
                    <span>{{ t('modals.user.kick') }}</span>
                    <span class="cost">{{ settings.KICK_COST || 30 }}</span>
                    <Icon icon="blood" class="blood" />
                </Button>
                <Button :name="t('common.close')" class="secondary" @click="close"/>
            </div>
        </template>
    </BaseModal>
</template>

<script setup>
    import { reactive, onMounted } from 'vue';
    import Button from '@/components/forms/Button.vue';
    import BaseModal from '@/components/modals/BaseModal.vue';
    import { useI18n } from 'vue-i18n';
    import { mapActions, mapMutations, mapState, mapGetters } from '@/map-state';
    import { message } from '@/utils/utils';

    const { t, tm, rt } = useI18n();
    const { kick } = mapActions();
    const { closeModal } = mapMutations();
    const { getModalData } = mapGetters();
    const { user, settings } = mapState();
    const jokes = tm('modals.user.jokes').map(item => rt(item));

    const data = reactive({
        uuid: null,
        username: ''
    });

    const close = () => {
        closeModal('user');
    }

    const kickHim = async () => {
        close();

        await kick(data.uuid);

        const joke = jokes[Math.min(parseInt(Math.random() * jokes.length), jokes.length - 1)];

        message.loki(`${ data.username } ${ t('modals.user.kickied') } <br> ${ joke }`);
        if (window.navigator?.vibrate) {
            window.navigator.vibrate(20);
        }
    }

    onMounted(() => {
        const payload = getModalData.value('user');

        if (payload?.uuid) {
            data.username = payload.username;
            data.uuid = payload.uuid;
        }
    });
</script>

<style lang="scss" scoped>
    .buttons {
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        gap: 20px;

        button {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;

            .blood {
                width: 18px;
                height: 18px;
                fill: $off-red;
            }

            .cost {
                @include font-secondray-btn;
                margin-left: auto;
            }
        }
    }
</style>
