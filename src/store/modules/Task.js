import axios from 'axios';
import i18n from '@/i18n';
import router from '@/router';
import moment from 'moment';
import {onRequestDefaultError, requests} from '@/utils/requests';

const {t} = i18n.global;

const state = () => ({});

const actions = {
    async getTasks({ commit, state }, payload) {
        try {
            const response = await this.$http({
                method: 'POST',
                url: '/task/list/',
                data: payload,
                signal: requests.tasks.signal()
            });

            if (response.status === 200) {
                return response.data;
            }

            return [];
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async getMyTasks({ commit, state }, payload) {

        try {
            const response = await this.$http({
                method: 'POST',
                url: '/task/my/',
                data: payload,
                signal: requests.myTasks.signal()
            });

            if (response.status === 200) {
                const result = {};
                response.data.items.forEach(item => result[item.task_id] = item.status);
                return result;
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async startTask({ commit, state }, task_id) {
        try {
            const response = await this.$http({
                method: 'POST',
                url: '/task/start/',
                data: { task_id },
                signal: requests.startTask.signal(task_id)
            });

            if (response.status === 200) {
                return response.data;
            }
        } catch (e) {
            onRequestDefaultError(e);
        }
    },
    async endTask({ commit, state }, task_id) {
        try {
            const response = await this.$http({
                method: 'POST',
                url: '/task/end/',
                data: { task_id },
                signal: requests.endTask.signal(task_id)
            });

            if (response.status === 200) {
                return response.data;
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
