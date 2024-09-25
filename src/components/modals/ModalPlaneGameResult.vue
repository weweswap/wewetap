<template>
    <BaseModal
        name="plane-game-result"
        @close="close"
        class="full-size light"
    >
        <template v-slot:content>
            <Loader v-if="!data.ready" class="light" />

            <div class="result-box"  v-show="data.ready">
                <div>
                    <img :src="`/img/avatars/${data.id}.png`" class="avatar" @load="onReady" />

                    <div>
                        <label class="title">{{ data.title }}</label>

                        <span class="coins">
                            <Icon icon="blood"/>
                            <Counter :value="data.coins" />
                        </span>
                    </div>
                </div>

                <div class="buttons">
                    <Button :name="t('modals.planeGameResult.share')" class="secondary" @click="share" />
                    <Button v-if="user.profile.plane_game_pass_count" @click="play">
                        <span>{{ t('modals.planeGameResult.play1') }}</span>
                        <Icon icon="game-pass" class="game-pass"/>
                        <span>{{ user.profile.plane_game_pass_count }} {{ t('modals.planeGameResult.play2') }}</span>
                    </Button>
                    <Button :name="t('common.close')" class="secondary" @click="close"/>
                </div>
            </div>
        </template>
    </BaseModal>
</template>

<script setup>
    import Button from '@/components/forms/Button.vue';
    import Counter from '@/components/forms/Counter.vue';
    import Loader from '@/components/forms/Loader.vue';
    import BaseModal from '@/components/modals/BaseModal.vue';
    import { reactive, onMounted } from 'vue';
    import { mapMutations, mapGetters, mapActions, mapState } from '@/map-state';
    import { useI18n } from 'vue-i18n';

    const { endPlaneGame } = mapActions();
    const { closeModal } = mapMutations();
    const { getModalData } = mapGetters();
    const { t, tm, rt } = useI18n();
    const { user } = mapState();

    const titles = tm('modals.planeGameResult.titles').map(item => rt(item));

    const data = reactive({
        ready: false,
        id: Math.min(1 + parseInt(Math.random() * 66), 66),
        coins: 0,
        title: titles[Math.min(parseInt(Math.random() * titles.length), titles.length - 1)]
    });

    const onReady = async () => {
        // save game result
        if (data.coins) {
            await endPlaneGame(data.coins);
        }

        // run
        setTimeout(() => {
            data.ready = true
        }, 200);
    }

    const close = () => {
        closeModal({
            name: 'plane-game-result',
            data: 'home'
        });
    }

    const play = () => {
        closeModal({
            name: 'plane-game-result',
            data: 'play'
        });
    }

    const share = () => {
        if (window.Telegram?.WebApp) {
            const url = `https://telegram.me/share/url?url=https://t.me/wewetapbot/app?startapp=ref_${ user.value.profile?.uuid }&text=Got ${ data.coins } bloods! Join me and try to top my score! `;
            window.Telegram?.WebApp.openLink(url);
        }
    }

    onMounted(() => {
        const payload = getModalData.value('plane-game-result');
        data.coins = payload?.coins || 0;
    });
</script>

<style lang="scss" scoped>
    .result-box {
        display: flex;
        flex-direction: column;
        flex: 1 1 100%;
        width: 100%;
        height: 100%;
        padding: 10px;
        align-items: center;
        justify-content: space-around;
        background: url(/img/game-bg.jpg);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        animation: bg-fade-in 1s;
        user-select: none;

        @keyframes bg-fade-in {
            0% {
                background-position-y: 189px;
            }
            100% {
                background-position-y: 0;
            }
        }

        &:before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background-color: $black;
            opacity: .8;
            animation: bg-2-fade-in 1s;
        }

        @keyframes bg-2-fade-in {
            0% {
                opacity: 1;
            }
            100% {
                opacity: .8;
            }
        }


        & > div:first-child {
            display: flex;
            flex-direction: column;
            flex: 1 1 100%;
            width: 100%;
            height: 50%;
            justify-content: space-evenly;
            align-items: center;
            z-index: 1;

            .avatar {
                margin: 0 auto;
                animation: avatar-fade-in 1s;
                width: 150px;
                height: 150px;
                border: solid 4px $turquoise;
                border-radius: 50%;

                @keyframes avatar-fade-in {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    60% {
                        transform: scale(.8);
                    }
                    70% {
                        transform: scale(1.1);
                    }
                    80% {
                        transform: scale(.9);
                    }
                    90% {
                        transform: scale(1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
            }

            div {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
            }

            .title {
                @include font-title-bold;
                color: $aureolin;
                font-size: 18px;
                line-height: 1.2;
                text-align: center;
            }

            .coins {
                @include font-h2;
                color: $white;
                display: flex;
                align-items: center;
                gap: 8px;
                height: 32px;
                font-size: 24px;
                pointer-events: none;
                user-select: none;
                svg {
                    width: 24px;
                    height: 24px;
                    fill: $off-red;
                }
            }
        }
    }
    .buttons {
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        padding: 20px 0 10px;
        gap: 20px;
        margin-top: auto;
        width: 100%;
        z-index: 1;

        .game-pass {
            fill: $violet;
        }
    }
</style>
