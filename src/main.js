import axios from 'axios';
import { createApp } from 'vue';
import VueAxios from 'vue-axios';
import App from './App.vue';
import i18n from './i18n';
import router from './router';
import Icon from '@/components/forms/Icon.vue';
import { store } from '@/store';
import { fetchData, message } from '@/utils/utils';

import './assets/scss/base.scss';

if (import.meta.env.VITE_APP_TITLE) {
    document.title = import.meta.env.VITE_APP_TITLE;
}

export const app = createApp(App);

app.use(router);
router.app = app;

app.use(store);
app.use(VueAxios, axios);
app.use(i18n);

app.component('Icon', Icon);

app.directive('scroll', {
    inserted: function (el, binding) {
        let f = function (evt) {
            if (binding.value(evt, el)) {
                window.removeEventListener('scroll', f);
            }
        };
        window.addEventListener('scroll', f);
    }
});

app.config.globalProperties.$http = store.$http = fetchData;
app.config.globalProperties.$message = store.$message = message;

app.mount('#app');