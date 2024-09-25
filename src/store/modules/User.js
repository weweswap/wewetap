import axios from 'axios';
import i18n from '@/i18n';
import router from '@/router';
import moment from 'moment';
import { delay } from '@/utils/utils';
import {onRequestDefaultError, requests} from '@/utils/requests';

const {t} = i18n.global;

const state = () => ({
    profile: {},
    token: null
});

const actions = {
    async login({ commit }) {
        if (!window.Telegram?.WebApp) {
            await delay(1500);
        }

        const tg_init_data = window.Telegram?.WebApp?.initData;
        let ref = null;

        (window.Telegram.WebApp?.initDataUnsafe?.start_param || '').split('&').forEach(item => {
            if (item.toLowerCase().includes('ref_')) {
                ref = item.toLowerCase().split('ref_')[1];
            }
        });

        try {
            const auth = await this.$http({
                method: 'POST',
                url: '/user/login',
                data: { tg_init_data, ref },
                // signal: requests.login.signal(),
            });

            if (auth.status === 200) {
                const { data } = auth;
                commit('setToken', data.token);
                commit('setUser', data.user);
            } else {
                onRequestDefaultError({ response: auth });
            }
        } catch (e) {
            await delay(1500);
            onRequestDefaultError(e);
        }
    },
    async claim({ commit, state }) {
        try {
            const result = await this.$http({
                method: 'POST',
                url: '/user/claim',
                signal: requests.claim.signal(),
            });

            if (result.status === 200) {
                const { data } = result;
                commit('setUser', data.user);
            }
        } catch (e) {
        }
    },
    async updateWallet({ commit, state }, wallet_address) {
        try {
            const result = await this.$http({
                method: 'POST',
                url: '/user/wallet',
                signal: requests.wallet.signal(),
                data: { wallet_address }
            });

            if (result.status === 200) {
                const { data } = result;
                commit('setUser', data.user);
            }
        } catch (e) {
        }
    },
    async me({ commit, state }) {
        try {
            const result = await this.$http({
                method: 'POST',
                url: '/user/me',
                signal: requests.me.signal(),
            });

            if (result.status === 200) {
                const { data } = result;
                commit('setUser', data.user);
            }
        } catch (e) {
        }
    },
    async asgardiansClaim({ commit, state }) {
        try {
            const result = await this.$http({
                method: 'POST',
                signal: requests.asgardiansClaim.signal(),
                url: '/user/asgardiansclaim',
            });

            if (result.status === 200) {
                const { data } = result;
                commit('setUser', data.user);
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async getAsgardians({ commit, state }, payload) {
        try {
            const response = await this.$http({
                method: 'POST',
                url: '/user/asgardians/',
                data: payload,
                signal: requests.asgardians.signal()
            });

            if (response.status === 200) {
                return response.data;
            }

            return response.data;
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async kick({ commit }, id) {
        try {
            const response = await this.$http({
                method: 'POST',
                url: '/user/kick',
                data: { id },
                // signal: requests.kick.signal(id),
            });

            if (response.status === 200) {
                const { data } = response;
                commit('setUser', data.user);
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    }

};

const getters = {};


const mutations = {
    setToken(state, payload) {
        state.token = payload;
    },
    setUser(state, payload) {
        state.profile = payload;
    }
}

export default {
    state,
    actions,
    getters,
    mutations
};
