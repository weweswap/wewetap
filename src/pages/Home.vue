<template>
    <div class="page-container" v-if="user.profile.id">
        <Avatar :name="user.profile.first_name" class="big"/>
        <h1>{{ user.profile.username }}</h1>
        <BigCounter :value="user.profile.coins" class="coins" />

        <div class="plane-game-box">
            <Icon icon="angle-1" class="angle-1" />

            <div>
                <span>{{ t('pages.home.planegame.title') }}</span>
                <span><Icon icon="game-pass"/>{{ user.profile.plane_game_pass_count }}</span>
            </div>
            <div>
                <Icon icon="ship" class="ship"/>
            </div>
            <div>
                <Button class="light"
                    :name="t('pages.home.planegame.play')"
                    :disabled="!user.profile.plane_game_pass_count"
                    :class="{ secondary: !user.profile.plane_game_pass_count }"
                    @click="runPlaneGame"
                />
            </div>

            <Icon icon="angle-2" class="angle-2" />
        </div>

        <div class="button-box">
            <Button v-if="!data.claimLoading"
                class="claim"
                :delay="+settings.DEFAULT_CLAIM_MINUTES_COUNT"
                :delayFrom="user.profile?.last_default_claim_datetime"
                @click="claimIt"
            >
                <template v-slot:delay>
                    {{ t('pages.home.hunting') }}
                    <Icon icon="blood" class="blood" />
                </template>
                <template v-slot>
                    <span>{{ t('common.claim') }}</span>
                    <Icon icon="blood" class="blood" />
                    <span>{{ settings.DEFAULT_CLAIM_COINS_COUNT }}</span>
                </template>
            </Button>
            <Button v-else-if="data.claimLoading" class="loader" :loading="true" />
        </div>
    </div>
</template>

<script setup>
    import Avatar from '@/components/forms/Avatar.vue';
    import BigCounter from '@/components/forms/BigCounter.vue';
    import Button from '@/components/forms/Button.vue';
    import { reactive } from 'vue';
    import { mapActions, mapState, mapMutations } from '@/map-state';
    import { message, delay } from '@/utils/utils';
    import router from '@/router';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const { pixiClaim, user, settings } = mapState();
    const { claim } = mapActions();
    const { openModal, closeModal } = mapMutations();

    const data = reactive({
        claimLoading: false,
    });

    const claimIt = async (e) => {
        data.claimLoading = true;

        const coins = user.value.profile.coins;
        const plane_game_pass_count = user.value.profile.plane_game_pass_count;

        await claim();

        await delay(500);

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        data.claimLoading = false;

        await delay(1000);
        message.blood(`${ t('common.youGet') } ${ (user.value.profile.coins - coins).toFixed(1) } ${ t('common.bloods') }`);
        await delay(400);
        message.pass(`${ t('common.youGet') } ${ user.value.profile.plane_game_pass_count - plane_game_pass_count } ${ t('common.playPass') }`);
    }

    const runPlaneGame = () => {
        router.push({ name: 'planegame' });
    }
</script>

<style lang="scss" scoped>
    .page-container {
        gap: 14px;
        padding: 60px 10px 0;
        & > .big {
            margin: 0 auto;
        }

        h1 {
            margin: 0;
            padding: 0;
            @include font-h1;
            color: $white;
            text-align: center;
        }

        .coins {
            margin: auto;
        }

        .plane-game-box {
            display: flex;
            flex-direction: row;
            height: 120px;
            flex-shrink: 0;
            gap: 0;
            // border: solid 3px $black-2;
            border-radius: 12px;
            align-items: center;
            justify-content: space-between;
            position: relative;
            padding: 0 24px;

            background: linear-gradient(-45deg, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 52%), linear-gradient(45deg, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 52%);
            background-size: 24px 24px;
            background-color: transparent;
            margin-top: auto;

            animation-name: claim-box-bg;
            animation-duration: 2s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;

            @keyframes claim-box-bg {
                0% {
                    background-position-y: 0%;
                }
                100% { 
                    background-position-y: 100%;
                }
            }

            .angle-2,
            .angle-1 {
                position: absolute;
                left: 0;
                top: 0;
                width: 24px;
                height: 24px;
            }

            .angle-2 {
                position: absolute;
                right: 0;
                bottom: 0;
                left: auto;
                top: auto;
            }

            & > div {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1 1 33%;
                width: 33%;
                max-width: 33%;

                // &:nth-child(1) {
                //     justify-content: start;
                // }

                // &:nth-child(2) {
                //     justify-content: center;
                // }

                // &:nth-child(3) {
                //     justify-content: end;
                // }
                svg.ship {
                    margin: 0 auto;
                }

                button {
                    margin-left: auto;
                }

                span {
                    display: flex;
                    flex-direction: row;
                    gap: 8px;
                    align-items: center;

                    &:first-child {
                        @include font-h3;
                        color: $white;
                    }
                    &:last-child {
                        @include font-secondary-b-bold;
                        color: $white;
                        svg {
                            width: 18px;
                            height: auto;
                            fill: $violet;
                        }
                    }
                }
            }

            .ship {
                width: 64px;
                height: 64px;

                animation-name: thorchain-ship;
                animation-duration: 2s;
                animation-timing-function: linear;
                animation-iteration-count: infinite;

                @keyframes thorchain-ship {
                    0% {
                        transform: skew(0, 17deg);
                        filter: drop-shadow(-3px 3px 2px $persian-blue);
                    }
                    50% {
                        transform: skew(0, -17deg);
                        filter: drop-shadow(3px 3px 2px $persian-blue);
                    }
                    100% { 
                        transform: skew(0, 17deg);
                        filter: drop-shadow(-3px 3px 2px $persian-blue);
                    }
                }
            }
        }

        .button-box {
            padding: 12px 0;
            background-color: $black;
            box-shadow: 0px 4px 12px 4px $black;
            flex-shrink: 0;
            position: sticky;
            bottom: 0;
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
            }
        }
    }
</style>