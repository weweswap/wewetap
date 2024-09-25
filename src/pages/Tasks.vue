<template>
    <Loader v-if="data.loading && !data.tasks.length" class="light" />
    <div v-else class="page-container">
        <Icon icon="blood"/>
        <h1>{{ t('pages.tasks.title') }}</h1>

        <label class="description">
            <span>{{ t('pages.tasks.description') }}</span>
        </label>

        <EmptyLabel v-if="!data.tasks.length"
            :title="t('pages.tasks.empty.title')"
            :description="t('pages.tasks.empty.description')"
        />

        <div v-else class="tasks-list">
            <ul>
                <li @click="openLink({
                    external_url: 'https://t.me/vultirefbot',
                    type: 'telegram'
                })" style="display: none;"
                >
                    <Icon icon="vult" class="vult" />
                    <div>
                        <div>
                            <span v-html="t('pages.tasks.vultisig.name')"></span>
                        </div>

                        <Button
                            :name="t('common.join')"
                            class="light vultisig"
                        />
                    </div>
                </li>
                <li v-for="item in data.tasks"
                    :key="item.name"
                    @click="openTask(item)"
                >
                    <Icon :icon="item.icon || item.type" :class="item.icon || item.type" />
                    <div>
                        <div>
                            <span>{{ item.name }}</span>
                            <span>
                                +{{ numberWithSpaces(item.coins) }}
                                <Icon icon="blood" />
                            </span>
                        </div>

                        <Button v-if="data.mytasks[item.id] === 'claim_time'"
                            :name="t('common.claim')"
                            class="light claim"
                            @click.stop="claimIt($event, item)"
                        />
                        <Button v-else-if="data.mytasks[item.id] === 'loading'"
                            class="light loader"
                            :loading="true"
                        />
                        <Button v-else-if="!data.mytasks[item.id]"
                            :name="t('common.start')"
                            class="light secondary"
                            @click.stop="start(item)"
                        />
                        <Icon v-else icon="done"/>
                    </div>
                </li>
            </ul>

            <Button v-if="data.total > data.tasks.length && !data.loading"
                :name="t('common.more')"
                class="light secondary"
                @click="getTasksList"
            />
            <Button v-if="data.loading" class="light loader" :loading="true" />
        </div>
    </div>
</template>

<script setup>
    import Loader from '@/components/forms/Loader.vue';
    import EmptyLabel from '@/components/forms/EmptyLabel.vue';
    import Button from '@/components/forms/Button.vue';
    import { onMounted, reactive, watch } from 'vue';
    import { mapMutations, mapState, mapActions } from '@/map-state';
    import { message, numberWithSpaces, delay } from '@/utils/utils';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const { pixiClaim, user, settings, ready } = mapState();
    const { openModal, closeModal } = mapMutations();
    const { getMyTasks, getTasks, startTask, endTask, me } = mapActions();

    const data = reactive({
        total: 0,
        tasks: [],
        mytasks: {},
        loading: true
    });

    const openLink = ({ external_url, type }) => {
        if (window.Telegram?.WebApp) {
            if (type === 'telegram') {
                window.Telegram?.WebApp.openTelegramLink(external_url);
            } else {
                window.Telegram?.WebApp.openLink(external_url);
            }
        } else {
            window.open(external_url, '_blank');
        }
    }

    const start = async (task) => {
        openLink(task);


        data.mytasks[task.id] = 'loading';

        const result = await startTask(task.id);
        await delay(12400);

        if (result?.task_id) {
            data.mytasks[result?.task_id] = result.status;
        }
    }

    const claimIt = async (e, task) => {
        data.mytasks[task.id] = 'loading';
        const result = await endTask(task.id);
        await delay(400);

        if (!result?.task_id) {
            return;
        }

        const coins = user.value.profile.coins;
        await me();

        data.mytasks[result?.task_id] = result.status;

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        await delay(1000);
        message.blood(`${ t('common.youGet') } ${ (user.value.profile.coins - coins).toFixed(1) } ${ t('common.bloods') }`);
    }

    const openTask = (task) => {
        if (data.mytasks[task?.id] !== 'done') {
            return;
        }

        openLink(task);
    }

    const getTasksList = async () => {
        data.loading = true;
        await delay(400);

        const payload = await getTasks({
            skip: data.tasks.length,
            take: settings.value.TASKS_DEFAULT_TAKE || 30 
        });

        if (payload?.total) {
            data.total = payload.total;
        }

        if (payload?.items) {
            data.tasks = [...data.tasks, ...payload.items];
        }

        data.loading = false;
    };

    const getMyTasksList = async () => {
        data.loading = true;

        data.mytasks = await getMyTasks({
            skip: 0,
            take: settings.value.TASKS_MAX_TAKE || 100 
        });

        data.loading = false;
    };

    watch(
        () => ready.value,
        async () => {
            if (ready.value) {
                await getMyTasksList();
                await getTasksList();
            }
        }
    );

    onMounted(async () => {
        if (ready.value) {
            await getMyTasksList();
            await getTasksList();
        }
    });
</script>

<style lang="scss" scoped>
    .page-container {
        gap: 24px;
        padding: 24px 10px 0;
        & > svg {
            width: auto;
            height: 36px;
            margin: 0 auto;
            fill: $off-red;
            flex-shrink: 0;
        }

        h1 {
            margin: 0;
            padding: 0;
            @include font-h1;
            color: $white;
            text-align: center;
        }

        & > .description {
            @include font-b;
            color: $black-3;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 0 40px;
            text-align: center;

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

        .tasks-list {
            display: flex;
            flex-direction: column;

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

                    & > svg {
                        width: 24px;
                        height: 24px;
                        fill: $white;

                        &.vult {
                            animation: vult-icon infinite 4s;
                        }
                    }

                    @keyframes vult-icon {
                        0% {
                            transform: scale(1.2);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.4);
                            opacity: .8;
                        }
                        100% {
                            transform: scale(1.2);
                            opacity: 1;
                        }
                    }

                    & > div {
                        padding: 12px 0;
                        border-bottom: solid 1px $black-2;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        flex: 1 0 1%;
                        width: 1%;
                        gap: 8px;

                        div {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            max-width: 80%;
                            span {
                                &:first-child {
                                    @include font-b-bold;
                                    color: $white;
                                    max-width: 100%;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                &:last-child {
                                    @include font-b-bold;
                                    color: $black-3;
                                    display: flex;
                                    flex-direction: row;
                                    gap: 4px;
                                    align-items: center;
                                    svg {
                                        width: 14px;
                                        height: 14px;
                                        fill: $off-red;
                                    }
                                }
                            }
                        }

                        & > button {
                            margin-left: auto;
                        }
                        & > svg {
                            fill: $black-3;
                            width: 14px;
                            height: 14px;
                            margin-left: auto;
                            margin-right: 20px;
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
    }
</style>