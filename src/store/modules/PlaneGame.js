import axios from 'axios';
import i18n from '@/i18n';
import router from '@/router';
import moment from 'moment';
import {onRequestDefaultError, requests} from '@/utils/requests';

const {t} = i18n.global;

const state = () => ({});

const actions = {
    async startPlaneGame({ commit, rootState }) {
        try {
            const result = await this.$http({
                method: 'POST',
                url: '/planegame/start',
                signal: requests.startPlaneGame.signal()
            });
            if (result.status === 200) {
                return true;
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async endPlaneGame({ commit, rootState }, points) {
        commit('setUser', {
            ...rootState.user.profile,
            coins: rootState.user.profile.coins + points,
        });
        try {
            const result = await this.$http({
                method: 'POST',
                url: '/planegame/end',
                signal: requests.endPlaneGame.signal(),
                data: { points }
            });

            if (result.status === 200) {
                const { data } = result;
                commit('setUser', data.user);
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    }
};

const getters = {};


const mutations = {}

export default {
    state,
    actions,
    getters,
    mutations
};
