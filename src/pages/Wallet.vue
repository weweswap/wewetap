<template>
    <div class="page-container" v-if="user.profile.id">
        <Icon icon="dude"/>
        <h1>{{ t('pages.wallet.title') }}</h1>

        <label class="description">
            <span>{{ t('pages.wallet.description.one') }} <b>$WEWE</b> {{ t('pages.wallet.description.two') }} <b class="meme">$MEME</b></span>
        </label>

        <label class="wallet" v-if="!data.editMode && user.profile.wallet_address">
            <span>{{ user.profile.wallet_address.substr(0, 10) }}</span>
            <b>...</b>
            <span>{{ user.profile.wallet_address.substr(-10) }}</span>
        </label>

        <EmptyLabel v-else-if="!data.editMode && !user.profile.wallet_address"
            :title="t('pages.wallet.empty.title')"
            :description="data.emptyDescription" />

        <textarea v-else
            v-model="data.walletAddress"
            placeholder="Wallet address" 
        />

        <div class="button-box">
            <Button v-if="!data.loading && data.editMode"
                :name="t('common.save')"
                :disabled="data.walletAddress?.trim().length < 20"
                @click="saveIt"
            />
            <Button v-if="!data.loading && !data.editMode"
                :name="t('pages.wallet.edit')"
                class="secondary"
                @click="editIt"
            />
            <Button v-else-if="data.loading" class="loader" :loading="true" />
        </div>
    </div>
</template>

<script setup>
    import Button from '@/components/forms/Button.vue';
    import EmptyLabel from '@/components/forms/EmptyLabel.vue';
    import { reactive } from 'vue';
    import { mapActions, mapState, mapMutations } from '@/map-state';
    import { message, delay } from '@/utils/utils';
    import router from '@/router';
    import { useI18n } from 'vue-i18n';

    const { t, tm, rt } = useI18n();
    const { pixiClaim, user } = mapState();
    const { updateWallet } = mapActions();
    const { openModal, closeModal } = mapMutations();
    const description = tm('pages.wallet.empty.description').map(item => rt(item));

    const data = reactive({
        editMode: false,
        walletAddress: null,
        loading: false,
        emptyDescription: description[Math.min(parseInt(Math.random() * description.length), description.length - 1)] 
    });

    const editIt = () => {
        data.walletAddress = user.value?.profile.wallet_address || '';
        data.editMode = true;
    }

    const saveIt = async (e) => {
        data.loading = true;

        await updateWallet(data.walletAddress);

        await delay(500);

        if (pixiClaim?.value) {
            pixiClaim.value({ y : e.pageY, x : e.pageX });
        }

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(200);
        }

        data.editMode = false;
        data.walletAddress = null;
        data.loading = false;

        await delay(1000);
        message.loki(t('pages.wallet.updated'));
    }
</script>

<style lang="scss" scoped>
    .page-container {
        gap: 14px;
        padding: 60px 10px 0;

        & > svg {
            width: 90px;
            height: 90px;
            margin: 0 auto;
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
                    &.meme {
                        color: $off-red;
                    }
                }
            }
        }

        textarea {
            border: solid 1px $black;
            background: $black-2;
            resize: none;
            margin: auto;
            width: 100%;
            height: 220px;
            padding: 8px;
            border-radius: 4px;
            @include font-title-bold;
            color: $white;
            font-size: 20px;
        }

        & > .wallet {
            @include font-title-bold;
            color: $white;
            margin: auto;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
            b {
                color: $turquoise;
                font-weight: normal;
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