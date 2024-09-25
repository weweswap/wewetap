import { createRouter, createWebHistory } from 'vue-router';
import { store } from '@/store';

import { ROUTER_ERRORS } from '@/constants';
import { requests } from '@/utils/requests';

const handleRouterError = (error) => {
    const errorWords = error.message.toLowerCase().split(' ');
    const action = ROUTER_ERRORS.find((item) => item.code.some((r) => errorWords.indexOf(r) !== -1));
    if (action) {
        return action.action();
    }
};

const goHome = (to, from, next) => {
    next({ name: 'home' });
};

const routes = [
    {
        path: '/home',
        name: 'home',
        component: () => import('../pages/Home.vue'),
        abort: []
    },
    {
        path: '/tasks',
        name: 'tasks',
        component: () => import('../pages/Tasks.vue'),
        abort: [
            'tasks',
            'myTasks'
        ]
    },
    {
        path: '/asgardians',
        name: 'asgardians',
        component: () => import('../pages/Asgardians.vue'),
        abort: [
            'asgardians'
        ]
    },
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import('../pages/Wallet.vue'),
        abort: []
    },
    {
        path: '/planegame',
        name: 'planegame',
        component: () => import('../pages/PlaneGame.vue'),
        abort: []
    },
    {
        path: '/error',
        name: 'error',
        component: () => import('../pages/Error.vue'),
        abort: []
    },
    {
        path: '/access-denied',
        name: 'access-denied',
        component: () => import('../pages/AccessDenied.vue'),
        abort: []
    },
    {
        path: '/bad-ref-code',
        name: 'bad-ref-code',
        component: () => import('../pages/BadRefCode.vue'),
        abort: []
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'error-page',
        beforeEnter: goHome
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.back = function (path) {
    this.options.history.state.back ? this.go(-1) : this.push(path || '/');
};

router.beforeEach((to, from, next) => {
    if (store?.state?.modals.find(item => item.name === 'plane-game')) {
        next(false);
        return;
    }

    if (from?.name) {
        routes.forEach((item) => {
            if (item.name === from.name && item.abort) {
                item.abort.forEach((code) => {
                    if (code.split(':id').length === 1) {
                        requests[code].abort();
                    } else {
                        requests[code.split(':id')[0]].abort(from.params.id);
                    }
                });
            }
        });
    }
    next();
});

router.onError(handleRouterError);

export default router;
