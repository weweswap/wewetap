import i18n from '@/i18n';
import router from '@/router';
import { message } from '@/utils/utils';

const { t } = i18n.global;
const controllers = {};

const signal = (name, id) => {
    const code = id ? `${name}_${id}` : name;

    if (controllers[code]) {
        controllers[code].abort();
    }

    controllers[code] = new AbortController();

    return controllers[code].signal;
};

const abort = (name) => {
    if (controllers[name]) {
        controllers[name].abort();
    }

    delete controllers[name];
};

const aborts = (name, id) => {
    if (id) {
        abort(`${name}_${id}`);
    } else {
        Object.keys(controllers)
            .filter((item) => item.indexOf(`${name}_`) === 0)
            .forEach((code) => {
                abort(code);
            });
    }
};

export const requests = {
    settings: {
        signal: () => signal('settings'),
        abort: () => abort('settings')
    },
    login: {
        signal: () => signal('login'),
        abort: () => abort('login')
    },
    me: {
        signal: () => signal('me'),
        abort: () => abort('me')
    },
    wallet: {
        signal: () => signal('wallet'),
        abort: () => abort('wallet')
    },
    asgardians: {
        signal: () => signal('asgardians'),
        abort: () => abort('asgardians')
    },
    claim: {
        signal: () => signal('claim'),
        abort: () => abort('claim')
    },
    asgardiansClaim: {
        signal: () => signal('asgardiansClaim'),
        abort: () => abort('asgardiansClaim')
    },
    tasks: {
        signal: () => signal('tasks'),
        abort: () => aborts('tasks')
    },
    myTasks: {
        signal: () => signal('myTasks'),
        abort: () => aborts('myTasks')
    },
    startTask: {
        signal: (id) => signal('startTask', id),
        abort: (id) => aborts('startTask', id)
    },
    endTask: {
        signal: (id) => signal('endTask', id),
        abort: (id) => aborts('endTask', id)
    },
    startPlaneGame: {
        signal: () => signal('startPlaneGame'),
        abort: () => aborts('startPlaneGame')
    },
    endPlaneGame: {
        signal: () => signal('endPlaneGame'),
        abort: () => aborts('endPlaneGame')
    }
};

let showAuthErrorTimeout;

export const onRequestDefaultError = (e) => {
    if (e?.code !== 'ERR_CANCELED') {
        if (e?.code === 'ERR_NETWORK') {
            window.location.reload();
        } else if (e?.response?.status === 401) {
            clearTimeout(showAuthErrorTimeout);
            showAuthErrorTimeout = setTimeout(() => {
                message.loki(t('utils.request.authError'));
            }, 200);

            if (router?.currentRoute?.value?.name !== 'error') {
                router.push({ name: 'error' });
            }
        } else if (e?.response?.status === 422) {
            if (router?.currentRoute?.value?.name !== 'access-denied') {
                router.push({ name: 'access-denied' });
            }
        } else if (e?.response?.status === 429) {
            if (router?.currentRoute?.value?.name !== 'bad-ref-code') {
                router.push({ name: 'bad-ref-code' });
            }
        } else {
            message.loki(t('utils.request.error'));
        }
    }
};
