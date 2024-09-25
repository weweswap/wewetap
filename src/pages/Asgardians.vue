<template>
    <Loader v-if="data.loading && !data.asgrs.length" class="light" />
    <div class="page-container" v-else-if="user.profile.id">
        <img :src="asgrsImg" :alt="t('pages.asgardians.title')" />
        <h1>{{ t('pages.asgardians.title') }}</h1>

        <div class="claim-box">
            <Icon icon="angle-1" class="angle-1" />

            <span>
                <Icon icon="blood"/>
                <Counter :value="parseInt(user.profile.asgardians_coins || 0)" />
            </span>

            <Button v-if="!data.claimLoading"
                :name="t('common.claim')"
                class="light claim"
                :class="{ secondary: !user.profile.asgardians_coins }"
                :disabled="!user.profile.asgardians_coins"
                :delay="+settings.ASGARDIANS_CLAIM_MINUTES_COUNT"
                :delayFrom="user.profile?.last_asgardians_claim_datetime"
                @click="claimIt" />

            <Button v-else="data.claimLoading" class="light loader" :loading="true" />

            <Icon icon="angle-2" class="angle-2" />
        </div>

        <label class="description">
            <span>{{ t('pages.asgardians.description1') }} <b>{{ settings.ASGARDIANS_LEVEL_1_ROYALTY }}%</b> {{ t('pages.asgardians.description2') }} <b>{{ settings.ASGARDIANS_LEVEL_2_ROYALTY }}%</b> {{ t('pages.asgardians.description3') }}</span>
            <span>
                {{ t('pages.asgardians.description4') }} <Icon icon="game-pass" class="game-pass" /> {{ t('pages.asgardians.description5') }}</span>
        </label>

        <EmptyLabel v-if="!data.asgrs.length" title="Nobody here." description="Is there anyone left in Asgard?" />

        <div v-else class="users-list">
            <span>{{ data.total }} / {{ user.profile.max_invites_count || settings.MAX_INVITES_COUNT }} {{ t('common.asgrs') }}</span>

            <ul>
                <li v-for="item in data.asgrs"
                    :key="item.username"
                    @click="openUser(item)"
                >
                    <Avatar :name="item.username || item.first_name" />
                    <div>
                        <div>
                            <span>{{ item.username || item.first_name }}</span>
                            <span>
                                <Icon icon="user-group" />
                                +{{ item.asgardians_count }}
                            </span>
                        </div>
                        <span>
                            {{ numberWithSpaces(+((+item.coins).toFixed(0))) }}
                            <Icon icon="blood"/>
                        </span>
                    </div>
                </li>
            </ul>

            <Button :name="t('common.more')" class="light secondary"
                v-if="data.total > data.asgrs.length && !data.loading"
                @click="getAsgardiansList"
            />
            <Button v-if="data.loading" class="light loader" :loading="true" />

        </div>

        <div class="invite-box">
            <Button
                :disabled="!canInvite"
                :class="{ secondary: !canInvite }"
                :name="t('pages.asgardians.invite')"
                @click="invite"/>
        </div>
    </div>
</template>

<script setup>
    import Counter from '@/components/forms/Counter.vue';
    import Avatar from '@/components/forms/Avatar.vue';
    import EmptyLabel from '@/components/forms/EmptyLabel.vue';
    import Loader from '@/components/forms/Loader.vue';
    import Button from '@/components/forms/Button.vue';
    import { onMounted, computed, reactive, watch } from 'vue';
    import { mapMutations, mapState, mapActions } from '@/map-state';
    import { useI18n } from 'vue-i18n';
    import { message, delay, numberWithSpaces } from '@/utils/utils';

    const { t } = useI18n();
    const { pixiClaim, user, settings, ready } = mapState();
    const { openModal, closeModal } = mapMutations();
    const { asgardiansClaim, getAsgardians, me } = mapActions();

    const asgrsImg = computed(() => {
        const path = `/img/asgrs.png`;
        return new URL(path, import.meta.url).href;
    });

    const canInvite = computed(() => {
        return data.total < (user.value.profile.max_invites_count || settings.value.MAX_INVITES_COUNT)
    });

    const data = reactive({
        asgrs: [],
        total: 0,
        claimLoading: false,
        loading: true
    });

    const openUser = async (data) => {
        if (user.value.profile?.coins < (settings.value.MAX_INVITES_COUNT || 30)) {
            return;
        }

        openModal({
            name: 'user',
            data
        });
    }

    const claimIt = async (e) => {
        data.claimLoading = true;

        const coins = user.value.profile.coins;

        await asgardiansClaim();

        await delay(500);

        data.claimLoading = false;

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        data.claimLoading = false;

        await delay(1000);
        message.blood(`${ t('common.youGet') } ${ (user.value.profile.coins - coins).toFixed(1) } ${ t('common.bloods') }`);
    };

    const invite = () => {
        openModal('invite');
    }

    const getAsgardiansList = async () => {
        data.loading = true;
        await delay(400);

        const payload = await getAsgardians({
            skip: data.asgrs.length,
            take: settings.value.ASGARDIANS_DEFAULT_TAKE || 30
        });

        if (payload?.total) {
            data.total = payload.total;
        }

        if (payload?.items) {
            data.asgrs = [...data.asgrs, ...payload.items];
        }

        data.loading = false;
    }

    watch(
        () => ready.value,
        async () => {
            if (ready.value) {
                await me();
                getAsgardiansList();
            }
        }
    );

    onMounted(async () => {
        if (ready.value) {
            await me();
            getAsgardiansList();
        }
    });
