import { createStore } from 'vuex';

import user from '@/store/modules/User';
import planeGame from '@/store/modules/PlaneGame';
import task from '@/store/modules/Task';
import { delay } from '@/utils/utils';

import { onRequestDefaultError, requests } from '@/utils/requests';

const state = () => ({
    theme: 'theme.default',
    modals: [],
    messages: [],
    pixiClaim: null,
    enableBG: null,
    disableBG: null,
    ready: false,
    settings: {}
});

const actions = {
    async getSettings({ commit }) {
        try {
            const result = await this.$http({
                method: 'GET',
                url: '/settings',
                // signal: requests.settings.signal(),
            });

            if (result?.status === 200) {
                const { data } = result;
                commit('setSettings', data);
            }
        } catch (e) {
            await delay(1500);
            onRequestDefaultError(e);
        }
    }
};

const getters = {
    getModalData: (state) => (name) => state.modals.find((modal) => modal.name === name)?.data
};

const mutations = {
    setSettings(state, payload) {
        state.settings = payload;
    },
    setReady(state, payload) {
        state.ready = payload;
    },
    setDisableBG(state, payload) {
        state.disableBG = payload;
    },
    setEnableBG(state, payload) {
        state.enableBG = payload;
    },
    setPixiClaim(state, payload) {
        state.pixiClaim = payload;
    },
    openModal(state, payload) {
        if (typeof payload == 'string') {
            payload = {
                name: payload
            };
        }
        if (state.modals.find((modal) => modal.name === payload.name)) {
            return;
        }
        state.modals.push({
            name: payload.name,
            data: payload.data,
            callback: payload.callback
        });
    },
    closeModal(state, payload) {
        if (typeof payload == 'string') {
            payload = {
                name: payload
            };
        }

        const modal = state.modals.find((modal) => modal.name === payload.name);
        if (modal) {
            if (modal.callback) {
                modal.callback(payload.data);
            }
            state.modals.splice(state.modals.indexOf(modal), 1);
        }
    },
    setMessages(state, message) {
        state.messages.push(message);
        const timerId = setTimeout(() => {
            const idx = state.messages.findIndex((el) => el.id === message.config.id);
            state.messages.splice(idx, 1);
            clearTimeout(timerId);
        }, message.config.delay);

        if (window.navigator?.vibrate) {
            window.navigator.vibrate(100);
        }
    }
};

export const store = createStore({
    state,
    actions,
    getters,
    mutations,
    modules: {
        user,
        planeGame,
        task
    }
});
