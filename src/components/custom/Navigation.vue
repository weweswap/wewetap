<template>
    <ul>
        <li v-for="item in data.items" :key="item.name">
            <router-link
                :class="{ active: route.path.indexOf(item.link) === 0 }"
                :to="item.link"
                :title="item.name"
            >
                <Icon :icon="item.icon" />
                <span>{{ item.name }}</span>
            </router-link>
        </li>
    </ul>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const data = reactive({
    items: [{
        icon: 'home',
        link: '/home',
        name: t('nav.home')
    }, {
        icon: 'tasks',
        link: '/tasks',
        name: t('nav.tasks')
    }, {
        icon: 'asgardians',
        link: '/asgardians',
        name: t('nav.asgardians')
    }, {
        icon: 'wallet',
        link: '/wallet',
        name: t('nav.wallet')
    }]
});
</script>

<style lang="scss" scoped>
    ul {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        list-style: none;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
        z-index: 1;
        background: $black;

        li {
            display: flex;
            flex: 1 1;
            a {
                height: 54px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1 1 100%;
                align-items: center;
                justify-content: center;
                opacity: .6;

                svg {
                    fill: $white;
                }
                span {
                    @include font-label;
                    color: $white;
                }

                &.active {
                    opacity: 1;
                }
            }
        }
    }
</style>