</script>

<style lang="scss" scoped>
    .page-container {
        gap: 24px;
        padding: 24px 10px 0;
        & > img {
            width: 240px;
            height: 36px;
            min-height: 36px;
            flex-shrink: 0;
            margin: 0 auto;
        }

        h1 {
            margin: 0;
            padding: 0;
            @include font-h1;
            color: $white;
            text-align: center;
        }

        .claim-box {
            display: flex;
            flex-direction: column;
            height: 120px;
            flex-shrink: 0;
            gap: 14px;
            // border: solid 3px $black-2;
            border-radius: 12px;
            align-items: center;
            justify-content: center;
            position: relative;

            background: linear-gradient(45deg, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 52%);
            background-size: 24px 24px;
            background-color: transparent;

            animation-name: claim-box-bg;
            animation-duration: 20s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;

            @keyframes claim-box-bg {
                0% {
                    background-position-x: 0%;
                }
                100% { 
                    background-position-x: 100%;
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

            span {
                @include font-h2;
                color: $white;
                display: flex;
                align-items: center;
                gap: 8px;
                height: 32px;
                svg {
                    width: 18px;
                    height: 18px;
                    fill: $off-red;
                }
            }
        }

        & > .description {
            @include font-b;
            color: $black-3;
            display: flex;
            flex-direction: column;
            gap: 4px;

            span {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 4px;
                justify-content: center;
                line-height: 1;

                b {
                    color: $turquoise;
                    font-weight: normal;
                }
                .game-pass {
                    fill: $violet;
                    width: 18px; 
                }
            }
        }

        .users-list {
            display: flex;
            flex-direction: column;

            & > span {
                @include font-b-bold;
                color: $white;
            }

            & > ul {
                padding: 0;
                margin: 0;
                list-style: none;
                display: flex;
                flex-direction: column;
                flex: 1 1;
                li {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: start;
                    gap: 12px;

                    & > div {
                        padding: 12px 0;
                        border-bottom: solid 1px $black-2;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        flex: 1 0 1%;
                        width: 1%;
                        gap: 8px;

                        & > span {
                            margin-left: auto;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            gap: 8px;
                            @include font-secondary-b-bold;
                            color: $white;

                            svg {
                                width: 16px;
                                height: 16px;
                                fill: $off-red;
                            }
                        }

                        div {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            span {
                                &:first-child {
                                    @include font-b-bold;
                                    color: $white;
                                    max-width: 180px;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                &:last-child {
                                    @include font-b-bold;
                                    color: $black-3;
                                    display: flex;
                                    flex-direction: row;
                                    gap: 8px;
                                    align-items: center;
                                    svg {
                                        width: 14px;
                                        height: 14px;
                                        fill: $black-3;
                                    }
                                }
                            }
                        }
                    }

                    &:last-child {
                        & > div {
                            border-bottom: none;
                        }
                    }
                }
            }

            & > button {
                margin: 0 auto;
            }
        }

        .invite-box {
            padding: 12px 0;
            background-color: $black;
            box-shadow: 0px 4px 12px 4px $black;
            flex-shrink: 0;
            position: sticky;
            bottom: 0;
            margin-top: auto;
            button {
                width: 100%;
            }
        }
    }
</style>