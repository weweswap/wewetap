import { v4 as uuidv4 } from 'uuid';
import { store } from '@/store';

const initConfig = {
    delay: 2500
};

export default {
    loki(text, config = {}) {
        store.commit('setMessages', {
            type: 'loki',
            text,
            config: {
                ...initConfig,
                ...config
            },
            id: uuidv4()
        });
    },
    blood(text, config = {}) {
        store.commit('setMessages', {
            type: 'blood',
            text,
            config: {
                ...initConfig,
                ...config
            },
            id: uuidv4()
        });
    },
    pass(text, config = {}) {
        store.commit('setMessages', {
            type: 'pass',
            text,
            config: {
                ...initConfig,
                ...config
            },
            id: uuidv4()
        });
    }
};
